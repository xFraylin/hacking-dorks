# Hacking Dorks

> Advanced Security Research Toolkit — Google Dorks, Attack Payloads, Pentesting Tools & XSS Exploit Toolkit

A modern, interactive web application for security research, penetration testing, and authorized vulnerability assessments. Features a 4-tab interface with Google Dork generation, categorized attack payloads, an integrated tools suite, and a dedicated XSS Exploit Toolkit.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

## Live Demo

**[https://xfraylin.github.io/hacking-dorks](https://xfraylin.github.io/hacking-dorks)**

## Features

- **4-Tab Interface** — Google Dorks, Attack Payloads, Tools, and XSS Exploit Toolkit
- **70+ Dork Categories** — Organized in 8 groups with filter buttons and keyword search
- **40 Payload Categories** — SQLi, XSS, RCE, SSTI, LFI, XXE, SSRF, LDAP, XPath, Cache Poisoning and more
- **5 Integrated Tools** — Encoder/Decoder, Reverse Shell Generator, Hash Identifier, JWT Builder, Subdomain Wordlist Generator
- **XSS Exploit Toolkit** — 9 sections (Defacement, UI Injection, Redirect, CSRF via XSS, Exfil, Keylogging, Flow Control, Persistence, Blind XSS) with attacker URL substitution
- **Attacker URL Input** — Type your server/Burp Collaborator URL once and it auto-replaces in all XSS payloads
- **Payload Tags** — Each XSS exploit entry tagged as [Visual], [Destructive], [Stealth], [Persistent]
- **Export & Copy** — Per-payload copy, Copy All, and Export `.txt` per category
- **Global Search** — Keyword search across dorks and payloads independently
- **Domain Support** — Single or multiple domains with wildcard support
- **Bulk Operations** — Open all dorks in new tabs for mass reconnaissance
- **Responsive** — Works on desktop and mobile

## Installation

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- pnpm (recommended) or npm

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/xFraylin/hacking-dorks.git
   cd hacking-dorks
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

## Usage Guide

### Google Dorks Tab

1. **Enter Target Domain(s)** — `example.com` or `example.com, target.com, *.domain.com`
2. **Filter by Group** — Recon, Web Vulns, Credenciales, Archivos, Infraestructura, Cloud, CMS, OSINT
3. **Search Dorks** — keyword search across title, description and dork content
4. **Execute** — click a dork to open in Google, or use "Open All" for bulk recon

### Payloads Tab

1. **Filter by Tag** — 29 attack type filters
2. **Search** — keyword search across all payloads
3. **Copy** — per-payload copy icon or "Copy All" button per category
4. **Export** — download any category as `.txt`

### Tools Tab

| Tool | Description |
|------|-------------|
| Encoder / Decoder | URL, Base64, HTML, Hex, Unicode, JS Escape (11 operations) |
| Reverse Shell Generator | 20+ shell types with custom LHOST/LPORT |
| Hash Identifier | Detects MD5, SHA-1/256/512, bcrypt, NTLM, Argon2, JWT and more |
| JWT Builder | Build `alg:none` bypass tokens or HS256 signed JWTs |
| Subdomain Wordlist | 100+ common prefixes, export `.txt`, ffuf-ready command |

### XSS Exploit Toolkit Tab

1. **Set your server** — Enter your Burp Collaborator / VPS / interactsh URL once — all payloads update automatically
2. **Select section** — Navigate between 9 technique categories
3. **Read tags** — [Visual] [Destructive] [Stealth] [Persistent] on each entry
4. **Copy** — Click the copy icon to get the payload with your URL already injected

| Section | Entries | Description |
|---------|---------|-------------|
| DOM / Defacement | 27 | Full body replace, overlay, shake, blur, iFrame injection, watermark and more |
| UI Injection | 4 | Fake login overlay, phish button, alert banner, payment form swap |
| Redirección | 8 | Immediate, delayed, history-based and JS URI redirects |
| Acciones como usuario | 12 | Password change, account deletion, CSRF token grab, admin backdoor |
| Exfiltración | 19 | Cookies, localStorage, DOM snapshot, API response, window.name, full context dump |
| Keylogging | 10 | Per-key, buffered, input monitor, selection capture, MutationObserver hook |
| Control de flujo | 13 | Fetch/XHR/WebSocket intercept, opener hijack, response logger |
| Persistencia | 12 | Service Worker, IndexedDB, BroadcastChannel, MutationObserver re-injector |
| Blind XSS | 10 | XSS Hunter style, Burp Collaborator ping, interactsh, admin screenshotter |

## Dork Categories (70+)

### Recon
PHP Parameter Endpoints, API Surface Mapping, Critical URL Tokens, Authentication Endpoints, Test & Staging Sites, API Documentation, Wayback & Cache, Subdomains & Virtual Hosts, Juicy Extensions, Mobile API & Backend Endpoints

### Web Vulns
XSS Parameters, XSS Reflected Parameters, XSS Forms & Stored Vectors, Redirect Parameters, SQL Injection Parameters, SQLi Error Messages, SQLi Login & Auth Panels, SQLi Numeric Parameters, SSRF Parameters, File Inclusion Candidates, File Inclusion Config & Logs, Command Execution, File Upload Discovery, GraphQL Endpoints, CORS Misconfiguration, WebSocket Endpoints, OAuth & SSO Endpoints, Password Reset & Account Takeover

### Credenciales
Exposed Credentials, Configuration Secrets, GitHub Leaks, Exposed API Keys & Tokens

### Archivos
Sensitive File Discovery, Confidential Documents, Backup Archives, Sensitive Documents, Exposed .git / .env / .DS_Store, Directory Listing

### Infraestructura
Exposed Admin Panels, Exposed Databases & Caches, Kubernetes & Docker Exposed, Jupyter & Notebooks, IoT & Industrial Devices, Spring Boot Actuator, Default Credentials Panels, Exposed Metrics & Health

### Cloud
Cloud Storage Buckets, Package Repositories, Firebase References, Cloud & Serverless Exposure

### CMS
AEM Content Paths, WordPress Vulnerabilities

### OSINT
Personal Data Parameters, Vulnerability Reports, Community Mentions, Code Snippet Sites, Bug Bounty Programs

## Payload Categories (40)

### SQL Injection (7)
Classic, UNION Based, Error Based, Blind Boolean, Time Based Blind, Obfuscated / WAF Bypass, Out-of-Band (OOB)

### Injection (6)
NoSQL / MongoDB, LDAP, XPath, Command Injection Classic, Command Injection Obfuscated, Email Header Injection

### XSS (6)
Classic, Filter Bypass, Obfuscated / Encodings, DOM Based, Polyglots, CSP Bypass

### Server-Side (4)
SSTI (Jinja2, Twig, Freemarker, ERB, Spring, Node), Path Traversal / LFI, XXE, SSRF

### Web Attacks (9)
Open Redirect, CRLF Injection, HTTP Request Smuggling, HTTP Parameter Pollution, Web Cache Poisoning, SQL Truncation & Mass Assignment, Log4Shell / JNDI, GraphQL, Prototype Pollution

### Auth & Session (4)
JWT Attacks, Host Header Injection, OAuth / OIDC, CORS Misconfiguration

### Modern (4)
File Upload Bypass, Deserialization (Java/PHP/Python), WebSocket Injection & CSWSH, Race Conditions

## Customization

### Adding New Dork Categories

Open `components/google-dorks-generator.tsx` and add to `dorkCategories[]`:

```typescript
{
  title: "Your Category",
  dorks: ["site:{domain} your:dork:query"],
  icon: <YourIcon className="h-4 w-4" />,
  description: "What this finds",
  color: "bg-color-500/10 text-color-600 border-color-500/20",
  group: "Recon"  // Recon | Web Vulns | Credenciales | Archivos | Infraestructura | Cloud | CMS | OSINT
}
```

### Adding New Payload Categories

Open `components/payload-data/attack-payloads.ts`:

```typescript
export const myCategory: PayloadCategory = {
  id: "my-category",
  title: "My Category",
  description: "What these payloads target",
  tag: "My Tag",
  tagColor: "bg-color-500/10 text-color-400 border-color-500/20",
  payloads: [
    "payload one",
    "payload two",
  ]
}
```

> **Note:** Payloads containing `${...}`, backticks, or `\NNN` octal sequences must use regular strings (`"..."`) instead of template literals to avoid TypeScript strict mode errors.

Then add it to `allPayloadCategories[]` and the filter tag list in `google-dorks-generator.tsx`.

### Adding XSS Exploit Entries

Open `components/payload-data/attack-payloads.ts` and add to the relevant `XssExploitSection` in `xssExploitSections[]`:

```typescript
{
  name: "🎯 Entry Name",
  description: "Short description of what this does.",
  payload: "your.payload('here')",
  tags: ["Visual"]  // Visual | Destructive | Stealth | Persistent
}
```

## Deployment

### GitHub Pages (Current)

Automatically deployed via GitHub Actions on every push to `main`.
Live at: `https://xfraylin.github.io/hacking-dorks`

### Other Platforms

- **Vercel**: `vercel --prod`
- **Netlify**: connect repository for automatic deploys

## Legal Disclaimer

**For educational and authorized security research only.**

This tool is intended for legitimate security testing, authorized penetration testing, CTF competitions, and educational purposes. Users are responsible for ensuring they have proper authorization before conducting any security research activities.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push and open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

**xFraylin**
- GitHub: [@xFraylin](https://github.com/xFraylin)
- LinkedIn: [xFraylin](https://linkedin.com/in/xfraylin)

## Acknowledgments

- Dork inspiration from [ExploitDB Google Hacking Database](https://www.exploit-db.com/google-hacking-database)
- Payload references from [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- Built with [Next.js](https://nextjs.org/) · [Radix UI](https://www.radix-ui.com/) · [Lucide React](https://lucide.dev/)

---

Star this repository if you found it helpful!
