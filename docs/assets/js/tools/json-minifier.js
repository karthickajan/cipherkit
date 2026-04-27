(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    zip:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.zip + '</div><h2 id="t-heading">JSON Minifier</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Minify</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">JSON Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your JSON here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-min" aria-label="Minify JSON">' + IC.zip + ' <span>Minify</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Minified JSON</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Minified JSON will appear here\u2026</div></div>'
    +     '<div class="out-box" id="t-stats-box" style="display:none"><div class="out-head"><div class="out-label">' + IC.code + ' <span>Stats</span></div></div><div class="out-body" id="t-stats"></div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Minified JSON will appear here\u2026'; $('t-stats-box').style.display = 'none'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-min').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none'; $('t-stats-box').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter JSON to minify.'; $('t-err').style.display = 'block'; return; }
    try {
      var obj = JSON.parse(input);
      var minified = JSON.stringify(obj);
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = minified;
      var originalLen = input.length;
      var minLen = minified.length;
      var saved = originalLen - minLen;
      var pct = originalLen > 0 ? ((saved / originalLen) * 100).toFixed(1) : 0;
      $('t-stats').textContent = 'Original: ' + originalLen + ' chars  •  Minified: ' + minLen + ' chars  •  Saved: ' + saved + ' chars (' + pct + '%)';
      $('t-stats-box').style.display = '';
      CK.toast('JSON minified');
    } catch (e) {
      $('t-err').textContent = 'Invalid JSON: ' + e.message; $('t-err').style.display = 'block';
    }
  });
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'json-minifier-output.json');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your formatted or prettified JSON.</li><li>Click <strong>Minify</strong> to remove all whitespace.</li></ol><p>The minifier strips all unnecessary whitespace and newlines from valid JSON. Shows size reduction stats. Perfect for reducing payload size in APIs and config files.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}';inp.dispatchEvent(new Event('input'));var b=$('btn-min');if(b)b.click();}})();
})();