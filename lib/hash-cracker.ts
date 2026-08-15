// ────────────────────────────────────────────────────────────────────────────
// Hash Cracker — a small, 100% client-side dictionary attack against
// MD4 / MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 hex digests.
//
// Hashes are one-way by design — this does NOT "decrypt" a hash. It hashes a
// built-in wordlist of the most common leaked/default passwords (plus a
// handful of cheap case/suffix mutations) with every algorithm whose digest
// length matches the target, and reports a match if one lands. This is the
// same basic technique as `hashcat -a 0` / `john --wordlist` against a weak,
// unsalted hash — useful during an authorized pentest/CTF to flag reused or
// trivially weak credentials, never against hashes you don't have permission
// to test.
//
// No network calls, ever — matches the rest of the app's "GitHub Pages
// friendly, no backend" invariant. Reuses lib/hash-utils.ts (runHash) and
// lib/codec-utils.ts (strToBytes) — no hashing logic is duplicated here.
// ────────────────────────────────────────────────────────────────────────────

import { strToBytes } from "./codec-utils"
import { type HashAlgorithm, runHash } from "./hash-utils"

// Public, widely-published "most common passwords" data (the same kind of
// list shipped with any password-strength/auditing tool) plus a few
// pentest-relevant defaults (admin/root/changeme/etc.).
export const COMMON_WORDLIST: string[] = [
  "123456", "123456789", "12345678", "12345", "1234567", "1234567890", "qwerty", "password",
  "password1", "111111", "123123", "abc123", "1q2w3e4r", "qwertyuiop", "iloveyou", "000000",
  "letmein", "monkey", "dragon", "football", "baseball", "welcome", "shadow", "master",
  "michael", "superman", "1234", "sunshine", "princess", "azerty", "trustno1", "batman",
  "starwars", "hello", "freedom", "whatever", "qazwsx", "zaq12wsx", "passw0rd", "P@ssw0rd",
  "letmein1", "login", "admin", "admin123", "root", "toor", "changeme", "default",
  "guest", "test", "test123", "user", "demo", "temp", "temp123", "secret",
  "administrator", "supervisor", "manager", "welcome1", "qwerty123", "1qaz2wsx", "asdfghjkl", "asdf1234",
  "abcd1234", "abcd123", "121212", "654321", "666666", "888888", "999999", "7777777",
  "654321a", "123321", "112233", "159357", "753951", "987654321", "1qazxsw2", "zxcvbnm",
  "qwe123", "aaaaaa", "111222", "121314", "223344", "1a2b3c4d", "welcome123", "hunter2",
  "letmein123", "iloveyou1", "sunshine1", "football1", "baseball1", "dragon1", "monkey1", "master1",
  "shadow1", "michael1", "jennifer", "jordan", "hunter", "harley", "ranger", "buster",
  "soccer", "hockey", "killer", "george", "sexy", "andrew", "charlie", "daniel",
  "maggie", "summer", "cheese", "computer", "corvette", "nicole", "chelsea", "biteme",
  "matthew", "access", "yankees", "987654", "dallas", "austin", "thunder", "taylor",
  "matrix", "mobilemail", "mom", "monitor", "monitoring", "montana", "moon", "mother",
  "movie", "mozilla", "music", "mustang", "password123", "pa55word", "pa$$w0rd", "p4ssword",
  "changeit", "changepassword", "letme1n", "newpassword", "oldpassword", "backup", "database", "server",
  "network", "system", "service", "support", "public", "private", "internal", "external",
  "config", "settings", "install", "update", "upgrade", "webadmin", "sysadmin", "dbadmin",
  "ftpuser", "ftpadmin", "mysql", "postgres", "oracle", "sqlserver", "mongodb", "redis",
  "jenkins", "docker", "kubernetes", "aws", "azure", "gcp", "cloudadmin", "s3bucket",
  "api", "apikey", "token", "secretkey", "clientid", "clientsecret", "bearer", "oauth",
  "wordpress", "wp-admin", "joomla", "drupal", "magento", "shopify", "django", "flask",
  "email", "webmail", "mailserver", "smtp", "pop3", "imap", "outlook", "gmail",
  "linux", "windows", "macos", "ubuntu", "debian", "centos", "fedora", "kali",
  "hacker", "pentest", "security", "firewall", "vpn", "proxy", "gateway", "router",
  "switch", "cisco", "juniper", "fortinet", "paloalto", "checkpoint", "symantec", "mcafee",
  "abcdef", "abcdefg", "abcdefgh", "a1b2c3", "q1w2e3", "1qaz", "zxcvbn", "asdfgh",
  "trustme", "letmego", "opensesame", "changeme123", "welcome2024", "welcome2025", "spring2024", "summer2024",
  "autumn2024", "winter2024", "january1", "december1", "newyear", "christmas", "easter", "halloween",
]

const HEX_LENGTH_TO_ALGOS: Record<number, HashAlgorithm[]> = {
  32: ["MD5", "MD4"],
  40: ["SHA-1"],
  64: ["SHA-256"],
  96: ["SHA-384"],
  128: ["SHA-512"],
}

/** A handful of cheap mutations per word — mirrors a first-pass hashcat/john rule. */
function mutations(word: string): string[] {
  const variants = new Set<string>()
  variants.add(word)
  variants.add(word.toLowerCase())
  variants.add(word.toUpperCase())
  variants.add(word.charAt(0).toUpperCase() + word.slice(1))
  for (const suffix of ["1", "12", "123", "!", "2023", "2024", "2025"]) {
    variants.add(word + suffix)
  }
  return Array.from(variants)
}

export interface CrackResult {
  found: boolean
  algorithm?: HashAlgorithm
  plaintext?: string
  attempts: number
  candidateAlgorithms: HashAlgorithm[]
}

/**
 * crackHash(hash) — dictionary attack against a hex digest, entirely client-side.
 * Auto-detects the candidate algorithm(s) from the digest length (a 32-hex
 * digest could be MD5 or MD4, so both are tried).
 */
export async function crackHash(rawHash: string): Promise<CrackResult> {
  const hash = rawHash.trim().toLowerCase()
  const candidateAlgorithms = /^[0-9a-f]+$/.test(hash) ? (HEX_LENGTH_TO_ALGOS[hash.length] ?? []) : []
  if (candidateAlgorithms.length === 0) {
    return { found: false, attempts: 0, candidateAlgorithms: [] }
  }

  let attempts = 0
  for (const word of COMMON_WORDLIST) {
    for (const candidate of mutations(word)) {
      const bytes = strToBytes(candidate)
      for (const algo of candidateAlgorithms) {
        attempts++
        const digest = await runHash(bytes, algo)
        if (digest === hash) {
          return { found: true, algorithm: algo, plaintext: candidate, attempts, candidateAlgorithms }
        }
      }
    }
  }
  return { found: false, attempts, candidateAlgorithms }
}
