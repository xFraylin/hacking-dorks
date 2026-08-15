"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Key, AlertTriangle } from "lucide-react"
import { base64UrlDecode, base64UrlEncodeBytes, strToBytes } from "@/lib/codec-utils"
import { copyToClipboard } from "@/lib/clipboard-utils"

type AlgChoice = "preserve" | "none" | "HS256" | "HS384" | "HS512"

const HMAC_HASH: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" }

const DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}'
const DEFAULT_PAYLOAD = '{\n  "sub": "UA123",\n  "role": "user",\n  "iat": 1700000000,\n  "exp": 9999999999\n}'

const QUICK_CLAIMS: { key: string; sample: unknown }[] = [
  { key: "sub", sample: "UA123" },
  { key: "email", sample: "user@example.com" },
  { key: "role", sample: "admin" },
  { key: "name", sample: "John Doe" },
  { key: "user_id", sample: 1 },
  { key: "exp", sample: 9999999999 },
  { key: "iat", sample: 1700000000 },
  { key: "nbf", sample: 1700000000 },
  { key: "iss", sample: "https://issuer.example.com" },
  { key: "aud", sample: "my-app" },
]

function safeParseJson(text: string): { ok: true; value: any } | { ok: false; error: string } {
  try {
    const value = JSON.parse(text)
    return { ok: true, value }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "JSON inválido" }
  }
}

interface Output {
  jwt: string
  h: string
  p: string
  sig: string
  status: "unsigned" | "newly signed" | "original signature invalidated" | "original token unchanged" | "error"
  note: string
}

const EMPTY_OUTPUT: Output = { jwt: "", h: "", p: "", sig: "", status: "unsigned", note: "" }

interface JwtEditorProps {
  /** Bump `nonce` (e.g. Date.now()) each time you want `token` loaded, even if it's the same string as before. */
  externalToken?: { token: string; nonce: number } | null
}

export function JwtEditor({ externalToken }: JwtEditorProps = {}) {
  const [pasteInput, setPasteInput] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [headerJson, setHeaderJson] = useState(DEFAULT_HEADER)
  const [payloadJson, setPayloadJson] = useState(DEFAULT_PAYLOAD)
  const [algChoice, setAlgChoice] = useState<AlgChoice>("HS256")
  const [secret, setSecret] = useState("")
  const [copied, setCopied] = useState(false)
  const [output, setOutput] = useState<Output>(EMPTY_OUTPUT)

  const original = useRef<{ token: string; h: string; p: string; sig: string } | null>(null)
  const computeSeq = useRef(0)

  const parseJwt = (raw: string) => {
    setPasteInput(raw)
    const token = raw.trim()
    if (!token) { setPasteError(null); return }
    const parts = token.split(".")
    if (parts.length !== 3) {
      setPasteError("Formato inválido — se esperaban 3 partes separadas por '.' (HEADER.PAYLOAD.SIGNATURE)")
      return
    }
    const [h, p, sig] = parts
    try {
      const headerObj = JSON.parse(base64UrlDecode(h))
      const payloadObj = JSON.parse(base64UrlDecode(p))
      setHeaderJson(JSON.stringify(headerObj, null, 2))
      setPayloadJson(JSON.stringify(payloadObj, null, 2))
      original.current = { token, h, p, sig }
      setPasteError(null)
      const alg = typeof headerObj.alg === "string" ? headerObj.alg : "none"
      setAlgChoice(alg === "none" || alg === "HS256" || alg === "HS384" || alg === "HS512" ? (alg as AlgChoice) : "preserve")
    } catch (e: any) {
      setPasteError(`No se pudo decodificar el token: ${e?.message ?? "Base64URL o JSON inválido"}`)
    }
  }

  // Load a token pushed in from outside (e.g. "Open in JWT Editor" from Smart Auto Decode).
  useEffect(() => {
    if (externalToken) parseJwt(externalToken.token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalToken?.nonce])

  const setHeaderAlg = (alg: string) => {
    const parsed = safeParseJson(headerJson)
    const base = parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : {}
    setHeaderJson(JSON.stringify({ ...base, alg }, null, 2))
  }

  const chooseAlg = (choice: AlgChoice) => {
    setAlgChoice(choice)
    if (choice !== "preserve") setHeaderAlg(choice)
  }

  const insertClaim = (key: string, sample: unknown) => {
    const parsed = safeParseJson(payloadJson)
    const base = parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : {}
    setPayloadJson(JSON.stringify({ ...base, [key]: sample }, null, 2))
  }

  const headerParsed = safeParseJson(headerJson)
  const currentAlg: string | undefined =
    headerParsed.ok && headerParsed.value && typeof headerParsed.value === "object" ? headerParsed.value.alg : undefined
  const needsSecret = currentAlg === "HS256" || currentAlg === "HS384" || currentAlg === "HS512"

  useEffect(() => {
    const seq = ++computeSeq.current
    const hp = safeParseJson(headerJson)
    const pp = safeParseJson(payloadJson)

    if (!hp.ok) { setOutput({ ...EMPTY_OUTPUT, status: "error", note: `Header JSON inválido: ${hp.error}` }); return }
    if (!pp.ok) { setOutput({ ...EMPTY_OUTPUT, status: "error", note: `Payload JSON inválido: ${pp.error}` }); return }

    const alg = typeof hp.value.alg === "string" ? hp.value.alg : "none"
    const h = base64UrlEncodeBytes(strToBytes(JSON.stringify(hp.value)))
    const p = base64UrlEncodeBytes(strToBytes(JSON.stringify(pp.value)))
    const orig = original.current
    const contentUnchanged = !!orig && orig.h === h && orig.p === p

    const finish = (sig: string, status: Output["status"], note: string) => {
      if (seq !== computeSeq.current) return
      setOutput({ jwt: `${h}.${p}.${sig}`, h, p, sig, status, note })
    }

    if (alg === "none") {
      if (contentUnchanged && orig!.sig === "") finish("", "original token unchanged", "Token idéntico al pegado originalmente (alg: none, sin firma).")
      else finish("", "unsigned", "alg: none — el token no lleva firma (útil para probar bypass de verificación de firma).")
      return
    }

    if (alg === "HS256" || alg === "HS384" || alg === "HS512") {
      if (secret) {
        ;(async () => {
          try {
            const key = await crypto.subtle.importKey("raw", strToBytes(secret) as BufferSource, { name: "HMAC", hash: HMAC_HASH[alg] }, false, ["sign"])
            const sigBuf = await crypto.subtle.sign("HMAC", key, strToBytes(`${h}.${p}`) as BufferSource)
            const sig = base64UrlEncodeBytes(new Uint8Array(sigBuf))
            if (contentUnchanged && orig!.sig === sig) finish(sig, "original token unchanged", "El secreto reproduce exactamente la firma original.")
            else finish(sig, "newly signed", `Firmado con ${alg} usando la clave proporcionada.`)
          } catch {
            if (seq !== computeSeq.current) return
            setOutput({ ...EMPTY_OUTPUT, status: "error", note: "No se pudo firmar (error de Web Crypto API)." })
          }
        })()
        return
      }
      if (orig && orig.sig) {
        if (contentUnchanged) finish(orig.sig, "original token unchanged", "Sin secreto: se reutiliza la firma original porque el contenido no cambió.")
        else finish(orig.sig, "original signature invalidated", "Header/Payload editados — la firma original ya NO es válida para este contenido. Ingresa el secreto correcto para volver a firmar.")
      } else {
        finish("", "unsigned", "Ingresa un Secret / Signing Key para generar una firma HMAC válida.")
      }
      return
    }

    // alg preservado que no es none/HS* (p.ej. RS256 de un token pegado) — no se puede firmar en el navegador
    if (orig && orig.sig && contentUnchanged) finish(orig.sig, "original token unchanged", `alg: ${alg} — no soportado para firmar en el navegador; se conserva la firma original porque el contenido no cambió.`)
    else if (orig && orig.sig) finish(orig.sig, "original signature invalidated", `alg: ${alg} — no soportado para firmar en el navegador. La firma mostrada es la ORIGINAL y ya no es válida para el contenido editado.`)
    else finish("", "unsigned", `alg: ${alg} — no soportado para firmar en el navegador (solo HS256/HS384/HS512 vía Web Crypto).`)
  }, [headerJson, payloadJson, secret])

  const copyJwt = async () => {
    if (!output.jwt) return
    const ok = await copyToClipboard(output.jwt)
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusStyle: Record<Output["status"], string> = {
    unsigned: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    "newly signed": "bg-green-500/10 text-green-400 border-green-500/20",
    "original signature invalidated": "bg-red-500/10 text-red-400 border-red-500/20",
    "original token unchanged": "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <Card id="jwt-editor-section" className="bg-white/5 backdrop-blur-md border border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Key className="h-4 w-4" />
            <span className="text-xs font-semibold">JWT Editor / Builder</span>
          </div>
        </div>
        <CardTitle className="text-white text-xl font-bold">JWT Editor / Builder</CardTitle>
        <p className="text-gray-400 text-sm">Pega y edita un JWT existente, o construye uno desde cero — alg:none bypass, HS256/384/512 firmado</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Paste JWT */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Paste JWT</label>
          <input
            type="text"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            value={pasteInput}
            onChange={(e) => parseJwt(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/50"
          />
          {pasteError && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />{pasteError}</p>
          )}
          {original.current && !pasteError && (
            <p className="mt-1.5 text-xs text-cyan-400">✓ Token parseado — header y payload cargados abajo, algoritmo detectado automáticamente.</p>
          )}
        </div>

        {/* Algorithm selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Algoritmo</label>
          <div className="flex flex-wrap gap-2">
            {(["preserve", "none", "HS256", "HS384", "HS512"] as AlgChoice[]).map((alg) => (
              <button
                key={alg}
                onClick={() => chooseAlg(alg)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  algChoice === alg ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {alg === "preserve" ? "Preserve original" : `alg: ${alg}`}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Header (JSON)</label>
          <textarea rows={3} value={headerJson} onChange={(e) => setHeaderJson(e.target.value)} spellCheck={false}
            className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-violet-400/50 resize-none" />
        </div>

        {/* Payload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-400">Payload (JSON)</label>
          </div>
          <textarea rows={6} value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} spellCheck={false}
            className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-violet-400/50 resize-none" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_CLAIMS.map(({ key, sample }) => (
              <button
                key={key}
                onClick={() => insertClaim(key, sample)}
                title={`Agregar/actualizar claim "${key}"`}
                className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/30 text-gray-400 hover:text-violet-300 transition-all"
              >
                +{key}
              </button>
            ))}
          </div>
        </div>

        {/* Secret */}
        {needsSecret && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Secret / Signing Key</label>
            <input type="text" placeholder="secretkey" value={secret} onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/50" />
          </div>
        )}

        {/* Generated JWT */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Generated JWT</label>
          <div className="relative">
            <pre className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-violet-300 break-all whitespace-pre-wrap pr-12 max-h-40 overflow-y-auto min-h-[3rem]">
              {output.status === "error" ? `⚠ ${output.note}` : (output.jwt || "—")}
            </pre>
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 h-8 w-8 hover:bg-white/20 rounded-lg" onClick={copyJwt}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
            </Button>
          </div>
        </div>

        {/* HEADER / PAYLOAD / SIGNATURE breakdown */}
        {output.status !== "error" && output.jwt && (
          <div className="space-y-1.5">
            <div className="p-2.5 bg-black/30 border border-red-500/20 rounded-lg">
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Header</span>
              <p className="text-xs font-mono text-red-300 break-all mt-0.5">{output.h}</p>
            </div>
            <div className="p-2.5 bg-black/30 border border-purple-500/20 rounded-lg">
              <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">Payload</span>
              <p className="text-xs font-mono text-purple-300 break-all mt-0.5">{output.p}</p>
            </div>
            <div className="p-2.5 bg-black/30 border border-cyan-500/20 rounded-lg">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">Signature</span>
              <p className="text-xs font-mono text-cyan-300 break-all mt-0.5">{output.sig || "(vacía)"}</p>
            </div>
          </div>
        )}

        {/* Signature status */}
        {output.status !== "error" && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${statusStyle[output.status]}`}>
            <span className="font-semibold whitespace-nowrap">Signature status: {output.status}</span>
          </div>
        )}
        {output.note && output.status !== "error" && <p className="text-xs text-gray-500 -mt-2">{output.note}</p>}

        <p className="text-[11px] text-gray-600 leading-relaxed border-t border-white/5 pt-3">
          ⚠️ Herramienta educativa/de debugging. Editar el Header o Payload de un JWT invalida su firma original a menos que
          se vuelva a firmar con la clave correcta. Esta herramienta no intenta recuperar, adivinar ni crackear secretos JWT.
        </p>
      </CardContent>
    </Card>
  )
}
