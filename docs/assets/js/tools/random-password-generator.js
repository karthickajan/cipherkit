(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ', LOWER='abcdefghijklmnopqrstuvwxyz', DIGITS='0123456789', SYMBOLS='!@#$%^&*()_+-=[]{}|;:,.<>?';
  function generate() {
    var len = parseInt($('t-len').value, 10) || 16;
    var charset = '';
    if ($('t-upper').checked) charset += UPPER;
    if ($('t-lower').checked) charset += LOWER;
    if ($('t-digits').checked) charset += DIGITS;
    if ($('t-symbols').checked) charset += SYMBOLS;
    if (!charset) { $('t-err').textContent = 'Select at least one character set.'; $('t-err').style.display = 'block'; return; }
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    var arr = crypto.getRandomValues(new Uint32Array(len));
    var pw = '';
    for (var i = 0; i < len; i++) pw += charset[arr[i] % charset.length];
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = pw;
    var entropy = Math.floor(len * Math.log2(charset.length));
    var label = entropy < 40 ? 'Weak' : entropy < 60 ? 'Fair' : entropy < 80 ? 'Strong' : 'Very Strong';
    var color = entropy < 40 ? '#ff6b6b' : entropy < 60 ? '#e8a020' : entropy < 80 ? '#58a6ff' : '#3dd68c';
    $('t-strength').textContent = label + ' (' + entropy + ' bits)';
    $('t-strength').style.color = color;
    $('t-strength').style.display = 'block';
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.lock + '</div><h2 id="t-heading">Password Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Generate</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-len">Length</label><input type="number" id="t-len" value="20" min="4" max="128" style="width:100%"></div></div>'
    +     '<div class="ctrl-row" style="gap:14px;flex-wrap:wrap">'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-upper" checked> Uppercase</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-lower" checked> Lowercase</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-digits" checked> Digits</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-symbols" checked> Symbols</label>'
    +     '</div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-gen" aria-label="Generate password">' + IC.refresh + ' <span>Generate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Password</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Click Generate\u2026</div></div>'
    +     '<div id="t-strength" style="font-size:12px;font-weight:700;text-align:center;display:none;margin-top:-6px"></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('Click')===-1?t:''; });
  $('btn-gen').addEventListener('click', generate);
  generate();
  CK.wireCtrlEnter('btn-gen');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'random-password-generator-output.txt');
  CK.setUsageContent('<ol><li>Set <strong>length</strong> and select <strong>character sets</strong>.</li><li>Click <strong>Generate</strong> for a cryptographically secure password.</li></ol><p>Uses <code>crypto.getRandomValues()</code>. Shows password entropy in bits for strength estimation.</p>');
})();