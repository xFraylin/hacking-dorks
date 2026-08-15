// ────────────────────────────────────────────────────────────────────────────
// Smart Recursive Auto Decoder — a convergence-based engine, entirely client-side.
//
// This is NOT "detect the top format and decode once, repeat". It's a bounded
// beam search over the space of possible decode paths:
//
//   detectCandidates(value)  — every plausible next decode, each with a confidence
//   applyDecode(candidate)   — actually run it (delegates to lib/codec-utils.ts)
//   scoreValue(value)        — how "good"/legible does this result look, 0-100
//   searchDecodePaths(input) — beam search: keep the best BEAM_WIDTH states per
//                              depth, expand up to MAX_DEPTH, collect every state
//                              reached (any of them can be the "right" stopping point)
//   autoDecode(input)        — run the search, rank routes by quality + confidence
//                              minus a per-step penalty, return the best one plus
//                              a couple of close alternatives
//
// Every actual decode call reuses the exact same functions as the manual
// Encoder/Decoder buttons and the Transformation Chain (lib/codec-utils.ts) —
// this module only adds detection/search/scoring on top, never re-implements decoding.
// ────────────────────────────────────────────────────────────────────────────

import {
  urlDecode,
  base64Encode, base64Decode,
  base64UrlEncode, base64UrlDecode,
  hexDecode,
  htmlDecode,
  unicodeUnescape,
  jsHexUnescape,
} from "./codec-utils"

export type DetectionType =
  | "url_decode" | "base64_decode" | "base64url_decode" | "hex_decode"
  | "html_decode" | "unicode_unescape" | "jshex_unescape" | "hash"
  | "caesar_decrypt" // covers ROT13 too — it's just shift 13

export interface Candidate {
  type: DetectionType
  label: string
  confidence: number // 0-100
  /** Present for every type except "hash" (one-way, intentionally not decodable). */
  decode: (() => string) | null
  /** Only set for type "hash" — the plain algorithm name (e.g. "SHA-256"), for display. */
  algo?: string
}

function clamp(n: number, min = 0, max = 99): number {
  return Math.max(min, Math.min(max, Math.round(n)))
}

/** Fraction of a decoded string that looks like normal printable/whitespace text. */
function printableRatio(text: string): number {
  if (text.length === 0) return 0
  const chars = Array.from(text)
  let printable = 0
  for (const ch of chars) {
    const c = ch.codePointAt(0) ?? 0
    const isControl = c < 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d
    const isDelOrC1 = c >= 0x7f && c <= 0x9f
    if (!isControl && !isDelOrC1) printable++
  }
  return printable / chars.length
}

// ── Individual detectors ─────────────────────────────────────────────────

function detectUrlEncoding(input: string): Candidate | null {
  const matches = input.match(/%[0-9A-Fa-f]{2}/g)
  if (!matches || matches.length === 0) return null
  let decoded: string
  try {
    decoded = urlDecode(input)
  } catch {
    return null
  }
  if (decoded === input) return null
  const coverage = Math.min(1, (matches.length * 3) / Math.max(1, input.length))
  const knownBonus = /%20|%2f|%3d|%25|%3c|%3e|%26|%22|%27|%40/i.test(input) ? 8 : 0
  const confidence = clamp(75 + coverage * 20 + knownBonus)
  return { type: "url_decode", label: "URL Decode", confidence, decode: () => decoded }
}

const BASE64_STRICT_RE = /^[A-Za-z0-9+/]+={0,2}$/

function detectBase64(input: string): Candidate | null {
  const cleaned = input.trim().replace(/[\r\n\t ]+/g, "")
  if (cleaned.length < 4 || cleaned.length % 4 !== 0) return null
  if (!BASE64_STRICT_RE.test(cleaned)) return null
  let decoded: string
  try {
    decoded = base64Decode(cleaned)
  } catch {
    return null
  }
  if (!decoded) return null

  let confidence = 78
  try {
    const reencoded = base64Encode(decoded)
    if (reencoded === cleaned) confidence += 15
    else if (reencoded.replace(/=+$/, "") === cleaned.replace(/=+$/, "")) confidence += 10
    else confidence -= 35
  } catch {
    confidence -= 35
  }
  const ratio = printableRatio(decoded)
  confidence += (ratio - 0.9) * 40
  if (/[+/=]/.test(cleaned)) confidence += 3
  if (/[A-Z]/.test(cleaned) && /[a-z]/.test(cleaned) && /[0-9]/.test(cleaned)) confidence += 3

  return { type: "base64_decode", label: "Base64", confidence: clamp(confidence), decode: () => decoded }
}

function detectBase64Url(input: string): Candidate | null {
  const cleaned = input.trim()
  if (cleaned.length < 4) return null
  if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) return null
  const hasMarker = /[-_]/.test(cleaned)
  const unpaddedShape = cleaned.length % 4 !== 0 // real JWT segments are rarely padded and often lack -/_
  // Fully ambiguous with plain Base64/plain alphanumeric text (padded length, no url-safe marker) — skip,
  // let detectBase64 (or nothing) claim it instead.
  if (!hasMarker && !unpaddedShape) return null
  let decoded: string
  try {
    decoded = base64UrlDecode(cleaned)
  } catch {
    return null
  }
  if (!decoded) return null

  let confidence = hasMarker ? 72 : 58
  try {
    const reencoded = base64UrlEncode(decoded)
    if (reencoded === cleaned) confidence += hasMarker ? 18 : 24
    else confidence -= 30
  } catch {
    confidence -= 30
  }
  const ratio = printableRatio(decoded)
  confidence += (ratio - 0.9) * 40

  return { type: "base64url_decode", label: "Base64URL", confidence: clamp(confidence), decode: () => decoded }
}

const HASH_LENGTHS: Record<number, string> = {
  32: "MD5 / NTLM / MD4",
  40: "SHA-1",
  56: "SHA-224",
  64: "SHA-256",
  96: "SHA-384",
  128: "SHA-512",
}

function detectHex(input: string): Candidate | null {
  const cleaned = input.trim().replace(/[\s,]+/g, "")
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null
  if (cleaned.length % 2 !== 0) return null
  if (cleaned.length < 8) return null // require >= 4 bytes to avoid short false positives like "ab", "cafe"
  let decoded: string
  try {
    decoded = hexDecode(cleaned)
  } catch {
    return null
  }
  if (!decoded) return null

  let confidence = 85
  const ratio = printableRatio(decoded)
  confidence += (ratio - 0.9) * 40
  confidence += 5 // pure hex-charset bonus (disambiguates from the base64 alphabet superset)

  return { type: "hex_decode", label: "Hex", confidence: clamp(confidence), decode: () => decoded }
}

/** Only fires when the string looks like a hash AND does NOT also look like decodable hex text. */
function detectHashLike(input: string, hexCandidate: Candidate | null): Candidate | null {
  const cleaned = input.trim()
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null
  const algo = HASH_LENGTHS[cleaned.length]
  if (!algo) return null
  if (hexCandidate) return null // it decodes to plausible printable text — treat as hex, not a hash
  return { type: "hash", label: `${algo} hash — one-way, cannot decode`, confidence: 90, decode: null, algo }
}

function detectHtmlEntities(input: string): Candidate | null {
  const matches = input.match(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g)
  if (!matches || matches.length === 0) return null
  let decoded: string
  try {
    decoded = htmlDecode(input)
  } catch {
    return null
  }
  if (decoded === input) return null
  const confidence = clamp(88 + Math.min(9, matches.length * 2))
  return { type: "html_decode", label: "HTML Entities", confidence, decode: () => decoded }
}

function detectUnicodeEscape(input: string): Candidate | null {
  const matches = input.match(/\\u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]{1,6}\})/g)
  if (!matches || matches.length === 0) return null
  let decoded: string
  try {
    decoded = unicodeUnescape(input)
  } catch {
    return null
  }
  if (decoded === input) return null
  const coverage = Math.min(1, matches.join("").length / Math.max(1, input.length))
  const confidence = clamp(88 + coverage * 11)
  return { type: "unicode_unescape", label: "Unicode Escape", confidence, decode: () => decoded }
}

function detectJsHexEscape(input: string): Candidate | null {
  const matches = input.match(/\\x[0-9a-fA-F]{2}/g)
  if (!matches || matches.length === 0) return null
  let decoded: string
  try {
    decoded = jsHexUnescape(input)
  } catch {
    return null
  }
  if (decoded === input) return null
  const coverage = Math.min(1, matches.join("").length / Math.max(1, input.length))
  const confidence = clamp(88 + coverage * 9)
  return { type: "jshex_unescape", label: "JS \\x Escape", confidence, decode: () => decoded }
}

// ── Caesar cipher / ROT13 cryptanalysis ──────────────────────────────────
// Unlike the formats above, a shifted-letter cipher leaves no structural marker
// (no %XX, no \u, no base64 padding) — the only evidence is that the *decrypted*
// text reads more like real language than the ciphertext does. This uses classic
// letter-frequency analysis (chi-squared against English letter frequencies)
// across all 25 possible shifts, the same technique real Caesar-cipher solvers
// use, so it also covers ROT13 for free (ROT13 is just shift 13).

const ENGLISH_LETTER_FREQ: Record<string, number> = {
  a: 8.17, b: 1.49, c: 2.78, d: 4.25, e: 12.70, f: 2.23, g: 2.02, h: 6.09, i: 6.97,
  j: 0.15, k: 0.77, l: 4.03, m: 2.41, n: 6.75, o: 7.51, p: 1.93, q: 0.10, r: 5.99,
  s: 6.33, t: 9.06, u: 2.76, v: 0.98, w: 2.36, x: 0.15, y: 1.97, z: 0.07,
}

function caesarShift(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base)
  })
}

/** Lower = closer to natural English letter distribution. null if too short to be meaningful. */
function letterChiSquared(text: string): number | null {
  const letters = text.toLowerCase().replace(/[^a-z]/g, "")
  if (letters.length < 8) return null
  const counts: Record<string, number> = {}
  for (const ch of letters) counts[ch] = (counts[ch] ?? 0) + 1
  let chi = 0
  for (const [letter, pct] of Object.entries(ENGLISH_LETTER_FREQ)) {
    const expected = (pct / 100) * letters.length
    const observed = counts[letter] ?? 0
    chi += (observed - expected) ** 2 / expected
  }
  return chi
}

// Calibrated empirically against ~60 real short words/names vs their Caesar-shifted
// versions: chi-squared alone overlaps heavily below ~120 (plenty of genuine short
// words score "badly" just from sample noise), so MIN_BASE_CHI gates out virtually
// all real text up front, and MIN_MARGIN rejects the rare word that sneaks past the
// gate but only "wins" by a hair over the runner-up shift (an ambiguous, not a clear,
// verdict). Both bars are intentionally strict — a missed Caesar/ROT13 guess is fine,
// mangling normal text is not.
const CAESAR_MIN_BASE_CHI = 120
const CAESAR_MIN_IMPROVEMENT = 60
const CAESAR_MIN_MARGIN = 10

function detectCaesarCipher(input: string): Candidate | null {
  const letterCount = (input.match(/[a-zA-Z]/g) ?? []).length
  const significantCount = input.replace(/\s/g, "").length
  if (significantCount === 0 || letterCount / significantCount < 0.85) return null // needs to be "mostly letters"

  const baseChi = letterChiSquared(input)
  if (baseChi === null || baseChi < CAESAR_MIN_BASE_CHI) return null // doesn't look "cipher-bad" enough to bother

  let best: { shift: number; chi: number; text: string } | null = null
  let secondBestChi = Infinity
  for (let shift = 1; shift <= 25; shift++) {
    const text = caesarShift(input, shift)
    const chi = letterChiSquared(text)
    if (chi === null) continue
    if (!best || chi < best.chi) {
      secondBestChi = best ? best.chi : Infinity
      best = { shift, chi, text }
    } else if (chi < secondBestChi) {
      secondBestChi = chi
    }
  }
  if (!best) return null

  const improvement = baseChi - best.chi // how much better the best shift fits language than the raw input
  const margin = secondBestChi - best.chi // how clearly it beats the runner-up shift
  if (improvement < CAESAR_MIN_IMPROVEMENT || margin < CAESAR_MIN_MARGIN) return null // not a clear, unambiguous winner

  const confidence = clamp(60 + improvement * 0.15 + margin * 0.6)
  const label = best.shift === 13 ? "ROT13" : `Caesar Cipher (shift ${best.shift})`
  const decoded = best.text
  return { type: "caesar_decrypt", label, confidence, decode: () => decoded }
}

/** detectCandidates(value) — ranked list of every plausible next decode, highest confidence first. */
export function detectCandidates(input: string): Candidate[] {
  const candidates: Candidate[] = []
  if (!input) return candidates

  const hex = detectHex(input)
  const hash = detectHashLike(input, hex)
  if (hash) candidates.push(hash)
  if (hex) candidates.push(hex)

  const base64 = detectBase64(input)
  if (base64) candidates.push(base64)
  const base64url = detectBase64Url(input)
  if (base64url) candidates.push(base64url)
  const url = detectUrlEncoding(input)
  if (url) candidates.push(url)
  const html = detectHtmlEntities(input)
  if (html) candidates.push(html)
  const unicode = detectUnicodeEscape(input)
  if (unicode) candidates.push(unicode)
  const jshex = detectJsHexEscape(input)
  if (jshex) candidates.push(jshex)
  const caesar = detectCaesarCipher(input)
  if (caesar) candidates.push(caesar)

  candidates.sort((a, b) => b.confidence - a.confidence)
  return candidates
}

// ── JWT structural detection (not "decoded" — just displayed as 3 parts) ────

export interface JwtInfo {
  token: string
  header: unknown
  payload: unknown
  signature: string
}

export function detectJwt(input: string): JwtInfo | null {
  const token = input.trim()
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  if (!h || !p) return null
  if (!/^[A-Za-z0-9_-]+$/.test(h) || !/^[A-Za-z0-9_-]+$/.test(p)) return null
  if (s && !/^[A-Za-z0-9_-]+$/.test(s)) return null
  try {
    const header = JSON.parse(base64UrlDecode(h))
    const payload = JSON.parse(base64UrlDecode(p))
    if (typeof header !== "object" || header === null) return null
    if (typeof payload !== "object" || payload === null) return null
    return { token, header, payload, signature: s ?? "" }
  } catch {
    return null
  }
}

// ── scoreValue(value) — local, deterministic "how good/legible is this text" ──
// No AI, no network. Rewards UTF-8-clean printable text, normal spacing/punctuation
// and valid JSON; penalizes control chars, replacement chars (�), and the "mixed
// upper+lower+digit+symbol, zero spaces" shape typical of an encoded blob (so a
// still-encoded value like "aG9sYQ==" scores well below its decoded form "hola").

export function scoreValue(text: string): number {
  if (text.length === 0) return 0
  const chars = Array.from(text)
  const n = chars.length

  let control = 0
  let replacement = 0
  let spaces = 0
  let punctuation = 0
  let upper = 0
  let lower = 0
  let digits = 0
  let symbolish = 0

  for (const ch of chars) {
    const c = ch.codePointAt(0) ?? 0
    if (ch === "�") replacement++
    const isControl = c < 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d
    const isDelOrC1 = c >= 0x7f && c <= 0x9f
    if (isControl || isDelOrC1) control++
    if (/[a-z]/.test(ch)) lower++
    else if (/[A-Z]/.test(ch)) upper++
    else if (/[0-9]/.test(ch)) digits++
    else if (/\s/.test(ch)) spaces++
    else if (/[.,;:!?'"()\-]/.test(ch)) punctuation++
    else if (/[+/=_%\\]/.test(ch)) symbolish++
  }

  const printable = n - control
  let score = 50
  score += (printable / n) * 35
  score -= (control / n) * 60
  score -= replacement * 12
  score += Math.min(15, spaces * 2)
  score += Math.min(10, punctuation * 1.5)

  // "still looks like an encoded blob" signature: mixed-case + digits, no spaces at all
  const looksLikeBlob = n >= 8 && spaces === 0 && upper > 0 && lower > 0 && digits > 0
  if (looksLikeBlob) score -= 18
  if (symbolish > 0) score -= Math.min(15, symbolish * 3)

  // Still entirely hex-charset (0-9a-f), even length: could well be another layer of
  // hex-encoded bytes rather than "done" plaintext (e.g. "686f6c61" vs "hola"). Nudge
  // the search to keep trying hex-decode on it rather than settling here by default —
  // real words made only of a-f (e.g. "facade") are unaffected in practice since if
  // decoding them further fails validation, they simply have no competing child route.
  if (n >= 6 && n % 2 === 0 && /^[0-9a-f]+$/i.test(text)) score -= 12

  // Valid JSON structure is strong evidence this is a meaningful result, not noise.
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === "object") score += 20
  } catch {
    /* not JSON — fine, most decoded text isn't */
  }

  // Crude entropy check (only meaningful for longer strings): near-uniform character
  // distribution suggests binary/random data rather than language or structured text.
  if (n >= 12) {
    const freq = new Map<string, number>()
    for (const ch of chars) freq.set(ch, (freq.get(ch) ?? 0) + 1)
    let entropy = 0
    for (const count of freq.values()) {
      const p = count / n
      entropy -= p * Math.log2(p)
    }
    const maxEntropy = Math.log2(freq.size || 1)
    const normalized = maxEntropy > 0 ? entropy / maxEntropy : 0
    if (normalized > 0.92) score -= 12
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ── Beam search over decode paths ────────────────────────────────────────

export const MAX_DEPTH = 8
export const BEAM_WIDTH = 5
export const MIN_CONFIDENCE = 75 // detector confidence floor to even consider a candidate
export const STEP_PENALTY = 4 // per-step cost so a long chain has to earn its extra layers

export interface DecodeStep {
  operation: DetectionType
  label: string
  input: string
  output: string
  detectorConfidence: number
  outputQuality: number
}

export type StopReason =
  | "no-detection" // the original input never had a confident candidate
  | "hash" // best route ends at a value that looks like a one-way hash
  | "jwt" // best route ends at a detected JWT structure
  | "converged" // search found and settled on a genuinely decoded result
  | "max-depth" // a branch hit MAX_DEPTH while still finding candidates

interface Route {
  final: string
  steps: DecodeStep[]
  quality: number
  avgConfidence: number
  jwt: JwtInfo | null
  possibleHash: boolean
  hashConfidence?: number
  hashAlgo?: string
}

function routeScore(r: Route): number {
  if (r.jwt) return 1000 // structural convergence — always the answer when present
  // A recognized-but-undecodable hash is real positive evidence (not "nothing found"),
  // so it must outrank the plain "we did nothing" route it would otherwise tie with.
  if (r.possibleHash) return r.quality + 5
  // Quality of the resulting text is the primary signal. Detector confidence only
  // contributes for routes that actually decoded something (steps.length > 0) —
  // and only the amount *above* a neutral 50 baseline, so it nudges the search
  // toward continuing when a confident format is detected, without ever letting
  // "we did nothing" outscore "we decoded this" just because 0-step routes have
  // no detector evidence to average in the first place.
  const confidenceBonus = r.steps.length > 0 ? (r.avgConfidence - 50) * 0.3 : 0
  return r.quality + confidenceBonus - r.steps.length * STEP_PENALTY
}

/** applyDecode(candidate) — actually run a detected candidate's decode function. */
function applyDecode(candidate: Candidate): string | null {
  if (!candidate.decode) return null
  try {
    return candidate.decode()
  } catch {
    return null
  }
}

interface SearchState {
  value: string
  steps: DecodeStep[]
  priorValues: Set<string> // values already seen on THIS route — loop guard
  quality: number
  avgConfidence: number
}

/**
 * searchDecodePaths(input) — bounded beam search. Explores every reasonably
 * confident decode at each state, keeps the best BEAM_WIDTH states per depth,
 * and returns every state ever reached (each one is a valid candidate "final
 * answer" — going further isn't always better, e.g. "aG9sYQ==" vs "hola").
 */
function searchDecodePaths(input: string): Route[] {
  const initial: SearchState = {
    value: input,
    steps: [],
    priorValues: new Set([input]),
    quality: scoreValue(input),
    avgConfidence: 100,
  }

  const toRoute = (s: SearchState): Route => ({
    final: s.value,
    steps: s.steps,
    quality: s.quality,
    avgConfidence: s.avgConfidence,
    jwt: null,
    possibleHash: false,
  })

  const allRoutes: Route[] = [toRoute(initial)]
  let frontier: SearchState[] = [initial]
  const globalVisited = new Set<string>([input]) // dedupe expansion work across routes, not a correctness guard

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const nextFrontier: SearchState[] = []

    for (const state of frontier) {
      const jwt = detectJwt(state.value)
      if (jwt) {
        allRoutes.push({ final: state.value, steps: state.steps, quality: 100, avgConfidence: 100, jwt, possibleHash: false })
        continue // JWT is a structural leaf — never decoded further
      }

      const candidates = detectCandidates(state.value).filter((c) => c.confidence >= MIN_CONFIDENCE)
      if (candidates.length === 0) continue // this state is already a leaf in allRoutes (added when it was created)

      for (const cand of candidates) {
        if (cand.type === "hash") {
          allRoutes.push({ final: state.value, steps: state.steps, quality: state.quality, avgConfidence: state.avgConfidence, jwt: null, possibleHash: true, hashConfidence: cand.confidence, hashAlgo: cand.algo })
          continue
        }
        const decoded = applyDecode(cand)
        if (decoded === null || decoded === state.value) continue
        if (state.priorValues.has(decoded)) continue // A → B → A within this route — stop, don't loop

        const quality = scoreValue(decoded)
        const step: DecodeStep = {
          operation: cand.type,
          label: cand.label,
          input: state.value,
          output: decoded,
          detectorConfidence: cand.confidence,
          outputQuality: quality,
        }
        const stepCount = state.steps.length + 1
        const avgConfidence = (state.avgConfidence * state.steps.length + cand.confidence) / stepCount
        const child: SearchState = {
          value: decoded,
          steps: [...state.steps, step],
          priorValues: new Set(state.priorValues).add(decoded),
          quality,
          avgConfidence,
        }
        allRoutes.push(toRoute(child))
        if (!globalVisited.has(decoded)) {
          globalVisited.add(decoded)
          nextFrontier.push(child)
        }
      }
    }

    // Beam: keep only the most promising states for the next depth.
    nextFrontier.sort((a, b) => routeScore(toRoute(b)) - routeScore(toRoute(a)))
    frontier = nextFrontier.slice(0, BEAM_WIDTH)
  }

  return allRoutes
}

function stepsShareRoute(a: DecodeStep[], b: DecodeStep[]): boolean {
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  return shorter.every((step, i) => step.output === longer[i].output)
}

export interface AutoDecodeResult {
  original: string
  final: string
  confidence: number
  steps: DecodeStep[]
  jwt: JwtInfo | null
  isJson: boolean
  possibleHash: boolean
  /** Only set when possibleHash is true — the detected algorithm, e.g. "SHA-256". */
  hashAlgo: string | null
  alternatives: { final: string; confidence: number; steps: DecodeStep[] }[]
  converged: boolean
  stopReason: StopReason
}

function isValidJsonObjectOrArray(text: string): boolean {
  try {
    const v = JSON.parse(text)
    return v !== null && typeof v === "object"
  } catch {
    return false
  }
}

/**
 * autoDecode(input) — the Smart Recursive Auto Decoder. Explores the space of
 * decode paths and converges on the single most probable final result, without
 * the caller ever having to know which format(s) were used or in what order.
 */
export function autoDecode(input: string): AutoDecodeResult {
  if (!input.trim()) {
    return { original: input, final: input, confidence: 0, steps: [], jwt: null, isJson: false, possibleHash: false, hashAlgo: null, alternatives: [], converged: false, stopReason: "no-detection" }
  }

  const routes = searchDecodePaths(input)
  routes.sort((a, b) => routeScore(b) - routeScore(a))
  const best = routes[0]

  const stopReason: StopReason = best.jwt
    ? "jwt"
    : best.possibleHash
      ? "hash"
      : best.steps.length === 0
        ? "no-detection"
        : "converged"

  const confidence = best.jwt
    ? 99
    : best.possibleHash
      ? (best.hashConfidence ?? 90)
      : best.steps.length === 0
        ? 0
        : Math.round(best.steps.reduce((sum, s) => sum + s.detectorConfidence, 0) / best.steps.length)

  // Close, genuinely different alternatives only — skip anything that's just an
  // earlier/later stop along the same path as the winner, and cap the noise.
  const alternatives = routes
    .filter((r) => r !== best && r.final !== best.final && !r.jwt && !stepsShareRoute(r.steps, best.steps))
    .sort((a, b) => routeScore(b) - routeScore(a))
    .filter((r, idx, arr) => arr.findIndex((x) => x.final === r.final) === idx) // unique by final value
    .slice(0, 2)
    .filter((r) => routeScore(best) - routeScore(r) <= 30)
    .map((r) => ({
      final: r.final,
      confidence: r.possibleHash
        ? (r.hashConfidence ?? 90)
        : r.steps.length === 0
          ? 0
          : Math.round(r.steps.reduce((s, x) => s + x.detectorConfidence, 0) / r.steps.length),
      steps: r.steps,
    }))

  return {
    original: input,
    final: best.final,
    confidence,
    steps: best.steps,
    jwt: best.jwt,
    isJson: !best.jwt && isValidJsonObjectOrArray(best.final),
    possibleHash: best.possibleHash,
    hashAlgo: best.possibleHash ? (best.hashAlgo ?? null) : null,
    alternatives,
    converged: best.steps.length > 0 || !!best.jwt || best.possibleHash,
    stopReason,
  }
}
