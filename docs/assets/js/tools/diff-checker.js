/**
 * CipherKit — Text Diff Checker
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    diff:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="M18 6H6"/><path d="M18 18H6"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* Simple line-based diff */
  function diff(a, b) {
    var linesA = a.split('\n');
    var linesB = b.split('\n');
    var max = Math.max(linesA.length, linesB.length);
    var result = [];
    var added = 0, removed = 0, unchanged = 0;
    for (var i = 0; i < max; i++) {
      var la = i < linesA.length ? linesA[i] : undefined;
      var lb = i < linesB.length ? linesB[i] : undefined;
      if (la === lb) { result.push({ type: ' ', line: la, num: i+1 }); unchanged++; }
      else {
        if (la !== undefined) { result.push({ type: '-', line: la, num: i+1 }); removed++; }
        if (lb !== undefined) { result.push({ type: '+', line: lb, num: i+1 }); added++; }
      }
    }
    return { lines: result, added: added, removed: removed, unchanged: unchanged };
  }

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.diff + '</div><h2 id="t-heading">Diff Checker</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Compare</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-left">Original Text</label></div><textarea id="t-left" placeholder="Paste original text\u2026" rows="8" class="mono"></textarea></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-right">Changed Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-right" placeholder="Paste changed text\u2026" rows="8" class="mono"></textarea></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-diff" aria-label="Compare">' + IC.diff + ' <span>Compare</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Diff Result</span></div><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button></div><div class="out-body mono ph" id="t-result" style="white-space:pre;overflow-x:auto" role="status" aria-live="polite">Diff will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  $('btn-clr').addEventListener('click', function () { $('t-left').value=''; $('t-right').value=''; $('t-result').className='out-body mono ph'; $('t-result').innerHTML='Diff will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { return $('t-result').textContent; });
  CK.initAutoGrow($('t-left')); CK.initAutoGrow($('t-right'));

  $('btn-diff').addEventListener('click', function () {
    var left = $('t-left').value;
    var right = $('t-right').value;
    if (!left && !right) { $('t-result').className='out-body mono ph'; $('t-result').innerHTML='Enter text in both fields.'; return; }
    var d = diff(left, right);
    var html = d.lines.map(function (l) {
      var prefix = l.type;
      var cls = l.type === '+' ? 'color:#3dd68c;background:rgba(61,214,140,.08)' : l.type === '-' ? 'color:#ff6b6b;background:rgba(255,107,107,.08)' : 'color:var(--muted)';
      return '<span style="' + cls + '">' + prefix + ' ' + esc(l.line) + '</span>';
    }).join('\n');
    html += '\n\n<span style="color:var(--amber)">— Added: ' + d.added + ' | Removed: ' + d.removed + ' | Unchanged: ' + d.unchanged + '</span>';
    $('t-result').className = 'out-body mono'; $('t-result').innerHTML = html;
    CK.toast('Diff computed');
  });

  CK.setUsageContent('<ol><li>Paste <strong>original text</strong> in the first field.</li><li>Paste <strong>changed text</strong> in the second field.</li><li>Click <strong>Compare</strong> to see line-by-line differences.</li></ol><p>Added lines shown in <span style="color:#3dd68c">green</span>, removed in <span style="color:#ff6b6b">red</span>. Shows a summary of added, removed, and unchanged line counts.</p>');
})();
