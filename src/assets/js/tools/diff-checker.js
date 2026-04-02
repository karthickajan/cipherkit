/**
 * CipherKit — Text Diff Checker
 * Wide side-by-side layout with per-line take-left / take-right,
 * live diff on input, and synchronized scrolling.
 */
(function () {
  'use strict';

  var root = document.getElementById('tool-root');
  if (!root) return;

  /* ── SVG ICONS ──────────────────────────────────────────────────────────── */
  var IC = {
    diff:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="M18 6H6"/><path d="M18 18H6"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── SCOPED STYLES ──────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '.dc-wrap{max-width:1400px;width:95%;margin:0 auto}'
    + '.dc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    + '.dc-pane textarea{width:100%;min-height:200px;resize:vertical}'
    + '.dc-stats{display:flex;gap:16px;flex-wrap:wrap;padding:10px 0;font-size:13px;color:var(--muted)}'
    + '.dc-stats b{font-weight:700}'
    + '.dc-stat-add{color:#3dd68c}.dc-stat-rem{color:#ff6b6b}.dc-stat-unc{color:var(--muted)}'
    + '.dc-result{max-height:600px;overflow:auto;border:1px solid var(--border);border-radius:var(--r);background:var(--bg)}'
    + '.dc-row{display:grid;grid-template-columns:36px 36px 1fr 40px 1fr 36px;align-items:stretch;border-bottom:1px solid rgba(255,255,255,.04);min-height:28px}'
    + '.dc-ln{display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);opacity:.6;user-select:none;padding:0 2px}'
    + '.dc-cell{font-family:var(--mono);font-size:13px;white-space:pre-wrap;word-break:break-all;padding:4px 8px;line-height:1.6;display:flex;align-items:center}'
    + '.dc-sep{display:flex;align-items:center;justify-content:center;gap:2px;padding:0 2px}'
    + '.dc-sep button{background:none;border:none;cursor:pointer;padding:2px;border-radius:3px;color:var(--muted);font-size:14px;line-height:1;transition:color .15s,background .15s}'
    + '.dc-sep button:hover{color:var(--text);background:rgba(255,255,255,.08)}'
    + '.dc-added{background:rgba(61,214,140,.12)}'
    + '.dc-removed{background:rgba(255,107,107,.12)}'
    + '.dc-empty{background:rgba(255,255,255,.02)}'
    + '.dc-row-head{background:var(--sf2);font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border)}'
    + '.dc-row-head .dc-cell{padding:8px}'
    + '@media(max-width:768px){.dc-grid{grid-template-columns:1fr}.dc-row{grid-template-columns:28px 28px 1fr 32px 1fr 28px}.dc-cell{font-size:12px}}';
  document.head.appendChild(style);

  /* ── LCS-BASED DIFF ─────────────────────────────────────────────────────── */
  function computeLCS(a, b) {
    var m = a.length, n = b.length;
    var dp = new Array(m + 1);
    var i, j;
    for (i = 0; i <= m; i++) { dp[i] = new Array(n + 1); dp[i][0] = 0; }
    for (j = 0; j <= n; j++) dp[0][j] = 0;
    for (i = 1; i <= m; i++)
      for (j = 1; j <= n; j++)
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    /* backtrack */
    var rows = [];
    i = m; j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        rows.push({ type: 'eq', li: i, ri: j, left: a[i - 1], right: b[j - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        rows.push({ type: 'add', li: null, ri: j, left: '', right: b[j - 1] });
        j--;
      } else {
        rows.push({ type: 'rem', li: i, ri: null, left: a[i - 1], right: '' });
        i--;
      }
    }
    rows.reverse();
    return rows;
  }

  function diffLines(leftText, rightText) {
    var a = leftText.split('\n');
    var b = rightText.split('\n');
    var rows = computeLCS(a, b);
    var added = 0, removed = 0, unchanged = 0;
    rows.forEach(function (r) {
      if (r.type === 'add') added++;
      else if (r.type === 'rem') removed++;
      else unchanged++;
    });
    return { rows: rows, added: added, removed: removed, unchanged: unchanged };
  }

  /* ── RENDER ─────────────────────────────────────────────────────────────── */
  root.innerHTML =
    '<div class="dc-wrap">'
    +   '<div class="tool-card-ui">'
    +     '<div class="tc-head">'
    +       '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.diff + '</div><h2 id="t-heading">Diff Checker</h2></div>'
    +       '<span class="tc-badge tc-badge-amber">Compare</span>'
    +     '</div>'
    +     '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +       '<div class="dc-grid">'
    +         '<div class="dc-pane field"><div class="field-hdr"><label for="t-left">Original Text</label></div><textarea id="t-left" placeholder="Paste original text\u2026" rows="10" class="mono"></textarea></div>'
    +         '<div class="dc-pane field"><div class="field-hdr"><label for="t-right">Changed Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-right" placeholder="Paste changed text\u2026" rows="10" class="mono"></textarea></div>'
    +       '</div>'
    +       '<div class="dc-stats" id="dc-stats"></div>'
    +       '<div class="out-box">'
    +         '<div class="out-head">'
    +           '<div class="out-label">' + IC.play + ' <span>Diff Result</span></div>'
    +           '<div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div>'
    +         '</div>'
    +         '<div class="dc-result" id="dc-result">'
    +           '<div class="dc-row dc-row-head"><div class="dc-ln"></div><div class="dc-ln"></div><div class="dc-cell">Original</div><div class="dc-sep"></div><div class="dc-cell">Changed</div><div class="dc-ln"></div></div>'
    +           '<div id="dc-rows" style="color:var(--muted);padding:24px;text-align:center;font-size:13px">Start typing to see live diff\u2026</div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  /* ── REFS ───────────────────────────────────────────────────────────────── */
  var elLeft   = $('t-left');
  var elRight  = $('t-right');
  var elRows   = $('dc-rows');
  var elStats  = $('dc-stats');
  var elResult = $('dc-result');

  /* ── DIFF RENDERER ──────────────────────────────────────────────────────── */
  function renderDiff() {
    var leftVal  = elLeft.value;
    var rightVal = elRight.value;

    if (!leftVal && !rightVal) {
      elRows.innerHTML = '<div style="color:var(--muted);padding:24px;text-align:center;font-size:13px">Start typing to see live diff\u2026</div>';
      elStats.innerHTML = '';
      return;
    }

    var d = diffLines(leftVal, rightVal);
    var html = '';

    d.rows.forEach(function (r) {
      var lnL = r.li !== null ? r.li : '';
      var lnR = r.ri !== null ? r.ri : '';
      var clsL = '', clsR = '';
      if (r.type === 'rem')      { clsL = ' dc-removed'; clsR = ' dc-empty'; }
      else if (r.type === 'add') { clsL = ' dc-empty';   clsR = ' dc-added'; }

      html += '<div class="dc-row" data-type="' + r.type + '">'
        + '<div class="dc-ln">' + lnL + '</div>'
        + '<div class="dc-ln">' + lnR + '</div>'
        + '<div class="dc-cell' + clsL + '">' + esc(r.left) + '</div>'
        + '<div class="dc-sep">';

      if (r.type !== 'eq') {
        html += '<button class="take-left" title="Use original">\u2190</button>'
              + '<button class="take-right" title="Use changed">\u2192</button>';
      }

      html += '</div>'
        + '<div class="dc-cell' + clsR + '">' + esc(r.right) + '</div>'
        + '<div class="dc-ln"></div>'
        + '</div>';
    });

    elRows.innerHTML = html;

    elStats.innerHTML =
      '<span class="dc-stat-add"><b>+' + d.added + '</b> added</span>'
      + '<span class="dc-stat-rem"><b>-' + d.removed + '</b> removed</span>'
      + '<span class="dc-stat-unc"><b>' + d.unchanged + '</b> unchanged</span>';
  }

  /* ── LIVE DIFF (debounced) ──────────────────────────────────────────────── */
  var debounceTimer;
  function triggerDiff() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderDiff, 150);
  }
  elLeft.addEventListener('input', triggerDiff);
  elRight.addEventListener('input', triggerDiff);

  /* ── SYNC SCROLL (input textareas) ──────────────────────────────────────── */
  var syncing = false;
  function syncScroll(source, target) {
    if (syncing) return;
    syncing = true;
    target.scrollTop = source.scrollTop;
    syncing = false;
  }
  elLeft.addEventListener('scroll', function () { syncScroll(elLeft, elRight); });
  elRight.addEventListener('scroll', function () { syncScroll(elRight, elLeft); });

  /* ── PER-LINE TAKE LEFT / RIGHT ─────────────────────────────────────────── */
  elRows.addEventListener('click', function (e) {
    var btn = e.target.closest('.take-left, .take-right');
    if (!btn) return;

    var row = btn.closest('.dc-row');
    if (!row) return;

    var cells = row.querySelectorAll('.dc-cell');
    var leftCell  = cells[0];
    var rightCell = cells[1];
    var type = row.getAttribute('data-type');

    /* figure out which line indices we're operating on */
    var lnDivs = row.querySelectorAll('.dc-ln');
    var lnL = lnDivs[0].textContent.trim();
    var lnR = lnDivs[1].textContent.trim();

    var leftLines  = elLeft.value.split('\n');
    var rightLines = elRight.value.split('\n');

    if (btn.classList.contains('take-left')) {
      /* push original → changed: replace or insert in right */
      var srcText = leftCell.textContent;
      if (type === 'rem') {
        /* line only in left — insert into right at appropriate position */
        var insertAt = lnR ? parseInt(lnR, 10) - 1 : rightLines.length;
        rightLines.splice(insertAt, 0, srcText);
      } else if (type === 'add') {
        /* line only in right — replace it with left (empty) = remove it */
        var rIdx = parseInt(lnR, 10) - 1;
        rightLines.splice(rIdx, 1);
      } else {
        /* modified — overwrite right with left */
        if (lnR) rightLines[parseInt(lnR, 10) - 1] = srcText;
      }
      elRight.value = rightLines.join('\n');
    } else {
      /* push changed → original: replace or insert in left */
      var srcText2 = rightCell.textContent;
      if (type === 'add') {
        var insertAt2 = lnL ? parseInt(lnL, 10) - 1 : leftLines.length;
        leftLines.splice(insertAt2, 0, srcText2);
      } else if (type === 'rem') {
        var lIdx = parseInt(lnL, 10) - 1;
        leftLines.splice(lIdx, 1);
      } else {
        if (lnL) leftLines[parseInt(lnL, 10) - 1] = srcText2;
      }
      elLeft.value = leftLines.join('\n');
    }

    /* re-run diff to reflect the change */
    renderDiff();
    CK.toast('Line applied');
  });

  /* ── CLEAR ──────────────────────────────────────────────────────────────── */
  $('btn-clr').addEventListener('click', function () {
    elLeft.value = '';
    elRight.value = '';
    renderDiff();
  });

  /* ── COPY / DOWNLOAD ────────────────────────────────────────────────────── */
  function getPlainDiff() {
    var left  = elLeft.value;
    var right = elRight.value;
    if (!left && !right) return '';
    var d = diffLines(left, right);
    return d.rows.map(function (r) {
      if (r.type === 'eq')  return '  ' + r.left;
      if (r.type === 'rem') return '- ' + r.left;
      if (r.type === 'add') return '+ ' + r.right;
      return '';
    }).join('\n');
  }

  CK.wireCopy($('btn-cp'), getPlainDiff);
  CK.wireDownload($('btn-dl'), getPlainDiff, 'diff-checker-output.diff');

  /* ── AUTO-GROW TEXTAREAS ────────────────────────────────────────────────── */
  CK.initAutoGrow(elLeft);
  CK.initAutoGrow(elRight);

  /* ── SAMPLE DATA ────────────────────────────────────────────────────────── */
  elLeft.value  = 'function greet(name) {\n  console.log("Hello, " + name);\n  return true;\n}\n\ngreet("World");';
  elRight.value = 'function greet(name, greeting) {\n  const msg = `${greeting}, ${name}!`;\n  console.log(msg);\n  return msg;\n}\n\ngreet("World", "Hi");';
  renderDiff();

  /* ── USAGE ──────────────────────────────────────────────────────────────── */
  CK.setUsageContent(
    '<ol>'
    + '<li>Paste <strong>original text</strong> on the left and <strong>changed text</strong> on the right.</li>'
    + '<li>Diff updates <strong>live</strong> as you type — no button click needed.</li>'
    + '<li>Each changed line shows <strong>\u2190</strong> / <strong>\u2192</strong> buttons to accept that specific change.</li>'
    + '<li>Use <strong>Copy</strong> or <strong>Download</strong> to export the unified diff.</li>'
    + '</ol>'
    + '<p>Added lines shown in <span style="color:#3dd68c">green</span>, removed in <span style="color:#ff6b6b">red</span>.</p>'
  );
})();
