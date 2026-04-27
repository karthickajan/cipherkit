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
  function parseCSV(text, delimiter) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuote = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      var next = text[i + 1];
      if (inQuote) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') { inQuote = false; }
        else { field += c; }
      } else {
        if (c === '"') { inQuote = true; }
        else if (c === delimiter) { row.push(field); field = ''; }
        else if (c === '\r' && next === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; }
        else if (c === '\n' || c === '\r') { row.push(field); field = ''; rows.push(row); row = []; }
        else { field += c; }
      }
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  function jsonToCSV(arr, delimiter) {
    if (!Array.isArray(arr) || !arr.length) throw new Error('JSON must be an array of objects.');
    var keys = Object.keys(arr[0]);
    var esc = function (v) {
      var s = v === null || v === undefined ? '' : String(v);
      if (s.indexOf(delimiter) !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    var lines = [keys.map(esc).join(delimiter)];
    for (var i = 0; i < arr.length; i++) {
      var vals = [];
      for (var k = 0; k < keys.length; k++) vals.push(esc(arr[i][keys[k]]));
      lines.push(vals.join(delimiter));
    }
    return lines.join('\n');
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.swap + '</div><h2 id="t-heading">CSV ↔ JSON Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-mode">Direction</label><select id="t-mode"><option value="csv2json">CSV → JSON</option><option value="json2csv">JSON → CSV</option></select></div><div class="sel-group"><label for="t-delim">Delimiter</label><select id="t-delim"><option value="," selected>Comma (,)</option><option value=";">Semicolon (;)</option><option value="\t">Tab</option><option value="|">Pipe (|)</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input" id="lbl-input">CSV Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste CSV data here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-conv" aria-label="Convert">' + IC.swap + ' <span>Convert</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span id="lbl-out">JSON Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Output will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('t-mode').addEventListener('change', function () {
    var csv2json = this.value === 'csv2json';
    $('lbl-input').textContent = csv2json ? 'CSV Input' : 'JSON Input';
    $('lbl-out').textContent = csv2json ? 'JSON Output' : 'CSV Output';
    $('t-input').placeholder = csv2json ? 'Paste CSV data here\u2026' : 'Paste JSON array here\u2026';
  });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-conv').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var delim = $('t-delim').value;
    if (delim === '\\t') delim = '\t';
    var mode = $('t-mode').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter data to convert.'; $('t-err').style.display = 'block'; return; }
    try {
      if (mode === 'csv2json') {
        var rows = parseCSV(input, delim);
        if (rows.length < 2) throw new Error('CSV must have a header row and at least one data row.');
        var headers = rows[0];
        var json = [];
        for (var i = 1; i < rows.length; i++) {
          if (rows[i].length === 1 && rows[i][0] === '') continue; /* skip empty trailing lines */
          var obj = {};
          for (var j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j] !== undefined ? rows[i][j] : '';
          json.push(obj);
        }
        $('t-result').className = 'out-body mono b'; $('t-result').textContent = JSON.stringify(json, null, 2);
        CK.toast('CSV converted to JSON (' + json.length + ' rows)');
      } else {
        var arr = JSON.parse(input);
        var csv = jsonToCSV(arr, delim);
        $('t-result').className = 'out-body mono b'; $('t-result').textContent = csv;
        CK.toast('JSON converted to CSV');
      }
    } catch (e) {
      $('t-err').textContent = 'Conversion failed: ' + e.message; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-conv');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'csv-json-converter-output.json');
  CK.setUsageContent('<ol><li>Choose <strong>direction</strong> (CSV → JSON or JSON → CSV).</li><li>Select the <strong>delimiter</strong> used in your CSV (comma, semicolon, tab, pipe).</li><li><strong>Paste data</strong> and click <strong>Convert</strong>.</li></ol><p>CSV → JSON uses the first row as headers and produces an array of objects. JSON → CSV requires an array of flat objects. Handles quoted fields with commas and newlines correctly.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='name,age,city\nAlice,30,New York\nBob,25,London\nCarol,35,Tokyo';inp.dispatchEvent(new Event('input'));}})();
})();