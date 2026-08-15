// ────────────────────────────────────────────────────────────────────────────
// Hash utilities — 100% client-side, no backend calls.
//
// SHA-1/256/384/512 use the browser's native Web Crypto API (crypto.subtle).
// MD5 and MD4 are NOT supported by Web Crypto (and MD4 isn't even available
// in Node's OpenSSL builds anymore), so both are implemented here as small,
// dependency-free, RFC-compliant JS functions and verified against the
// official RFC 1320 (MD4) / RFC 1321 (MD5) test vectors.
//
// These are one-way hash functions — there is intentionally no "decode".
// ────────────────────────────────────────────────────────────────────────────

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0
}

/** MD4/MD5 padding: 0x80, zero bytes, then 64-bit little-endian bit length. */
function padMessage(bytes: Uint8Array): Uint8Array {
  const bitLenLo = (bytes.length * 8) >>> 0
  const bitLenHi = Math.floor(bytes.length / 0x20000000) >>> 0
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64)
  const total = bytes.length + padLen + 8
  const out = new Uint8Array(total)
  out.set(bytes, 0)
  out[bytes.length] = 0x80
  const view = new DataView(out.buffer)
  view.setUint32(total - 8, bitLenLo, true)
  view.setUint32(total - 4, bitLenHi, true)
  return out
}

function wordsToHex(words: number[]): string {
  return words
    .map((w) => {
      const b = new Uint8Array(4)
      new DataView(b.buffer).setUint32(0, w, true)
      return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("")
    })
    .join("")
}

// ── MD4 (RFC 1320) ───────────────────────────────────────────────────────

export function md4(bytes: Uint8Array): string {
  const msg = padMessage(bytes)
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476

  const F = (x: number, y: number, z: number) => (x & y) | (~x & z)
  const G = (x: number, y: number, z: number) => (x & y) | (x & z) | (y & z)
  const H = (x: number, y: number, z: number) => x ^ y ^ z

  const s1 = [3, 7, 11, 19]
  const s2 = [3, 5, 9, 13]
  const s3 = [3, 9, 11, 15]
  const order2 = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]
  const order3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]

  for (let off = 0; off < msg.length; off += 64) {
    const X = new Uint32Array(16)
    const view = new DataView(msg.buffer, off, 64)
    for (let i = 0; i < 16; i++) X[i] = view.getUint32(i * 4, true)

    let a = a0, b = b0, c = c0, d = d0

    for (let i = 0; i < 16; i++) {
      const t = (a + F(b, c, d) + X[i]) >>> 0
      a = d; d = c; c = b; b = rotl(t, s1[i % 4])
    }
    for (let i = 0; i < 16; i++) {
      const k = order2[i]
      const t = (a + G(b, c, d) + X[k] + 0x5a827999) >>> 0
      a = d; d = c; c = b; b = rotl(t, s2[i % 4])
    }
    for (let i = 0; i < 16; i++) {
      const k = order3[i]
      const t = (a + H(b, c, d) + X[k] + 0x6ed9eba1) >>> 0
      a = d; d = c; c = b; b = rotl(t, s3[i % 4])
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  return wordsToHex([a0, b0, c0, d0])
}

// ── MD5 (RFC 1321) ───────────────────────────────────────────────────────

const MD5_K = (() => {
  const K = new Uint32Array(64)
  for (let i = 0; i < 64; i++) K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) >>> 0
  return K
})()
const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

export function md5(bytes: Uint8Array): string {
  const msg = padMessage(bytes)
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476

  for (let off = 0; off < msg.length; off += 64) {
    const M = new Uint32Array(16)
    const view = new DataView(msg.buffer, off, 64)
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(i * 4, true)

    let A = a0, B = b0, C = c0, D = d0
    for (let i = 0; i < 64; i++) {
      let F: number, g: number
      if (i < 16) { F = (B & C) | (~B & D); g = i }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16 }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16 }
      else { F = C ^ (B | ~D); g = (7 * i) % 16 }
      F = (F + A + MD5_K[i] + M[g]) >>> 0
      A = D; D = C; C = B
      B = (B + rotl(F, MD5_S[i])) >>> 0
    }
    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  return wordsToHex([a0, b0, c0, d0])
}

// ── SHA family via Web Crypto ────────────────────────────────────────────

export async function sha(bytes: Uint8Array, algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"): Promise<string> {
  const digest = await crypto.subtle.digest(algo, bytes as BufferSource)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const HASH_ALGORITHMS = ["MD4", "MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

/** Run any supported hash algorithm on raw bytes, returning a lowercase hex digest. */
export async function runHash(bytes: Uint8Array, algo: HashAlgorithm): Promise<string> {
  if (algo === "MD4") return md4(bytes)
  if (algo === "MD5") return md5(bytes)
  return sha(bytes, algo)
}
