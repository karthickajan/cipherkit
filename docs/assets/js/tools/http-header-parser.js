(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.globe + '</div><h2 id="t-heading">HTTP Header Parser</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Parse</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Raw HTTP Headers</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Content-Type: application/json\nAuthorization: Bearer abc123\nCache-Control: no-cache" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-parse" aria-label="Parse headers">' + IC.globe + ' <span>Parse</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Parsed Headers</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Parsed headers will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Parsed headers will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  CK.initAutoGrow($('t-input'));
  $('btn-parse').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!input) { $('t-err').textContent='Paste HTTP headers.'; $('t-err').style.display='block'; return; }
    var lines = input.split(/\r?\n/);
    var headers = [];
    var statusLine = '';
    lines.forEach(function (line) {
      if (!line.trim()) return;
      if (/^(HTTP\/|GET |POST |PUT |DELETE |PATCH |HEAD |OPTIONS )/i.test(line)) { statusLine = line; return; }
      var idx = line.indexOf(':');
      if (idx === -1) return;
      headers.push({ name: line.substring(0, idx).trim(), value: line.substring(idx + 1).trim() });
    });
    if (!headers.length && !statusLine) { $('t-err').textContent='No valid headers found.'; $('t-err').style.display='block'; return; }
    var out = '';
    if (statusLine) out += '📡 ' + statusLine + '\n\n';
    out += headers.map(function (h, i) { return (i + 1) + '. ' + h.name + ': ' + h.value; }).join('\n');
    out += '\n\n— Total: ' + headers.length + ' header' + (headers.length !== 1 ? 's' : '');
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = out;
    CK.toast(headers.length + ' headers parsed');
  });
  CK.wireCtrlEnter('btn-parse');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'http-header-parser-output.txt');
  CK.setUsageContent('<ol><li><strong>Paste</strong> raw HTTP headers (from curl, dev tools, etc.).</li><li>Click <strong>Parse</strong> to get a structured, numbered breakdown.</li></ol><p>Detects HTTP status lines and request lines automatically. Each header is parsed into name-value pairs.</p>');
})();