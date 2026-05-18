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
const crypto = require('crypto');

// ── Cache-busting version (content hash of CSS/JS source files) ──────────────
function assetHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  } catch (e) { return Date.now().toString(36); }
}
const ASSET_V = assetHash(path.join(__dirname, 'src/assets/css/base.css')) +
                assetHash(path.join(__dirname, 'src/assets/js/core/ui.js'));
const V = `?v=${ASSET_V.slice(0, 8)}`;

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

/** Simple CSS minifier — removes comments, extra whitespace */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')      // remove comments
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')  // remove space around symbols
    .replace(/;\}/g, '}')                   // remove last semicolons
    .replace(/\s{2,}/g, ' ')               // collapse whitespace
    .replace(/\n/g, '')                     // remove newlines
    .trim();
}

/** Simple JS minifier — collapses blank lines (safe, no regex-based comment stripping) */
function minifyJS(js) {
  const lines = js.split('\n');
  const out = [];
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    // Skip pure block comment lines (start/end on own line only)
    if (!inBlockComment && (trimmed === '/**' || trimmed === '/*')) { inBlockComment = true; continue; }
    if (inBlockComment) { if (trimmed === '*/' || trimmed.endsWith('*/')) { inBlockComment = false; } continue; }
    // Skip standalone single-line block comments like /* ── SECTION ── */
    if (/^\s*\/\*[^*]*\*\/\s*$/.test(line) && !line.includes("'") && !line.includes('"') && !line.includes('`')) continue;
    // Skip blank lines
    if (trimmed === '') continue;
    out.push(line);
  }
  return out.join('\n');
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
function buildHead({ pageTitle, metaDescription, canonicalPath, extraMeta = '', extraImgSrc = '', extraConnectSrc = '', extraFrameSrc = '' }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  const imgSrc = `'self' data: blob: https://www.google-analytics.com https://launchboosts.com https://dofollow.tools${extraImgSrc ? ' ' + extraImgSrc : ''}`;
  const connectSrc = `'self' https://dns.google https://www.google-analytics.com https://www.googletagmanager.com https://script.google.com${extraConnectSrc ? ' ' + extraConnectSrc : ''}`;
  const frameSrc = extraFrameSrc ? ` frame-src ${extraFrameSrc};` : '';
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
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src ${connectSrc}; img-src ${imgSrc};${frameSrc}">

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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
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
    .header-inner{max-width:1100px;margin:0 auto;padding:0 24px;height:56px;display:flex;align-items:center;gap:24px}
    .hamburger-btn{display:none;background:none;border:none;color:#3dd68c;font-size:1.4rem;cursor:pointer;padding:4px;margin-left:auto;line-height:1}
    .logo{display:flex;align-items:center;gap:10px;text-decoration:none}
    .logo-mark{width:30px;height:30px;border-radius:6px;display:grid;place-items:center;flex-shrink:0;overflow:hidden}
    .logo-mark svg{width:16px;height:16px}
    .logo-name{font-family:'Syne',Arial,sans-serif;font-weight:800;font-size:17px;color:#dde4ed;letter-spacing:-.4px}
    .logo-name em{color:#3dd68c;font-style:normal}
    .tool-interface-wrap{max-width:1100px;margin:0 auto;padding:28px 24px;min-height:60vh}
    .tool-container{min-height:400px}
    .tool-page-lower{min-height:280px}
    .hero{text-align:center;padding:48px 24px 36px}
    .hero-inner{max-width:720px;margin:0 auto}
    .hero h1{font-size:clamp(26px,3.6vw,42px);font-weight:900;line-height:1.05;letter-spacing:-0.02em;margin-bottom:16px;color:#fff;font-family:'Syne',Arial,sans-serif}
    .hero h1 em{color:#00ff88;font-style:normal}
    .hero-accent{font-size:16px;font-weight:500;color:#00ff88;letter-spacing:0.02em;margin-bottom:16px}
    .hero-sub{font-size:14px;margin-bottom:28px;color:#888;line-height:1.7}
    .hub-section{content-visibility:auto;contain-intrinsic-size:0 600px}
    .theme-icon-sun{display:none}.theme-icon-moon{display:block}
    [data-theme="light"] .theme-icon-sun{display:block}[data-theme="light"] .theme-icon-moon{display:none}
    [data-theme="light"] body{background:#f5f7fa;color:#1f2328}
    [data-theme="light"] .site-header{background:rgba(245,247,250,.92);border-bottom-color:#d0d7de}
    [data-theme="light"] .hero h1{color:#1f2328}
    [data-theme="light"] .hero h1 em{color:#1a8c5b}
    [data-theme="light"] .hero-accent{color:#1a8c5b}
  </style>
  <script>try{var t=localStorage.getItem('ck-theme');if(t){document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content='#f5f7fa'}}catch(e){}</script>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/base.css${V}">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/layout.css${V}">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/tool.css${V}">
  <link rel="stylesheet" href="${BASE_PATH}/assets/css/feedback.css${V}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${BASE_PATH}/assets/css/feedback.css${V}"></noscript>

  <!-- GA4 anonymous analytics — deferred to not block rendering -->
  <script>
    (function(){var loaded=false;function loadGA(){if(loaded)return;loaded=true;var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=G-31DPEW6FGL';s.async=true;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-31DPEW6FGL',{anonymize_ip:true});}['scroll','click','keydown','touchstart'].forEach(function(e){document.addEventListener(e,loadGA,{once:true,passive:true});});})();
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
      <button id="gh-stars" class="gh-stars-badge" onclick="CK.bookmarkSite(event)" aria-label="Bookmark this site" type="button">🔖 <span id="gh-star-count">Bookmark</span></button>
    </div>
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle light/dark mode" onclick="CK.toggleTheme()">
      <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
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
      <div class="footer-crafted" style="font-size: 12px; color: #9ea7b2; margin-top: 4px;">
        Crafted by <a href="https://karthickajan.github.io/Ajan/" target="_blank" rel="noopener noreferrer" style="text-decoration:underline">Ajan</a>
      </div>
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-start">
        <a href="https://launchboosts.com/project/cipherkit" target="_blank" rel="noopener noreferrer" aria-label="Featured on LaunchBoosts">
          <img src="https://launchboosts.com/badges/featured-dark.svg" alt="Featured on LaunchBoosts" width="180" height="54" loading="lazy" style="height:36px;width:auto;display:block;opacity:0.85">
        </a>
        <a href="https://bowora.com/cipherkit.app" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;height:36px;background-color:#fff;color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;padding:6px 12px;border-radius:6px;text-decoration:none;border:1px solid #E8E8E8;opacity:0.9"><svg width="22" height="22" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(31.1875, 18.1874)" fill="#000"><path d="M87.5343464,15.4046144 C88.0800499,16.2992254 87.7980596,17.4698555 86.9050901,18.0165331 C86.0121207,18.5633415 84.8423829,18.2806539 84.2966794,17.3859122 C81.7117678,13.1474282 78.0968081,9.80172458 73.4648555,7.33755659 L73.4485366,7.32879615 C68.8772902,4.83909213 63.5398394,3.61244746 57.444409,3.61244746 L9.3017365,3.61244746 C7.67506992,3.61244746 6.3960609,3.83953898 5.49238625,4.41819874 L5.45674581,4.4405444 C4.79524344,4.84409996 4.32995935,5.45833757 4.0239476,6.27503287 C3.73947677,7.26368123 3.60644521,8.42777375 3.60644521,9.76432926 L3.60644521,103.544841 C3.60644521,104.950303 3.75631787,106.263062 4.0658545,107.495669 C4.27578065,108.239391 4.6709588,108.810258 5.28428782,109.184211 L5.31979771,109.20657 C6.22347236,109.785151 7.50248138,110.012269 9.12927851,110.012269 L59.1699028,110.012269 C63.7602097,110.012269 68.0783175,109.267239 72.1226597,107.769727 C76.1497692,106.173758 79.6895314,103.98404 82.7378993,101.19469 C83.5107618,100.487317 84.7118318,100.541579 85.4181132,101.315897 C86.1243946,102.090216 86.0708687,103.293142 85.2967007,104.000384 C81.9088999,107.100795 77.9767011,109.539466 73.4985376,111.311429 L73.4602862,111.326073 C68.9979194,112.981273 64.2351545,113.8126 59.1699028,113.8126 L9.12927851,113.8126 C6.62504751,113.8126 4.6896276,113.307371 3.2936448,112.419559 C1.8549718,111.536324 0.878319095,110.227096 0.397499432,108.466901 L0.387969203,108.430944 C0.00649891912,106.918395 -0.1875,105.289999 -0.1875,103.544841 L-0.1875,9.76432926 C-0.1875,7.97589194 0.0187707215,6.42738608 0.409379582,5.11588281 L0.444889478,5.00826015 C1.06187393,3.31376875 2.08082518,2.0552073 3.46675555,1.20522233 C4.8626078,0.317842042 6.79815825,-0.1874 9.3017365,-0.1874 L57.444409,-0.1874 C64.2296714,-0.1874 70.1626962,1.21570871 75.252361,3.98591679 C80.5093922,6.78394907 84.5995579,10.5933023 87.5343464,15.4046144 Z"></path><path d="M18.1870648,100.8126 C16.6872227,100.8126 15.520287,100.518396 14.687172,99.9299894 C13.9369898,99.4256779 13.4369118,98.6692106 13.1873299,97.6604566 C12.9372256,96.567738 12.8125,95.3909238 12.8125,94.130538 L12.8125,19.2423752 C12.8125,17.9815965 12.9372256,16.8888779 13.1873299,15.9647434 C13.5207588,14.9559894 14.0622378,14.1995221 14.8124201,13.6952106 C15.6459269,13.1068035 16.8124708,12.8126 18.3128353,12.8126 L53.1886048,12.8126 C57.8554332,12.8126 61.9387285,13.8632708 65.4386213,15.9647434 C69.0219693,18.066085 71.8139951,20.9235009 73.8135234,24.537515 C75.8135741,28.1519222 76.7720677,32.1020566 76.688482,36.3885735 C76.7720677,38.5740106 76.5218328,40.7170071 75.9382997,42.8183487 C75.3548972,44.9198213 74.4798587,46.8946265 73.3134454,48.7439434 C72.2298343,50.5090336 70.8552402,51.9800514 69.188096,53.1563416 C71.438251,54.5853115 73.3548465,56.4346284 74.9381438,58.7036372 C76.5213104,60.9731699 77.729386,63.4943345 78.5626316,66.2681788 C79.3971832,69.0416301 79.8125,71.9416177 79.8125,74.9670938 C79.7302203,78.5811079 79.0628402,81.9848831 77.8129717,85.1790743 C76.5631033,88.2891699 74.771364,91.0204424 72.4380151,93.3735468 C70.1045356,95.7271752 67.3963567,97.576361 64.3126949,98.9208424 C61.2291637,100.181752 57.9374518,100.8126 54.437559,100.8126 L18.186673,100.8126 L18.1870648,100.8126 Z" fill-rule="nonzero"></path></g></svg><div style="display:flex;flex-direction:column;line-height:1.2"><span style="font-size:9px;font-weight:400">Featured on</span><span style="font-size:13px;font-weight:700">Bowora</span></div></a>
        <a href="https://dofollow.tools" target="_blank" rel="noopener noreferrer">
          <img src="https://dofollow.tools/badge/badge_transparent.svg" alt="Featured on Dofollow.Tools" width="200" height="54" loading="lazy" style="height:36px;width:auto;display:block;opacity:0.85">
        </a>
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
  <p>© ${year} CipherKit. Open source. <a href="${site.github}">GitHub</a>. <a href="${BASE_PATH}/tools/privacy-policy/">Privacy Policy</a>. <a href="${BASE_PATH}/tools/support/">Support</a>. <a href="mailto&#58;karthickajangs&#64;gmail&#46;com" class="footer-contact-link" aria-label="Contact CipherKit">Contact</a></p>
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

// ── CHESSY (IFRAME) TOOL PAGE ─────────────────────────────────────────────────
function buildIframeToolPage(tool) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I get a live eval bar for my chess game online?",
        "acceptedAnswer": { "@type": "Answer", "text": "Paste your live game link (Lichess or chess.com) into CipherKit's Chess Analyzer. The built-in Stockfish engine instantly shows a live evaluation bar with best-move arrows — no download, no signup, completely free." }
      },
      {
        "@type": "Question",
        "name": "Can I analyze a chess.com or Lichess game in real time?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Enter your game URL in the Live Game Tracking section. The tool follows the game move-by-move, showing the eval bar and Stockfish's top 3 engine lines with zero lag if you provide a Lichess Board API token, or ~2 second polling without one." }
      },
      {
        "@type": "Question",
        "name": "How does the chess screenshot to FEN feature work?",
        "acceptedAnswer": { "@type": "Answer", "text": "Upload or paste (Ctrl+V) any chess screenshot. The tool uses pure computer vision (no AI cloud calls) to detect the board grid, identify all 64 squares and piece types, then outputs the exact FEN string in under 500 ms. Works with chess.com, Lichess, Chessify, ChessKid, and any 2D board theme." }
      },
      {
        "@type": "Question",
        "name": "Is this chess analysis tool really free?",
        "acceptedAnswer": { "@type": "Answer", "text": "100% free with no limits. No account required, no ads, no data sent to servers. The Stockfish engine runs directly in your browser via WebAssembly for maximum privacy and speed." }
      },
      {
        "@type": "Question",
        "name": "What is the best free alternative to Lichess analysis board?",
        "acceptedAnswer": { "@type": "Answer", "text": "CipherKit's Live Chess Analyzer offers Stockfish evaluation, an interactive board editor, live game tracking with eval bar, and screenshot-to-FEN — all in one tool. Unlike Lichess analysis, it also supports pasting screenshots directly and tracking chess.com games." }
      }
    ]
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Live Chess Game Analysis — Eval Bar & Board Analyzer",
    "applicationCategory": "GameApplication",
    "applicationSubCategory": "Chess Analysis Tool",
    "description": tool.metaDescription,
    "url": `${DOMAIN}/tools/${tool.slug}`,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "operatingSystem": "Web",
    "browserRequirements": "Requires a modern browser with WebAssembly support",
    "featureList": "Live eval bar, Stockfish engine, Screenshot to FEN, Live game tracking, Board editor, Open in Lichess",
    "screenshot": `${DOMAIN}/android-chrome-512x512.png`
  };

  const head = buildHead({
    pageTitle:       tool.pageTitle,
    metaDescription: tool.metaDescription,
    canonicalPath:   `/tools/${tool.slug}/`,
    extraMeta: `
  <meta name="keywords" content="live chess analysis online, live game eval bar chess, chess game analysis online free, chess eval bar, stockfish analysis online, chess position analyzer, chess screenshot to FEN, chess board analyzer, live chess evaluation, analyze chess game online, chess analysis tool free, alternative to lichess analysis, chess.com game analyzer, live chess engine online, chess board recognition" />
  <script type="application/ld+json">
  ${JSON.stringify(appSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>`,
    extraConnectSrc: 'https://karthickajan-chessy.hf.space',
    extraFrameSrc: 'https://karthickajan-chessy.hf.space',
    extraImgSrc: ''
  });

  const navbar = buildNavbar(null, tool.category);
  const footer = buildFooter();

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<style>
  .chessy-tool-wrapper{width:100%;height:calc(100vh - 60px);overflow:hidden;position:relative}
  .chessy-tool-wrapper iframe{border:none}
  .chessy-seo-content{background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);padding:32px 24px}
  [data-theme="light"] .chessy-seo-content{background:rgba(0,0,0,.02);border-top-color:rgba(0,0,0,.08)}
  .chessy-seo-inner{max-width:860px;margin:0 auto}
  .chessy-seo-inner h2{font-family:'Syne',sans-serif;font-size:clamp(20px,2.5vw,28px);font-weight:700;margin:28px 0 12px;color:#fff}
  .chessy-seo-inner h3{font-size:16px;font-weight:600;margin:20px 0 8px;color:#ccc}
  .chessy-seo-inner p,.chessy-seo-inner li{font-size:14px;line-height:1.7;color:#999;margin-bottom:10px}
  .chessy-seo-inner ul{padding-left:20px;margin-bottom:16px}
  .chessy-seo-inner details{margin-top:24px;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:16px}
  .chessy-seo-inner summary{cursor:pointer;font-weight:600;font-size:15px;color:#ddd}
  .chessy-seo-inner .faq-item{margin:16px 0;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .chessy-seo-inner .faq-q{font-weight:600;color:#ddd;margin-bottom:6px}
  .chessy-seo-inner .faq-a{color:#999;font-size:13px;line-height:1.7}
  [data-theme="light"] .chessy-seo-inner h2{color:#1f2328}
  [data-theme="light"] .chessy-seo-inner h3{color:#333}
  [data-theme="light"] .chessy-seo-inner p,[data-theme="light"] .chessy-seo-inner li{color:#555}
  [data-theme="light"] .chessy-seo-inner .faq-q{color:#222}
  [data-theme="light"] .chessy-seo-inner .faq-a{color:#555}
  .ck-fab{background:#1a6b3f;border-color:#28a060}
  .ck-fab svg{stroke:#fff}
  .ck-fab:hover{background:#22875a;border-color:#3dd68c}
  .ck-fab:hover svg{stroke:#fff}
</style>
</head>
<body>

<a href="#tool-interface" class="skip-link">Skip to tool</a>

${navbar}

<main id="main-content">
  <div class="chessy-tool-wrapper" id="tool-interface">
    <iframe
      src="${tool.iframeSrc}"
      width="100%"
      height="100%"
      frameborder="0"
      allow="clipboard-read; clipboard-write"
      title="Live Chess Game Analysis — Free Eval Bar & Stockfish Engine Online"
      loading="lazy"
    ></iframe>
  </div>

  <div class="chessy-seo-content">
    <div class="chessy-seo-inner">
      <h2>Live Chess Game Analysis with Free Eval Bar Online</h2>
      <p>Analyze any chess game online with a <strong>live evaluation bar</strong> powered by Stockfish — the world's strongest open-source chess engine. Paste a live game link from <strong>chess.com</strong> or <strong>Lichess</strong> and watch the eval bar update in real time, or upload a board screenshot to get instant position analysis. 100% free, no signup, runs entirely in your browser.</p>

      <h3>Key Features</h3>
      <ul>
        <li><strong>Live Eval Bar</strong> — Real-time Stockfish evaluation bar shows who's winning during any live chess game</li>
        <li><strong>Live Game Tracking</strong> — Paste a Lichess or chess.com game URL and follow along with engine analysis move-by-move</li>
        <li><strong>Screenshot to FEN</strong> — Upload or paste (Ctrl+V) any chess screenshot; get the exact FEN position in under 500ms using pure computer vision</li>
        <li><strong>Stockfish Engine</strong> — Full-strength Stockfish running in-browser via WebAssembly. See top 3 engine lines, depth, and centipawn evaluation</li>
        <li><strong>Interactive Board Editor</strong> — Drag pieces to correct any position, flip the board, set castling rights</li>
        <li><strong>Open in Lichess</strong> — One click to continue deeper analysis on Lichess with the current position</li>
        <li><strong>Zero Lag Tracking</strong> — With a free Lichess Board API token, get instant move updates with zero polling delay</li>
      </ul>

      <h3>How to Use the Live Chess Eval Bar</h3>
      <ol style="padding-left:20px;margin-bottom:16px">
        <li>Paste your live game URL in the "Live Game Tracking" box (supports Lichess and chess.com links)</li>
        <li>Click "Track" — the eval bar appears instantly showing Stockfish's evaluation</li>
        <li>Watch the evaluation update after each move in real time</li>
        <li>Click "Analyze" at any point to see the best move, top engine lines, and alternative variations</li>
      </ol>

      <h3>How to Analyze a Chess Screenshot</h3>
      <ol style="padding-left:20px;margin-bottom:16px">
        <li>Take a screenshot of any chess position (chess.com, Lichess, a book, a stream, any 2D board)</li>
        <li>Upload or paste (Ctrl+V) the image into the analyzer</li>
        <li>The tool detects the board, identifies all pieces, and outputs the FEN in under 1 second</li>
        <li>Use the eval bar and Stockfish to find the best move, or click "Open in Lichess" for deeper analysis</li>
      </ol>

      <h3>Supported Platforms</h3>
      <p>Works with screenshots and live game links from: <strong>chess.com</strong> (all piece themes and board colors), <strong>Lichess</strong> (all themes), <strong>Chessify</strong>, <strong>Chess24</strong>, <strong>ChessKid</strong>, <strong>365chess</strong>, <strong>Chess Tempo</strong>, and virtually any 2D digital chess board. Also works with photos of printed chess diagrams and book positions.</p>

      <h2>Why Choose This Over Other Chess Analysis Tools?</h2>
      <ul>
        <li><strong>Completely free</strong> — No premium tiers, no credit card, no "5 analyses per day" limit</li>
        <li><strong>No download required</strong> — Runs in your browser. No app install, no Java, no extensions</li>
        <li><strong>Private</strong> — Your positions and games are never sent to any server. Stockfish runs locally</li>
        <li><strong>Screenshot support</strong> — Unlike Lichess analysis or 365chess, you can paste any board screenshot directly</li>
        <li><strong>Live tracking</strong> — Unlike ChessCompass or DecodeChess, track live games with a real-time eval bar</li>
        <li><strong>All-in-one</strong> — Combines screenshot OCR + live game tracking + Stockfish eval + board editor in one tool</li>
      </ul>

      <details>
        <summary>Frequently Asked Questions about Live Chess Analysis</summary>

        <div class="faq-item">
          <div class="faq-q">How do I get a live eval bar for my chess game online?</div>
          <div class="faq-a">Paste your live game link (Lichess or chess.com) into CipherKit's Chess Analyzer. The built-in Stockfish engine instantly shows a live evaluation bar with best-move arrows — no download, no signup, completely free.</div>
        </div>

        <div class="faq-item">
          <div class="faq-q">Can I analyze a chess.com or Lichess game in real time?</div>
          <div class="faq-a">Yes. Enter your game URL in the Live Game Tracking section. The tool follows the game move-by-move, showing the eval bar and Stockfish's top 3 engine lines with zero lag if you provide a Lichess Board API token, or ~2 second polling without one.</div>
        </div>

        <div class="faq-item">
          <div class="faq-q">How does the chess screenshot to FEN feature work?</div>
          <div class="faq-a">Upload or paste (Ctrl+V) any chess screenshot. The tool uses pure computer vision (no AI cloud calls) to detect the board grid, identify all 64 squares and piece types, then outputs the exact FEN string in under 500 ms. Works with chess.com, Lichess, Chessify, ChessKid, and any 2D board theme.</div>
        </div>

        <div class="faq-item">
          <div class="faq-q">Is this chess analysis tool really free?</div>
          <div class="faq-a">100% free with no limits. No account required, no ads, no data sent to servers. The Stockfish engine runs directly in your browser via WebAssembly for maximum privacy and speed.</div>
        </div>

        <div class="faq-item">
          <div class="faq-q">What is the best free alternative to Lichess analysis board?</div>
          <div class="faq-a">CipherKit's Live Chess Analyzer offers Stockfish evaluation, an interactive board editor, live game tracking with eval bar, and screenshot-to-FEN — all in one tool. Unlike Lichess analysis, it also supports pasting screenshots directly and tracking chess.com games.</div>
        </div>

        <div class="faq-item">
          <div class="faq-q">Does it work on mobile?</div>
          <div class="faq-a">Yes. The tool is fully responsive and works on iOS and Android browsers. Upload screenshots from your camera roll or paste from clipboard.</div>
        </div>
      </details>
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

<!-- Core JS -->
<script src="${BASE_PATH}/assets/js/core/ui.js${V}" defer></script>

<!-- Feedback Widget -->
<script>window.CIPHERKIT_TOOL_NAME = '${tool.title}';</script>
<script>window.CIPHERKIT_IFRAME_TOOL = true;</script>
<script src="${BASE_PATH}/assets/js/feedback.js${V}" defer></script>

<script src="${BASE_PATH}/assets/js/core/ck-state.js${V}" defer></script>

</body>
</html>`;
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
      ${tool.slug === 'diff-checker' ? `<div class="tool-skeleton" aria-hidden="true" style="display:flex;gap:12px;padding:16px;min-height:50vh">
        <div style="flex:1;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.08);padding:16px">
          <div style="height:14px;width:40%;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:12px"></div>
          <div style="height:14px;width:90%;background:rgba(255,255,255,0.04);border-radius:4px;margin-bottom:8px"></div>
          <div style="height:14px;width:75%;background:rgba(255,255,255,0.04);border-radius:4px;margin-bottom:8px"></div>
          <div style="height:14px;width:85%;background:rgba(255,255,255,0.04);border-radius:4px"></div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.08);padding:16px">
          <div style="height:14px;width:40%;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:12px"></div>
          <div style="height:14px;width:90%;background:rgba(255,255,255,0.04);border-radius:4px;margin-bottom:8px"></div>
          <div style="height:14px;width:75%;background:rgba(255,255,255,0.04);border-radius:4px;margin-bottom:8px"></div>
          <div style="height:14px;width:85%;background:rgba(255,255,255,0.04);border-radius:4px"></div>
        </div>
      </div>` : '<div class="tool-loading">Loading tool...</div>'}
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
<script src="${BASE_PATH}/assets/js/core/ui.js${V}" defer></script>

<!-- Feedback Widget -->
<script>window.CIPHERKIT_TOOL_NAME = '${tool.title}';</script>
<script src="${BASE_PATH}/assets/js/feedback.js${V}" defer></script>

<!-- Vendor JS -->
${vendorScripts}

<!-- Tool-specific JS -->
<script src="${toolJsSrc}" defer></script>

<!-- State: permalinks, recent tools, history -->
<script src="${BASE_PATH}/assets/js/core/ck-state.js${V}" defer></script>

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
<body class="home-page">

<a href="#main-content" class="skip-link">Skip to content</a>

${buildNavbar()}

<main id="main-content">

  <!-- Hero -->
  <section class="hero" aria-label="Introduction">
    <div class="hero-inner">
      <h1>Stop pasting sensitive data into random <em>tools.</em></h1>
      <p class="hero-accent">${tools.length}+ free tools. 100% in your browser. Zero tracking.</p>
      <p class="hero-sub">AES, JWT, Base64, SHA, Regex and 80+ more — all running locally.</p>

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

    ${categorySection('crypto')}
    ${categorySection('encoding')}
    ${categorySection('converter')}
    ${categorySection('dev')}
    ${categorySection('image')}

    <!-- Recently Used (hidden by default, populated by JS) -->
    <section id="recently-used" style="display:none; margin-bottom: 2rem;">
      <h2 style="font-size:13px; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:12px;">Recently used</h2>
      <div id="recent-tools-row" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
    </section>
  </div>

</main>

${buildFooter()}

<!-- Toast -->
<div class="toast" id="toast" role="alert" aria-live="assertive">
  <span id="toast-msg"></span>
</div>

<script src="${BASE_PATH}/assets/js/core/ui.js${V}" defer></script>
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
    crypto:    { label: 'Crypto',    color: ['#00ff88','#0d7a40'], bg: ['rgba(0,255,136,0.08)','rgba(13,122,64,0.1)'] },
    encoding:  { label: 'Encoding',  color: ['#00d4ff','#0874a6'], bg: ['rgba(0,212,255,0.08)','rgba(8,116,166,0.1)'] },
    converter: { label: 'Converter', color: ['#a78bfa','#7c3aed'], bg: ['rgba(167,139,250,0.08)','rgba(124,58,237,0.1)'] },
    dev:       { label: 'Dev',       color: ['#fb923c','#c2410c'], bg: ['rgba(251,146,60,0.08)','rgba(194,65,12,0.1)'] },
    image:     { label: 'Image',     color: ['#f472b6','#be185d'], bg: ['rgba(244,114,182,0.08)','rgba(190,24,93,0.1)'] }
  };
  var isLt = document.documentElement.getAttribute('data-theme') === 'light' ? 1 : 0;

  const hits = TOOLS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.tagline.toLowerCase().includes(q) ||
    (t.tags && t.tags.some(tag => tag.includes(q)))
  );

  searchGrid.innerHTML = hits.length
    ? hits.map(t => {
        const badge = hubBadge[t.category] || { label: t.category, color: ['#9ea7b2','#656d76'], bg: ['rgba(158,167,178,0.08)','rgba(101,109,118,0.1)'] };
        return \`
        <a href="${BASE_PATH}/tools/\${t.slug}/" class="tool-card">
          <div class="tool-card-title">\${t.title}</div>
          <div class="tool-card-tag">\${t.tagline}</div>
          <span class="hub-badge" style="color:\${badge.color[isLt]};background:\${badge.bg[isLt]};font-size:10px;padding:2px 8px;border-radius:99px;margin-top:6px;display:inline-block;font-family:var(--sans);font-weight:600">\${badge.label}</span>
        </a>\`;
      }).join('')
    : '<p class="no-results">No tools found. <a href="https://github.com/karthickajan/cipherkit/issues" target="_blank">Suggest one ↗</a></p>';

  searchSection.hidden = false;
  hubsWrap.hidden      = true;
});
</script>

<!-- Typewriter placeholder for hero search -->
<script defer>
(function(){
  var el = document.getElementById('tool-search');
  if (!el || !document.querySelector('.hero')) return;
  var words = ["AES Encryption","Decode JWT Token", "Base64 Encode","Format JSON","Generate UUID","Hex to Text","Test Regex","Compare Text","Bcrypt Password","PNG to JPG"];
  var fallback = el.getAttribute('placeholder') || '';
  var idx = 0, pos = 0, deleting = false, tid = 0, active = true;
  var cursorOn = true, cid = 0;

  function setPlc(text) {
    el.setAttribute('placeholder', text + (cursorOn ? '|' : ''));
  }

  function blink() {
    if (!active) return;
    cursorOn = !cursorOn;
    var word = words[idx];
    var text = pos > 0 ? word.slice(0, pos) : '\\u200B';
    setPlc(text);
    cid = setTimeout(blink, 500);
  }

  function tick() {
    if (!active) return;
    cursorOn = true;
    var word = words[idx];
    if (!deleting) {
      pos++;
      setPlc(word.slice(0, pos));
      if (pos >= word.length) {
        deleting = true;
        tid = setTimeout(tick, 1200);
        return;
      }
      tid = setTimeout(tick, 80);
    } else {
      pos--;
      setPlc(pos > 0 ? word.slice(0, pos) : '\\u200B');
      if (pos <= 0) {
        deleting = false;
        idx = (idx + 1) % words.length;
        tid = setTimeout(tick, 300);
        return;
      }
      tid = setTimeout(tick, 40);
    }
  }

  function stop() {
    active = false;
    clearTimeout(tid);
    clearTimeout(cid);
    el.setAttribute('placeholder', fallback);
  }
  function resume() {
    if (el.value.length > 0) return;
    active = true;
    cursorOn = true;
    pos = 0;
    idx = (idx + 1) % words.length;
    deleting = false;
    tick();
    cid = setTimeout(blink, 500);
  }

  el.addEventListener('focus', stop);
  el.addEventListener('blur', resume);
  tick();
  cid = setTimeout(blink, 500);
})();
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
    'Crypto Hub': ['#00ff88','#0d7a40'], 'Encoding Hub': ['#00d4ff','#0874a6'],
    'Converter Hub': ['#a78bfa','#7c3aed'], 'Dev Hub': ['#fb923c','#c2410c'], 'Image Hub': ['#f472b6','#be185d']
  };
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';

  var row = document.getElementById('recent-tools-row');
  var section = document.getElementById('recently-used');
  if (!row || !section) return;

  recent.slice(0, 5).forEach(function(item) {
    var colors = hubColors[item.hub] || ['#00ff88','#0d7a40'];
    var color = isLight ? colors[1] : colors[0];
    var card = document.createElement('a');
    card.href = '/tools/' + item.slug + '/';
    card.style.cssText = 'display:inline-flex;flex-direction:column;gap:4px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:9px;text-decoration:none;transition:border-color 0.15s;min-width:120px;';
    card.onmouseenter = function() { card.style.borderColor = 'var(--green)'; };
    card.onmouseleave = function() { card.style.borderColor = 'var(--border)'; };
    card.innerHTML = '<span style="font-size:13px;color:var(--text);white-space:nowrap;">' + item.name + '</span>'
      + '<span style="font-size:11px;color:' + color + ';opacity:0.8;">' + item.hub + '</span>';
    row.appendChild(card);
  });

  section.style.display = 'block';
})();
</script>

<!-- State: recent tools on homepage -->
<script src="${BASE_PATH}/assets/js/core/ck-state.js${V}" defer></script>

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

<script src="${BASE_PATH}/assets/js/core/ui.js${V}" defer></script>
</body>
</html>`;
}

// ── SUPPORT PAGE (external module — avoids nested template-literal issues) ────
const _buildSupportPage = require('./build-support-page.js');
function buildSupportPage() {
  return _buildSupportPage({ buildHead, buildNavbar, buildFooter, SVG, BASE_PATH, site });
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
    { loc: `${DOMAIN}/tools/support/`,        priority: '0.4', freq: 'monthly' },
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

# Block UTM/ref tracking params from being indexed
Disallow: /*?ref=
Disallow: /*?utm_source=
Disallow: /*?utm_medium=
Disallow: /*?utm_campaign=

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
      } else if (entry.name.endsWith('.css')) {
        // Minify CSS files
        const raw = fs.readFileSync(s, 'utf8');
        fs.writeFileSync(d, minifyCSS(raw), 'utf8');
        console.log(`  ✓ assets/${path.relative(assetDist, d)} (minified)`);
      } else if (entry.name.endsWith('.js')) {
        // Minify JS files
        const raw = fs.readFileSync(s, 'utf8');
        fs.writeFileSync(d, minifyJS(raw), 'utf8');
        console.log(`  ✓ assets/${path.relative(assetDist, d)} (minified)`);
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

<script src="/assets/js/core/ui.js${V}" defer></script>
<script src="/assets/js/feedback.js${V}" defer></script>
<script src="/assets/js/core/ck-state.js${V}" defer></script>

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
    if (tool.iframe) {
      writeDist(`tools/${tool.slug}/index.html`, buildIframeToolPage(tool));
    } else {
      writeDist(`tools/${tool.slug}/index.html`, buildToolPage(tool));
    }
  }
  console.log('');

  // 6. Privacy Policy page
  console.log('📜 Building privacy policy...');
  writeDist('tools/privacy-policy/index.html', buildPrivacyPage());
  console.log('');

  // 6b. Support page
  console.log('💚 Building support page...');
  writeDist('tools/support/index.html', buildSupportPage());
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

  // 10. llms.txt — AI discovery files
  console.log('\n🤖 Building AI discovery files...');
  const llmsTxt = `# CipherKit
> ${tools.length} free online developer tools — encryption, hashing, encoding, formatting, image conversion. 100% client-side, no server, no tracking. Open source.

## About
CipherKit is a free, open-source collection of ${tools.length} developer tools that run entirely in the browser. No data is sent to any server. No login required. No cookies (except anonymous Google Analytics). Hosted on GitHub Pages.

- Website: ${DOMAIN}
- GitHub: ${site.github}
- License: Open Source

## Categories
${categories.map(c => `- [${c.label}](${DOMAIN}/tools/${c.id}/): ${c.description}`).join('\n')}

## Tools
${tools.map(t => `- [${t.title}](${DOMAIN}/tools/${t.slug}/): ${t.tagline}`).join('\n')}

## Key Features
- 100% client-side: all processing happens in the browser
- No server-side processing: your data never leaves your device
- No login or signup required
- Free forever, no premium tiers
- Works offline after first load
- Mobile-friendly responsive design
- Dark and light mode support

## Common Use Cases
- Encrypt/decrypt data with AES-256 or RSA
- Generate SHA-256, SHA-512, MD5, HMAC hashes
- Encode/decode Base64, URL, HTML entities, Hex, Binary
- Format JSON, XML, YAML, SQL, CSS, HTML
- Convert between JSON, CSV, XML, YAML formats
- Generate and decode JWTs
- Generate UUIDs, passwords, random strings
- Convert images (HEIC→JPG, PNG→WebP, SVG→PNG, etc.)
- Resize and enhance images
- Generate QR codes
- Test regex patterns
- Compare text with diff checker
- Parse HTTP headers and SSL certificates
- DNS lookup and IP address tools
`;
  writeDist('llms.txt', llmsTxt);

  // llms-full.txt with SEO content included
  const llmsFullLines = [llmsTxt, '\n## Detailed Tool Descriptions\n'];
  for (const t of tools) {
    llmsFullLines.push(`### ${t.title}`);
    llmsFullLines.push(`URL: ${DOMAIN}/tools/${t.slug}/`);
    llmsFullLines.push(`Category: ${t.category}`);
    llmsFullLines.push(`Description: ${t.metaDescription}`);
    if (t.seoContent) {
      llmsFullLines.push(t.seoContent.description || '');
      if (t.seoContent.commonUses) {
        llmsFullLines.push('Common uses: ' + t.seoContent.commonUses.join(', '));
      }
    }
    llmsFullLines.push('');
  }
  writeDist('llms-full.txt', llmsFullLines.join('\n'));
  console.log('');

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
