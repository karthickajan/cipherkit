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
const BASE_PATH = '/cipherkit';
const fs   = require('fs');
const path = require('path');

// ── CONFIG ─────────────────────────────────────────────────────────────────
const DOMAIN      = 'https://cipherkit.dev';   // ← change this when domain is ready
const SRC         = path.join(__dirname, 'src');
const DIST        = path.join(__dirname, 'docs'); // GitHub Pages reads /docs on main branch
const TOOLS_JSON  = path.join(__dirname, 'tools.json');

// ── LOAD DATA ───────────────────────────────────────────────────────────────
const data       = JSON.parse(fs.readFileSync(TOOLS_JSON, 'utf8'));
const { site, categories, tools } = data;

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
function buildHead({ pageTitle, metaDescription, canonicalPath, extraMeta = '' }) {
  const canonical = `${DOMAIN}${canonicalPath}`;
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDescription}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#07090d">
  <link rel="canonical" href="${canonical}">

  <!-- Security headers (meta fallbacks — real headers need a CDN/server) -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'none'; img-src 'self' data:; frame-ancestors 'none';">

  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${site.name}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">

  ${extraMeta}

  <title>${pageTitle}</title>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="${BASE_PATH}/assets/favicon.svg">

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
    .header-inner{max-width:1100px;margin:0 auto;padding:0 24px;height:56px;display:flex;align-items:center;gap:24px}
    .logo{display:flex;align-items:center;gap:10px;text-decoration:none}
    .logo-mark{width:30px;height:30px;background:#3dd68c;border-radius:6px;display:grid;place-items:center;flex-shrink:0}
    .logo-mark svg{width:16px;height:16px}
    .logo-name{font-family:'Syne',Arial,sans-serif;font-weight:800;font-size:17px;color:#dde4ed;letter-spacing:-.4px}
    .logo-name em{color:#3dd68c;font-style:normal}
  </style>

  <!-- Non-critical styles deferred -->
  <link rel="preload" href="${BASE_PATH}/assets/css/base.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <link rel="preload" href="${BASE_PATH}/assets/css/layout.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <link rel="preload" href="${BASE_PATH}/assets/css/tool.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="${BASE_PATH}/assets/css/base.css">
    <link rel="stylesheet" href="${BASE_PATH}/assets/css/layout.css">
    <link rel="stylesheet" href="${BASE_PATH}/assets/css/tool.css">
  </noscript>
`.trim();
}

// ── NAVBAR ──────────────────────────────────────────────────────────────────
function buildNavbar() {
  return `
<header class="site-header">
  <div class="header-inner">
    <a href="${BASE_PATH}/" class="logo" aria-label="CipherKit — home">
      <div class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#3dd68c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <span class="logo-name">Cipher<em>Kit</em></span>
    </a>

    <nav class="header-nav" aria-label="Tool categories">
      <a href="${BASE_PATH}/tools/crypto/" class="nav-link">🔐 Crypto</a>
      <a href="${BASE_PATH}/tools/encoding/" class="nav-link">📦 Encoding</a>
      <a href="${BASE_PATH}/tools/dev/" class="nav-link">⚙️ Dev</a>
    </nav>

    <div class="header-badges" aria-label="Security guarantees">
      <span class="hdr-badge">
        <span class="live-dot" aria-hidden="true"></span>
        100% Client-Side
      </span>
    </div>
  </div>
</header>
`.trim();
}

// ── FOOTER ──────────────────────────────────────────────────────────────────
function buildFooter() {
  const year = new Date().getFullYear();
  const cryptoTools = tools.filter(t => t.category === 'crypto').slice(0, 6);
  const encTools    = tools.filter(t => t.category === 'encoding').slice(0, 6);
  const devTools    = tools.filter(t => t.category === 'dev').slice(0, 6);

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
          <svg viewBox="0 0 24 24" fill="none" stroke="#3dd68c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <span class="logo-name">Cipher<em>Kit</em></span>
      </a>
      <p class="footer-tagline">Free developer tools. All client-side. No tracking.</p>
      <a href="${site.github}" class="footer-github" target="_blank" rel="noopener">
        View on GitHub ↗
      </a>
    </div>

    <div class="footer-links">
      <div class="footer-col">
        <h3>🔐 Crypto Hub</h3>
        <ul>
          ${linkList(cryptoTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3>📦 Data Hub</h3>
        <ul>
          ${linkList(encTools)}
        </ul>
      </div>
      <div class="footer-col">
        <h3>⚙️ Dev Hub</h3>
        <ul>
          ${linkList(devTools)}
        </ul>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <p>© ${year} CipherKit. Open source. <a href="${site.github}">GitHub</a>.</p>
  </div>
</footer>
`.trim();
}

// ── JSON-LD SCHEMA ───────────────────────────────────────────────────────────
function buildSchema(tool) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "url": `${DOMAIN}/tools/${tool.slug}/`,
    "description": tool.metaDescription,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "provider": { "@type": "Organization", "name": "CipherKit", "url": DOMAIN }
  }, null, 2);
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

  const navbar     = buildNavbar();
  const footer     = buildFooter();
  const related    = buildRelatedTools(tool);

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
        <span class="badge badge-green">✓ Free</span>
        <span class="badge badge-green">✓ Client-Side</span>
        <span class="badge badge-green">✓ No Login</span>
        <span class="badge badge-green">✓ No Storage</span>
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
        <!-- Populated by tool JS via setUsageContent() -->
      </div>
    </section>
  </div>

</main>

${footer}

<!-- Toast notification -->
<div class="toast" id="toast" role="alert" aria-live="assertive">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  <span id="toast-msg">Copied to clipboard</span>
</div>

<!-- Core JS -->
<script src="${BASE_PATH}/assets/js/core/ui.js" defer></script>

<!-- Vendor JS -->
${vendorScripts}

<!-- Tool-specific JS -->
<script src="${toolJsSrc}" defer></script>

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
        <h2 id="${catId}-heading">${cat.icon} ${cat.label}</h2>
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Free. Client-side. No tracking.
      </div>
      <h1>Developer Crypto & Utility Tools</h1>
      <p class="hero-sub">${tools.length} free online tools for developers. AES, RSA, SHA, JWT, Base64, JSON — all run in your browser. Your data never leaves your device.</p>

      <!-- Search -->
      <div class="hero-search" role="search">
        <input
          type="search"
          id="tool-search"
          placeholder="Search tools — e.g. AES, JWT, Base64..."
          aria-label="Search tools"
          autocomplete="off"
        >
      </div>

      <!-- Hub quick-links -->
      <div class="hub-pills" aria-label="Jump to category">
        <a href="#crypto" class="hub-pill">🔐 Crypto Hub</a>
        <a href="#encoding" class="hub-pill">📦 Data Hub</a>
        <a href="#dev" class="hub-pill">⚙️ Dev Hub</a>
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
    ${categorySection('dev')}
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

  const hits = TOOLS.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.tagline.toLowerCase().includes(q) ||
    (t.tags && t.tags.some(tag => tag.includes(q)))
  );

  searchGrid.innerHTML = hits.length
    ? hits.map(t => \`
        <a href="${BASE_PATH}/tools/\${t.slug}/" class="tool-card">
          <div class="tool-card-title">\${t.title}</div>
          <div class="tool-card-tag">\${t.tagline}</div>
        </a>\`).join('')
    : '<p class="no-results">No tools found. <a href="https://github.com/karthickajan/cipherkit/issues" target="_blank">Suggest one ↗</a></p>';

  searchSection.hidden = false;
  hubsWrap.hidden      = true;
});
</script>

</body>
</html>`;
}

// ── CATEGORY HUB PAGES ───────────────────────────────────────────────────────
function buildCategoryPage(cat) {
  const catTools = tools.filter(t => t.category === cat.id);
  const head = buildHead({
    pageTitle:       `${cat.label} — Free ${cat.label} Tools for Developers | CipherKit`,
    metaDescription: `${catTools.length} free ${cat.label.toLowerCase()} tools for developers. ${cat.description}. All client-side, no server, no tracking.`,
    canonicalPath:   `/tools/${cat.id}/`
  });

  const cards = catTools.map(t => `
        <a href="${BASE_PATH}/tools/${t.slug}/" class="tool-card">
          <div class="tool-card-title">${t.title}</div>
          <div class="tool-card-tag">${t.tagline}</div>
        </a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>

<a href="#main-content" class="skip-link">Skip to content</a>

${buildNavbar()}

<main id="main-content" class="category-page">
  <div class="cat-header">
    <div class="cat-header-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="${BASE_PATH}/">Home</a>
        <span aria-hidden="true">›</span>
        <span aria-current="page">${cat.label}</span>
      </nav>
      <h1>${cat.icon} ${cat.label}</h1>
      <p class="cat-desc">${cat.description} — ${catTools.length} tools, all free and client-side.</p>
    </div>
  </div>

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
    { loc: `${DOMAIN}/`,              priority: '1.0', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/crypto/`, priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/encoding/`, priority: '0.8', freq: 'weekly' },
    { loc: `${DOMAIN}/tools/dev/`,    priority: '0.8', freq: 'weekly' },
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

  // 6. SEO files
  console.log('🗺️  Building SEO files...');
  writeDist('sitemap.xml', buildSitemap());
  writeDist('robots.txt',  buildRobots());
  console.log('');

  // 7. GitHub Pages requirements
  writeDist('.nojekyll', ''); // Prevents Jekyll processing
  console.log('  ✓ .nojekyll');

  // 8. 404 page
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
