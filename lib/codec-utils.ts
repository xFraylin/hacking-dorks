// ────────────────────────────────────────────────────────────────────────────
// Codec utilities — UTF-8 safe encode/decode helpers used across the app
// (Encoder/Decoder tool, JWT Editor, Transformation Chain).
//
// Everything here runs 100% client-side (GitHub Pages friendly): no backend,
// no external requests. UTF-8 <-> bytes conversion is done with the native
// TextEncoder/TextDecoder APIs instead of the legacy escape()/unescape()
// tricks, which mis-handle a large chunk of the Unicode range (accents, ñ,
// emoji, etc.) and were the root cause of most "input inválido" errors.
// ────────────────────────────────────────────────────────────────────────────

/** Encode a JS string into its UTF-8 byte representation. */
export function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/** Decode UTF-8 bytes back into a JS string. Throws on invalid UTF-8. */
export function bytesToStr(bytes: Uint8Array, fatal = true): string {
  return new TextDecoder("utf-8", { fatal }).decode(bytes)
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return binary
}

function binaryStringToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ── URL Encoding ──────────────────────────────────────────────────────────

export function urlEncode(str: string): string {
  return encodeURIComponent(str)
}

export function urlDecode(str: string): string {
  const input = str.trim()
  if (!input) return ""
  try {
    return decodeURIComponent(input)
  } catch {
    throw new Error("Secuencia %XX inválida o incompleta — no es URL Encoding válido")
  }
}

export function doubleUrlEncode(str: string): string {
  return encodeURIComponent(encodeURIComponent(str))
}

// ── Base64 ────────────────────────────────────────────────────────────────

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/

export function base64Encode(str: string): string {
  return btoa(bytesToBinaryString(strToBytes(str)))
}

export function base64Decode(str: string): string {
  // Trim accidental surrounding whitespace, and strip internal whitespace/newlines
  // that often show up when Base64 is copy-pasted from logs, headers, etc.
  const cleaned = str.trim().replace(/[\r\n\t ]+/g, "")
  if (!cleaned) return ""
  if (!BASE64_RE.test(cleaned)) {
    throw new Error("Contiene caracteres fuera del alfabeto Base64 (solo se permite A-Z a-z 0-9 + / y '=' de padding)")
  }
  if (cleaned.length % 4 !== 0) {
    throw new Error("Longitud inválida: un Base64 válido debe ser múltiplo de 4 caracteres (con padding)")
  }
  let binary: string
  try {
    binary = atob(cleaned)
  } catch {
    throw new Error("No se pudo decodificar como Base64 válido")
  }
  const bytes = binaryStringToBytes(binary)
  try {
    return bytesToStr(bytes)
  } catch {
    throw new Error("El Base64 es válido pero los bytes resultantes no son texto UTF-8 (¿datos binarios?)")
  }
}

// ── HTML Entities ─────────────────────────────────────────────────────────

const HTML_ENC_MAP: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;",
}
const HTML_DEC_MAP: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#x27": "'", "#x60": "`", nbsp: " ",
}

export function htmlEncode(str: string): string {
  return str.replace(/[&<>"'`]/g, (c) => HTML_ENC_MAP[c] ?? c)
}

export function htmlDecode(str: string): string {
  // Any text is valid input: entities found are decoded, everything else is left
  // untouched (this also makes it a correct inverse of htmlEncode, whose output
  // is unchanged for text with no &<>"'` characters to begin with).
  if (!str) return ""
  return str.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (full, ent: string) => {
    if (ent[0] === "#") {
      const code = ent[1] === "x" || ent[1] === "X"
        ? parseInt(ent.slice(2), 16)
        : parseInt(ent.slice(1), 10)
      if (Number.isNaN(code)) return full
      return String.fromCodePoint(code)
    }
    const key = ent.toLowerCase()
    return HTML_DEC_MAP[key] ?? full
  })
}

// ── Hex ───────────────────────────────────────────────────────────────────

export function hexEncode(str: string): string {
  const bytes = strToBytes(str)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function hexDecode(str: string): string {
  const cleaned = str.trim().replace(/[\s,]+/g, "") // allow spaces "68 6f 6c 61" between bytes
  if (!cleaned) return ""
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error("Contiene caracteres no hexadecimales (solo 0-9 a-f A-F)")
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error("Cantidad impar de dígitos hex — cada byte necesita 2 dígitos")
  }
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16)
  }
  try {
    return bytesToStr(bytes)
  } catch {
    throw new Error("El hex es válido pero los bytes resultantes no son texto UTF-8 (¿datos binarios?)")
  }
}

/** Hex encode raw bytes (used by the Transformation Chain, e.g. after a hash step). */
export function hexEncodeBytes(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ── Unicode \uXXXX escape ─────────────────────────────────────────────────
// Operates on UTF-16 code units (like JS source literals) so surrogate pairs
// used by astral characters (emoji, etc.) round-trip correctly.

export function unicodeEscape(str: string): string {
  let out = ""
  for (let i = 0; i < str.length; i++) {
    out += "\\u" + str.charCodeAt(i).toString(16).padStart(4, "0")
  }
  return out
}

// Accepts both classic \uXXXX (4 hex digits, UTF-16 code unit) and the ES6
// code-point form \u{X...} (1-6 hex digits, used for astral characters without
// needing a surrogate pair).
export function unicodeUnescape(str: string): string {
  if (!str) return ""
  const VALID = /\\u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]{1,6}\})/
  if (!VALID.test(str)) {
    throw new Error("No se encontraron secuencias \\uXXXX válidas")
  }
  if (/\\u(?!([0-9a-fA-F]{4}|\{[0-9a-fA-F]{1,6}\}))/i.test(str)) {
    throw new Error("Secuencia \\u incompleta o inválida (se esperan 4 dígitos hex o \\u{...})")
  }
  return str.replace(/\\u(?:([0-9a-fA-F]{4})|\{([0-9a-fA-F]{1,6})\})/gi, (_, h4, hBrace) =>
    h4 ? String.fromCharCode(parseInt(h4, 16)) : String.fromCodePoint(parseInt(hBrace, 16))
  )
}

// ── JS \xHH escape ────────────────────────────────────────────────────────
// Operates on UTF-8 bytes (not raw code points) so any Unicode character —
// including emoji and characters above U+00FF — round-trips correctly.

export function jsHexEscape(str: string): string {
  const bytes = strToBytes(str)
  return Array.from(bytes).map((b) => "\\x" + b.toString(16).padStart(2, "0")).join("")
}

export function jsHexUnescape(str: string): string {
  if (!str) return ""
  if (!/\\x[0-9a-fA-F]{2}/i.test(str)) {
    throw new Error("No se encontraron secuencias \\xHH válidas")
  }
  if (/\\x(?![0-9a-fA-F]{2})/i.test(str)) {
    throw new Error("Secuencia \\x incompleta o inválida (se esperan 2 dígitos hex)")
  }
  const bytes: number[] = []
  str.replace(/\\x([0-9a-fA-F]{2})/gi, (_, h) => {
    bytes.push(parseInt(h, 16))
    return ""
  })
  try {
    return bytesToStr(new Uint8Array(bytes))
  } catch {
    throw new Error("Los bytes decodificados no forman texto UTF-8 válido")
  }
}

// ── Base64URL (RFC 4648 §5) — used by JWT ────────────────────────────────
// NOT the same alphabet as standard Base64 ('+','/' -> '-','_', no padding),
// so it gets its own implementation rather than reusing base64Decode's
// standard-alphabet validation.

export function base64UrlEncodeBytes(bytes: Uint8Array): string {
  return btoa(bytesToBinaryString(bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function base64UrlDecodeBytes(str: string): Uint8Array {
  const cleaned = str.trim().replace(/[\r\n\t ]+/g, "")
  if (!cleaned) throw new Error("Entrada vacía")
  if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) {
    throw new Error("Contiene caracteres fuera del alfabeto Base64URL (A-Z a-z 0-9 - _)")
  }
  let s = cleaned.replace(/-/g, "+").replace(/_/g, "/")
  while (s.length % 4) s += "="
  let binary: string
  try {
    binary = atob(s)
  } catch {
    throw new Error("No se pudo decodificar como Base64URL válido")
  }
  return binaryStringToBytes(binary)
}

export function base64UrlEncode(str: string): string {
  return base64UrlEncodeBytes(strToBytes(str))
}

export function base64UrlDecode(str: string): string {
  return bytesToStr(base64UrlDecodeBytes(str))
}
