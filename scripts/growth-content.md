# CipherKit — Growth Content Templates
# Copy-paste these to post on each platform

---

## 1. HACKER NEWS (Show HN)

**Title:** Show HN: CipherKit – 85 free, client-side dev tools (AES, JWT, Base64, SHA, image tools)

**Text (paste in the text box, NOT as a URL submission):**

I built CipherKit (https://cipherkit.app) — a collection of 85 free developer tools that run entirely in the browser. Zero server-side processing, no accounts, no tracking.

Tools include:

• Crypto: AES encrypt/decrypt, RSA key generation, SHA-256/512, HMAC, bcrypt, TOTP
• Encoding: Base64, URL encode/decode, hex, binary, HTML entities
• Dev: JWT decoder/builder, JSON/YAML/XML formatter, regex tester, UUID generator, diff checker, cron explainer
• Converters: JSON↔CSV, JSON↔YAML, XML↔JSON, Markdown→PDF, DOCX→HTML
• Image: HEIC→JPG/PNG/WebP, PNG↔JPG↔WebP, SVG→PNG, QR generator, image resizer

Everything is vanilla HTML/CSS/JS — no frameworks, no build tools (well, one build.js). Hosted on GitHub Pages. Source: https://github.com/karthickajan/cipherkit

The key design decisions:
- Client-side only: your data never leaves the browser
- No CDN dependencies for core functionality (crypto-js loaded from CDN for AES/RSA)
- Dark + light mode
- Mobile responsive
- SEO optimized (100 Lighthouse SEO, 93+ Performance)

I built this because I was tired of pasting sensitive data into random online tools that send everything to a server.

Would love feedback on the UX, tool selection, or anything else.

---

## 2. REDDIT r/webdev

**Title:** I built 85 free developer tools that run 100% in your browser — no server, no login, no tracking

**Body:**

Hey r/webdev!

I've been building [CipherKit](https://cipherkit.app) — a free, open-source collection of 85 developer tools. Every tool runs entirely client-side in your browser. No data is sent to any server, ever.

**What's included:**
- 🔐 **Crypto:** AES encrypt/decrypt, RSA key pairs, SHA-256/512, bcrypt, HMAC, TOTP generator
- 📦 **Encoding:** Base64, URL, hex, binary, HTML entities encode/decode
- ⚙️ **Dev:** JWT decoder, JSON/XML/YAML formatter, regex tester, UUID generator, diff checker, cron explainer, SQL formatter
- 🔄 **Converters:** JSON↔CSV, JSON↔YAML, Markdown→PDF, CSV→Excel, DOCX→HTML
- 🖼️ **Image:** HEIC→JPG/PNG, PNG↔JPG↔WebP, image resizer, QR generator

**Tech stack:** Pure vanilla HTML/CSS/JS. One `build.js` generates all 94 pages. Hosted on GitHub Pages.

**Why I built it:** I got tired of pasting API keys and JWTs into random online tools that phone home to servers. CipherKit keeps everything local.

🔗 **Site:** https://cipherkit.app
📦 **GitHub:** https://github.com/karthickajan/cipherkit

Happy to answer any questions or take feature requests!

---

## 3. REDDIT r/programming

**Title:** CipherKit — 85 client-side dev tools (crypto, encoding, formatting, image conversion) — open source, zero server processing

**Body:**

Built a collection of 85 developer tools at [cipherkit.app](https://cipherkit.app) that run 100% in the browser. No backend, no accounts, no data collection.

Covers: AES/RSA encryption, SHA/MD5/bcrypt hashing, Base64/URL/hex encoding, JWT decode/build, JSON/XML/YAML formatting, regex testing, diff checking, image format conversion (HEIC, PNG, JPG, WebP), QR codes, and more.

Source: https://github.com/karthickajan/cipherkit

Tech: Vanilla JS, no frameworks. Single build script generates 94 static HTML pages served via GitHub Pages. Lighthouse: 93+ performance, 100 SEO.

---

## 4. REDDIT r/opensource

**Title:** Open source: 85 client-side developer tools — CipherKit (vanilla JS, GitHub Pages)

**Body:**

Sharing [CipherKit](https://cipherkit.app), an open-source collection of 85 developer tools. Everything runs in the browser — no server, no accounts, no tracking beyond anonymous GA4.

GitHub: https://github.com/karthickajan/cipherkit

Built with vanilla HTML/CSS/JS. A single `build.js` reads `tools.json` and generates 94 static pages. Hosted free on GitHub Pages.

Contributions welcome — whether it's new tools, bug fixes, or UX improvements. Source-available, free to use.

---

## 5. DEV.TO ARTICLE

**Title:** I Built 85 Free Developer Tools That Never Touch a Server

**Tags:** webdev, javascript, opensource, security

**Cover image suggestion:** Screenshot of CipherKit homepage

**Body (Markdown):**

# I Built 85 Free Developer Tools That Never Touch a Server

Last year, I pasted a production JWT into an online decoder and realized — I have no idea where that data went. That was the moment I decided to build my own tools.

The result is [**CipherKit**](https://cipherkit.app) — 85 free developer tools that run **100% in your browser**. No server processing, no accounts, no tracking. Your data never leaves your device.

## What's Inside

### 🔐 Crypto Hub (12 tools)
AES-128/192/256 encryption & decryption, RSA key pair generation, SHA-256, SHA-512, SHA-3, MD5, RIPEMD-160, HMAC generator, bcrypt, hash comparator, checksum generator, TOTP generator.

### 📦 Encoding Hub (14 tools)
Base64 encode/decode, URL encode/decode, HTML entity encode/decode, hex encode/decode, binary encode/decode, Gzip compress/decompress, JWT encoder.

### 🔄 Converter Hub (18 tools)
JSON↔CSV, JSON↔YAML, JSON↔XML, CSV→Excel, DOCX→HTML, Markdown→PDF, decimal↔hex, number base converter, epoch converter, color converter.

### ⚙️ Dev Hub (18 tools)
JWT decoder & builder, JSON/XML/YAML/SQL/CSS/HTML formatter & minifier, regex tester, UUID generator, diff checker, cron expression generator & explainer, password strength checker, random password/string generator, lorem ipsum, word counter, DNS lookup, HTTP header parser, SSL cert decoder, IP address tools.

### 🖼️ Image Hub (13 tools)
HEIC→JPG/PNG/WebP, PNG↔JPG↔WebP, SVG→PNG, QR code generator, image resizer, image enhancer, color palette generator.

## The Tech Stack (Intentionally Boring)

No React. No Next.js. No Tailwind. No build pipeline beyond a single Node.js script.

```
Vanilla HTML + CSS + JavaScript
├── build.js (reads tools.json → generates 94 HTML pages)
├── tools.json (85 tool definitions)
├── src/assets/css/ (4 CSS files)
├── src/assets/js/tools/ (85 tool JS files, one per tool)
└── docs/ (output → GitHub Pages)
```

**Why vanilla?** Performance. The homepage scores 92+ on Lighthouse mobile. Tool pages score 93+. There's no framework overhead, no hydration, no client-side routing. Each page is a self-contained HTML file with exactly the JS it needs.

## Design Decisions

### Client-Side Only
Every tool runs in the browser using the Web Crypto API, or lightweight libraries like crypto-js (loaded from CDN). When you encrypt with AES, the encryption happens in your browser's JavaScript engine. The ciphertext never touches a network.

### No Accounts
There's no database. No user table. No authentication system. Bookmarks and recent tools are stored in `localStorage`.

### Dark + Light Mode
A `<script>` in `<head>` reads `localStorage('ck-theme')` and sets `data-theme` before paint — zero flash of unstyled content.

### SEO First
Every tool page has:
- Unique `<title>`, `<meta description>`, Open Graph tags
- JSON-LD schema (WebApplication + FAQPage)
- Breadcrumbs
- Custom SEO content section with FAQs
- Semantic HTML with proper headings

Result: **Lighthouse SEO 100** on every page.

## What I Learned

1. **Vanilla JS is fast enough.** No framework needed for tools that take input → process → show output.

2. **A build script beats a framework.** One 1200-line `build.js` generates 94 pages in < 2 seconds. No webpack, no Vite, no config files.

3. **Client-side crypto is mature.** The Web Crypto API handles RSA, SHA, HMAC natively. crypto-js fills the gaps for AES with custom modes.

4. **Content-visibility: auto is magic.** Adding `content-visibility: auto` to hub sections saved 300ms on homepage LCP.

5. **GitHub Pages is underrated.** Free hosting, free SSL, custom domain, no cold starts, no build minutes to worry about.

## Open Source

The entire project is open source: [github.com/karthickajan/cipherkit](https://github.com/karthickajan/cipherkit)

Contributions welcome — new tools, bug fixes, accessibility improvements, or just a star ⭐

## Try It

🔗 [cipherkit.app](https://cipherkit.app)

If you've ever pasted a secret into a random online tool and felt uneasy — this is for you.

---

## 6. DIRECTORY SUBMISSIONS

Submit CipherKit to these (all free):

| Directory | URL | Category |
|-----------|-----|----------|
| AlternativeTo | https://alternativeto.net/contribute/ | Alternative to CyberChef, DevToys |
| Product Hunt | https://www.producthunt.com/posts/new | Developer Tools |
| SaaSHub | https://www.saashub.com/submit | Developer Tools |
| Hacker News | https://news.ycombinator.com/submit | Show HN |
| dev.to | https://dev.to/new | Article (use template above) |
| GitHub Topics | Add to repo: developer-tools, encryption, base64, jwt, sha256, online-tools, client-side |
| Free for Dev | https://github.com/ripienaar/free-for-dev (PR) | Security/Crypto |
| Awesome lists | PR to awesome-security, awesome-crypto, awesome-developer-tools | Multiple |
| Uneed | https://uneed.best/submit | Developer Tools |
| ToolHunt | https://toolhunt.dev | Developer Tools |
| MicroLaunch | https://microlaunch.net | Launch |
| Indie Hackers | https://www.indiehackers.com | Share in community |
| Lobste.rs | https://lobste.rs | Developer Tools (need invite) |
| Slant | https://www.slant.co | Alternative recommendations |
| StackShare | https://stackshare.io | Developer Tools |
| LibHunt | https://www.libhunt.com | Open Source |

**GitHub Repo Optimization:**
Go to https://github.com/karthickajan/cipherkit → Settings:
- Description: "85 free client-side developer tools — AES, RSA, JWT, Base64, SHA, JSON, image tools. No server, no tracking."
- Website: https://cipherkit.app
- Topics: developer-tools, encryption, aes, rsa, jwt, base64, sha256, json-formatter, online-tools, client-side, open-source, free-tools, crypto, hash, encoding

---

## 7. TWITTER/X THREADS

**Launch tweet:**

🚀 Just launched CipherKit — 85 free developer tools that run 100% in your browser.

AES, RSA, JWT, SHA-256, Base64, JSON formatter, regex tester, image converter, and 77 more.

No server. No login. No tracking. Open source.

🔗 cipherkit.app

Thread 🧵

**Thread tweets:**

1/ Why I built it: I got tired of pasting secrets into online tools that send data to unknown servers. CipherKit processes everything locally in your browser.

2/ 🔐 Crypto tools: AES-256 encrypt/decrypt, RSA key pairs, SHA-256/512, bcrypt, HMAC, TOTP — all client-side using Web Crypto API

3/ ⚙️ Dev tools: JWT decoder, JSON/YAML/XML formatter, regex tester, diff checker, UUID generator, cron explainer, SQL formatter

4/ 🖼️ Image tools: HEIC→JPG, PNG↔WebP, SVG→PNG, QR generator, image resizer — all processed in-browser, no uploads

5/ Tech: Pure vanilla HTML/CSS/JS. One build script → 94 static pages → GitHub Pages. Lighthouse: 93+ performance, 100 SEO.

6/ It's free forever and open source: github.com/karthickajan/cipherkit

Star ⭐ if you find it useful!

---

## 8. STACK OVERFLOW STRATEGY

Search for these questions and add helpful answers mentioning CipherKit:
- "online AES encryption tool"
- "base64 encode decode online"
- "sha256 hash generator online"
- "jwt decoder online"
- "json formatter online free"
- "convert heic to jpg online"
- "uuid generator online"
- "regex tester online"

Answer format: Give a genuine, helpful answer first, then mention "I also built a free client-side tool for this at cipherkit.app/tools/[tool]/ if you want something that doesn't send data to a server."
