// ────────────────────────────────────────────────────────────────────────────
// Clipboard utilities — safe copy-to-clipboard used across the app (Google
// Dorks Generator, JWT Editor, Auto-Decode Panel, Transformation Chain).
//
// navigator.clipboard is only defined in secure contexts (https/localhost)
// and may be missing entirely in older browsers or embedded webviews, which
// throws "Cannot read properties of undefined (reading 'writeText')" if
// called directly. This wraps it with a document.execCommand("copy")
// fallback so copy buttons never crash the page.
// ────────────────────────────────────────────────────────────────────────────

/** Copy text to the clipboard, falling back to execCommand when the async
 *  Clipboard API isn't available. Returns whether the copy succeeded. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to the legacy fallback below
    }
  }

  if (typeof document === "undefined") return false

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.top = "0"
  textarea.style.left = "0"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  let succeeded = false
  try {
    succeeded = document.execCommand("copy")
  } catch {
    succeeded = false
  } finally {
    document.body.removeChild(textarea)
  }

  return succeeded
}
