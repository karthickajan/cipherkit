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
  function xmlToObj(node) {
    var obj = {};
    if (node.attributes && node.attributes.length) {
      for (var a = 0; a < node.attributes.length; a++) {
        obj['@' + node.attributes[a].nodeName] = node.attributes[a].nodeValue;
      }
    }
    if (node.hasChildNodes()) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        if (child.nodeType === 1) { /* ELEMENT_NODE */
          var tag = child.nodeName;
          var val = xmlToObj(child);
          if (obj[tag] !== undefined) {
            if (!Array.isArray(obj[tag])) obj[tag] = [obj[tag]];
            obj[tag].push(val);
          } else {
            obj[tag] = val;
          }
        } else if (child.nodeType === 3) { /* TEXT_NODE */
          var txt = child.nodeValue.trim();
          if (txt) {
            if (Object.keys(obj).length === 0) return txt;
            obj['#text'] = txt;
          }
        } else if (child.nodeType === 4) { /* CDATA_SECTION */
          obj['#cdata'] = child.nodeValue;
        }
      }
    }
    return obj;
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.swap + '</div><h2 id="t-heading">XML → JSON Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">XML Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste XML here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-conv" aria-label="Convert to JSON">' + IC.swap + ' <span>Convert</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>JSON Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">JSON output will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'JSON output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-conv').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter XML to convert.'; $('t-err').style.display = 'block'; return; }
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(input, 'application/xml');
      var errNode = doc.querySelector('parsererror');
      if (errNode) { $('t-err').textContent = 'XML parse error: ' + errNode.textContent.substring(0, 200); $('t-err').style.display = 'block'; return; }
      var result = {};
      result[doc.documentElement.nodeName] = xmlToObj(doc.documentElement);
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = JSON.stringify(result, null, 2);
      CK.toast('XML converted to JSON');
    } catch (e) {
      $('t-err').textContent = 'Conversion failed: ' + e.message; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-conv');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'xml-json-converter-output.json');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your XML data.</li><li>Click <strong>Convert</strong> to transform it to JSON.</li></ol><p>Attributes become <code>@attribute</code> keys. Text content becomes the value or <code>#text</code> key. Repeated elements become arrays. CDATA sections are preserved as <code>#cdata</code>.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='<person><name>John</name><age>30</age><city>New York</city></person>';inp.dispatchEvent(new Event('input'));}})();
})();