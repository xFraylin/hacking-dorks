"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, RotateCcw, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import type { AutoDecodeResult } from "@/lib/auto-decode"
import { copyToClipboard } from "@/lib/clipboard-utils"

interface AutoDecodePanelProps {
  result: AutoDecodeResult
  /** Called with the raw JWT token string when the user clicks "Open in JWT Editor". */
  onOpenJwt: (token: string) => void
  /** Re-runs the engine starting from the current final result. */
  onDecodeAgain: () => void
}

function tryPrettyJson(text: string): string | null {
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === "object") return JSON.stringify(parsed, null, 2)
  } catch {
    /* not JSON */
  }
  return null
}

export function AutoDecodePanel({ result, onOpenJwt, onDecodeAgain }: AutoDecodePanelProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text)
    if (!ok) return
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Structural JWT convergence — shown as 3 parts, never "decoded" further as text.
  if (result.jwt) {
    const { header, payload, signature, token } = result.jwt
    return (
      <div className="space-y-2.5 p-4 bg-black/30 border border-fuchsia-500/20 rounded-xl">
        <p className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Detected: JWT</p>
        <div className="space-y-1.5">
          <div className="p-2.5 bg-black/30 border border-red-500/20 rounded-lg">
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Header</span>
            <pre className="text-xs font-mono text-red-300 break-all whitespace-pre-wrap mt-0.5">{JSON.stringify(header, null, 2)}</pre>
          </div>
          <div className="p-2.5 bg-black/30 border border-purple-500/20 rounded-lg">
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">Payload</span>
            <pre className="text-xs font-mono text-purple-300 break-all whitespace-pre-wrap mt-0.5">{JSON.stringify(payload, null, 2)}</pre>
          </div>
          <div className="p-2.5 bg-black/30 border border-cyan-500/20 rounded-lg">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">Signature</span>
            <p className="text-xs font-mono text-cyan-300 break-all mt-0.5">{signature || "(vacía)"}</p>
          </div>
        </div>
        <button
          onClick={() => onOpenJwt(token)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/40 text-fuchsia-300 transition-all"
        >
          Open in JWT Editor
        </button>
      </div>
    )
  }

  if (!result.converged) {
    return (
      <div className="p-4 bg-black/30 border border-white/10 rounded-xl">
        <p className="text-sm text-gray-300">No confident encoding detected.</p>
        <pre className="mt-2 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-400 break-all whitespace-pre-wrap">{result.original}</pre>
      </div>
    )
  }

  if (result.possibleHash) {
    return (
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2">
        <p className="text-sm font-semibold text-orange-300">
          Possible hash / hex data{result.hashAlgo ? <> — <span className="font-mono">{result.hashAlgo}</span></> : ""}
        </p>
        <p className="text-xs text-orange-400/80">
          {result.hashAlgo
            ? <>La longitud ({result.final.trim().length} caracteres hex) coincide con <span className="font-mono">{result.hashAlgo}</span>. Es una función de una sola vía — no se intenta "decodificar".</>
            : 'Esta cadena tiene la forma de un hash de una sola vía (o datos hex sin texto legible detrás) — no se intenta "decodificar".'}
        </p>
        <pre className="p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-orange-200 break-all whitespace-pre-wrap">{result.final}</pre>
      </div>
    )
  }

  const routeSummary = result.steps.map((s) => s.label).join(" → ")
  const pretty = tryPrettyJson(result.final)

  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] font-semibold text-fuchsia-400 tracking-wide">FINAL RESULT</span>
        <div className="relative mt-1">
          <pre className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl text-sm font-mono text-fuchsia-100 break-all whitespace-pre-wrap pr-12 max-h-52 overflow-y-auto">
            {pretty ?? result.final}
          </pre>
          <Button size="icon" variant="ghost" className="absolute top-3 right-3 h-8 w-8 hover:bg-white/20 rounded-lg" onClick={() => copy(result.final, "final")}>
            {copiedKey === "final" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
          </Button>
        </div>
        {result.isJson && <p className="mt-1 text-[11px] text-gray-500">JSON válido — formateado para lectura (el valor copiado es el original).</p>}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
        <span>Confidence: <span className="text-fuchsia-300 font-semibold">{result.confidence}%</span></span>
        {result.steps.length > 0 && (
          <span>Decoded through {result.steps.length} layer{result.steps.length === 1 ? "" : "s"} — <span className="font-mono text-gray-300">{routeSummary}</span></span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
        >
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          Show details
        </button>
        <button
          onClick={onDecodeAgain}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />Decode Again
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wide">ORIGINAL</span>
            <pre className="mt-1 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-gray-300 break-all whitespace-pre-wrap max-h-32 overflow-y-auto">{result.original}</pre>
          </div>
          {result.steps.map((s, i) => {
            const key = `step-${i}`
            return (
              <div key={key} className="relative">
                <span className="text-[10px] font-semibold text-gray-500 tracking-wide">
                  {i + 1}. {s.label} · Confidence: {s.detectorConfidence}%
                </span>
                <pre className="mt-1 p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-fuchsia-300 break-all whitespace-pre-wrap pr-12 max-h-32 overflow-y-auto">{s.output}</pre>
                <Button size="icon" variant="ghost" className="absolute top-6 right-2 h-7 w-7 hover:bg-white/20 rounded-lg" onClick={() => copy(s.output, key)}>
                  {copiedKey === key ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {result.alternatives.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-[10px] font-semibold text-gray-500 tracking-wide">ALTERNATIVE RESULTS</span>
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">Best result</span>
            <span className="text-xs font-mono text-fuchsia-300 truncate">{result.final}</span>
            <span className="text-xs font-semibold text-fuchsia-400 flex-shrink-0">{result.confidence}%</span>
          </div>
          {result.alternatives.map((alt, i) => (
            <div key={i} className="p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">Alternative</span>
              <span className="text-xs font-mono text-gray-300 truncate">{alt.final}</span>
              <span className="text-xs font-semibold text-gray-400 flex-shrink-0">{alt.confidence}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
