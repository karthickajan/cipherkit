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
    launchpadIndia: '<a href="https://launchpadindia.co/listing/9c462e2c-e086-433f-9176-1c5ef82ab602" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:#1f2937;border:1px solid #374151;border-radius:10px;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.3)"><img src="https://launchpadindia.co/logo.png" alt="LaunchPad India" width="28" height="28" style="object-fit:contain" /><div style="display:flex;flex-direction:column;gap:2px"><span style="color:#f9fafb;font-weight:700;font-size:13px">LaunchPad<span style="color:#fb923c">India</span></span><span style="color:#9ca3af;font-weight:500;font-size:11px">#1 Product of the Week</span></div></a>',
    launchBoosts: '<a href="https://launchboosts.com/project/cipherkit" target="_blank" rel="noopener noreferrer"><img src="https://launchboosts.com/badges/featured-dark.svg" alt="Featured on LaunchBoosts" width="180" height="54" style="height:54px;width:auto" /></a>',
    bowora: '<a href="https://bowora.com/cipherkit.app" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;width:170px;height:50px;background-color:#fff;color:#000;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,sans-serif;padding:8px 14px;border-radius:8px;text-decoration:none;border:1px solid #E8E8E8"><svg width="35" height="35" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(31.1875, 18.1874)" fill="#000"><path d="M87.5343464,15.4046144 C88.0800499,16.2992254 87.7980596,17.4698555 86.9050901,18.0165331 C86.0121207,18.5633415 84.8423829,18.2806539 84.2966794,17.3859122 C81.7117678,13.1474282 78.0968081,9.80172458 73.4648555,7.33755659 L73.4485366,7.32879615 C68.8772902,4.83909213 63.5398394,3.61244746 57.444409,3.61244746 L9.3017365,3.61244746 C7.67506992,3.61244746 6.3960609,3.83953898 5.49238625,4.41819874 L5.45674581,4.4405444 C4.79524344,4.84409996 4.32995935,5.45833757 4.0239476,6.27503287 C3.73947677,7.26368123 3.60644521,8.42777375 3.60644521,9.76432926 L3.60644521,103.544841 C3.60644521,104.950303 3.75631787,106.263062 4.0658545,107.495669 C4.27578065,108.239391 4.6709588,108.810258 5.28428782,109.184211 L5.31979771,109.20657 C6.22347236,109.785151 7.50248138,110.012269 9.12927851,110.012269 L59.1699028,110.012269 C63.7602097,110.012269 68.0783175,109.267239 72.1226597,107.769727 C76.1497692,106.173758 79.6895314,103.98404 82.7378993,101.19469 C83.5107618,100.487317 84.7118318,100.541579 85.4181132,101.315897 C86.1243946,102.090216 86.0708687,103.293142 85.2967007,104.000384 C81.9088999,107.100795 77.9767011,109.539466 73.4985376,111.311429 L73.4602862,111.326073 C68.9979194,112.981273 64.2351545,113.8126 59.1699028,113.8126 L9.12927851,113.8126 C6.62504751,113.8126 4.6896276,113.307371 3.2936448,112.419559 C1.8549718,111.536324 0.878319095,110.227096 0.397499432,108.466901 L0.387969203,108.430944 C0.00649891912,106.918395 -0.1875,105.289999 -0.1875,103.544841 L-0.1875,9.76432926 C-0.1875,7.97589194 0.0187707215,6.42738608 0.409379582,5.11588281 L0.444889478,5.00826015 C1.06187393,3.31376875 2.08082518,2.0552073 3.46675555,1.20522233 C4.8626078,0.317842042 6.79815825,-0.1874 9.3017365,-0.1874 L57.444409,-0.1874 C64.2296714,-0.1874 70.1626962,1.21570871 75.252361,3.98591679 C80.5093922,6.78394907 84.5995579,10.5933023 87.5343464,15.4046144 Z"></path><path d="M18.1870648,100.8126 C16.6872227,100.8126 15.520287,100.518396 14.687172,99.9299894 C13.9369898,99.4256779 13.4369118,98.6692106 13.1873299,97.6604566 C12.9372256,96.567738 12.8125,95.3909238 12.8125,94.130538 L12.8125,19.2423752 C12.8125,17.9815965 12.9372256,16.8888779 13.1873299,15.9647434 C13.5207588,14.9559894 14.0622378,14.1995221 14.8124201,13.6952106 C15.6459269,13.1068035 16.8124708,12.8126 18.3128353,12.8126 L53.1886048,12.8126 C57.8554332,12.8126 61.9387285,13.8632708 65.4386213,15.9647434 C69.0219693,18.066085 71.8139951,20.9235009 73.8135234,24.537515 C75.8135741,28.1519222 76.7720677,32.1020566 76.688482,36.3885735 C76.7720677,38.5740106 76.5218328,40.7170071 75.9382997,42.8183487 C75.3548972,44.9198213 74.4798587,46.8946265 73.3134454,48.7439434 C72.2298343,50.5090336 70.8552402,51.9800514 69.188096,53.1563416 C71.438251,54.5853115 73.3548465,56.4346284 74.9381438,58.7036372 C76.5213104,60.9731699 77.729386,63.4943345 78.5626316,66.2681788 C79.3971832,69.0416301 79.8125,71.9416177 79.8125,74.9670938 C79.7302203,78.5811079 79.0628402,81.9848831 77.8129717,85.1790743 C76.5631033,88.2891699 74.771364,91.0204424 72.4380151,93.3735468 C70.1045356,95.7271752 67.3963567,97.576361 64.3126949,98.9208424 C61.2291637,100.181752 57.9374518,100.8126 54.437559,100.8126 L18.186673,100.8126 L18.1870648,100.8126 Z" fill-rule="nonzero"></path></g></svg><div style="display:flex;flex-direction:column;line-height:1.2"><span style="font-size:10px;font-weight:normal">Featured on</span><span style="font-size:16px;font-weight:700">Bowora</span></div></a>',
    dofollow: '<a href="https://dofollow.tools" target="_blank" rel="noopener noreferrer"><img src="https://dofollow.tools/badge/badge_transparent.svg" alt="Featured on Dofollow.Tools" width="200" height="54" style="height:54px;width:auto" /></a>',
    peerpush: '<a href="https://peerpush.com/p/cipherkit" target="_blank" rel="noopener"><img src="https://peerpush.com/p/cipherkit/badge.png" alt="CipherKit on PeerPush" style="width: 230px;" /></a>',
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
  p.push('          <a href="https://peerlist.io/karthick_ajan/project/cipherkit" target="_blank" rel="noreferrer" style="display:inline-block;max-width:270px">');
  p.push('            <img src="https://peerlist.io/api/v1/projects/embed/PRJHJKNJDN8N97RG7FONBD7B79AJE8?showUpvote=true&theme=dark" alt="CipherKit on Peerlist Launchpad" loading="lazy" width="270" style="width:100%;height:auto;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.peerlist));

  // ── VibeRank ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">VibeRank</h3>');
  p.push('          <a href="https://viberank.dev/apps/Cipherkit" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:270px">');
  p.push('            <img src="https://viberank.dev/badge?app=Cipherkit&theme=dark" alt="CipherKit on VibeRank" loading="lazy" width="270" style="width:100%;height:auto;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.vibeRank));

  // ── LaunchPad India ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">LaunchPad India</h3>');
  p.push('          <div style="display:inline-block;max-width:270px">');
  p.push('            <a href="https://launchpadindia.co/listing/9c462e2c-e086-433f-9176-1c5ef82ab602" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:#1f2937;border:1px solid #374151;border-radius:10px;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.3)"><img src="https://launchpadindia.co/logo.png" alt="LaunchPad India" width="28" height="28" style="object-fit:contain" /><div style="display:flex;flex-direction:column;gap:2px"><span style="color:#f9fafb;font-weight:700;font-size:13px">LaunchPad<span style="color:#fb923c">India</span></span><span style="color:#9ca3af;font-weight:500;font-size:11px">#1 Product of the Week</span></div></a>');
  p.push('          </div>');
  p.push('          ' + copyBlock(embeds.launchpadIndia));

  // ── LaunchBoosts ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">LaunchBoosts</h3>');
  p.push('          <a href="https://launchboosts.com/project/cipherkit" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:270px">');
  p.push('            <img src="https://launchboosts.com/badges/featured-dark.svg" alt="Featured on LaunchBoosts" loading="lazy" height="54" style="height:54px;width:auto;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.launchBoosts));

  // ── Bowora ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">Bowora</h3>');
  p.push('          <div style="display:inline-block">');
  p.push('            ' + embeds.bowora);
  p.push('          </div>');
  p.push('          ' + copyBlock(embeds.bowora));

  // ── Dofollow.Tools ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">Dofollow.Tools</h3>');
  p.push('          <a href="https://dofollow.tools" target="_blank" rel="noopener noreferrer" style="display:inline-block;max-width:270px">');
  p.push('            <img src="https://dofollow.tools/badge/badge_transparent.svg" alt="Featured on Dofollow.Tools" loading="lazy" height="54" style="height:54px;width:auto;border-radius:6px">');
  p.push('          </a>');
  p.push('          ' + copyBlock(embeds.dofollow));

  // ── More Platforms ──
  p.push('          <h3 style="color:var(--green);margin-bottom:12px">More Platforms</h3>');
  p.push('          <div style="display:flex;flex-wrap:wrap;gap:10px">');
  p.push('            ' + embeds.peerpush);
  p.push('            ' + platformBtn('https://fazier.com/launches/cipherkit', 'Fazier'));
  p.push('            ' + platformBtn('https://www.producthunt.com/products/cipherkit', 'Product Hunt'));
  p.push('            ' + platformBtn('https://dev.to/karthick_ajan/cipherkit-5h2i', 'DEV.to'));
  p.push('            ' + platformBtn('https://cipherkit.hashnode.dev/stop-pasting-your-company-s-api-payloads-into-random-websites', 'Hashnode'));
  p.push('            ' + platformBtn('https://stackshare.io/cipherkit', 'StackShare'));
  p.push('            ' + platformBtn('https://www.saashub.com/cipherkit-app-alternatives', 'SaaSHub'));
  p.push('            ' + platformBtn(site.github, 'GitHub &#9733;'));
  p.push('            ' + platformBtn('https://news.ycombinator.com/item?id=44486498', 'Hacker News'));
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
  p.push('<script src="/assets/js/core/ui.js" defer></script>');
  p.push('<script src="/assets/js/feedback.js" defer></script>');
  p.push('<script src="/assets/js/core/ck-state.js" defer></script>');
  p.push('');
  p.push('</body>');
  p.push('</html>');

  return p.join('\n');
};
