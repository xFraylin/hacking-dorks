# Hacking Dorks

> Advanced Security Research Toolkit — Google Dorks, Attack Payloads & Pentesting Tools

A modern, interactive web application for security research, penetration testing, and authorized vulnerability assessments. Features a multi-tab interface with Google Dork generation, categorized attack payloads, and an integrated tools suite.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

## Live Demo

**[https://xfraylin.github.io/hacking-dorks](https://xfraylin.github.io/hacking-dorks)**

## Features

- **3-Tab Interface** — Google Dorks, Attack Payloads, and Tools in one place
- **46+ Dork Categories** — Organized in 8 groups with filter buttons and keyword search
- **27 Payload Categories** — SQLi, XSS, RCE, SSTI, LFI, XXE, SSRF, and more with obfuscation variants
- **Encoder/Decoder** — 11 encoding operations (Base64, URL, HTML, Hex, ROT13, JWT decode, and more)
- **Reverse Shell Generator** — 20 shell types with custom IP/port
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
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
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

1. **Enter Target Domain(s)**
   - Single domain: `example.com`
   - Multiple domains: `example.com, target.com, *.domain.com`

2. **Filter by Group**
   - Use the group filter buttons: Recon, Web Vulns, Credenciales, Archivos, Infraestructura, Cloud, CMS, OSINT
   - Click a group to narrow visible categories

3. **Search Dorks**
   - Type in the search box to filter by category title, description, or dork content

4. **Execute Queries**
   - Click individual dorks to open in Google
   - Use "Open All" to open all visible dorks at once

### Payloads Tab

1. **Filter by Tag** — select an attack type (SQLi, XSS, RCE, SSTI, LFI, XXE, SSRF, etc.)
2. **Search Payloads** — keyword search across all payload titles and descriptions
3. **Copy individual payloads** with the copy icon next to each one
4. **Copy All** — copies the entire payload list for a category
5. **Export .txt** — downloads all payloads in the category as a text file

### Tools Tab

**Encoder/Decoder**
- Paste any string and choose an operation:
  - Base64 Encode / Decode
  - URL Encode / Decode
  - HTML Encode / Decode
  - Hex Encode / Decode
  - ROT13
  - JWT Decode (header + payload)
  - MD5 Hash (client-side)

**Reverse Shell Generator**
- Enter listener IP and port
- Select shell type from 20 options
- Click to copy the generated command

Available shell types: Bash TCP, Bash UDP, Python 3, PHP, Perl, Ruby, Netcat (-e), Netcat (mkfifo), Socat, Socat PTY, Node.js, PowerShell, Golang, AWK, Lua, cURL upload, and more.

## Dork Categories

### Recon
- PHP Parameters, API Mapping, URL Tokens, Authentication Pages, Test Environments, AEM Paths, Community Mentions, Bug Bounty Programs

### Web Vulns
- XSS Parameters, Redirect Parameters, SQL Injection Parameters, SSRF Parameters, File Inclusion, Command Execution, File Upload, Error Pages

### Credenciales
- Exposed Credentials, GitHub Leaks, Configuration Files, Exposed API Keys

### Archivos
- Sensitive Files, Backup Archives, Sensitive Documents, Confidential Docs, API Documentation

### Infraestructura
- Vulnerability Reports, Personal Data URLs, Open Directories, Login Panels, Database Errors

### Cloud
- Cloud Storage Buckets, Firebase References, Package Repositories (Artifactory)

### CMS
- WordPress, Joomla, Drupal, Magento, PrestaShop specific dorks

### OSINT
- Code Snippets (pastebins), Pastebin Leaks, Social Profiles, Job Listings with tech stack

## Payload Categories

### SQL Injection (7 categories)
- Classic SQLi — `' OR 1=1--`, `UNION SELECT`, error-based fingerprinting
- UNION-based — column enumeration, data extraction
- Error-based — `extractvalue()`, `updatexml()`, dialect-specific
- Blind Boolean — conditional true/false responses
- Time-based Blind — `SLEEP()`, `WAITFOR DELAY`, `pg_sleep()`
- Obfuscated SQLi — case mixing, comment insertion, encoding
- Out-of-Band — DNS exfil via `LOAD_FILE`, `UTL_HTTP`

### NoSQL Injection
- MongoDB operator injection (`$gt`, `$where`, `$regex`)

### XSS (5 categories)
- Classic XSS — basic `<script>`, event handlers, SVG/IMG vectors
- Filter Bypass — tag/attribute obfuscation, encoding tricks
- Obfuscated XSS — JavaScript `String.fromCharCode`, hex/unicode encoding
- DOM-based XSS — `document.write`, `innerHTML`, `eval` sinks
- Polyglot XSS — single payloads that work across multiple contexts

### Command Injection (2 categories)
- Classic — `;`, `|`, `&&`, backtick, `$()` substitution
- Obfuscated — `${IFS}`, `printf` hex/octal, `{cat,/etc/passwd}`, base64 piping

### Other Attack Vectors
- SSTI — Jinja2, Twig, Freemarker, Velocity, Smarty, Pebble templates
- Path Traversal / LFI — `../` variants, null bytes, URL encoding, Windows paths
- XXE — classic, blind OOB, error-based, SVG/XLSX vectors
- SSRF — internal metadata, cloud provider endpoints, protocol wrappers
- Open Redirect — parameter-based, protocol-relative, data URIs
- CRLF Injection — header injection, response splitting, log poisoning
- HTTP Request Smuggling — CL.TE, TE.CL, TE.TE desync
- Log4Shell — `${jndi:ldap://...}`, nested obfuscation, bypass variants
- GraphQL Attacks — introspection, batching, field suggestions, aliases
- Prototype Pollution — `__proto__`, `constructor.prototype` gadgets
- Host Header Injection — password reset poisoning, cache poisoning
- JWT Attacks — `alg:none`, HS256 with RS256 public key, key confusion

## Customization

### Adding New Dork Categories

1. Open `components/google-dorks-generator.tsx`
2. Add a new entry to the `dorkCategories` array:

```typescript
{
  title: "Your Category Name",
  dorks: ["site:{domain} your:dork:query"],
  icon: <YourIcon className="h-4 w-4" />,
  description: "Description of what this category does",
  color: "bg-color-500/10 text-color-600 border-color-500/20",
  group: "Recon"  // must match one of the defined groups
}
```

Available groups: `"Recon"`, `"Web Vulns"`, `"Credenciales"`, `"Archivos"`, `"Infraestructura"`, `"Cloud"`, `"CMS"`, `"OSINT"`

### Adding New Payload Categories

1. Open `components/payload-data/attack-payloads.ts`
2. Add a new `PayloadCategory` object and include it in `allPayloadCategories[]`:

```typescript
export const myCategory: PayloadCategory = {
  id: "my-category",
  title: "My Category",
  description: "What these payloads target",
  icon: "🎯",
  color: "bg-color-500/10 text-color-600 border-color-500/20",
  tags: ["tag1", "tag2"],
  payloads: [
    "payload one",
    "payload two",
  ]
}
```

> **Note:** If any payload contains `${...}`, backticks, or octal escape sequences (`\NNN`), use regular strings (`"..."`) instead of template literals to avoid TypeScript/Turbopack strict mode errors.

## Deployment

### GitHub Pages (Current)

The application is automatically deployed to GitHub Pages using GitHub Actions:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at `https://xfraylin.github.io/hacking-dorks`

### Other Platforms

- **Vercel**: `vercel --prod`
- **Netlify**: Connect repository for automatic deploys

## Legal Disclaimer

**For educational and authorized security research only.**

This tool is intended for:
- Legitimate security testing
- Authorized penetration testing
- Authorized vulnerability assessments
- CTF competitions and educational purposes

Users are responsible for ensuring they have proper authorization before conducting any security research activities. Unauthorized use against systems you do not own or have explicit permission to test is illegal.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**xFraylin**
- GitHub: [@xFraylin](https://github.com/xFraylin)
- LinkedIn: [xFraylin](https://linkedin.com/in/xfraylin)

## Acknowledgments

- Dork inspiration from [ExploitDB Google Hacking Database](https://www.exploit-db.com/google-hacking-database)
- Payload references from [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

Star this repository if you found it helpful!
