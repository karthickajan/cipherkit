'use strict';

/**
 * Generates the Support CipherKit page HTML.
 * Called from build.js — keeps nested templates out of the main file.
 */
module.exports = function buildSupportPage({ buildHead, buildNavbar, buildFooter, SVG, BASE_PATH, site }) {
  const head = buildHead({
    pageTitle:       'Support CipherKit — Badges & Donate',
    metaDescription: 'Support CipherKit — embed badges, share the project, or donate via UPI or GitHub Sponsors.',
    canonicalPath:   '/tools/support/',
    // Allow all HTTPS images — this is a badge showcase page with many external image hosts
    extraImgSrc:     'https:'
  });
  const navbar = buildNavbar();
  const footer = buildFooter();

  // ── Embed codes (dark only — site is dark-first) ──
  const embeds = {
    peerlist:  '<a href="https://peerlist.io/karthick_ajan/project/cipherkit" target="_blank" rel="noreferrer"><img src="https://peerlist.io/api/v1/projects/embed/PRJHJKNJDN8N97RG7FONBD7B79AJE8?showUpvote=true&theme=dark" alt="CipherKit on Peerlist" style="width:auto;height:72px" /></a>',
    vibeRank:  '<a href="https://viberank.dev/apps/Cipherkit" target="_blank" rel="noopener noreferrer"><img src="https://viberank.dev/badge?app=Cipherkit&theme=dark" alt="CipherKit on VibeRank" /></a>',
    fazier:    '<a href="https://fazier.com/launches/cipherkit" target="_blank"><img src="https://fazier.com/api/v1/public/badges/embed_image.svg?launch_id=8284&badge_type=featured&variant=3&theme=neutral" width="270" alt="CipherKit on Fazier" /></a>',
  };

  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function copyBlock(code) {
    var safeAttr = code.replace(/"/g, '&quot;');
    return '<details style="margin-top:8px;margin-bottom:24px">' +
      '<summary style="cursor:pointer;color:var(--green);font-size:13px;font-weight:600;margin-bottom:8px">Embed code</summary>' +
      '<div style="position:relative">' +
      '<pre style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px 48px 12px 12px;font-size:12px;overflow-x:auto;white-space:pre-wrap;color:var(--muted)"><code>' + esc(code) + '</code></pre>' +
      '<button onclick="navigator.clipboard.writeText(this.dataset.code);this.textContent=\'Copied!\';setTimeout(()=>this.textContent=\'Copy\',1500)" data-code="' + safeAttr + '" style="position:absolute;top:8px;right:8px;background:var(--green);color:#02150a;border:none;border-radius:4px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">Copy</button>' +
      '</div></details>';
  }

  var btnStyle = 'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);text-decoration:none;font-size:13px;font-weight:600;transition:border-color .2s';

  function platformBtn(url, label) {
    return '<a href="' + url + '" target="_blank" rel="noopener" style="' + btnStyle + '">' + label + '</a>';
  }

  // UPI QR via external API
  var upiUrl = 'upi://pay?pa=karthickajangs-1@oksbi&pn=Karthick%20Ajan%20G%20S&cu=INR';
  var qrImgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(upiUrl);

  // ── Assemble page ──
  var p = [];
  p.push('<!DOCTYPE html>');
  p.push('<html lang="en">');
  p.push('<head>');
  p.push(head);
  p.push('</head>');
  p.push('<body>');
  p.push('');
  p.push('<a href="#main-content" class="skip-link">Skip to content</a>');
  p.push('');
  p.push(navbar);
  p.push('');
  p.push('<main id="main-content" class="tool-page">');
  p.push('');

  // ── Header ──
  p.push('  <div class="tool-header">');
  p.push('    <div class="tool-header-inner">');
  p.push('      <nav class="breadcrumb" aria-label="Breadcrumb">');
  p.push('        <a href="' + BASE_PATH + '/">Home</a>');
  p.push('        <span aria-hidden="true">&#8250;</span>');
  p.push('        <span aria-current="page">Support</span>');
  p.push('      </nav>');
  p.push('      <h1>Support CipherKit</h1>');
  p.push('      <p class="tool-tagline">Embed badges, share the project, or support the developer</p>');
  p.push('    </div>');
  p.push('  </div>');
  p.push('');

  p.push('  <div class="tool-interface-wrap">');
  p.push('    <div style="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:32px">');

  // ═══ BADGES CARD ═══
  p.push('');
  p.push('      <div class="tool-card-ui">');
  p.push('        <div class="tc-head"><div class="tc-title">');
  p.push('          <div class="tc-icon tc-icon-green">' + SVG.shield + '</div>');
  p.push('          <h2>As Seen On</h2>');
  p.push('        </div></div>');
  p.push('        <div class="tc-body" style="padding:24px;font-size:14px;line-height:1.8;color:var(--text)">');

  // ── Peerlist ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">Peerlist Launchpad</h3>');
  p.push('          <a href="https://peerlist.io/karthick_ajan/project/cipherkit" target="_blank" rel="noreferrer">');
  p.push('            <img src="https://peerlist.io/api/v1/projects/embed/PRJHJKNJDN8N97RG7FONBD7B79AJE8?showUpvote=true&theme=dark" alt="CipherKit on Peerlist Launchpad" loading="lazy" width="180" height="72" style="width:auto;height:72px;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.peerlist));

  // ── VibeRank ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">VibeRank</h3>');
  p.push('          <a href="https://viberank.dev/apps/Cipherkit" target="_blank" rel="noopener noreferrer">');
  p.push('            <img src="https://viberank.dev/badge?app=Cipherkit&theme=dark" alt="CipherKit on VibeRank" loading="lazy" width="180" height="54" style="height:54px;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.vibeRank));

  // ── Platform links (including Fazier as link-only) ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">More Platforms</h3>');
  p.push('          <div style="display:flex;flex-wrap:wrap;gap:10px">');
  p.push('            ' + platformBtn('https://fazier.com/launches/cipherkit', 'Fazier'));
  p.push('            ' + platformBtn('https://www.producthunt.com/products/cipherkit', 'Product Hunt'));
  p.push('            ' + platformBtn('https://dev.to/karthick_ajan/cipherkit-5h2i', 'DEV.to'));
  p.push('            ' + platformBtn('https://cipherkit.hashnode.dev/stop-pasting-your-company-s-api-payloads-into-random-websites', 'Hashnode'));
  p.push('            ' + platformBtn('https://stackshare.io/cipherkit', 'StackShare'));
  p.push('            ' + platformBtn('https://www.saashub.com/cipherkit-app-alternatives', 'SaaSHub'));
  p.push('            ' + platformBtn('https://launchpadindia.co/listing/cipherkit?sort=top', 'Launchpad India &#127942; #1'));
  p.push('            ' + platformBtn(site.github, 'GitHub &#9733;'));
  p.push('          </div>');

  p.push('        </div>');
  p.push('      </div>');

  // ═══ SUPPORT / DONATE CARD ═══
  p.push('');
  p.push('      <div class="tool-card-ui" id="support-section">');
  p.push('        <div class="tc-head"><div class="tc-title">');
  p.push('          <div class="tc-icon tc-icon-green">' + SVG.box + '</div>');
  p.push('          <h2>Support the Project</h2>');
  p.push('        </div></div>');
  p.push('        <div class="tc-body" style="padding:24px;font-size:14px;line-height:1.8;color:var(--text)">');
  p.push('          <p style="color:var(--muted);margin-bottom:20px">');
  p.push('            CipherKit is <strong style="color:var(--text)">free forever</strong> and open source.');
  p.push('            If these tools save you time, consider supporting the developer — every bit helps keep the project alive and ad-free.');
  p.push('          </p>');
  p.push('');
  p.push('          <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">');

  // ── UPI / GPay card ──
  p.push('            <div style="flex:1;min-width:240px;text-align:center;padding:20px;background:var(--bg);border:1px solid var(--border);border-radius:10px">');
  p.push('              <h3 style="color:var(--green);margin-bottom:12px;font-size:15px">UPI / Google Pay</h3>');
  p.push('              <div style="background:#fff;display:inline-block;padding:16px;border-radius:10px;margin-bottom:12px">');
  p.push('                <img src="' + qrImgUrl + '" alt="Scan to pay via UPI / Google Pay" width="180" height="180" loading="lazy" style="display:block;border-radius:4px">');
  p.push('              </div>');
  p.push('              <p style="color:var(--muted);font-size:12px;margin-top:4px">');
  p.push('                <code style="background:var(--bg);padding:2px 8px;border-radius:4px;border:1px solid var(--border);font-size:11px;user-select:all">karthickajangs-1@oksbi</code>');
  p.push('              </p>');
  p.push('              <p style="color:var(--muted);font-size:12px;margin-top:8px">Scan with any UPI app<br>(GPay, PhonePe, Paytm, etc.)</p>');
  p.push('              <a href="upi://pay?pa=karthickajangs-1@oksbi&pn=Karthick%20Ajan&cu=INR" style="display:inline-block;margin-top:12px;padding:10px 28px;background:var(--green);color:#02150a;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none">Open UPI App</a>');
  p.push('            </div>');

  // ── GitHub Sponsors card ──
  p.push('            <div style="flex:1;min-width:240px;text-align:center;padding:20px;background:var(--bg);border:1px solid var(--border);border-radius:10px">');
  p.push('              <h3 style="color:var(--green);margin-bottom:12px;font-size:15px">GitHub Sponsors</h3>');
  p.push('              <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Prefer international payments?<br>Sponsor on GitHub — no fees for you.</p>');
  p.push('              <a href="https://github.com/sponsors/karthickajan" target="_blank" rel="noopener" style="display:inline-block;padding:10px 28px;background:var(--green);color:#02150a;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none">Sponsor on GitHub</a>');
  p.push('            </div>');

  // ── Star the repo card ──
  p.push('            <div style="flex:1;min-width:240px;text-align:center;padding:20px;background:var(--bg);border:1px solid var(--border);border-radius:10px">');
  p.push('              <h3 style="color:var(--green);margin-bottom:12px;font-size:15px">Free Support</h3>');
  p.push('              <p style="color:var(--muted);font-size:13px;margin-bottom:16px">No money? No problem.<br>A GitHub star helps more than you think.</p>');
  p.push('              <a href="' + site.github + '" target="_blank" rel="noopener" style="display:inline-block;padding:10px 28px;background:var(--green);color:#02150a;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none">&#9733; Star on GitHub</a>');
  p.push('            </div>');

  p.push('          </div>');
  p.push('');
  p.push('          <p style="color:var(--muted);font-size:12px;margin-top:20px;text-align:center">');
  p.push('            CipherKit will always be free to use. Donations help cover domain costs and motivate development of new tools.');
  p.push('          </p>');
  p.push('        </div>');
  p.push('      </div>');

  p.push('');
  p.push('    </div>');
  p.push('  </div>');
  p.push('');
  p.push('</main>');
  p.push('');
  p.push(footer);
  p.push('');
  p.push('</body>');
  p.push('</html>');

  return p.join('\n');
};
