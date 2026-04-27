(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var TOP = /^(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|OUTER\s+JOIN|CROSS\s+JOIN|FULL\s+JOIN|ON|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|UNION|UNION\s+ALL|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|INTO|CASE|WHEN|THEN|ELSE|END|WITH|AS)$/i;
  function formatSQL(sql, indent) {
    var pad = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent,10));
    var tokens = [];
    var i = 0;
    while (i < sql.length) {
      if (sql[i] === "'" || sql[i] === '"') {
        var q = sql[i]; var s = q; i++;
        while (i < sql.length && sql[i] !== q) { if (sql[i] === '\\') { s += sql[i++]; } s += sql[i++]; }
        if (i < sql.length) s += sql[i++];
        tokens.push(s);
      } else if (/\s/.test(sql[i])) { i++; /* skip whitespace */ }
      else if (/[(),;]/.test(sql[i])) { tokens.push(sql[i++]); }
      else { var w = ''; while (i < sql.length && !/[\s(),;'"]/. test(sql[i])) w += sql[i++]; tokens.push(w); }
    }
    var out = '';
    var depth = 0;
    for (var t = 0; t < tokens.length; t++) {
      var tk = tokens[t];
      var upper = tk.toUpperCase();
      if (t + 1 < tokens.length) {
        var combo = upper + ' ' + tokens[t+1].toUpperCase();
        if (/^(ORDER BY|GROUP BY|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|CROSS JOIN|FULL JOIN|INSERT INTO|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE|UNION ALL)$/.test(combo)) {
          tk = tokens[t] + ' ' + tokens[t+1]; upper = combo; t++;
        }
      }
      if (tk === '(') { depth++; out += ' ('; continue; }
      if (tk === ')') { depth = Math.max(0, depth-1); out += ')'; continue; }
      if (tk === ',') { out += ',\n' + pad.repeat(depth + 1); continue; }
      if (tk === ';') { out += ';\n\n'; depth = 0; continue; }
      if (TOP.test(upper)) {
        if (out && !/^\s*$/.test(out)) out += '\n' + pad.repeat(depth);
        out += upper;
      } else {
        out += (out && !out.endsWith('\n') && !out.endsWith('(') ? ' ' : '') + tk;
      }
    }
    return out.trim();
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.code + '</div><h2 id="t-heading">SQL Formatter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Format</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-indent">Indent</label><select id="t-indent"><option value="2" selected>2 Spaces</option><option value="4">4 Spaces</option><option value="tab">Tab</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">SQL Query</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your SQL query here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-fmt" aria-label="Format SQL">' + IC.code + ' <span>Format</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Formatted SQL</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Formatted SQL will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Formatted SQL will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  CK.initAutoGrow($('t-input'));
  $('btn-fmt').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var indent = $('t-indent').value;
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!input) { $('t-err').textContent='Enter a SQL query.'; $('t-err').style.display='block'; return; }
    var formatted = formatSQL(input, indent);
    $('t-result').className='out-body mono b'; $('t-result').textContent = formatted;
    CK.toast('SQL formatted');
  });
  CK.wireCtrlEnter('btn-fmt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'sql-formatter-output.sql');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your SQL query.</li><li>Choose <strong>indent</strong> style.</li><li>Click <strong>Format</strong>.</li></ol><p>Formats SELECT, INSERT, UPDATE, DELETE, CREATE, and JOIN statements. Keywords are uppercased, commas start new lines, and parentheses are indented.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='SELECT u.id,u.name,o.total FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 ORDER BY o.total DESC';inp.dispatchEvent(new Event('input'));}})();
})();