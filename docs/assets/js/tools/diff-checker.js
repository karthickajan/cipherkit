/**
 * CipherKit — Diff & Merge  (VS Code–style merge editor)
 *
 * Architecture:
 *   state = { left, right, merged, diff[] }
 *   • left/right  — source inputs (editable textareas)
 *   • merged      — editable result textarea (Ctrl-Z safe)
 *   • diff[]      — computed from left vs right via LCS
 *
 * The merged textarea is NEVER overwritten on re-render.
 * It is only set when the user explicitly clicks a merge action.
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
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── SCOPED STYLES ──────────────────────────────────────────────────────── */
  var sty = document.createElement('style');
  sty.textContent =
    /* Wide container — matches AES layout width */
    '.dm-wrap{max-width:1400px;width:95%;margin:0 auto}'

    /* 3-column grid: left | diff-map | right */
    + '.dm-inputs{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    + '.dm-inputs textarea{width:100%;min-height:180px;resize:vertical}'

    /* Bulk action bar */
    + '.dm-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:6px 0}'
    + '.dm-bar .pill-btn{font-size:12px}'

    /* Stats row */
    + '.dm-stats{display:flex;gap:14px;flex-wrap:wrap;padding:4px 0;font-size:12px;color:var(--muted)}'
    + '.dm-stats b{font-weight:700}'
    + '.dm-st-add{color:#3dd68c}.dm-st-rem{color:#ff6b6b}.dm-st-eq{color:var(--muted)}'

    /* Diff rows container */
    + '.dm-diff{max-height:420px;overflow:auto;border:1px solid var(--border);border-radius:var(--r);background:var(--bg)}'

    /* Individual diff row — 6-col grid */
    + '.dm-row{display:grid;grid-template-columns:32px 1fr 44px 1fr 32px 0;align-items:stretch;'
    +   'border-bottom:1px solid rgba(255,255,255,.04);min-height:26px}'
    + '.dm-ln{display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--muted);'
    +   'opacity:.55;user-select:none;padding:0 2px}'
    + '.dm-cell{font-family:var(--mono);font-size:12.5px;white-space:pre-wrap;word-break:break-all;'
    +   'padding:3px 8px;line-height:1.55;display:flex;align-items:center}'

    /* Centre controls */
    + '.dm-ctl{display:flex;align-items:center;justify-content:center;gap:2px;padding:0 2px}'
    + '.dm-ctl button{background:none;border:none;cursor:pointer;padding:3px 5px;border-radius:3px;'
    +   'color:var(--muted);font-size:13px;line-height:1;transition:color .12s,background .12s}'
    + '.dm-ctl button:hover{color:var(--text);background:rgba(255,255,255,.08)}'

    /* Colour coding */
    + '.dm-add{background:rgba(61,214,140,.10)}'
    + '.dm-rem{background:rgba(255,107,107,.10)}'
    + '.dm-empty{background:rgba(255,255,255,.02)}'

    /* Header row in diff */
    + '.dm-row-h{background:var(--sf2);border-bottom:1px solid var(--border)}'
    + '.dm-row-h .dm-cell{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;'
    +   'letter-spacing:.05em;padding:7px 8px}'

    /* Merged editor panel */
    + '.dm-merged{margin-top:14px}'
    + '.dm-merged textarea{width:100%;min-height:200px;resize:vertical;font-family:var(--mono);font-size:13px}'
    + '.dm-merged-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}'
    + '.dm-merged-head label{font-size:13px;font-weight:700;color:var(--text)}'
    + '.dm-merged-btns{display:flex;gap:6px}'

    /* Responsive */
    + '@media(max-width:768px){.dm-inputs{grid-template-columns:1fr}'
    +   '.dm-row{grid-template-columns:24px 1fr 36px 1fr 24px 0}'
    +   '.dm-cell{font-size:11.5px}}';
  document.head.appendChild(sty);

  /* ── STATE ──────────────────────────────────────────────────────────────── */
  var state = {
    left: '',
    right: '',
    merged: '',
    diff: []      /* { type:'eq'|'add'|'rem', li:num|null, ri:num|null, left:str, right:str } */
  };

  /* ── LCS DIFF ENGINE ────────────────────────────────────────────────────── */
  function computeDiff(leftText, rightText) {
    var a = leftText.split('\n');
    var b = rightText.split('\n');
    var m = a.length, n = b.length;

    /* build LCS table */
    var dp = new Array(m + 1);
    var i, j;
    for (i = 0; i <= m; i++) { dp[i] = new Array(n + 1); dp[i][0] = 0; }
    for (j = 0; j <= n; j++) dp[0][j] = 0;
    for (i = 1; i <= m; i++)
      for (j = 1; j <= n; j++)
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);

    /* backtrack to produce aligned rows */
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

  /* ── RENDER HTML ────────────────────────────────────────────────────────── */
  root.innerHTML =
    '<div class="dm-wrap">'
    /* ── card header ── */
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.diff + '</div>'
    +       '<h2 id="t-heading">Diff &amp; Merge</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Merge Editor</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'

    /* ── LEFT / RIGHT textareas ── */
    +     '<div class="dm-inputs">'
    +       '<div class="field"><div class="field-hdr"><label for="t-left">Original (Left)</label>'
    +         '</div><textarea id="t-left" placeholder="Paste original text\u2026" rows="8" class="mono"></textarea></div>'
    +       '<div class="field"><div class="field-hdr"><label for="t-right">Changed (Right)</label>'
    +         '<div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear all">'
    +           IC.trash + ' <span>Clear</span></button></div>'
    +         '</div><textarea id="t-right" placeholder="Paste changed text\u2026" rows="8" class="mono"></textarea></div>'
    +     '</div>'

    /* ── Bulk action bar ── */
    +     '<div class="dm-bar">'
    +       '<button type="button" class="pill-btn" id="btn-use-left">\u2190 Use All Left</button>'
    +       '<button type="button" class="pill-btn" id="btn-use-right">Use All Right \u2192</button>'
    +       '<button type="button" class="pill-btn" id="btn-reset">' + IC.reset + ' <span>Reset Merge</span></button>'
    +     '</div>'

    /* ── Stats ── */
    +     '<div class="dm-stats" id="dm-stats"></div>'

    /* ── Diff map ── */
    +     '<div class="dm-diff" id="dm-diff">'
    +       '<div class="dm-row dm-row-h">'
    +         '<div class="dm-ln"></div><div class="dm-cell">Original</div>'
    +         '<div class="dm-ctl"></div><div class="dm-cell">Changed</div>'
    +         '<div class="dm-ln"></div><div></div>'
    +       '</div>'
    +       '<div id="dm-rows"></div>'
    +     '</div>'

    /* ── Merged editor ── */
    +     '<div class="dm-merged">'
    +       '<div class="dm-merged-head">'
    +         '<label for="t-merged">Merged Result</label>'
    +         '<div class="dm-merged-btns">'
    +           '<button type="button" class="copy-btn" id="btn-cp">' + IC.copy + ' <span>Copy</span></button>'
    +           '<button type="button" class="dl-btn" id="btn-dl">' + IC.dl + ' <span>Download</span></button>'
    +         '</div>'
    +       '</div>'
    +       '<textarea id="t-merged" placeholder="Merged output will appear here\u2026 You can also edit freely." rows="10" class="mono"></textarea>'
    +     '</div>'

    +   '</div>'  /* tc-body */
    + '</div>'  /* tool-card-ui */
    + '</div>';  /* dm-wrap */

  /* ── ELEMENT REFS ───────────────────────────────────────────────────────── */
  var elLeft   = $('t-left');
  var elRight  = $('t-right');
  var elMerged = $('t-merged');
  var elRows   = $('dm-rows');
  var elStats  = $('dm-stats');

  /* ── SYNC STATE → DIFF (does NOT touch merged textarea) ─────────────────── */
  function recomputeDiff() {
    state.diff = computeDiff(state.left, state.right);
    renderDiffRows();
    renderStats();
  }

  /* ── RENDER DIFF ROWS ───────────────────────────────────────────────────── */
  function renderDiffRows() {
    if (!state.left && !state.right) {
      elRows.innerHTML = '<div style="color:var(--muted);padding:24px;text-align:center;font-size:13px">'
        + 'Type or paste text in both panels to see a live diff\u2026</div>';
      return;
    }
    var html = '';
    state.diff.forEach(function (r, idx) {
      var lnL = r.li !== null ? r.li : '';
      var lnR = r.ri !== null ? r.ri : '';
      var clsL = '', clsR = '';
      if (r.type === 'rem')      { clsL = ' dm-rem'; clsR = ' dm-empty'; }
      else if (r.type === 'add') { clsL = ' dm-empty'; clsR = ' dm-add'; }

      html += '<div class="dm-row" data-idx="' + idx + '">'
        + '<div class="dm-ln">' + lnL + '</div>'
        + '<div class="dm-cell' + clsL + '">' + esc(r.left) + '</div>'
        + '<div class="dm-ctl">';

      if (r.type !== 'eq') {
        html += '<button class="ml-take" data-idx="' + idx + '" title="Use original line">\u2190</button>'
              + '<button class="mr-take" data-idx="' + idx + '" title="Use changed line">\u2192</button>';
      }

      html += '</div>'
        + '<div class="dm-cell' + clsR + '">' + esc(r.right) + '</div>'
        + '<div class="dm-ln">' + lnR + '</div>'
        + '<div></div></div>';
    });
    elRows.innerHTML = html;
  }

  /* ── RENDER STATS ───────────────────────────────────────────────────────── */
  function renderStats() {
    var add = 0, rem = 0, eq = 0;
    state.diff.forEach(function (r) {
      if (r.type === 'add') add++;
      else if (r.type === 'rem') rem++;
      else eq++;
    });
    elStats.innerHTML =
      '<span class="dm-st-add"><b>+' + add + '</b> added</span>'
      + '<span class="dm-st-rem"><b>\u2212' + rem + '</b> removed</span>'
      + '<span class="dm-st-eq"><b>' + eq + '</b> unchanged</span>';
  }

  /* ── SET MERGED (only called on explicit user action) ───────────────────── */
  function setMerged(text) {
    state.merged = text;
    elMerged.value = state.merged;
  }

  /* ── APPLY SINGLE LINE TO MERGED ────────────────────────────────────────── */
  function applyLineToMerged(idx, side) {
    var r = state.diff[idx];
    if (!r) return;
    var mergedLines = state.merged.split('\n');

    /* We need to figure out which line in merged this diff row maps to.
       Strategy: walk diff[0..idx] and count the "merged line index" assuming
       merged was built from the diff. Each eq/rem maps to a left-line,
       each add maps to a right-line inserted. We track a cursor. */
    var cursor = 0;
    for (var k = 0; k < idx; k++) {
      var t = state.diff[k].type;
      if (t === 'eq' || t === 'rem' || t === 'add') cursor++;
    }

    var lineText = side === 'left' ? r.left : r.right;

    if (r.type === 'rem') {
      /* Line exists in left, not in right.
         If taking left → keep it (might already be there).
         If taking right → remove it. */
      if (side === 'right') {
        if (cursor < mergedLines.length) mergedLines.splice(cursor, 1);
      } else {
        if (cursor < mergedLines.length) mergedLines[cursor] = lineText;
        else mergedLines.push(lineText);
      }
    } else if (r.type === 'add') {
      /* Line exists in right, not in left.
         If taking right → keep/insert.
         If taking left → remove it. */
      if (side === 'left') {
        if (cursor < mergedLines.length) mergedLines.splice(cursor, 1);
      } else {
        if (cursor < mergedLines.length) mergedLines[cursor] = lineText;
        else mergedLines.push(lineText);
      }
    } else {
      /* eq — just overwrite */
      if (cursor < mergedLines.length) mergedLines[cursor] = lineText;
    }

    setMerged(mergedLines.join('\n'));
    CK.toast('Line merged');
  }

  /* ── LIVE INPUT → STATE → DIFF (debounced) ──────────────────────────────── */
  var debounceTimer;
  function onInputChange() {
    state.left  = elLeft.value;
    state.right = elRight.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(recomputeDiff, 150);
  }
  elLeft.addEventListener('input', onInputChange);
  elRight.addEventListener('input', onInputChange);

  /* ── MERGED TEXTAREA → STATE (preserves Ctrl-Z natively) ────────────────── */
  elMerged.addEventListener('input', function () {
    state.merged = elMerged.value;
  });

  /* ── SYNC SCROLL — LEFT/RIGHT TEXTAREAS ─────────────────────────────────── */
  var syncing = false;
  function syncScroll(src, dst) {
    if (syncing) return;
    syncing = true;
    dst.scrollTop = src.scrollTop;
    syncing = false;
  }
  elLeft.addEventListener('scroll', function () { syncScroll(elLeft, elRight); });
  elRight.addEventListener('scroll', function () { syncScroll(elRight, elLeft); });

  /* ── PER-LINE MERGE BUTTONS (event delegation) ──────────────────────────── */
  elRows.addEventListener('click', function (e) {
    var btn = e.target.closest('.ml-take, .mr-take');
    if (!btn) return;
    var idx = parseInt(btn.getAttribute('data-idx'), 10);
    var side = btn.classList.contains('ml-take') ? 'left' : 'right';
    applyLineToMerged(idx, side);
  });

  /* ── BULK ACTIONS ───────────────────────────────────────────────────────── */
  $('btn-use-left').addEventListener('click', function () {
    setMerged(state.left);
    CK.toast('Merged \u2190 all left');
  });
  $('btn-use-right').addEventListener('click', function () {
    setMerged(state.right);
    CK.toast('Merged \u2192 all right');
  });
  $('btn-reset').addEventListener('click', function () {
    setMerged('');
    CK.toast('Merge reset');
  });

  /* ── CLEAR ALL ──────────────────────────────────────────────────────────── */
  $('btn-clr').addEventListener('click', function () {
    elLeft.value = '';
    elRight.value = '';
    state.left = ''; state.right = ''; state.merged = ''; state.diff = [];
    elMerged.value = '';
    renderDiffRows();
    renderStats();
  });

  /* ── COPY / DOWNLOAD (merged result) ────────────────────────────────────── */
  CK.wireCopy($('btn-cp'), function () { return state.merged; });
  CK.wireDownload($('btn-dl'), function () { return state.merged; }, 'merged-output.txt');

  /* ── AUTO-GROW TEXTAREAS ────────────────────────────────────────────────── */
  CK.initAutoGrow(elLeft);
  CK.initAutoGrow(elRight);
  CK.initAutoGrow(elMerged);

  /* ── SAMPLE DATA ────────────────────────────────────────────────────────── */
  elLeft.value = 'function greet(name) {\n  console.log("Hello, " + name);\n  return true;\n}\n\ngreet("World");';
  elRight.value = 'function greet(name, greeting) {\n  const msg = `${greeting}, ${name}!`;\n  console.log(msg);\n  return msg;\n}\n\ngreet("World", "Hi");';
  state.left = elLeft.value;
  state.right = elRight.value;
  setMerged(state.left);   /* initialise merged = left */
  recomputeDiff();

  /* ── USAGE CONTENT ──────────────────────────────────────────────────────── */
  CK.setUsageContent(
    '<ol>'
    + '<li>Paste <strong>original text</strong> on the left and <strong>changed text</strong> on the right.</li>'
    + '<li>The diff updates <strong>live</strong> as you type — no button click needed.</li>'
    + '<li>Use <strong>\u2190</strong> / <strong>\u2192</strong> buttons on each line to merge individual changes.</li>'
    + '<li>Use <strong>"Use All Left"</strong> or <strong>"Use All Right"</strong> for bulk merges.</li>'
    + '<li>The <strong>Merged Result</strong> textarea is fully editable — Ctrl+Z works natively.</li>'
    + '<li>Click <strong>Copy</strong> or <strong>Download</strong> to export the merged result.</li>'
    + '</ol>'
    + '<p>Added lines shown in <span style="color:#3dd68c">green</span>, removed in <span style="color:#ff6b6b">red</span>.</p>'
  );
})();
