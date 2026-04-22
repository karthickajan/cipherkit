/**
 * CipherKit — Static Site Builder
 * Reads tools.json → generates docs/ with all tool pages + homepage
 *
 * Usage:  node build.js
 * Output: docs/ folder — commit this, GitHub Pages serves from /docs on main branch
 *
 * GitHub Pages setup:
 *   Repo → Settings → Pages → Source: Deploy from branch → main → /docs
 *
 * To change domain: update DOMAIN below (one line change)
 */

'use strict';
const BASE_PATH = '';
const fs   = require('fs');
const path = require('path');

// ── INLINE SVG ICONS (no emojis anywhere) ────────────────────────────────────
const SVG = {
  lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  box:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  gear:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  arrows: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>',
  image:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
};
// ── CONFIG ─────────────────────────────────────────────────────────────────
const DOMAIN      = 'https://cipherkit.app';
const SRC         = path.join(__dirname, 'src');
const DIST        = path.join(__dirname, 'docs'); // GitHub Pages reads /docs on main branch
const TOOLS_JSON  = path.join(__dirname, 'tools.json');

// ── LOAD DATA ───────────────────────────────────────────────────────────────
const data       = JSON.parse(fs.readFileSync(TOOLS_JSON, 'utf8'));
const { site, categories, tools } = data;

// ── LOAD SEO CONTENT ────────────────────────────────────────────────────────
const SEO_JSON = path.join(__dirname, 'seo-content.json');
if (fs.existsSync(SEO_JSON)) {
  const seoData = JSON.parse(fs.readFileSync(SEO_JSON, 'utf8'));
  for (const tool of tools) {
    if (seoData[tool.slug]) {
      tool.seoContent = seoData[tool.slug];
    }
  }
}

// ── UTILS ───────────────────────────────────────────────────────────────────
function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSrc(relPath) {
  const full = path.join(SRC, relPath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

function writeDist(relPath, content) {
  const full = path.join(DIST, relPath);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

function copySrc(srcRel, distRel) {
  const srcFull  = path.join(SRC, srcRel);
  const distFull = path.join(DIST, distRel || srcRel);
  if (!fs.existsSync(srcFull)) return;
  mkdirp(path.dirname(distFull));
  fs.copyFileSync(srcFull, distFull);
  console.log(`  ✓ ${distRel || srcRel} (copied)`);
}

// ── SHARED HEAD HTML ────────────────────────────────────────────────────────
function buildHead({ pageTitle, metaDescription, canonicalPath, extraMeta = '', extraImgSrc = '' }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  const imgSrc = `'self' data: blob: https://www.google-analytics.com${extraImgSrc ? ' ' + extraImgSrc : ''}`;
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDescription}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#07090d">
  <meta name="google-site-verification" content="UC-6PSV0VLbnfHxe9FoC2l7MWoX1Qi1CY1-_bV7lxQw" />
  <link rel="canonical" href="${canonical}">

  <!-- Security headers (meta fallbacks — real headers need a CDN/server) -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://dns.google https://www.google-analytics.com https://www.googletagmanager.com https://script.google.com; img-src ${imgSrc}; frame-ancestors 'none';">

  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:image" content="${DOMAIN}/android-chrome-512x512.png">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${DOMAIN}/android-chrome-512x512.png">

  ${extraMeta}

  <title>${pageTitle}</title>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="${BASE_PATH}/assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="${BASE_PATH}/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${BASE_PATH}/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${BASE_PATH}/apple-touch-icon.png">
  <link rel="manifest" href="${BASE_PATH}/site.webmanifest">

  <!-- Fonts — non-blocking, font-display:swap prevents layout shift -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700&family=Syne:wght@400;600;700;800&display=swap"
    onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700&family=Syne:wght@400;600;700;800&display=swap">
  </noscript>

  <!-- Critical styles inline to eliminate render-blocking -->
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px;scroll-behavior:smooth}
    body{background:#07090d;color:#dde4ed;font-family:'Space Mono','Courier New',monospace;min-height:100vh;overflow-x:hidden;line-height:1.6}
    .skip-link{position:absolute;top:-100px;left:16px;background:#3dd68c;color:#02150a;font-size:13px;font-weight:700;padding:8px 16px;border-radius:6px;z-index:9999;transition:top .2s}
    .skip-link:focus{top:8px}
    .site-header{border-bottom:1px solid #1e2530;background:rgba(7,9,13,.88);position:sticky;top:0;z-index:200;backdrop-filter:blur(16px)}
    .header-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:56px;display:flex;align-items:center;gap:24px}
    .hamburger-btn{display:none;background:none;border:none;color:#3dd68c;font-size:1.4rem;cursor:pointer;padding:4px;margin-left:auto;line-height:1}
    .logo{display:flex;align-items:center;gap:10px;text-decoration:none}
    .logo-mark{width:30px;height:30px;border-radius:6px;display:grid;place-items:center;flex-shrink:0;overflow:hidden}
    .logo-mark svg{width:16px;height:16px}
    .logo-name{font-family:'Syne',Arial,sans-serif;font-weight:800;font-size:17px;color:#dde4ed;letter-spacing:-.4px}
    .logo-name em{color:#3dd68c;font-style:normal}
  </style>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/base.css">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/layout.css">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/tool.css">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/feedback.css">

  <!-- GA4 anonymous analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-31DPEW6FGL"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-31DPEW6FGL', { anonymize_ip: true });
  </script>
`.trim();
}

// ── NAVBAR ──────────────────────────────────────────────────────────────────
function buildNavbar(headerBadge, activeCategory) {
  const badgeColorMap = {
    green:  { dot: 'var(--green)',  text: 'var(--green)' },
    purple: { dot: 'var(--purple)', text: 'var(--purple)' },
    blue:   { dot: 'var(--blue)',   text: 'var(--blue)' },
    amber:  { dot: 'var(--amber)',  text: 'var(--amber)' },
  };
  const badge = headerBadge || { text: '100% Client-Side', color: 'green' };
  const bc    = badgeColorMap[badge.color] || badgeColorMap.green;
  const badgeStyle = badge.color !== 'green' ? ` style="color:${bc.text};border-color:${bc.dot}"` : '';
  const dotStyle   = badge.color !== 'green' ? ` style="background:${bc.dot}"` : '';

  const navLinks = [
    { href: `${BASE_PATH}/tools/crypto/`,    icon: SVG.lock,   label: 'Crypto',    cat: 'crypto' },
    { href: `${BASE_PATH}/tools/encoding/`,  icon: SVG.box,    label: 'Encoding',  cat: 'encoding' },
    { href: `${BASE_PATH}/tools/converter/`, icon: SVG.arrows, label: 'Converter', cat: 'converter' },
    { href: `${BASE_PATH}/tools/dev/`,       icon: SVG.gear,   label: 'Dev',       cat: 'dev' },
    { href: `${BASE_PATH}/tools/image/`,     icon: SVG.image,  label: 'Image',     cat: 'image' },
  ];
  const navHtml = navLinks.map(l => {
    const cls = l.cat === activeCategory ? 'nav-link nav-link--active' : 'nav-link';
    return `<a href="${l.href}" class="${cls}"><span class="nav-icon">${l.icon}</span> ${l.label}</a>`;
  }).join('\n      ');

  return `
<header class="site-header">
  <div class="header-inner">
    <a href="${BASE_PATH}/" class="logo" aria-label="CipherKit — home">
      <div class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="#3dd68c"/>
          <rect x="9" y="15" width="14" height="10" rx="2" fill="#02150a"/>
          <path d="M12 15v-3a4 4 0 0 1 8 0v3" stroke="#02150a" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="16" cy="20" r="1.5" fill="#3dd68c"/>
        </svg>
      </div>
      <span class="logo-name">Cipher<em>Kit</em></span>
    </a>

    <button class="hamburger-btn" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>

    <nav class="header-nav" id="header-nav" aria-label="Tool categories">
      ${navHtml}
    </nav>

    <div class="nav-search-wrapper">
      <input type="search" id="nav-search" placeholder="Search ${tools.length} tools…" autocomplete="off" aria-label="Search tools">
      <div id="nav-search-results" class="nav-search-dropdown" hidden></div>
    </div>

    <div class="header-badges" aria-label="Security guarantees">
      <span class="hdr-badge"${badgeStyle}>
        <span class="live-dot"${dotStyle} aria-hidden="true"></span>
        ${badge.text}
      </span>
      <a id="gh-stars" href="javascript:void(0)" class="gh-stars-badge" title="Bookmark CipherKit" onclick="CK.bookmarkSite(event)">🔖 <span id="gh-star-count">Bookmark</span></a>
    </div>
  </div>
</header>
`.trim();
}

// ── FOOTER ──────────────────────────────────────────────────────────────────
function buildFooter() {
  const year = new Date().getFullYear();
  const cryptoTools    = tools.filter(t => t.category === 'crypto').slice(0, 6);
  const encTools       = tools.filter(t => t.category === 'encoding').slice(0, 6);
  const converterTools = tools.filter(t => t.category === 'converter').slice(0, 6);
  const devTools       = tools.filter(t => t.category === 'dev').slice(0, 6);
  const imageTools     = tools.filter(t => t.category === 'image').slice(0, 6);

  function linkList(arr) {
    return arr.map(t =>
      `<li><a href="${BASE_PATH}/tools/${t.slug}/">${t.title}</a></li>`
    ).join('\n        ');
  }

  return `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="${BASE_PATH}/" class="logo">
        <div class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#3dd68c"/>
            <rect x="9" y="15" width="14" height="10" rx="2" fill="#02150a"/>
            <path d="M12 15v-3a4 4 0 0 1 8 0v3" stroke="#02150a" stroke-width="2.2" stroke-linecap="round"/>
            <circle cx="16" cy="20" r="1.5" fill="#3dd68c"/>
          </svg>
        </div>
        <span class="logo-name">Cipher<em>Kit</em></span>
      </a>
      <p class="footer-tagline">Free developer tools. All client-side. No tracking.</p>
      <a href="${site.github}" class="footer-github" target="_blank" rel="noopener">View on GitHub ↗</a>
      <div style="font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 4px;">
        Crafted by <a href="https://karthickajan.github.io/Ajan/" target="_blank" rel="noopener noreferrer">Ajan</a>
      </div>
    </div>

    <div class="footer-links">
      <div class="footer-col">
        <h3><span class="footer-icon">${SVG.lock}</span> Crypto Hub</h3>
        <ul>
          ${linkList(cryptoTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3><span class="footer-icon">${SVG.box}</span> Encoding Hub</h3>
        <ul>
          ${linkList(encTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3><span class="footer-icon">${SVG.arrows}</span> Converter Hub</h3>
        <ul>
          ${linkList(converterTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3><span class="footer-icon">${SVG.gear}</span> Dev Hub</h3>
        <ul>
          ${linkList(devTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3><span class="footer-icon">${SVG.image}</span> Image Hub</h3>
        <ul>
          ${linkList(imageTools)}
        </ul>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
  <p>© ${year} CipherKit. Open source. <a href="${site.github}">GitHub</a>. <a href="${BASE_PATH}/tools/privacy-policy/">Privacy Policy</a>. <a href="mailto:karthickajangs@gmail.com" class="footer-contact-link" aria-label="Contact CipherKit">Contact</a></p>
  </div>
</footer>
`.trim();
}

// ── JSON-LD SCHEMA ───────────────────────────────────────────────────────────
function buildSchema(tool) {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "url": `${DOMAIN}/tools/${tool.slug}/`,
    "description": tool.metaDescription,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "provider": { "@type": "Organization", "name": "CipherKit", "url": DOMAIN }
  };

  // Use tool-specific FAQs if available, otherwise fall back to generic ones
  const seo = tool.seoContent;
  const faqEntries = (seo && seo.faq && seo.faq.length)
    ? seo.faq.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    : [
        {
          "@type": "Question",
          "name": `Is the ${tool.title} free?`,
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. No signup required." }
        },
        {
          "@type": "Question",
          "name": "Is my data sent to a server?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. Everything runs in your browser using client-side JavaScript. Nothing leaves your device." }
        },
        {
          "@type": "Question",
          "name": `What does the ${tool.title} do?`,
          "acceptedAnswer": { "@type": "Answer", "text": tool.metaDescription }
        }
      ];

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqEntries
  };

  return JSON.stringify(webApp, null, 2) + '\n</script>\n<script type="application/ld+json">\n' + JSON.stringify(faq, null, 2);
}

// ── SEO CONTENT SECTION ──────────────────────────────────────────────────────
function buildSeoSection(tool) {
  const seo = tool.seoContent;
  if (!seo) return '';

  const usesHtml = (seo.commonUses || []).map(u => `      <li>${u}</li>`).join('\n');
  const faqHtml  = (seo.faq || []).map(f =>
    `    <h3>${f.q}</h3>\n    <p>${f.a}</p>`
  ).join('\n\n');

  return `
    <section class="seo-content">
      <h2>What is ${seo.heading || tool.title}?</h2>
      <p>${seo.description}</p>

      <h2>Common Uses</h2>
      <ul>
${usesHtml}
      </ul>

      <h2>Frequently Asked Questions</h2>
${faqHtml}
    </section>`;
}

// ── RELATED TOOLS SECTION ────────────────────────────────────────────────────
function buildRelatedTools(tool) {
  const related = tool.relatedTools
    .map(slug => tools.find(t => t.slug === slug))
    .filter(Boolean)
    .slice(0, 4);

  if (related.length === 0) return '';

  const cards = related.map(t => `
      <a href="${BASE_PATH}/tools/${t.slug}/" class="related-card">
        <span class="related-title">${t.title}</span>
        <span class="related-tag">${t.tagline}</span>
      </a>`).join('');

  return `
  <section class="related-tools" aria-labelledby="related-heading">
    <h2 id="related-heading">Related Tools</h2>
    <div class="related-grid">
      ${cards}
    </div>
  </section>
`.trim();
}

// ── TOOL PAGE TEMPLATE ────────────────────────────────────────────────────────
function buildToolPage(tool) {
  const head       = buildHead({
    pageTitle:       tool.pageTitle,
    metaDescription: tool.metaDescription,
    canonicalPath:   `/tools/${tool.slug}/`,
    extraMeta: `<script type="application/ld+json">${buildSchema(tool)}</script>`
  });

  const navbar     = buildNavbar(tool.headerBadge, tool.category);
  const footer     = buildFooter();
  const related    = buildRelatedTools(tool);
  const seoSection = buildSeoSection(tool);

  // Extract usage HTML from tool JS (the argument passed to CK.setUsageContent())
  let usageHtml = '';
  try {
    const jsPath = path.join(SRC, 'assets', 'js', 'tools', tool.jsFile);
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      const marker = 'CK.setUsageContent(';
      const idx = jsContent.indexOf(marker);
      if (idx !== -1) {
        const start = idx + marker.length;
        let depth = 0, end = start;
        for (let i = start; i < jsContent.length; i++) {
          if (jsContent[i] === '(') depth++;
          if (jsContent[i] === ')') {
            if (depth === 0) { end = i; break; }
            depth--;
          }
        }
        const arg = jsContent.slice(start, end);
        try { usageHtml = (new Function('return (' + arg + ')'))(); } catch (_) {}
      }
    }
  } catch (_) { /* ignore */ }

  // Tool JS path (loaded at bottom)
  const toolJsSrc  = `${BASE_PATH}/assets/js/tools/${tool.jsFile}`;

  // Vendor JS (e.g. crypto-js CDN)
  const vendorScripts = (tool.vendorJs || []).map(v =>
    `<script src="${v.src}"${v.integrity ? ` integrity="${v.integrity}"` : ''}${v.crossorigin ? ` crossorigin="${v.crossorigin}"` : ''} defer></script>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>

<a href="#tool-interface" class="skip-link">Skip to tool</a>

${navbar}

<main class="tool-page" id="main-content">

  <!-- Tool Header -->
  <div class="tool-header">
    <div class="tool-header-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${BASE_PATH}/">Home</a>
        <span aria-hidden="true">›</span>
        <a href="${BASE_PATH}/tools/${tool.category}/">${tool.hub}</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">${tool.title}</span>
      </nav>
      <h1>${tool.h1}</h1>
      <p class="tool-tagline">${tool.tagline}</p>
      <div class="tool-badges">
        <span class="badge badge-green"><span class="badge-icon">${SVG.check}</span> Free</span>
        <span class="badge badge-green"><span class="badge-icon">${SVG.check}</span> Client-Side</span>
        <span class="badge badge-green"><span class="badge-icon">${SVG.check}</span> No Login</span>
        <span class="badge badge-green"><span class="badge-icon">${SVG.check}</span> No Storage</span>
      </div>
    </div>
  </div>

  <!-- Tool Interface (injected by tool JS) -->
  <div class="tool-interface-wrap" id="tool-interface">
    <div class="tool-container" id="tool-root">
      <!-- Tool UI rendered here by ${tool.jsFile} -->
      <div class="tool-loading">Loading tool...</div>
    </div>
  </div>

  <!-- Related Tools -->
  <div class="tool-page-lower">
    ${related}

    <!-- SEO Content Block — How to Use -->
    <section class="usage-guide" aria-labelledby="usage-heading">
      <h2 id="usage-heading">How to Use the ${tool.h1}</h2>
      <div class="usage-content" id="usage-content">
        ${usageHtml || ''}
      </div>
    </section>
${seoSection}
  </div>

</main>

${footer}

<!-- Toast notification -->
<div class="toast" id="toast" role="alert" aria-live="assertive">
  <span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg></span>
  <span id="toast-msg">Copied to clipboard</span>
</div>

<!-- Core JS -->
<script src="${BASE_PATH}/assets/js/core/ui.js" defer></script>

<!-- Feedback Widget -->
<script>window.CIPHERKIT_TOOL_NAME = '${tool.title}';</script>
<script src="${BASE_PATH}/assets/js/feedback.js" defer></script>

<!-- Vendor JS -->
${vendorScripts}

<!-- Tool-specific JS -->
<script src="${toolJsSrc}" defer></script>

<!-- State: permalinks, recent tools, history -->
<script src="${BASE_PATH}/assets/js/core/ck-state.js" defer></script>

</body>
</html>`;
}

// ── HOMEPAGE ─────────────────────────────────────────────────────────────────
function buildHomepage() {
  const head = buildHead({
    pageTitle:       `${site.name} — ${site.tagline}`,
    metaDescription: site.description,
    canonicalPath:   '/',
    extraMeta: `
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": site.name,
  "url": DOMAIN,
  "description": site.description,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${DOMAIN}/?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
}, null, 2)}
</script>`
  });

  // Map category id to SVG icon
  const catIcons = { crypto: SVG.lock, encoding: SVG.box, converter: SVG.arrows, dev: SVG.gear, image: SVG.image };

  function categorySection(catId) {
    const cat       = categories.find(c => c.id === catId);
    const catTools  = tools.filter(t => t.category === catId);
    const cards     = catTools.map(t => `
        <a href="${BASE_PATH}/tools/${t.slug}/" class="tool-card">
          <div class="tool-card-title">${t.title}</div>
          <div class="tool-card-tag">${t.tagline}</div>
        </a>`).join('');

    return `
    <section class="hub-section" id="${catId}" aria-labelledby="${catId}-heading">
      <div class="hub-header">
        <h2 id="${catId}-heading"><span class="hub-icon">${catIcons[catId]}</span> ${cat.label}</h2>
        <p>${cat.description}</p>
      </div>
      <div class="tools-grid">
        ${cards}
      </div>
    </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>

<a href="#main-content" class="skip-link">Skip to content</a>

${buildNavbar()}

<main id="main-content">

  <!-- Hero -->
  <section class="hero" aria-label="Introduction">
    <div class="hero-inner">
      <div class="hero-pill">
        <span class="hero-pill-icon">${SVG.shield}</span>
        Free. Client-side. No tracking.
      </div>
      <h1>Developer Crypto & Utility Tools</h1>
      <p class="hero-sub">${tools.length} free online tools for developers. AES, RSA, SHA, JWT, Base64, JSON — all run in your browser. Your data never leaves your device.</p>

      <!-- Search -->
      <div class="hero-search" role="search">
        <div class="search-glow-wrapper">
        <input
          type="search"
          id="tool-search"
          placeholder="Search tools — e.g. AES, JWT, Base64..."
          aria-label="Search tools"
          autocomplete="off"
        >
        </div>
      </div>

      <!-- Hub quick-links -->
      <div class="hub-pills" aria-label="Jump to category">
        <a href="#crypto" class="hub-pill"><span class="hub-pill-icon">${SVG.lock}</span> Crypto Hub</a>
        <a href="#encoding" class="hub-pill"><span class="hub-pill-icon">${SVG.box}</span> Encoding Hub</a>
        <a href="#converter" class="hub-pill"><span class="hub-pill-icon">${SVG.arrows}</span> Converter Hub</a>
        <a href="#dev" class="hub-pill"><span class="hub-pill-icon">${SVG.gear}</span> Dev Hub</a>
        <a href="#image" class="hub-pill"><span class="hub-pill-icon">${SVG.image}</span> Image Hub</a>
      </div>
    </div>
  </section>

  <!-- Search Results (hidden by default) -->
  <section class="search-results" id="search-results" aria-live="polite" hidden>
    <div class="hub-header">
      <h2>Search Results</h2>
    </div>
    <div class="tools-grid" id="search-results-grid"></div>
  </section>

  <!-- Tool Hubs -->
  <div class="hubs-wrap" id="hubs-wrap">

    <!-- Recently Used (hidden by default, populated by JS) -->
    <section id="recently-used" style="display:none; margin-bottom: 2rem;">
      <h2 style="font-size:13px; text-transform:uppercase; letter-spacing:0.1em; color:#444; margin-bottom:12px;">Recently used</h2>
      <div id="recent-tools-row" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
    </section>

    ${categorySection('crypto')}
    ${categorySection('encoding')}
    ${categorySection('converter')}
    ${categorySection('dev')}
    ${categorySection('image')}
  </div>

</main>

${buildFooter()}

<!-- Toast -->
<div class="toast" id="toast" role="alert" aria-live="assertive">
  <span id="toast-msg"></span>
</div>

<script src="${BASE_PATH}/assets/js/core/ui.js" defer></script>
<script defer>
// ── SEARCH ──────────────────────────────────────────────────────────────────
const TOOLS = ${JSON.stringify(tools.map(t => ({
  slug:     t.slug,
  title:    t.title,
  tagline:  t.tagline,
  tags:     t.tags,
  category: t.category
})))};

const searchInput   = document.getElementById('tool-search');
const searchSection = document.getElementById('search-results');
const searchGrid    = document.getElementById('search-results-grid');
const hubsWrap      = document.getElementById('hubs-wrap');

searchInput.addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  if (!q) {
    searchSection.hidden = true;
    hubsWrap.hidden      = false;
    return;
  }

  const hubBadge = {
    crypto:    { label: 'Crypto',    color: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
    encoding:  { label: 'Encoding',  color: '#00d4ff', bg: 'rgba(0,212,255,0.08)' },
    converter: { label: 'Converter', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    dev:       { label: 'Dev',       color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
    image:     { label: 'Image',     color: '#f472b6', bg: 'rgba(244,114,182,0.08)' }
  };

  const hits = TOOLS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.tagline.toLowerCase().includes(q) ||
    (t.tags && t.tags.some(tag => tag.includes(q)))
  );

  searchGrid.innerHTML = hits.length
    ? hits.map(t => {
        const badge = hubBadge[t.category] || { label: t.category, color: '#9ea7b2', bg: 'rgba(158,167,178,0.08)' };
        return \`
        <a href="${BASE_PATH}/tools/\${t.slug}/" class="tool-card">
          <div class="tool-card-title">\${t.title}</div>
          <div class="tool-card-tag">\${t.tagline}</div>
          <span class="hub-badge" style="color:\${badge.color};background:\${badge.bg};font-size:10px;padding:2px 8px;border-radius:99px;margin-top:6px;display:inline-block;font-family:var(--sans);font-weight:600">\${badge.label}</span>
        </a>\`;
      }).join('')
    : '<p class="no-results">No tools found. <a href="https://github.com/karthickajan/cipherkit/issues" target="_blank">Suggest one ↗</a></p>';

  searchSection.hidden = false;
  hubsWrap.hidden      = true;
});
</script>

<!-- Recently Used (inline, runs before ck-state.js) -->
<script defer>
(function() {
  function lsGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
  var raw = lsGet('ck_recent');
  if (!raw) return;
  var recent;
  try { recent = JSON.parse(raw); } catch(e) { return; }
  if (!Array.isArray(recent) || recent.length === 0) return;

  var hubColors = {
    'Crypto Hub': '#00ff88', 'Encoding Hub': '#00d4ff',
    'Converter Hub': '#a78bfa', 'Dev Hub': '#fb923c', 'Image Hub': '#f472b6'
  };

  var row = document.getElementById('recent-tools-row');
  var section = document.getElementById('recently-used');
  if (!row || !section) return;

  recent.slice(0, 5).forEach(function(item) {
    var color = hubColors[item.hub] || '#00ff88';
    var card = document.createElement('a');
    card.href = '/tools/' + item.slug + '/';
    card.style.cssText = 'display:inline-flex;flex-direction:column;gap:4px;padding:10px 14px;background:#111;border:1px solid #1e1e1e;border-radius:9px;text-decoration:none;transition:border-color 0.15s;min-width:120px;';
    card.onmouseenter = function() { card.style.borderColor = '#2a2a2a'; };
    card.onmouseleave = function() { card.style.borderColor = '#1e1e1e'; };
    card.innerHTML = '<span style="font-size:13px;color:#e0e0e0;white-space:nowrap;">' + item.name + '</span>'
      + '<span style="font-size:11px;color:' + color + ';opacity:0.8;">' + item.hub + '</span>';
    row.appendChild(card);
  });

  section.style.display = 'block';
})();
</script>

<!-- State: recent tools on homepage -->
<script src="${BASE_PATH}/assets/js/core/ck-state.js" defer></script>

</body>
</html>`;
}

// ── CATEGORY HUB PAGES ───────────────────────────────────────────────────────
function buildCategoryPage(cat) {
  const catTools = tools.filter(t => t.category === cat.id);

  // Better SEO titles per hub
  const seoTitles = {
    crypto:    'Crypto Hub — Encryption, Hashing & Security Tools',
    encoding:  'Encoding Hub — Base64, URL, Hex & Data Format Tools',
    converter: 'Converter Hub — Format & File Conversion Tools',
    dev:       'Dev Hub — Developer Utilities & Generators',
    image:     'Image Hub — Image Editing & Conversion Tools',
  };
  const pageTitle = (seoTitles[cat.id] || `${cat.label} — Free Tools`) + ' | CipherKit';

  const head = buildHead({
    pageTitle,
    metaDescription: `${catTools.length} free ${cat.label.toLowerCase()} tools for developers. ${cat.description}. All client-side, no server, no tracking.`,
    canonicalPath:   `/tools/${cat.id}/`
  });

  // Featured tools per hub
  const featuredSlugs = {
    crypto:    ['aes-encryption', 'sha256-generator', 'bcrypt-generator'],
    encoding:  ['base64-encode', 'json-formatter', 'url-encode'],
    converter: ['csv-json-converter', 'markdown-to-pdf', 'xml-json-converter'],
    dev:       ['jwt-decoder', 'uuid-generator', 'regex-tester'],
    image:     ['qr-generator', 'image-resizer', 'png-to-jpg'],
  };
  const featured = (featuredSlugs[cat.id] || [])
    .map(slug => tools.find(t => t.slug === slug))
    .filter(Boolean);

  const featuredHtml = featured.length ? `
  <div class="hub-featured">
    <h2>Most Used</h2>
    <div class="hub-featured-grid">
      ${featured.map(t => `
      <a href="${BASE_PATH}/tools/${t.slug}/" class="featured-card">
        <div class="featured-card-title">${t.title}</div>
        <div class="featured-card-tag">${t.tagline}</div>
        <span class="featured-card-arrow">→</span>
      </a>`).join('')}
    </div>
  </div>` : '';

  const cards = catTools.map(t => `
        <a href="${BASE_PATH}/tools/${t.slug}/" class="tool-card">
          <div class="tool-card-title">${t.title}</div>
          <div class="tool-card-tag">${t.tagline}</div>
        </a>`).join('');

  const catIcon = { crypto: SVG.lock, encoding: SVG.box, converter: SVG.arrows, dev: SVG.gear, image: SVG.image }[cat.id] || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>

<a href="#main-content" class="skip-link">Skip to content</a>

${buildNavbar(null, cat.id)}

<main id="main-content" class="category-page">
  <div class="cat-header">
    <div class="cat-header-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${BASE_PATH}/">Home</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">${cat.label}</span>
      </nav>
      <h1><span class="hub-icon">${catIcon}</span> ${cat.label}</h1>
      <p class="cat-desc">${cat.description} — ${catTools.length} tools, all free and client-side.</p>
    </div>
  </div>

  ${featuredHtml}

  <div class="tools-grid-wrap">
    <div class="tools-grid">
      ${cards}
    </div>
  </div>
</main>

${buildFooter()}

<script src="${BASE_PATH}/assets/js/core/ui.js" defer></script>
</body>
</html>`;
}

// ── SITEMAP ───────────────────────────────────────────────────────────────────
function buildSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${DOMAIN}/`,                  priority: '1.0', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/crypto/`,     priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/encoding/`,   priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/converter/`,  priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/dev/`,        priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/image/`,      priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/privacy-policy/`, priority: '0.3', freq: 'yearly' },
  ];

  const toolUrls = tools.map(t => ({
    loc:      `${DOMAIN}/tools/${t.slug}/`,
    priority: '0.9',
    freq:     'monthly'
  }));

  const allUrls = [...staticUrls, ...toolUrls];

  const urlEntries = allUrls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// ── ROBOTS.TXT ────────────────────────────────────────────────────────────────
function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
}

// ── CLEAN DIST ────────────────────────────────────────────────────────────────
function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  mkdirp(DIST);
}

// ── COPY ASSETS ───────────────────────────────────────────────────────────────
function copyAssets() {
  const assetSrc  = path.join(SRC, 'assets');
  const assetDist = path.join(DIST, 'assets');

  function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    mkdirp(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(s, d);
      } else {
        fs.copyFileSync(s, d);
        console.log(`  ✓ assets/${path.relative(assetDist, d)}`);
      }
    }
  }

  copyDir(assetSrc, assetDist);
}

// ── PRIVACY POLICY PAGE ──────────────────────────────────────────────────────
function buildPrivacyPage() {
  const head = buildHead({
    pageTitle:       'Privacy Policy — CipherKit',
    metaDescription: 'CipherKit privacy policy. 100% client-side tools, anonymous analytics, no personal data collected.',
    canonicalPath:   '/tools/privacy-policy/'
  });
  const navbar = buildNavbar();
  const footer = buildFooter();
  const year   = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>

<a href="#main-content" class="skip-link">Skip to content</a>

${navbar}

<main id="main-content" class="tool-page">

  <div class="tool-header">
    <div class="tool-header-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${BASE_PATH}/">Home</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Privacy Policy</span>
      </nav>
      <h1>Privacy Policy</h1>
      <p class="tool-tagline">Last updated: ${year}</p>
    </div>
  </div>

  <div class="tool-interface-wrap">
    <div style="max-width:800px;margin:0 auto">
      <div class="tool-card-ui">
        <div class="tc-head">
          <div class="tc-title">
            <div class="tc-icon tc-icon-green">${SVG.shield}</div>
            <h2>Your Privacy Matters</h2>
          </div>
        </div>
        <div class="tc-body" style="padding:24px;font-size:14px;line-height:1.8;color:var(--text)">

          <h3 style="color:var(--green);margin-bottom:8px">100% Client-Side Processing</h3>
          <p style="margin-bottom:20px;color:var(--muted)">
            CipherKit runs entirely in your web browser. All encryption, hashing, encoding, formatting,
            and conversion operations are performed using client-side JavaScript. <strong style="color:var(--text)">No user data is ever
            sent to any server.</strong> Your inputs, passwords, keys, and outputs never leave your device.
          </p>

          <h3 style="color:var(--green);margin-bottom:8px">Analytics</h3>
          <p style="margin-bottom:20px;color:var(--muted)">
            We use <strong style="color:var(--text)">Google Analytics 4</strong> to collect anonymous usage statistics such as
            page views, referral sources, and general geographic region. IP addresses are anonymized.
            No personally identifiable information (PII) is collected. Analytics data helps us understand
            which tools are most used so we can prioritize improvements.
          </p>

          <h3 style="color:var(--green);margin-bottom:8px">Cookies</h3>
          <p style="margin-bottom:20px;color:var(--muted)">
            CipherKit itself does not set any cookies. Google Analytics may set first-party cookies
            (e.g. <code style="background:var(--bg);padding:2px 6px;border-radius:3px;border:1px solid var(--border);font-size:12px">_ga</code>)
            for anonymous visitor identification. You can block these via your browser settings or a
            cookie blocker extension without affecting tool functionality.
          </p>

          <h3 style="color:var(--green);margin-bottom:8px">GitHub Pages Hosting</h3>
          <p style="margin-bottom:20px;color:var(--muted)">
            CipherKit is hosted on GitHub Pages. GitHub may log IP addresses and request metadata
            as part of their infrastructure. For details, see the
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener" style="color:var(--green)">GitHub Privacy Statement</a>.
          </p>

          <h3 style="color:var(--green);margin-bottom:8px">No Accounts or Personal Data</h3>
          <p style="margin-bottom:20px;color:var(--muted)">
            CipherKit does not require any account, login, email address, or personal information.
            There is no user registration, no database, and no server-side storage of any kind.
          </p>

          <h3 style="color:var(--green);margin-bottom:8px">Contact</h3>
          <p style="color:var(--muted)">
            Questions about this privacy policy? Reach out via
            <a href="${site.github}" target="_blank" rel="noopener" style="color:var(--green)">GitHub</a>.
          </p>

        </div>
      </div>
    </div>
  </div>

</main>

${footer}

<!-- Toast notification -->
<div class="toast" id="toast" role="alert" aria-live="assertive">
  <span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg></span>
  <span id="toast-msg">Copied to clipboard</span>
</div>

</body>
</html>`;
}

// ── MAIN BUILD ────────────────────────────────────────────────────────────────
function build() {
  console.log('\n🔨 CipherKit Build Starting...\n');

  // 1. Clean
  cleanDist();
  console.log('📁 dist/ cleaned\n');

  // 2. Copy assets (CSS, JS, images)
  console.log('📦 Copying assets...');
  copyAssets();
  console.log('');

  // 3. Homepage
  console.log('🏠 Building homepage...');
  writeDist('index.html', buildHomepage());
  console.log('');

  // 4. Category hub pages
  console.log('📂 Building category pages...');
  for (const cat of categories) {
    writeDist(`tools/${cat.id}/index.html`, buildCategoryPage(cat));
  }
  console.log('');

  // 5. Tool pages
  console.log(`🛠️  Building ${tools.length} tool pages...`);
  for (const tool of tools) {
    writeDist(`tools/${tool.slug}/index.html`, buildToolPage(tool));
  }
  console.log('');

  // 6. Privacy Policy page
  console.log('📜 Building privacy policy...');
  writeDist('tools/privacy-policy/index.html', buildPrivacyPage());
  console.log('');

  // 7. SEO files
  console.log('🗺️  Building SEO files...');
  writeDist('sitemap.xml', buildSitemap());
  writeDist('robots.txt',  buildRobots());
  console.log('');

  // 8. GitHub Pages requirements
  writeDist('.nojekyll', ''); // Prevents Jekyll processing
  console.log('  ✓ .nojekyll');

  // 8b. Copy tools.json to docs/ for nav search fetch
  fs.copyFileSync(TOOLS_JSON, path.join(DIST, 'tools.json'));
  console.log('  ✓ tools.json (nav search data)');

  // 9. 404 page
  const notFoundHead = buildHead({
    pageTitle:       '404 — Page Not Found | CipherKit',
    metaDescription: 'The page you are looking for does not exist. Browse our free developer tools.',
    canonicalPath:   '/404.html'
  });
  writeDist('404.html', `<!DOCTYPE html>
<html lang="en">
<head>${notFoundHead}</head>
<body>
${buildNavbar()}
<main id="main-content" style="text-align:center;padding:80px 24px">
  <h1 style="font-family:var(--sans);font-size:64px;color:var(--green)">404</h1>
  <p style="color:var(--muted);margin-bottom:32px">This tool doesn't exist — yet.</p>
  <a href="/" style="color:var(--green)">← Back to all tools</a>
</main>
${buildFooter()}
</body>
</html>`);

  // ── COPY STATIC ROOT FILES (favicons, manifest) ────────────────────────
  const staticRoot = path.join(__dirname, 'static');
  if (fs.existsSync(staticRoot)) {
    console.log('\n📌 Copying static root files...');
    for (const f of fs.readdirSync(staticRoot)) {
      fs.copyFileSync(path.join(staticRoot, f), path.join(DIST, f));
      console.log(`  ✓ ${f}`);
    }
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const totalPages = 1 + categories.length + tools.length + 3; // home + cats + tools + seo + 404
  console.log('\n✅ Build complete!');
  console.log(`   Pages generated: ${totalPages}`);
  console.log(`   Tool pages:      ${tools.length}`);
  console.log(`   Output:          ./docs/`);
  console.log('\n📡 Deploy:  git add docs/ && git push → GitHub Pages reads /docs on main');
  console.log(`🔗 Site:     ${DOMAIN}\n`);
}

build();
