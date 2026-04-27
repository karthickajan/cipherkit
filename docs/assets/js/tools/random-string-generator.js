(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    hash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var PRESETS = {
    alpha:  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    alnum:  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    hex:    '0123456789abcdef',
    base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    custom: ''
  };
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.hash + '</div><h2 id="t-heading">Random String Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Generate</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-len">Length</label><input type="number" id="t-len" value="32" min="1" max="1024" style="width:100%"></div><div class="sel-group"><label for="t-count">Count</label><select id="t-count"><option value="1">1</option><option value="5">5</option><option value="10">10</option></select></div><div class="sel-group"><label for="t-preset">Charset</label><select id="t-preset"><option value="alnum" selected>Alphanumeric</option><option value="alpha">Alpha only</option><option value="hex">Hex</option><option value="base64">Base64</option><option value="custom">Custom</option></select></div></div>'
    +     '<div class="field" id="custom-row" style="display:none"><div class="field-hdr"><label for="t-custom">Custom Characters</label></div><input type="text" id="t-custom" placeholder="Enter your custom character set\u2026"></div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-gen" aria-label="Generate strings">' + IC.refresh + ' <span>Generate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Click Generate\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('t-preset').addEventListener('change', function () { $('custom-row').style.display = this.value === 'custom' ? '' : 'none'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('Click')===-1?t:''; });
  $('btn-gen').addEventListener('click', function () {
    var len = parseInt($('t-len').value, 10) || 32;
    var count = parseInt($('t-count').value, 10);
    var preset = $('t-preset').value;
    var charset = preset === 'custom' ? $('t-custom').value : PRESETS[preset];
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!charset) { $('t-err').textContent = 'Character set is empty.'; $('t-err').style.display = 'block'; return; }
    var lines = [];
    for (var n = 0; n < count; n++) {
      var arr = crypto.getRandomValues(new Uint32Array(len));
      var s = '';
      for (var i = 0; i < len; i++) s += charset[arr[i] % charset.length];
      lines.push(s);
    }
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = lines.join('\n');
    CK.toast(count + ' string' + (count > 1 ? 's' : '') + ' generated');
  });
  $('btn-gen').click();
  CK.wireCtrlEnter('btn-gen');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'random-string-generator-output.txt');
  CK.setUsageContent('<ol><li>Set <strong>length</strong>, <strong>count</strong>, and <strong>charset</strong> (alphanumeric, hex, base64, or custom).</li><li>Click <strong>Generate</strong>.</li></ol><p>Uses <code>crypto.getRandomValues()</code> for cryptographically secure random generation. Great for API keys, tokens, and test data.</p>');
})();