"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Layers, Trash2, ChevronUp, ChevronDown, GripVertical, Save, Bookmark, RotateCcw, AlertTriangle, X, Star } from "lucide-react"
import {
  base64Encode, base64Decode,
  base64UrlEncode, base64UrlDecode,
  urlEncode, urlDecode,
  hexEncode, hexDecode,
  htmlEncode, htmlDecode,
  unicodeEscape, unicodeUnescape,
  jsHexEscape, jsHexUnescape,
  strToBytes,
} from "@/lib/codec-utils"
import { md4, md5, sha } from "@/lib/hash-utils"
import { autoDecode } from "@/lib/auto-decode"
import { copyToClipboard } from "@/lib/clipboard-utils"
import {
  type StepType,
  type CompatibilityResult,
  type StepOutcomeStatus,
  HASH_STEP_TYPES,
  checkOperationCompatibility,
  classifyStepOutcome,
  suggestNextSteps,
} from "@/lib/chain-compatibility"

// StepType, the compatibility engine and per-step outcome classification all
// live in lib/chain-compatibility.ts — this component only wires them into UI.
// It reuses the exact same lib/codec-utils.ts functions the main Encoder/Decoder
// card and that engine use under the hood too. One shared implementation, no drift.

type Category = "smart" | "encode" | "decode" | "text" | "hash"

interface ChainStep {
  id: string
  type: StepType
  params?: { shift?: number }
}

const STEP_DEFS: Record<StepType, { label: string; category: Category }> = {
  auto_decode: { label: "Auto Decode", category: "smart" },
  base64_encode: { label: "Base64 Encode", category: "encode" },
  base64_decode: { label: "Base64 Decode", category: "decode" },
  base64url_encode: { label: "Base64URL Encode", category: "encode" },
  base64url_decode: { label: "Base64URL Decode", category: "decode" },
  url_encode: { label: "URL Encode", category: "encode" },
  url_decode: { label: "URL Decode", category: "decode" },
  hex_encode: { label: "Hex Encode", category: "encode" },
  hex_decode: { label: "Hex Decode", category: "decode" },
  html_encode: { label: "HTML Encode", category: "encode" },
  html_decode: { label: "HTML Decode", category: "decode" },
  unicode_escape: { label: "Unicode Escape", category: "encode" },
  unicode_unescape: { label: "Unicode Unescape", category: "decode" },
  jshex_escape: { label: "JS \\x Escape", category: "encode" },
  jshex_unescape: { label: "JS \\x Unescape", category: "decode" },
  reverse: { label: "Reverse string", category: "text" },
  upper: { label: "Uppercase", category: "text" },
  lower: { label: "Lowercase", category: "text" },
  rot13: { label: "ROT13", category: "text" },
  caesar: { label: "Caesar Cipher", category: "text" },
  md5: { label: "MD5", category: "hash" },
  md4: { label: "MD4", category: "hash" },
  sha1: { label: "SHA-1", category: "hash" },
  sha256: { label: "SHA-256", category: "hash" },
  sha384: { label: "SHA-384", category: "hash" },
  sha512: { label: "SHA-512", category: "hash" },
}

const CATEGORY_ORDER: Category[] = ["smart", "encode", "decode", "text", "hash"]
const CATEGORY_LABEL: Record<Category, string> = {
  smart: "SMART",
  encode: "ENCODE",
  decode: "DECODE",
  text: "TEXT TRANSFORMATIONS",
  hash: "HASH (one-way)",
}
const CATEGORY_TAG: Record<Category, string> = { smart: "AUTO", encode: "ENC", decode: "DEC", text: "TXT", hash: "HASH" }

// Reversible pairs used by "Reverse Pipeline". Anything not listed here (hashes,
// upper, lower) is one-way/lossy and cannot be part of an auto-reversed chain.
const REVERSE_PAIR: Partial<Record<StepType, StepType>> = {
  base64_encode: "base64_decode", base64_decode: "base64_encode",
  base64url_encode: "base64url_decode", base64url_decode: "base64url_encode",
  url_encode: "url_decode", url_decode: "url_encode",
  hex_encode: "hex_decode", hex_decode: "hex_encode",
  html_encode: "html_decode", html_decode: "html_encode",
  unicode_escape: "unicode_unescape", unicode_unescape: "unicode_escape",
  jshex_escape: "jshex_unescape", jshex_unescape: "jshex_escape",
  reverse: "reverse",
  rot13: "rot13",
}

// ── Compatibility → visual tone helpers ──────────────────────────────────
// A single "good / warn / bad" tone drives both the live add-step buttons
// (CompatStatus: compatible/warning/incompatible) and the already-executed
// pipeline step badges (StepOutcomeStatus: valid/warning/error) — same colors,
// same icon language, everywhere in this component.

type Tone = "good" | "warn" | "bad"

function toneOf(status: CompatibilityResult["status"] | StepOutcomeStatus): Tone {
  if (status === "compatible" || status === "valid") return "good"
  if (status === "warning") return "warn"
  return "bad" // "incompatible" | "error"
}

const TONE_BUTTON_CLASS: Record<Tone, string> = {
  good: "bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300",
  warn: "bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/25 hover:border-amber-500/40 text-amber-300",
  bad: "bg-red-500/5 hover:bg-red-500/10 border-red-500/25 hover:border-red-500/30 text-red-400",
}
const TONE_BADGE_CLASS: Record<Tone, string> = {
  good: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
  warn: "bg-amber-500/10 border-amber-500/25 text-amber-300",
  bad: "bg-red-500/10 border-red-500/25 text-red-300",
}

function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  if (tone === "good") return <Check className={className} />
  if (tone === "warn") return <AlertTriangle className={className} />
  return <X className={className} />
}

function truncate(text: string, max = 70): string {
  return text.length > max ? text.slice(0, max) + "…" : text
}

function buildAddStepTooltip(label: string, compat: CompatibilityResult, allowIncompatible: boolean): string {
  const statusWord = compat.status === "compatible" ? "Compatible" : compat.status === "warning" ? "Compatible, with a catch" : "Incompatible"
  let text = `${label} — ${statusWord}\n${compat.reason}`
  if (compat.preview) text += `\n\nPreview: ${truncate(compat.preview)}`
  if (compat.status === "incompatible" && allowIncompatible) {
    text += `\n\n⚠ This operation is expected to fail with the current output.`
  }
  return text
}

function rot13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

function caesar(input: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base)
  })
}

/** Builds the "AUTO DECODE\n\nURL Decode\n→ Base64 Decode\n\n2 layers decoded" step detail text. */
function summarizeAutoDecode(result: ReturnType<typeof autoDecode>): string {
  if (result.jwt) return "AUTO DECODE\n\nDetected: JWT — ver JWT Editor para el desglose completo (no se decodifica como texto)."
  if (result.possibleHash) {
    const algo = result.hashAlgo ? ` — ${result.hashAlgo}` : ""
    return `AUTO DECODE\n\nPossible hash / hex data${algo} (one-way, no se intenta decodificar)`
  }
  if (!result.converged) return "AUTO DECODE\n\nNo confident encoding detected — input sin cambios."
  const chain = result.steps.map((s) => s.label).join("\n→ ")
  return `AUTO DECODE (confidence ${result.confidence}%)\n\n${chain}\n\n${result.steps.length} layer${result.steps.length === 1 ? "" : "s"} decoded`
}

// Every branch below calls the exact same lib/codec-utils.ts function the main
// Encoder/Decoder card uses — no parallel/duplicate implementation here.
async function runStep(type: StepType, input: string, params?: ChainStep["params"]): Promise<string> {
  switch (type) {
    case "base64_encode": return base64Encode(input)
    case "base64_decode": return base64Decode(input)
    case "base64url_encode": return base64UrlEncode(input)
    case "base64url_decode": return base64UrlDecode(input)
    case "url_encode": return urlEncode(input)
    case "url_decode": return urlDecode(input)
    case "hex_encode": return hexEncode(input)
    case "hex_decode": return hexDecode(input)
    case "html_encode": return htmlEncode(input)
    case "html_decode": return htmlDecode(input)
    case "unicode_escape": return unicodeEscape(input)
    case "unicode_unescape": return unicodeUnescape(input)
    case "jshex_escape": return jsHexEscape(input)
    case "jshex_unescape": return jsHexUnescape(input)
    case "reverse": return Array.from(input).reverse().join("")
    case "upper": return input.toUpperCase()
    case "lower": return input.toLowerCase()
    case "rot13": return rot13(input)
    case "caesar": return caesar(input, params?.shift ?? 3)
    case "md5": return md5(strToBytes(input))
    case "md4": return md4(strToBytes(input))
    case "sha1": return sha(strToBytes(input), "SHA-1")
    case "sha256": return sha(strToBytes(input), "SHA-256")
    case "sha384": return sha(strToBytes(input), "SHA-384")
    case "sha512": return sha(strToBytes(input), "SHA-512")
    // The pipeline loop special-cases "auto_decode" itself (to also surface the
    // per-layer detail text), but keep runStep exhaustive/self-contained too.
    case "auto_decode": return autoDecode(input).final
  }
}

interface Preset { name: string; steps: { type: StepType; params?: ChainStep["params"] }[] }

const DEFAULT_PRESETS: Preset[] = [
  { name: "Auto Decode → Reverse → Base64", steps: [{ type: "auto_decode" }, { type: "reverse" }, { type: "base64_encode" }] },
  { name: "Base64 → URL Encode", steps: [{ type: "base64_encode" }, { type: "url_encode" }] },
  { name: "Reverse → Base64", steps: [{ type: "reverse" }, { type: "base64_encode" }] },
  { name: "MD5 → Caesar +3", steps: [{ type: "md5" }, { type: "caesar", params: { shift: 3 } }] },
  { name: "Base64 → SHA256", steps: [{ type: "base64_encode" }, { type: "sha256" }] },
  { name: "Base64 Decode", steps: [{ type: "base64_decode" }] },
  { name: "URL Decode → Base64 Decode", steps: [{ type: "url_decode" }, { type: "base64_decode" }] },
  { name: "Hex Decode", steps: [{ type: "hex_decode" }] },
  { name: "Base64URL Decode", steps: [{ type: "base64url_decode" }] },
  { name: "HTML Decode", steps: [{ type: "html_decode" }] },
  { name: "Base64 Encode → Base64 Decode", steps: [{ type: "base64_encode" }, { type: "base64_decode" }] },
  { name: "Hex Encode → Hex Decode", steps: [{ type: "hex_encode" }, { type: "hex_decode" }] },
  { name: "URL Encode → URL Decode", steps: [{ type: "url_encode" }, { type: "url_decode" }] },
]

const LS_KEY = "hacking-dorks:chain-presets"
const uid = () => Math.random().toString(36).slice(2, 10)

function isKnownStepType(t: unknown): t is StepType {
  return typeof t === "string" && Object.prototype.hasOwnProperty.call(STEP_DEFS, t)
}

interface StageResult {
  label: string
  before: string
  output: string
  error?: string
  detail?: string
  outcome: StepOutcomeStatus
  outcomeReason: string
}

export function TransformationChain() {
  const [input, setInput] = useState("")
  const [steps, setSteps] = useState<ChainStep[]>([])
  const [stageResults, setStageResults] = useState<StageResult[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [customPresets, setCustomPresets] = useState<Preset[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [reverseNotice, setReverseNotice] = useState<string | null>(null)
  const [showIncompatible, setShowIncompatible] = useState(true)
  const [allowIncompatible, setAllowIncompatible] = useState(false)
  const runSeq = useRef(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Defensively drop any preset saved by an older version of this tool
        // whose step ids no longer exist (e.g. bare "base64" pre-encode/decode split).
        const valid = parsed.filter(
          (p: any) => p && typeof p.name === "string" && Array.isArray(p.steps) && p.steps.every((s: any) => isKnownStepType(s?.type))
        )
        setCustomPresets(valid)
      }
    } catch { /* ignore corrupt localStorage */ }
  }, [])

  const addStep = (type: StepType) => {
    setReverseNotice(null)
    setSteps((prev) => [...prev, { id: uid(), type, params: type === "caesar" ? { shift: 3 } : undefined }])
  }
  const removeStep = (id: string) => {
    setReverseNotice(null)
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }
  const moveStep = (index: number, dir: -1 | 1) => {
    setReverseNotice(null)
    setSteps((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }
  const updateShift = (id: string, shift: number) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, params: { ...s.params, shift } } : s)))
  }

  const reorderByDrag = (from: number, to: number) => {
    if (from === to) return
    setReverseNotice(null)
    setSteps((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const loadPreset = (preset: Preset) => {
    setReverseNotice(null)
    setSteps(preset.steps.map((s) => ({ id: uid(), type: s.type, params: s.params })))
  }

  const saveCurrentAsPreset = () => {
    if (steps.length === 0) return
    const name = window.prompt("Nombre del preset:")
    if (!name) return
    const preset: Preset = { name, steps: steps.map(({ type, params }) => ({ type, params })) }
    const next = [...customPresets.filter((p) => p.name !== name), preset]
    setCustomPresets(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* storage full/unavailable */ }
  }

  const deletePreset = (name: string) => {
    const next = customPresets.filter((p) => p.name !== name)
    setCustomPresets(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const reversePipeline = () => {
    if (steps.length === 0) return
    const irreversible = steps.some((s) => s.type !== "caesar" && !REVERSE_PAIR[s.type])
    if (irreversible) {
      setReverseNotice("This pipeline contains one-way or lossy transformations and cannot be automatically reversed.")
      return
    }
    const reversed = [...steps].reverse().map((s): ChainStep => {
      if (s.type === "caesar") {
        return { id: uid(), type: "caesar", params: { shift: -(s.params?.shift ?? 3) } }
      }
      return { id: uid(), type: REVERSE_PAIR[s.type]!, params: s.params }
    })
    setSteps(reversed)
    setReverseNotice(null)
  }

  // Live execution — recompute the whole pipeline whenever input/steps change.
  // Every stage also records its own before/after → StepOutcome, purely derived
  // from the real values that were actually produced (never re-guessed by name).
  useEffect(() => {
    const seq = ++runSeq.current
    if (steps.length === 0) { setStageResults([]); return }
    ;(async () => {
      let current = input
      const results: StageResult[] = []
      for (const step of steps) {
        const def = STEP_DEFS[step.type]
        const label = step.type === "caesar" ? `${def.label} (shift ${step.params?.shift ?? 3})` : def.label
        const before = current
        try {
          if (step.type === "auto_decode") {
            const r = autoDecode(current)
            current = r.final
            const outcome = classifyStepOutcome(step.type, before, current)
            results.push({ label, before, output: current, detail: summarizeAutoDecode(r), outcome: outcome.status, outcomeReason: outcome.reason })
          } else {
            current = await runStep(step.type, current, step.params)
            const outcome = classifyStepOutcome(step.type, before, current)
            results.push({ label, before, output: current, outcome: outcome.status, outcomeReason: outcome.reason })
          }
        } catch (e: any) {
          const message = e?.message ?? "Error al ejecutar este paso"
          const outcome = classifyStepOutcome(step.type, before, null, message)
          results.push({ label, before, output: "", error: message, outcome: outcome.status, outcomeReason: outcome.reason })
          break
        }
      }
      if (seq === runSeq.current) setStageResults(results)
    })()
  }, [input, steps])

  const copy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text)
    if (!ok) return
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const finalOutput = stageResults.length > 0 ? stageResults[stageResults.length - 1] : null

  // ── Compatibility analysis — recomputed on every render from the REAL value
  // currently flowing through the pipeline (last successfully-executed stage's
  // output, or the raw input if the pipeline is empty/broken at step 1). This
  // is deliberately NOT memoized on step identity/order — only on the value —
  // so it never "remembers" a stale verdict from a renamed/reordered step.
  const lastGoodOutput = (() => {
    for (let i = stageResults.length - 1; i >= 0; i--) {
      if (!stageResults[i].error) return stageResults[i].output
    }
    return input
  })()

  const compatByType = useMemo(() => {
    const map = {} as Record<StepType, CompatibilityResult>
    for (const t of Object.keys(STEP_DEFS) as StepType[]) {
      map[t] = checkOperationCompatibility(t, lastGoodOutput)
    }
    return map
  }, [lastGoodOutput])

  const suggestions = useMemo(() => suggestNextSteps(lastGoodOutput), [lastGoodOutput])

  const attemptAddStep = (type: StepType) => {
    const compat = compatByType[type]
    if (compat.status === "incompatible" && !allowIncompatible) return
    addStep(type)
  }

  const scrollToStep = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const firstErrorIndex = stageResults.findIndex((r) => r.error)
  const irreversibleIndex = steps.findIndex((s) => HASH_STEP_TYPES.has(s.type))
  const reachedIrreversible = irreversibleIndex !== -1 && irreversibleIndex < stageResults.length

  const pipelineBadge = steps.length === 0
    ? null
    : firstErrorIndex !== -1
      ? { tone: "bad" as Tone, text: `Invalid pipeline — Problem at Step ${firstErrorIndex + 1}`, clickIndex: firstErrorIndex }
      : reachedIrreversible
        ? { tone: "warn" as Tone, text: "Valid with irreversible operations", clickIndex: irreversibleIndex }
        : { tone: "good" as Tone, text: "Valid pipeline", clickIndex: null as number | null }

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-semibold">Transformation Chain</span>
          </div>
        </div>
        <CardTitle className="text-white text-xl font-bold">Custom Encoding / Transformation Chain</CardTitle>
        <p className="text-gray-400 text-sm">Encadena encodings, decodings, transformaciones de texto y hashes en el orden que quieras, y observa cada etapa</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          rows={3}
          placeholder="Input inicial de la cadena..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-400/50 resize-none"
        />

        {/* Presets */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Presets</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PRESETS.map((p) => (
              <button key={p.name} onClick={() => loadPreset(p)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-fuchsia-500/20 border border-white/10 hover:border-fuchsia-500/30 text-gray-300 hover:text-fuchsia-300 transition-all">
                {p.name}
              </button>
            ))}
            {customPresets.map((p) => (
              <div key={p.name} className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                <button onClick={() => loadPreset(p)} className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1.5">
                  <Bookmark className="h-3 w-3" />{p.name}
                </button>
                <button onClick={() => deletePreset(p.name)} className="p-1 hover:bg-white/10 rounded-md" title="Eliminar preset">
                  <Trash2 className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            ))}
            <button onClick={saveCurrentAsPreset} disabled={steps.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Save className="h-3.5 w-3.5" />Guardar cadena actual
            </button>
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-semibold text-gray-400">Pipeline ({steps.length} pasos)</label>
              {pipelineBadge && (
                <button
                  type="button"
                  onClick={() => pipelineBadge.clickIndex !== null && scrollToStep(pipelineBadge.clickIndex)}
                  title={pipelineBadge.clickIndex !== null ? "Click para ir al paso con el problema" : undefined}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all ${TONE_BADGE_CLASS[pipelineBadge.tone]} ${pipelineBadge.clickIndex !== null ? "cursor-pointer hover:brightness-125" : "cursor-default"}`}
                >
                  <ToneIcon tone={pipelineBadge.tone} className="h-3 w-3" />
                  {pipelineBadge.text}
                </button>
              )}
            </div>
            <button onClick={reversePipeline} disabled={steps.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white/5 hover:bg-fuchsia-500/20 border border-white/10 hover:border-fuchsia-500/30 text-gray-300 hover:text-fuchsia-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <RotateCcw className="h-3 w-3" />Reverse Pipeline
            </button>
          </div>
          {steps.length === 0 && (
            <p className="text-xs text-gray-600 italic mb-2">Agrega pasos abajo para construir tu cadena de transformación.</p>
          )}
          {reverseNotice && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{reverseNotice}</span>
            </div>
          )}
          <div className="space-y-2">
            {steps.map((step, i) => {
              const def = STEP_DEFS[step.type]
              const stage = stageResults[i]
              const outcomeTone: Tone | null = stage ? toneOf(stage.outcome) : null
              return (
                <div key={step.id}>
                  {reachedIrreversible && i === irreversibleIndex && (
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                      <span className="text-[10px] font-bold tracking-widest text-orange-400/80">IRREVERSIBLE BOUNDARY</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
                    </div>
                  )}
                  <div
                    ref={(el) => { stepRefs.current[i] = el }}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragIndex !== null) reorderByDrag(dragIndex, i); setDragIndex(null) }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex items-center gap-2 p-2.5 bg-black/30 border rounded-xl transition-all ${dragIndex === i ? "border-fuchsia-400/50 opacity-60" : "border-white/10"}`}
                  >
                    <GripVertical className="h-4 w-4 text-gray-600 cursor-grab flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-500 w-5 flex-shrink-0">{i + 1}</span>
                    {outcomeTone ? (
                      <span title={stage.outcomeReason} className={`p-1 rounded-md border flex-shrink-0 ${TONE_BADGE_CLASS[outcomeTone]}`}>
                        <ToneIcon tone={outcomeTone} className="h-3 w-3" />
                      </span>
                    ) : (
                      <span title="No alcanzado: un paso anterior falló." className="p-1 rounded-md border border-white/10 text-gray-600 flex-shrink-0">
                        <span className="block h-3 w-3 text-center text-[10px] leading-3">—</span>
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex-shrink-0 ${TONE_BADGE_CLASS[toneOf(compatByType[step.type].status)]}`}>{def.label}</span>
                    <span className="text-[9px] font-bold text-gray-600 tracking-wider flex-shrink-0">{CATEGORY_TAG[def.category]}</span>
                    {step.type === "caesar" && (
                      <input
                        type="number"
                        value={step.params?.shift ?? 3}
                        onChange={(e) => updateShift(step.id, parseInt(e.target.value || "0", 10))}
                        className="w-16 px-2 py-1 bg-black/40 border border-white/10 rounded-md text-xs font-mono text-white focus:outline-none focus:border-fuchsia-400/50"
                      />
                    )}
                    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed" title="Mover arriba">
                        <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed" title="Mover abajo">
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => removeStep(step.id)} className="p-1.5 hover:bg-red-500/20 rounded-md" title="Eliminar paso">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Suggested next steps — top live detector hits for the current output */}
        {suggestions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Suggested next steps</label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s.type} onClick={() => attemptAddStep(s.type)} title={s.reason}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-fuchsia-500/5 hover:bg-fuchsia-500/15 border border-fuchsia-500/25 hover:border-fuchsia-500/40 text-fuchsia-300 transition-all">
                  {s.starred && <Star className="h-3 w-3 fill-current" />}
                  {STEP_DEFS[s.type].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Step */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none">
              <input type="checkbox" checked={showIncompatible} onChange={(e) => setShowIncompatible(e.target.checked)} className="accent-fuchsia-500" />
              Show incompatible operations
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none">
              <input type="checkbox" checked={allowIncompatible} onChange={(e) => setAllowIncompatible(e.target.checked)} className="accent-fuchsia-500" />
              Allow incompatible steps
            </label>
          </div>
          {CATEGORY_ORDER.map((cat) => {
            const items = (Object.keys(STEP_DEFS) as StepType[])
              .filter((t) => STEP_DEFS[t].category === cat)
              .filter((t) => showIncompatible || compatByType[t].status !== "incompatible")
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <span className="text-[10px] font-semibold text-gray-500 tracking-wide">{CATEGORY_LABEL[cat]}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {items.map((t) => {
                    const compat = compatByType[t]
                    const tone = toneOf(compat.status)
                    const locked = compat.status === "incompatible" && !allowIncompatible
                    return (
                      <button key={t} onClick={() => attemptAddStep(t)} disabled={locked}
                        title={buildAddStepTooltip(STEP_DEFS[t].label, compat, allowIncompatible)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${TONE_BUTTON_CLASS[tone]} ${locked ? "opacity-40 cursor-not-allowed" : ""}`}>
                        <ToneIcon tone={tone} className="h-3 w-3" />
                        {STEP_DEFS[t].label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Stage-by-stage results */}
        {stageResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="relative">
              <span className="text-[10px] font-semibold text-gray-500 tracking-wide">INPUT</span>
              <pre className="mt-1 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-300 break-all whitespace-pre-wrap max-h-32 overflow-y-auto">{input || "(vacío)"}</pre>
            </div>
            {stageResults.map((r, i) => {
              const key = `stage-${i}`
              return (
                <div key={key} className="relative">
                  <span className="text-[10px] font-semibold text-gray-500 tracking-wide">STEP {i + 1} — {r.label.toUpperCase()}</span>
                  {r.error ? (
                    <p className="mt-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">⚠ {r.error}</p>
                  ) : (
                    <>
                      {r.detail && (
                        <pre className="mt-1 mb-1 p-2.5 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg text-[11px] font-mono text-fuchsia-300/90 whitespace-pre-wrap">{r.detail}</pre>
                      )}
                      <div className="relative">
                        <pre className="p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-fuchsia-300 break-all whitespace-pre-wrap pr-12 max-h-32 overflow-y-auto">{r.output}</pre>
                        <Button size="icon" variant="ghost" className="absolute top-1.5 right-1.5 h-7 w-7 hover:bg-white/20 rounded-lg" onClick={() => copy(r.output, key)}>
                          {copiedKey === key ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
            {finalOutput && !finalOutput.error && (
              <div className="relative pt-1">
                <span className="text-[10px] font-semibold text-fuchsia-400 tracking-wide">FINAL OUTPUT</span>
                <pre className="mt-1 p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl text-sm font-mono text-fuchsia-200 break-all whitespace-pre-wrap pr-12 max-h-40 overflow-y-auto">{finalOutput.output}</pre>
                <Button size="icon" variant="ghost" className="absolute top-6 right-3 h-8 w-8 hover:bg-white/20 rounded-lg" onClick={() => copy(finalOutput.output, "final")}>
                  {copiedKey === "final" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
