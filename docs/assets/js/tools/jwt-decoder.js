(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    key:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    warn:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function b64url(s) { s = s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return atob(s); }
  var sty = document.createElement('style');
  sty.textContent =
    '.jwt-colored{font-family:var(--mono);font-size:12px;line-height:1.7;background:#0a0a0a;border:1px solid var(--border);border-radius:var(--r);padding:12px;word-break:break-all;margin-bottom:16px}'
    + '.jwt-c-header{color:#ff6b6b}'
    + '.jwt-c-dot{color:#666}'
    + '.jwt-c-payload{color:#c678dd}'
    + '.jwt-c-sig{color:#61afef}'
    + '.jwt-panels{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px}'
    + '@media(max-width:768px){.jwt-panels{grid-template-columns:1fr}}'
    + '.jwt-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}'
    + '.jwt-panel-head{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding:8px 12px;display:flex;align-items:center;justify-content:space-between}'
    + '.jwt-panel-body{padding:12px;font-family:var(--mono);font-size:12px;white-space:pre-wrap;word-break:break-all;line-height:1.65;min-height:60px;color:var(--text)}'
    + '.jwt-panel-body.ph{color:var(--muted)}'
    + '.jwt-p-header .jwt-panel-head{border-top:3px solid #ff6b6b;color:#ff6b6b}'
    + '.jwt-p-payload .jwt-panel-head{border-top:3px solid #c678dd;color:#c678dd}'
    + '.jwt-p-sig .jwt-panel-head{border-top:3px solid #61afef;color:#61afef}'
    + '.jwt-badge{display:inline-block;font-size:10px;font-weight:600;font-family:var(--mono);padding:2px 8px;border-radius:3px;margin-left:6px;vertical-align:middle}'
    + '.jwt-badge-valid{background:rgba(61,214,140,.12);color:#3dd68c;border:1px solid rgba(61,214,140,.3)}'
    + '.jwt-badge-expired{background:rgba(255,68,68,.1);color:#ff4444;border:1px solid rgba(255,68,68,.3)}'
    + '.jwt-badge-info{background:rgba(88,166,255,.1);color:#58a6ff;border:1px solid rgba(88,166,255,.3)}'
    + '.jwt-ts{font-size:11px;color:var(--muted);margin-top:8px;line-height:1.6}'
    + '.jwt-ts span{color:var(--text)}'
    + '.jwt-warn{display:none;align-items:center;gap:8px;background:rgba(255,68,68,.06);border:1px solid rgba(255,68,68,.25);border-radius:var(--r);padding:10px 14px;margin-bottom:16px;font-size:12px;color:#ff8888}'
    + '.jwt-warn svg{width:16px;height:16px;flex-shrink:0;stroke:#ff8888}';
  document.head.appendChild(sty);
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.key + '</div><h2 id="t-heading">JWT Decoder</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Decode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">JWT Token</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your JWT token here\u2026" rows="4" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-dec" aria-label="Decode JWT">' + IC.key + ' <span>Decode</span></button>'
    +     '<div class="jwt-warn" id="jwt-warn">' + IC.warn + ' <span>Signature is not verified — this tool only decodes the token and does not validate cryptographic signatures.</span></div>'
    +     '<div class="jwt-colored" id="jwt-colored" style="display:none"></div>'
    +     '<div class="jwt-panels">'
    +       '<div class="jwt-panel jwt-p-header"><div class="jwt-panel-head"><span>Header</span><button type="button" class="copy-btn" id="btn-cp-h" aria-label="Copy header">' + IC.copy + '</button></div><div class="jwt-panel-body ph" id="t-header">Header will appear here\u2026</div></div>'
    +       '<div class="jwt-panel jwt-p-payload"><div class="jwt-panel-head"><span>Payload</span><button type="button" class="copy-btn" id="btn-cp-p" aria-label="Copy payload">' + IC.copy + '</button></div><div class="jwt-panel-body ph" id="t-payload">Payload will appear here\u2026</div><div class="jwt-ts" id="jwt-ts" style="display:none;padding:0 12px 12px"></div></div>'
    +       '<div class="jwt-panel jwt-p-sig"><div class="jwt-panel-head"><span>Signature</span><button type="button" class="copy-btn" id="btn-cp-s" aria-label="Copy signature">' + IC.copy + '</button></div><div class="jwt-panel-body ph" id="t-sig">Signature will appear here\u2026</div></div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    $('t-header').className = 'jwt-panel-body ph'; $('t-header').textContent = 'Header will appear here\u2026';
    $('t-payload').className = 'jwt-panel-body ph'; $('t-payload').textContent = 'Payload will appear here\u2026';
    $('t-sig').className = 'jwt-panel-body ph'; $('t-sig').textContent = 'Signature will appear here\u2026';
    $('jwt-colored').style.display = 'none'; $('jwt-colored').innerHTML = '';
    $('jwt-warn').style.display = 'none';
    $('jwt-ts').style.display = 'none'; $('jwt-ts').innerHTML = '';
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
  });
  CK.wireCopy($('btn-cp-h'), function () { var t = $('t-header').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireCopy($('btn-cp-p'), function () { var t = $('t-payload').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireCopy($('btn-cp-s'), function () { var t = $('t-sig').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  function decode() {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    $('jwt-warn').style.display = 'none';
    $('jwt-colored').style.display = 'none';
    $('jwt-ts').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter a JWT token.'; $('t-err').style.display = 'block'; return; }
    var parts = input.split('.');
    if (parts.length < 2 || parts.length > 3) {
      $('t-err').textContent = 'Invalid JWT format. Must have 2 or 3 parts separated by dots.'; $('t-err').style.display = 'block'; return;
    }
    $('jwt-colored').innerHTML =
      '<span class="jwt-c-header">' + parts[0] + '</span>'
      + '<span class="jwt-c-dot">.</span>'
      + '<span class="jwt-c-payload">' + parts[1] + '</span>'
      + (parts[2] ? '<span class="jwt-c-dot">.</span><span class="jwt-c-sig">' + parts[2] + '</span>' : '');
    $('jwt-colored').style.display = 'block';
    var header;
    try {
      header = JSON.parse(b64url(parts[0]));
      $('t-header').className = 'jwt-panel-body'; $('t-header').textContent = JSON.stringify(header, null, 2);
    } catch (e) { $('t-err').textContent = 'Failed to decode header: ' + e.message; $('t-err').style.display = 'block'; window.CKFeedback && window.CKFeedback.reportError(e.message, {"JWT": ($('t-input').value || '').substring(0, 2000)}); return; }
    var payload;
    try {
      payload = JSON.parse(b64url(parts[1]));
      $('t-payload').className = 'jwt-panel-body'; $('t-payload').textContent = JSON.stringify(payload, null, 2);
    } catch (e) { $('t-err').textContent = 'Failed to decode payload: ' + e.message; $('t-err').style.display = 'block'; window.CKFeedback && window.CKFeedback.reportError(e.message, {"JWT": ($('t-input').value || '').substring(0, 2000)}); return; }
    var tsLines = [];
    var now = Math.floor(Date.now() / 1000);
    if (typeof payload.iat === 'number') {
      tsLines.push('\u23f0 Issued: <span>' + new Date(payload.iat * 1000).toLocaleString() + '</span>');
    }
    if (typeof payload.nbf === 'number') {
      tsLines.push('\u23f3 Not Before: <span>' + new Date(payload.nbf * 1000).toLocaleString() + '</span>');
    }
    if (typeof payload.exp === 'number') {
      var d = new Date(payload.exp * 1000);
      var isExpired = payload.exp < now;
      tsLines.push('\u231b Expires: <span>' + d.toLocaleString() + '</span> <span class="jwt-badge ' + (isExpired ? 'jwt-badge-expired' : 'jwt-badge-valid') + '">' + (isExpired ? 'Expired' : 'Valid') + '</span>');
    }
    if (typeof payload.auth_time === 'number') {
      tsLines.push('\ud83d\udd11 Auth Time: <span>' + new Date(payload.auth_time * 1000).toLocaleString() + '</span>');
    }
    if (tsLines.length) {
      $('jwt-ts').innerHTML = tsLines.join('<br>');
      $('jwt-ts').style.display = 'block';
    }
    $('t-sig').className = 'jwt-panel-body'; $('t-sig').textContent = parts[2] || '(unsigned)';
    $('jwt-warn').style.display = 'flex';
    CK.toast('JWT decoded');
  }
  $('btn-dec').addEventListener('click', decode);
  $('t-input').addEventListener('paste', function () { setTimeout(decode, 0); });
  CK.wireCtrlEnter('btn-dec');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent('<ol><li>Paste any JWT token into the input field.</li><li>The header, payload, and signature are decoded and displayed instantly.</li><li>Claims like <code>exp</code>, <code>iat</code>, <code>sub</code> are shown with human-readable timestamps.</li></ol><h3>What is a JWT?</h3><p>A JSON Web Token (JWT) is a compact, URL-safe token format used to represent claims between two parties. It consists of three Base64URL-encoded parts separated by dots: <strong>Header.Payload.Signature</strong>.</p><h3>Colour-coded display</h3><ul><li><span style="color:#ff6b6b">\u25cf Header</span> \u2014 algorithm &amp; token type</li><li><span style="color:#c678dd">\u25cf Payload</span> \u2014 claims (sub, exp, iat, \u2026)</li><li><span style="color:#61afef">\u25cf Signature</span> \u2014 cryptographic hash</li></ul><h3>Common uses</h3><ul><li><strong>Authentication</strong> \u2014 servers issue JWTs after login; clients send them with each request</li><li><strong>API authorization</strong> \u2014 REST APIs use JWTs in the Authorization header</li><li><strong>SSO</strong> \u2014 single sign-on systems share identity via JWT</li></ul><p><strong>Security note:</strong> JWTs are <em>not encrypted</em> by default \u2014 the payload is only Base64-encoded and readable by anyone. Never store sensitive data (passwords, card numbers) in a JWT payload unless using JWE (JSON Web Encryption).</p>');
  (function () {
    var inp = $('t-input');
    if (inp && !inp.value) {
      inp.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      setTimeout(decode, 50);
    }
  })();
})();