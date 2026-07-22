# CipherKit — Dev tools that don't phone home.

> 85 free browser-based developer tools.
> 100% client-side. No login. No server. No tracking.

![Tools](https://img.shields.io/badge/tools-85-00ff88?style=flat-square)
![License](https://img.shields.io/badge/license-Custom-blue?style=flat-square)
![Client Side](https://img.shields.io/badge/client--side-100%25-00d4ff?style=flat-square)
![No Login](https://img.shields.io/badge/login-none-green?style=flat-square)

🔗 **[cipherkit.app](https://cipherkit.app)**

![CipherKit Preview](./docs/assets/preview.png)

---

## ✨ Features

- ✅ 100% client-side — your data never leaves the browser
- ✅ No login, no account, no sign-up
- ✅ No tracking. No ads.
- ✅ Dark & light mode
- ✅ Mobile-friendly, 90+ Lighthouse score
- ✅ Source-available — view & learn from the code
- ✅ Fast — vanilla HTML/CSS/JS, no framework bloat

---

## 🧰 Tool Hubs

### 🔐 Crypto Hub (18 tools)
AES Encryption/Decryption, SHA-256/512/1/3, MD5, RIPEMD-160, HMAC, RSA Key Generator, RSA Encrypt/Decrypt, Bcrypt, JWT Builder, TOTP Generator, SSL Certificate Decoder, Password Strength Checker, Hash Comparator, Checksum Generator

### 📦 Encoding Hub (13 tools)
Base64 Encoder/Decoder, URL Encoder/Decoder, HTML Entity Encoder/Decoder, Hex Encoder/Decoder, Binary Encoder/Decoder, JSON Formatter, JSON Minifier, JSON Schema Validator

### 🔄 Converter Hub (12 tools)
XML↔JSON, JSON↔YAML, CSV→JSON, CSV→Excel, JSON→CSV, Markdown→PDF, Number Base Converter, Decimal↔Hex, DOCX→HTML, JSON→YAML

### 🛠️ Dev Hub (21 tools)
JWT Decoder/Encoder, UUID Generator, Password Generator, String Generator, Unix Timestamp, Epoch Converter, Cron Builder/Explainer, Regex Tester, Diff Checker, SQL Formatter, Markdown Preview, Lorem Ipsum, HTTP Header Parser, Word Counter, IP Tools, Gzip Tool, ASCII Table, Bit/Byte Calculator, DNS Lookup

### 🖼️ Image Hub (21 tools)
QR Generator, Image Resizer, Format Converter, SVG→PNG, PNG↔JPG↔WebP↔HEIC converters, Color Converter, Color Palette Generator, Image Filters & Effects, XML/YAML/HTML/CSS Formatters, JS Minifier

---

## 🚀 Running Locally

```bash
git clone https://github.com/karthickajan/cipherkit.git
cd cipherkit
node build.js
npx serve docs -p 3000
# Open http://localhost:3000
```

---

## 🏗️ Tech Stack

- Vanilla HTML, CSS, JavaScript — no framework
- Hosted on GitHub Pages
- Build system: `build.js` + `tools.json` for page generation
- Libraries: CryptoJS, JSZip, marked.js, html2canvas, jsPDF, SheetJS

---

## Contributing

Found a bug or want a new tool? [Open an issue](https://github.com/karthickajan/cipherkit/issues) — feedback welcome.

## License
Custom Source-Available License — © 2026 Karthick Ajan G S

This software is provided for **educational and personal learning purposes only**. You may view and study the source code, but **hosting, deploying, or redistributing the software is strictly prohibited**. See the [LICENSE](./LICENSE) file for full terms.
