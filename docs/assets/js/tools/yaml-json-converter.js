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
  function parseYAML(text) {
    var lines = text.split('\n');
    var stack = [{ indent: -1, obj: {} }];
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      if (/^\s*(#.*)?$/.test(raw)) continue;
      if (/^---/.test(raw) || /^\.\.\./.test(raw)) continue;
      var indent = raw.search(/\S/);
      var trimmed = raw.trim();
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      var parent = stack[stack.length - 1];
      if (trimmed.charAt(0) === '-') {
        var listVal = trimmed.substring(1).trim();
        if (!Array.isArray(parent.obj)) {
          var gp = stack.length > 1 ? stack[stack.length - 1] : parent;
          if (!Array.isArray(gp.obj)) {
            var keys = Object.keys(gp.obj);
            var lastKey = keys[keys.length - 1];
            if (lastKey !== undefined && gp.obj[lastKey] === null) {
              gp.obj[lastKey] = [];
              parent = { indent: indent, obj: gp.obj[lastKey] };
              stack.push(parent);
            } else {
              parent = gp;
            }
          }
        }
        if (Array.isArray(parent.obj)) {
          var parsed = parseScalar(listVal);
          if (listVal.indexOf(':') !== -1 && typeof parsed === 'string') {
            var cp = listVal.indexOf(':');
            var lk = listVal.substring(0, cp).trim();
            var lv = listVal.substring(cp + 1).trim();
            var item = {};
            item[lk] = parseScalar(lv);
            parent.obj.push(item);
            stack.push({ indent: indent + 2, obj: item });
          } else {
            parent.obj.push(parsed);
          }
        }
        continue;
      }
      var colonPos = trimmed.indexOf(':');
      if (colonPos === -1) continue;
      var key = trimmed.substring(0, colonPos).trim();
      var val = trimmed.substring(colonPos + 1).trim();
      if (typeof parent.obj !== 'object' || Array.isArray(parent.obj)) continue;
      if (val === '' || val === '|' || val === '>') {
        if (val === '|' || val === '>') {
          var blockLines = [];
          var bi = i + 1;
          var blockIndent = -1;
          while (bi < lines.length) {
            var bl = lines[bi];
            if (/^\s*$/.test(bl)) { blockLines.push(''); bi++; continue; }
            var bInd = bl.search(/\S/);
            if (blockIndent === -1) blockIndent = bInd;
            if (bInd < blockIndent) break;
            blockLines.push(bl.substring(blockIndent));
            bi++;
          }
          var joiner = val === '|' ? '\n' : ' ';
          parent.obj[key] = blockLines.join(joiner).replace(/\s+$/, '');
          i = bi - 1;
        } else {
          parent.obj[key] = null;
          stack.push({ indent: indent, obj: parent.obj });
          var child = {};
          parent.obj[key] = child;
          stack.push({ indent: indent, obj: child });
        }
      } else {
        parent.obj[key] = parseScalar(val);
      }
    }
    return stack[0].obj;
  }
  function parseScalar(s) {
    if (!s) return null;
    if ((s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') || (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'")) return s.substring(1, s.length - 1);
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null' || s === '~') return null;
    if (s.charAt(0) === '[' && s.charAt(s.length - 1) === ']') {
      try { return JSON.parse(s); } catch (e) {
        return s.substring(1, s.length - 1).split(',').map(function (x) { return parseScalar(x.trim()); });
      }
    }
    if (s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') {
      try { return JSON.parse(s); } catch (e) { return s; }
    }
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    return s;
  }
  function jsonToYAML(obj, indent) {
    if (indent === undefined) indent = 0;
    var pad = '  '.repeat(indent);
    var out = '';
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        if (obj[i] !== null && typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
          var keys = Object.keys(obj[i]);
          out += pad + '- ' + keys[0] + ': ' + scalarToYAML(obj[i][keys[0]]) + '\n';
          for (var k = 1; k < keys.length; k++) {
            if (typeof obj[i][keys[k]] === 'object' && obj[i][keys[k]] !== null) {
              out += pad + '  ' + keys[k] + ':\n' + jsonToYAML(obj[i][keys[k]], indent + 2);
            } else {
              out += pad + '  ' + keys[k] + ': ' + scalarToYAML(obj[i][keys[k]]) + '\n';
            }
          }
        } else {
          out += pad + '- ' + scalarToYAML(obj[i]) + '\n';
        }
      }
    } else if (obj !== null && typeof obj === 'object') {
      var okeys = Object.keys(obj);
      for (var j = 0; j < okeys.length; j++) {
        var v = obj[okeys[j]];
        if (v !== null && typeof v === 'object') {
          out += pad + okeys[j] + ':\n' + jsonToYAML(v, indent + 1);
        } else {
          out += pad + okeys[j] + ': ' + scalarToYAML(v) + '\n';
        }
      }
    }
    return out;
  }
  function scalarToYAML(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    var s = String(v);
    if (/[:{}\[\],&*?|>!%#@`"']/.test(s) || s === '' || /^\s|\s$/.test(s)) return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    return s;
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.swap + '</div><h2 id="t-heading">YAML ↔ JSON Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-mode">Direction</label><select id="t-mode"><option value="yaml2json">YAML → JSON</option><option value="json2yaml">JSON → YAML</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input" id="lbl-input">YAML Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste YAML here\u2026" rows="10" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-conv" aria-label="Convert">' + IC.swap + ' <span>Convert</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span id="lbl-out">JSON Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Output will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  var _pathSlug = (window.location.pathname.match(/\/tools\/([^/]+)/) || [])[1] || '';
  if (_pathSlug === 'json-to-yaml') {
    $('t-mode').value = 'json2yaml';
    $('lbl-input').textContent = 'JSON Input';
    $('lbl-out').textContent = 'YAML Output';
    $('t-input').placeholder = 'Paste JSON here\u2026';
  }
  var BASE = '';
  $('t-mode').addEventListener('change', function () {
    var y2j = this.value === 'yaml2json';
    $('lbl-input').textContent = y2j ? 'YAML Input' : 'JSON Input';
    $('lbl-out').textContent = y2j ? 'JSON Output' : 'YAML Output';
    $('t-input').placeholder = y2j ? 'Paste YAML here\u2026' : 'Paste JSON here\u2026';
    var newSlug = y2j ? 'yaml-json-converter' : 'json-to-yaml';
    var newPath = BASE + '/tools/' + newSlug + '/';
    if (window.location.pathname !== newPath) history.pushState(null, '', newPath);
  });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-conv').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var mode = $('t-mode').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter data to convert.'; $('t-err').style.display = 'block'; return; }
    try {
      if (mode === 'yaml2json') {
        var obj = parseYAML(input);
        $('t-result').className = 'out-body mono b'; $('t-result').textContent = JSON.stringify(obj, null, 2);
        CK.toast('YAML converted to JSON');
      } else {
        var parsed = JSON.parse(input);
        var yaml = jsonToYAML(parsed);
        $('t-result').className = 'out-body mono b'; $('t-result').textContent = yaml;
        CK.toast('JSON converted to YAML');
      }
    } catch (e) {
      $('t-err').textContent = 'Conversion failed: ' + e.message; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-conv');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'yaml-json-converter-output.json');
  CK.setUsageContent('<ol><li>Choose <strong>direction</strong> (YAML → JSON or JSON → YAML).</li><li><strong>Paste data</strong> and click <strong>Convert</strong>.</li></ol><p>Supports common YAML features: key-value pairs, nested objects, lists, inline arrays/objects, block scalars (<code>|</code> and <code>&gt;</code>), comments, and quoted strings. For complex YAML with anchors and aliases, consider a full YAML library.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='name: John\nage: 30\ncity: New York\nhobbies:\n  - reading\n  - coding';inp.dispatchEvent(new Event('input'));}})();
})();