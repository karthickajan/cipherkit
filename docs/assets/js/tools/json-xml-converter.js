(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    swap:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/><polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function escXml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function objToXml(obj, tag, indent) {
    var pad = '  '.repeat(indent);
    if (obj === null || obj === undefined) return pad + '<' + tag + '/>\n';
    if (typeof obj !== 'object') return pad + '<' + tag + '>' + escXml(obj) + '</' + tag + '>\n';
    var attrs = '';
    var children = '';
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.charAt(0) === '@') {
        attrs += ' ' + k.substring(1) + '="' + escXml(obj[k]) + '"';
      } else if (k === '#text') {
        children += escXml(obj[k]);
      } else if (k === '#cdata') {
        children += '<![CDATA[' + obj[k] + ']]>';
      } else if (Array.isArray(obj[k])) {
        for (var j = 0; j < obj[k].length; j++) {
          children += objToXml(obj[k][j], k, indent + 1);
        }
      } else {
        children += objToXml(obj[k], k, indent + 1);
      }
    }
    if (!children) return pad + '<' + tag + attrs + '/>\n';
    if (children.indexOf('\n') === -1) return pad + '<' + tag + attrs + '>' + children + '</' + tag + '>\n';
    return pad + '<' + tag + attrs + '>\n' + children + pad + '</' + tag + '>\n';
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.swap + '</div><h2 id="t-heading">JSON → XML Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-root">Root Element</label><input type="text" id="t-root" value="root" class="mono" style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg-main);color:var(--text-primary);font-size:0.85rem;width:120px"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">JSON Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste JSON here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-conv" aria-label="Convert to XML">' + IC.swap + ' <span>Convert</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>XML Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">XML output will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'XML output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-conv').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var rootTag = $('t-root').value.trim() || 'root';
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter JSON to convert.'; $('t-err').style.display = 'block'; return; }
    try {
      var obj = JSON.parse(input);
      var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += objToXml(obj, rootTag, 0);
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = xml;
      CK.toast('JSON converted to XML');
    } catch (e) {
      $('t-err').textContent = 'Invalid JSON: ' + e.message; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-conv');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'json-xml-converter-output.json');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your JSON data.</li><li>Optionally set a <strong>root element</strong> name.</li><li>Click <strong>Convert</strong> to transform it to XML.</li></ol><p>Keys starting with <code>@</code> become XML attributes. <code>#text</code> becomes text content. Arrays become repeated elements. The converter handles nested objects recursively.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='{"person":{"name":"John","age":30,"city":"New York"}}';inp.dispatchEvent(new Event('input'));}})();
})();