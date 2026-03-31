/**
 * CipherKit — UUID / GUID Generator
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    hash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  function uuidV4() {
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6]&0x0f)|0x40; b[8] = (b[8]&0x3f)|0x80;
    var h = Array.from(b).map(function(x){return x.toString(16).padStart(2,'0');}).join('');
    return h.substr(0,8)+'-'+h.substr(8,4)+'-'+h.substr(12,4)+'-'+h.substr(16,4)+'-'+h.substr(20,12);
  }

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.hash + '</div><h2 id="t-heading">UUID Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Generate</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-count">Count</label><select id="t-count"><option value="1" selected>1</option><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div><div class="sel-group"><label for="t-case">Case</label><select id="t-case"><option value="lower" selected>Lowercase</option><option value="upper">Uppercase</option></select></div><div class="sel-group"><label for="t-braces">Format</label><select id="t-braces"><option value="plain" selected>Plain</option><option value="braces">{Braces}</option></select></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-gen" aria-label="Generate UUIDs">' + IC.refresh + ' <span>Generate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>UUIDs</span></div><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Click Generate to create UUIDs\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('Click')===-1?t:''; });

  $('btn-gen').addEventListener('click', function () {
    var count = parseInt($('t-count').value, 10);
    var upper = $('t-case').value === 'upper';
    var braces = $('t-braces').value === 'braces';
    var lines = [];
    for (var i = 0; i < count; i++) {
      var u = uuidV4();
      if (upper) u = u.toUpperCase();
      if (braces) u = '{' + u + '}';
      lines.push(u);
    }
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = lines.join('\n');
    CK.toast(count + ' UUID' + (count > 1 ? 's' : '') + ' generated');
  });

  /* Auto-generate on load */
  $('btn-gen').click();

  CK.setUsageContent('<ol><li>Choose <strong>count</strong>, <strong>case</strong>, and <strong>format</strong>.</li><li>Click <strong>Generate</strong> for cryptographically secure UUID v4 values.</li></ol><p>Uses <code>crypto.getRandomValues()</code> for secure random generation. Supports bulk generation (up to 50), uppercase/lowercase, and GUID-style <code>{braces}</code> format.</p>');
})();
