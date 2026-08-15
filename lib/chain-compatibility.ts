// ────────────────────────────────────────────────────────────────────────────
// Transformation Chain compatibility engine — decides, in real time, whether
// a given operation makes sense applied to the ACTUAL value currently flowing
// through the pipeline (not by step name/history, but by content).
//
// This intentionally reuses the exact same building blocks as everywhere else
// in the app instead of re-implementing format validation:
//   - decode attempts call the real lib/codec-utils.ts functions and read
//     their thrown Error messages (those messages ARE the validation logic —
//     alphabet, padding, round-trip-through-UTF8, etc.)
//   - "is this format actually present, with how much confidence" reuses the
//     Smart Auto Decoder's detectCandidates()/autoDecode() from lib/auto-decode.ts
// No parallel detection logic lives here — only classification of results
// that were already computed by those two modules.
// ────────────────────────────────────────────────────────────────────────────

import {
  base64Decode,
  base64UrlDecode,
  urlDecode,
  hexDecode,
  htmlDecode,
  unicodeUnescape,
  jsHexUnescape,
} from "./codec-utils"
import { autoDecode, detectCandidates } from "./auto-decode"

export type StepType =
  | "auto_decode"
  | "base64_encode" | "base64_decode"
  | "base64url_encode" | "base64url_decode"
  | "url_encode" | "url_decode"
  | "hex_encode" | "hex_decode"
  | "html_encode" | "html_decode"
  | "unicode_escape" | "unicode_unescape"
  | "jshex_escape" | "jshex_unescape"
  | "reverse" | "upper" | "lower" | "rot13" | "caesar"
  | "md5" | "md4" | "sha1" | "sha256" | "sha384" | "sha512"

export const HASH_STEP_TYPES: ReadonlySet<StepType> = new Set([
  "md5", "md4", "sha1", "sha256", "sha384", "sha512",
])

export type CompatStatus = "compatible" | "warning" | "incompatible"

export interface CompatibilityResult {
  status: CompatStatus
  /** 0-100 — how sure the engine is about this verdict (not about the decoded content). */
  confidence: number
  /** Human-readable "why" — shown in the button tooltip. */
  reason: string
  /** Only set for a "compatible" decode: what the value would become if applied now. */
  preview?: string
}

function compatible(reason: string, confidence = 95, preview?: string): CompatibilityResult {
  return { status: "compatible", confidence, reason, preview }
}
function warning(reason: string, confidence = 60): CompatibilityResult {
  return { status: "warning", confidence, reason }
}
function incompatible(reason: string, confidence = 100): CompatibilityResult {
  return { status: "incompatible", confidence, reason }
}

/**
 * Runs a real decode function against the real current value. The thrown
 * Error's message (from lib/codec-utils.ts) IS the incompatibility reason —
 * no separate validation is re-implemented here. A decode that "succeeds"
 * but changes nothing (no matching content found) is a warning, not a green
 * light: it's technically compatible but pointless.
 */
function decoderCompat(matchType: string, label: string, fn: () => string, currentValue: string): CompatibilityResult {
  let decoded: string
  try {
    decoded = fn()
  } catch (e: any) {
    return incompatible(e?.message ?? `La entrada actual no es ${label} válido.`, 100)
  }
  if (decoded === currentValue) {
    return warning(`No hay nada que decodificar: la salida actual no contiene contenido en formato ${label}.`, 45)
  }
  const match = detectCandidates(currentValue).find((c) => c.type === matchType)
  return compatible(`Entrada válida en formato ${label}.`, match?.confidence ?? 88, decoded)
}

const HAS_LETTER = /[a-zA-Z]/

/**
 * checkOperationCompatibility(operation, currentValue) — the single source of
 * truth for whether `operation` makes sense applied to `currentValue` right now.
 */
export function checkOperationCompatibility(type: StepType, currentValue: string): CompatibilityResult {
  switch (type) {
    // Auto Decode never hard-fails on content (it's designed to always return
    // something), so it's never red. But it only earns a green light when it
    // would genuinely decode something — same bar as every other decoder button.
    // When there's nothing real to decode it's a warning (harmless no-op), not
    // a false "compatible": marking it green unconditionally would make the
    // color meaningless, since it would then be green even when it does nothing.
    case "auto_decode": {
      if (!currentValue) return warning("Empty input — no hay nada que analizar.", 40)
      const result = autoDecode(currentValue)
      if (result.jwt) return compatible("JWT detectado — se mostrará como 3 partes estructurales (ver JWT Editor).", 95)
      if (result.possibleHash) {
        return warning(`Parece un hash${result.hashAlgo ? ` ${result.hashAlgo}` : ""} — de un solo sentido, no hay nada que decodificar.`, 65)
      }
      if (result.steps.length > 0) {
        const n = result.steps.length
        return compatible(`${n} possible encoded layer${n === 1 ? "" : "s"} detected.`, result.confidence, result.final)
      }
      return warning("No confident encoding detected — input will pass through unchanged.", 50)
    }

    // Encoders accept any string — they never fail on content, only decoders do.
    case "base64_encode":
    case "base64url_encode":
    case "url_encode":
    case "hex_encode":
    case "html_encode":
    case "unicode_escape":
    case "jshex_escape":
      return compatible("Acepta cualquier texto como entrada.", 95)

    case "base64_decode": return decoderCompat("base64_decode", "Base64", () => base64Decode(currentValue), currentValue)
    case "base64url_decode": return decoderCompat("base64url_decode", "Base64URL", () => base64UrlDecode(currentValue), currentValue)
    case "url_decode": return decoderCompat("url_decode", "URL-encoded", () => urlDecode(currentValue), currentValue)
    case "hex_decode": return decoderCompat("hex_decode", "hexadecimal", () => hexDecode(currentValue), currentValue)
    case "html_decode": return decoderCompat("html_decode", "HTML entity", () => htmlDecode(currentValue), currentValue)
    case "unicode_unescape": return decoderCompat("unicode_unescape", "\\uXXXX escape", () => unicodeUnescape(currentValue), currentValue)
    case "jshex_unescape": return decoderCompat("jshex_unescape", "\\xHH escape", () => jsHexUnescape(currentValue), currentValue)

    case "reverse":
      return compatible("Cualquier cadena puede invertirse.", 100)

    case "rot13":
      if (!HAS_LETTER.test(currentValue)) return warning("Sin efecto: la entrada no contiene caracteres alfabéticos para rotar.", 40)
      return compatible("Contiene caracteres alfabéticos para rotar.", 90)

    case "caesar":
      if (!HAS_LETTER.test(currentValue)) return warning("Sin efecto: la entrada no contiene caracteres alfabéticos para desplazar.", 40)
      return compatible("Contiene caracteres alfabéticos para desplazar.", 90)

    case "upper":
      if (currentValue.length > 0 && !/[a-z]/.test(currentValue)) return warning("Sin efecto: la entrada ya está en mayúsculas.", 40)
      return compatible("Contiene minúsculas que se convertirán.", 95)

    case "lower":
      if (currentValue.length > 0 && !/[A-Z]/.test(currentValue)) return warning("Sin efecto: la entrada ya está en minúsculas.", 40)
      return compatible("Contiene mayúsculas que se convertirán.", 95)

    // Hashes accept practically any string, but they're one-way — never a plain
    // green light, always a warning, regardless of content.
    case "md5": case "md4": case "sha1": case "sha256": case "sha384": case "sha512":
      return warning("One-way transformation. Everything before this step can no longer be recovered from the final output.", 100)
  }
}

// ── Per-step outcome of an ALREADY-EXECUTED pipeline stage ──────────────────
// Derived from the real before/after values the pipeline produced — not
// recomputed from scratch — so it reflects exactly what actually happened.

export type StepOutcomeStatus = "valid" | "warning" | "error"

export interface StepOutcome {
  status: StepOutcomeStatus
  reason: string
}

export function classifyStepOutcome(type: StepType, beforeValue: string, afterValue: string | null, error?: string): StepOutcome {
  if (error) return { status: "error", reason: error }
  if (HASH_STEP_TYPES.has(type)) {
    return { status: "warning", reason: "One-way transformation — everything before this step can no longer be recovered from the final output." }
  }
  if (afterValue !== null && afterValue === beforeValue) {
    return { status: "warning", reason: "Este paso no tuvo efecto sobre el valor que pasó por él." }
  }
  return { status: "valid", reason: "Ejecutado correctamente." }
}

// ── Suggested next steps ─────────────────────────────────────────────────
// Reuses detectCandidates() directly — every suggestion IS a live detector
// hit, just re-labeled as "the chain step that would apply it".

const DECODE_DETECTION_TYPES = new Set([
  "url_decode", "base64_decode", "base64url_decode", "hex_decode",
  "html_decode", "unicode_unescape", "jshex_unescape",
])

const FALLBACK_SUGGESTIONS: StepType[] = ["base64_encode", "url_encode", "sha256"]

export interface StepSuggestion {
  type: StepType
  confidence: number
  reason: string
  starred: boolean
}

/** suggestNextSteps(currentValue) — top candidates for the next chain step, highest confidence first. */
export function suggestNextSteps(currentValue: string, maxCount = 3): StepSuggestion[] {
  if (!currentValue) return []
  const candidates = detectCandidates(currentValue).filter((c) => DECODE_DETECTION_TYPES.has(c.type))
  if (candidates.length > 0) {
    return candidates.slice(0, maxCount).map((c) => ({
      type: c.type as StepType,
      confidence: c.confidence,
      reason: `${c.confidence}% de confianza de que esto es ${c.label}.`,
      starred: c.confidence >= 85,
    }))
  }
  return FALLBACK_SUGGESTIONS.slice(0, maxCount).map((type) => ({
    type,
    confidence: 0,
    reason: "Transformación de propósito general — no se detectó una señal fuerte para un decode específico.",
    starred: false,
  }))
}
