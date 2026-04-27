(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var sty = document.createElement('style');
  sty.textContent =
    '.ck-radio-group{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}'
    + '.ck-radio-group label{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--muted);cursor:pointer;line-height:1.5}'
    + '.ck-radio-group input[type=radio]{margin-top:3px;accent-color:var(--green)}'
    + '.ck-mode-hint{font-size:11px;color:var(--muted);background:var(--sf2);border:1px solid var(--border);border-radius:4px;padding:6px 10px;margin-bottom:12px;line-height:1.5}';
  document.head.appendChild(sty);
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.link + '</div><h2 id="t-heading">URL Encoder</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Encode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ck-radio-group">'
    +       '<label><input type="radio" name="encode-mode" value="component" id="mode-comp" checked> <span><strong>Component mode</strong> \u2014 encodeURIComponent() \u2014 for query string values</span></label>'
    +       '<label><input type="radio" name="encode-mode" value="full" id="mode-full"> <span><strong>Full URL mode</strong> \u2014 encodeURI() \u2014 keeps http:// and URL structure intact</span></label>'
    +     '</div>'
    +     '<div class="ck-mode-hint" id="mode-hint">Encodes everything including : / ? &amp; = \u2014 use for values only</div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter URL or text to encode\u2026" rows="5"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-enc" aria-label="URL Encode">' + IC.link + ' <span>Encode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Encoded Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">\u21C4 <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Encoded output will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function getMode() { return $('mode-full').checked ? 'full' : 'component'; }
  function updateHint() {
    $('mode-hint').textContent = getMode() === 'component'
      ? 'Encodes everything including : / ? & = \u2014 use for values only'
      : 'Preserves URL structure, encodes spaces and illegal chars';
  }
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Encoded output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  function doEncode() {
    var input = $('t-input').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter text to encode.'; $('t-err').style.display = 'block'; return; }
    try {
      var out = getMode() === 'full' ? encodeURI(input) : encodeURIComponent(input);
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = out;
      CK.toast('URL encoded');
    } catch (e) { $('t-result').className = 'out-body err'; $('t-result').textContent = 'Error: ' + e.message; window.CKFeedback && window.CKFeedback.reportError(e.message, {"Input": (input || '').substring(0, 2000), "Mode": getMode()}); }
  }
  $('btn-enc').addEventListener('click', doEncode);
  $('mode-comp').addEventListener('change', function () { updateHint(); if ($('t-input').value) doEncode(); });
  $('mode-full').addEventListener('change', function () { updateHint(); if ($('t-input').value) doEncode(); });
  $('btn-swap').addEventListener('click', function () {
    var t = $('t-result').textContent;
    if (!t || t.indexOf('appear') !== -1) return;
    $('t-input').value = t; $('t-input').dispatchEvent(new Event('input'));
    $('t-input').scrollIntoView({ behavior: 'smooth', block: 'start' });
    CK.toast('Output moved to input');
  });
  CK.wireCtrlEnter('btn-enc');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'url-encode-output.txt');
  CK.setUsageContent('<ol><li>Paste a URL or query string into the input.</li><li>The percent-encoded output appears instantly.</li><li>Use <strong>Component mode</strong> (encodeURIComponent) for encoding parameter values, or <strong>Full URL mode</strong> (encodeURI) to preserve URL structure and only encode unsafe characters.</li></ol><h3>What is URL encoding?</h3><p>URL encoding (percent encoding) replaces unsafe ASCII characters with a % followed by two hexadecimal digits. For example, a space becomes %20, and &amp; becomes %26.</p><h3>Common uses</h3><ul><li><strong>Query parameters</strong> \u2014 encode values before appending to URLs</li><li><strong>Form submission</strong> \u2014 browsers encode form data before sending</li><li><strong>API requests</strong> \u2014 encode special characters in API query strings</li></ul>');
  (function () { var inp = $('t-input'); if (inp && !inp.value) { inp.value = 'https://example.com/search?q=hello world&lang=en'; doEncode(); } })();
  (function () { var dt; $('t-input').addEventListener('input', function () { clearTimeout(dt); dt = setTimeout(doEncode, 150); }); })();
})();