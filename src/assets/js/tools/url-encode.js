/**
 * CipherKit — URL Encoder
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.link + '</div><h2 id="t-heading">URL Encoder</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Encode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-mode">Mode</label><select id="t-mode"><option value="component">encodeURIComponent</option><option value="uri">encodeURI (full URL)</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter URL or text to encode\u2026" rows="5"></textarea><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-enc" aria-label="URL Encode">' + IC.link + ' <span>Encode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Encoded Output</span></div><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Encoded output will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Encoded output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));

  $('btn-enc').addEventListener('click', function () {
    var input = $('t-input').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter text to encode.'; $('t-err').style.display = 'block'; return; }
    var out = $('t-mode').value === 'uri' ? encodeURI(input) : encodeURIComponent(input);
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = out;
    CK.toast('URL encoded');
  });

  CK.setUsageContent('<ol><li><strong>Enter a URL or text</strong> into the input field.</li><li>Select <strong>encodeURIComponent</strong> (for query params) or <strong>encodeURI</strong> (for full URLs).</li><li>Click <strong>Encode</strong> to percent-encode.</li></ol><p><code>encodeURIComponent</code> encodes all special characters except <code>-_.!~*\'()</code>. <code>encodeURI</code> preserves URL structure characters like <code>:</code>, <code>/</code>, <code>?</code>, <code>#</code>.</p>');
})();
