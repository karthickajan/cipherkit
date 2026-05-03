(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    diff:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M18 6H6"/><path d="M18 18H6"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var sty = document.createElement('style');
  sty.textContent = `
    .dm-pane { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .dm-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .dm-stats-bar { display: flex; justify-content: space-between; padding: 10px 16px; background: rgba(0,0,0,0.15); border: 1px solid var(--border); border-bottom: none; border-radius: 6px 6px 0 0; font-size: 13px; }
    .dm-st-add { color: #3dd68c; margin-right: 12px; } .dm-st-rem { color: #ff6b6b; margin-right: 12px; } .dm-stats b { font-weight: 700; }
    .dm-feature-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: var(--muted); transition: 0.2s; user-select: none; }
    .dm-feature-toggle:hover { color: var(--text); }
    .dm-feature-toggle input { accent-color: var(--amber); cursor: pointer; width: 14px; height: 14px; }
    .dm-workspace { display: flex; height: 60vh; border: 1px solid var(--border); border-radius: 0 0 6px 6px; background: var(--bg-card); overflow: hidden; }
    .dm-scroll-pane { flex: 1; overflow: auto; background: var(--bg-body); position: relative; }
    .dm-gutter-pane { width: 48px; flex-shrink: 0; overflow: hidden; background: rgba(0,0,0,0.2); border-left: 1px solid var(--border); border-right: 1px solid var(--border); position: relative; }
    .dm-scroll-pane.wrap-active .dm-content { min-width: 100%; width: 100%; }
    .dm-scroll-pane:not(.wrap-active) .dm-content { min-width: max-content; }
    .dm-block-wrap { display: flex; flex-direction: column; }
    .dm-gutter-block { position: relative; }
    .dm-line { display: flex; align-items: flex-start; min-height: 24px; padding: 0 12px; box-sizing: border-box; }
    .dm-line-num { opacity: 0.4; font-size: 11px; width: 36px; flex-shrink: 0; text-align: right; margin-right: 16px; user-select: none; font-variant-numeric: tabular-nums; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important; }
    .dm-line-txt { flex: 1; outline: none; transition: background 0.2s; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important; font-size: 13px; line-height: 24px; }
    .dm-line-txt[contenteditable="true"]:focus { background: rgba(255,255,255,0.05); border-radius: 2px; }
    .dm-sticky-arrows { position: sticky; top: 12px; display: flex; justify-content: center; width: 100%; padding: 4px; z-index: 5; }
    .dm-add { background: rgba(61,214,140,0.12); color: #3dd68c; }
    .dm-rem { background: rgba(255,107,107,0.12); color: #ff6b6b; }
    .dm-empty { background: rgba(255,255,255,0.02); }
    .dm-btn-grp { display: flex; width: 100%; height: 24px; justify-content: space-evenly; align-items: center; background: rgba(255,255,255,0.08); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); backdrop-filter: blur(4px); }
    .dm-btn-arrow { background: none; border: none; color: var(--text); cursor: pointer; height: 20px; width: 20px; display: flex; align-items: center; justify-content: center; padding: 2px; transition: 0.2s; }
    .dm-btn-arrow:hover { background: rgba(255,255,255,0.2); border-radius: 4px; }
    .dm-history-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .diff-del-inline { background: rgba(255,107,107,0.25); border-radius: 2px; padding: 0 1px; }
    .diff-add-inline { background: rgba(61,214,140,0.25); border-radius: 2px; padding: 0 1px; }
    .dm-nav-bar { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 6px 16px; background: rgba(0,0,0,0.15); border: 1px solid var(--border); border-top: none; border-bottom: none; font-size: 13px; }
    .dm-nav-btn { background: #1a1a1a; border: 1px solid #1e1e1e; color: #00ff88; border-radius: 4px; padding: 6px 14px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: opacity 0.2s; }
    .dm-nav-btn:hover:not(:disabled) { opacity: 0.85; }
    .dm-nav-btn:disabled { color: #444; cursor: not-allowed; }
    .dm-nav-label { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; min-width: 90px; text-align: center; }
    .dm-overview-bar { width: 10px; flex-shrink: 0; background: #0d0d0d; border-left: 1px solid #1e1e1e; position: relative; cursor: pointer; }
    .dm-overview-tick { position: absolute; left: 0; width: 100%; min-height: 3px; pointer-events: none; }
    .dm-overview-viewport { position: absolute; left: 0; width: 100%; background: rgba(255,255,255,0.12); border-radius: 1px; pointer-events: none; min-height: 4px; transition: top 0.08s linear, height 0.08s linear; }
    .dm-scroll-pane.wrap-active .dm-line-txt { white-space: pre-wrap; word-break: break-all; }
    .dm-scroll-pane:not(.wrap-active) .dm-line-txt { white-space: pre; }
    .dm-workspace.hide-match .dm-row-match { display: none !important; }
    .ck-usage-list { margin: 0; padding-left: 20px; line-height: 1.6; }
    .ck-usage-list li { margin-bottom: 8px; }
    .ck-usage-note { margin-top: 16px; font-size: 0.9em; color: var(--amber); background: rgba(227, 179, 65, 0.1); padding: 12px; border-radius: 6px; }
    [data-theme="light"] .dm-stats-bar { background: rgba(0,0,0,0.04); }
    [data-theme="light"] .dm-workspace { background: var(--surface); }
    [data-theme="light"] .dm-scroll-pane { background: var(--bg); }
    [data-theme="light"] .dm-gutter-pane { background: rgba(0,0,0,0.04); border-color: var(--border); }
    [data-theme="light"] .dm-nav-bar { background: rgba(0,0,0,0.04); }
    [data-theme="light"] .dm-nav-btn { background: var(--surface); border-color: var(--border); color: var(--green); }
    [data-theme="light"] .dm-nav-btn:disabled { color: var(--dim); }
    [data-theme="light"] .dm-overview-bar { background: var(--sf2); border-left-color: var(--border); }
    [data-theme="light"] .dm-overview-viewport { background: rgba(0,0,0,0.12); }
    [data-theme="light"] .dm-empty { background: rgba(0,0,0,0.02); }
    [data-theme="light"] .dm-btn-grp { background: rgba(0,0,0,0.06); box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
    [data-theme="light"] .dm-btn-arrow { color: var(--text); }
    [data-theme="light"] .dm-btn-arrow:hover { background: rgba(0,0,0,0.1); }
    [data-theme="light"] .dm-line-txt[contenteditable="true"]:focus { background: rgba(0,0,0,0.04); }
    [data-theme="light"] .dm-add { background: rgba(26,140,91,0.1); color: #1a8c5b; }
    [data-theme="light"] .dm-rem { background: rgba(207,34,46,0.1); color: #cf222e; }
    [data-theme="light"] .diff-add-inline { background: rgba(26,140,91,0.2); }
    [data-theme="light"] .diff-del-inline { background: rgba(207,34,46,0.2); }
    [data-theme="light"] .dm-st-add { color: #1a8c5b; }
    [data-theme="light"] .dm-st-rem { color: #cf222e; }
  `;
  document.head.appendChild(sty);
  var currentDiff = null;
  var historyStack = [];
  var historyIndex = -1;
  var settings = { wrap: true, hideUnchanged: false };
  var diffBlockEls = [];
  var currentNavIndex = -1;
  function saveHistory(leftText, rightText) {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push({ l: leftText, r: rightText });
    historyIndex++;
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    $('btn-undo').disabled = historyIndex <= 0;
    $('btn-redo').disabled = historyIndex >= historyStack.length - 1;
  }
  $('tool-root').addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if(!btn) return;
    if(btn.id === 'btn-undo' && historyIndex > 0) { historyIndex--; restoreHistoryState(); } 
    else if(btn.id === 'btn-redo' && historyIndex < historyStack.length - 1) { historyIndex++; restoreHistoryState(); }
  });
  function restoreHistoryState() {
    var state = historyStack[historyIndex];
    $('t-left').value = state.l; $('t-right').value = state.r;
    renderDiff();
  }
  function lcsDiffAligned(textA, textB) {
    let a = textA === '' ? [] : textA.split('\n');
    let b = textB === '' ? [] : textB.split('\n');
    let matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1] + 1;
        else matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
    let i = a.length, j = b.length;
    let ops = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.unshift({ type: 'match', l: a[i - 1], r: b[j - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        ops.unshift({ type: 'add', r: b[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        ops.unshift({ type: 'remove', l: a[i - 1] });
        i--;
      }
    }
    let resA = [], resB = [];
    let blockId = 0, iOp = 0;
    let addCount = 0, remCount = 0, matchCount = 0;
    while (iOp < ops.length) {
      if (ops[iOp].type === 'match') {
        resA.push({ type: 'match', text: ops[iOp].l, blockId: null });
        resB.push({ type: 'match', text: ops[iOp].r, blockId: null });
        matchCount++; iOp++;
      } else {
        blockId++;
        let localRem = [], localAdd = [];
        while (iOp < ops.length && ops[iOp].type !== 'match') {
          if (ops[iOp].type === 'remove') { localRem.push(ops[iOp].l); remCount++; }
          if (ops[iOp].type === 'add') { localAdd.push(ops[iOp].r); addCount++; }
          iOp++;
        }
        let maxLen = Math.max(localRem.length, localAdd.length);
        for (let k = 0; k < maxLen; k++) {
          resA.push({ type: k < localRem.length ? 'remove' : 'empty', text: k < localRem.length ? localRem[k] : '', blockId: blockId });
          resB.push({ type: k < localAdd.length ? 'add' : 'empty', text: k < localAdd.length ? localAdd[k] : '', blockId: blockId });
        }
      }
    }
    return { left: resA, right: resB, stats: { add: addCount, rem: remCount, match: matchCount } };
  }
  function inlineDiffChars(oldStr, newStr) {
    var a = Array.from(oldStr);
    var b = Array.from(newStr);
    var m = a.length, n = b.length;
    // LCS on characters
    var prev = new Uint16Array(n + 1);
    var curr = new Uint16Array(n + 1);
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) curr[j] = prev[j - 1] + 1;
        else curr[j] = curr[j - 1] > prev[j] ? curr[j - 1] : prev[j];
      }
      var tmp = prev; prev = curr; curr = tmp;
      curr.fill(0);
    }
    // Backtrack to get edit ops
    var ops = [];
    i = m; var jj = n;
    // Rebuild full matrix for backtrack (space-optimized won't work for backtrack)
    var mat = [];
    for (var x = 0; x <= m; x++) mat[x] = new Uint16Array(n + 1);
    for (x = 1; x <= m; x++) {
      for (var y = 1; y <= n; y++) {
        if (a[x - 1] === b[y - 1]) mat[x][y] = mat[x - 1][y - 1] + 1;
        else mat[x][y] = mat[x - 1][y] > mat[x][y - 1] ? mat[x - 1][y] : mat[x][y - 1];
      }
    }
    i = m; jj = n;
    while (i > 0 || jj > 0) {
      if (i > 0 && jj > 0 && a[i - 1] === b[jj - 1]) {
        ops.unshift({ t: '=', c: a[i - 1] }); i--; jj--;
      } else if (jj > 0 && (i === 0 || mat[i][jj - 1] >= mat[i - 1][jj])) {
        ops.unshift({ t: '+', c: b[jj - 1] }); jj--;
      } else {
        ops.unshift({ t: '-', c: a[i - 1] }); i--;
      }
    }
    // Build HTML for left (old) and right (new)
    var leftH = '', rightH = '';
    var lBuf = '', lInDel = false;
    var rBuf = '', rInAdd = false;
    for (var k = 0; k < ops.length; k++) {
      var op = ops[k];
      if (op.t === '=') {
        if (lInDel) { leftH += '<span class="diff-del-inline">' + esc(lBuf) + '</span>'; lBuf = ''; lInDel = false; }
        if (rInAdd) { rightH += '<span class="diff-add-inline">' + esc(rBuf) + '</span>'; rBuf = ''; rInAdd = false; }
        leftH += esc(op.c);
        rightH += esc(op.c);
      } else if (op.t === '-') {
        lInDel = true; lBuf += op.c;
      } else {
        rInAdd = true; rBuf += op.c;
      }
    }
    if (lInDel) leftH += '<span class="diff-del-inline">' + esc(lBuf) + '</span>';
    if (rInAdd) rightH += '<span class="diff-add-inline">' + esc(rBuf) + '</span>';
    return { leftHtml: leftH, rightHtml: rightH };
  }
  root.innerHTML = `
    <div class="tool-single-col" style="max-width: 1400px; margin: 0 auto;">
      <div class="tool-card-ui">
        <div class="tc-head">
          <div class="tc-title"><div class="tc-icon tc-icon-amber">${IC.diff}</div><h2 id="t-heading">Interactive Diff & Merge</h2></div>
          <span class="tc-badge tc-badge-amber">Pro Editor</span>
        </div>
        <div class="tc-body">
          <div id="view-input">
            <div style="display:flex; gap:16px; margin-bottom:16px;">
              <div class="dm-pane"><div class="field-hdr"><label for="t-left">Left Editor (Original)</label></div><textarea id="t-left" placeholder="Paste left text..." rows="16" class="mono"></textarea></div>
              <div class="dm-pane"><div class="field-hdr"><label for="t-right">Right Editor (Modified)</label></div><textarea id="t-right" placeholder="Paste right text..." rows="16" class="mono"></textarea></div>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <button type="button" class="act-btn act-amber" id="btn-compare">${IC.diff} <span>Compare & Resolve Workspace</span></button>
              <button type="button" class="pill-btn" id="btn-clr">${IC.trash} <span>Clear All</span></button>
            </div>
          </div>
          <div id="view-resolve" style="display:none;">
            <div class="dm-toolbar">
              <div style="display:flex; gap:12px; align-items:center;">
                <button type="button" class="pill-btn" id="btn-back">${IC.edit} <span>Raw Editors</span></button>
                <div style="width:1px; height:20px; background:var(--border); margin: 0 4px;"></div>
                <button type="button" class="pill-btn dm-history-btn" id="btn-undo" title="Undo" disabled>${IC.undo}</button>
                <button type="button" class="pill-btn dm-history-btn" id="btn-redo" title="Redo" disabled>${IC.redo}</button>
              </div>
              <div style="display:flex; gap:16px; align-items:center;">
                <label class="dm-feature-toggle"><input type="checkbox" id="cb-wrap" checked> Wrap Lines</label>
                <label class="dm-feature-toggle"><input type="checkbox" id="cb-hide"> Hide Unchanged</label>
                <div style="width:1px; height:20px; background:var(--border); margin: 0 4px;"></div>
                <button type="button" class="pill-btn" id="btn-cp-left">${IC.copy} <span>Copy Left</span></button>
                <button type="button" class="pill-btn" id="btn-cp-right">${IC.copy} <span>Copy Right</span></button>
              </div>
            </div>
            <div class="dm-stats-bar" id="dm-stats-bar"></div>
            <div class="dm-nav-bar" id="dm-nav-bar">
              <button type="button" class="dm-nav-btn" id="btn-prev-diff" disabled>↑ Prev</button>
              <span class="dm-nav-label" id="dm-nav-label">No diffs</span>
              <button type="button" class="dm-nav-btn" id="btn-next-diff" disabled>↓ Next</button>
            </div>
            <div class="dm-workspace wrap-active" id="dm-workspace">
              <div id="pane-left" class="dm-scroll-pane wrap-active">
                <div class="dm-content" id="content-left"></div>
              </div>
              <div id="pane-gutter" class="dm-gutter-pane">
                <div class="dm-content" id="content-gutter" style="min-width:100%;"></div>
              </div>
              <div id="pane-right" class="dm-scroll-pane wrap-active">
                <div class="dm-content" id="content-right"></div>
              </div>
              <div id="pane-overview" class="dm-overview-bar">
                <div id="overview-viewport" class="dm-overview-viewport"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  function showResolveView() { $('view-input').style.display = 'none'; $('view-resolve').style.display = 'block'; }
  function showInputView() { $('view-input').style.display = 'block'; $('view-resolve').style.display = 'none'; }
  $('btn-clr').addEventListener('click', function () { 
    $('t-left').value=''; $('t-right').value=''; historyStack = []; historyIndex = -1; updateHistoryButtons();
  });
  $('btn-back').addEventListener('click', showInputView);
  $('btn-compare').addEventListener('click', function () {
    if(historyIndex === -1) saveHistory($('t-left').value, $('t-right').value);
    renderDiff();
    showResolveView();
  });
  $('cb-wrap').addEventListener('change', (e) => {
    settings.wrap = e.target.checked;
    $('pane-left').classList.toggle('wrap-active', settings.wrap);
    $('pane-right').classList.toggle('wrap-active', settings.wrap);
    setTimeout(syncRowHeights, 0); 
  });
  $('cb-hide').addEventListener('change', (e) => {
    settings.hideUnchanged = e.target.checked;
    $('dm-workspace').classList.toggle('hide-match', settings.hideUnchanged);
    setTimeout(syncRowHeights, 0); 
  });
  let isSyncingLeft = false;
  let isSyncingRight = false;
  function syncScroll(source, target, gutter) {
    target.scrollTop = source.scrollTop;
    gutter.scrollTop = source.scrollTop;
    target.scrollLeft = source.scrollLeft; 
  }
  $('pane-left').addEventListener('scroll', function(e) {
    if (!isSyncingLeft) {
      isSyncingRight = true;
      syncScroll(e.target, $('pane-right'), $('pane-gutter'));
    }
    isSyncingLeft = false;
  }, { passive: true });
  $('pane-right').addEventListener('scroll', function(e) {
    if (!isSyncingRight) {
      isSyncingLeft = true;
      syncScroll(e.target, $('pane-left'), $('pane-gutter'));
    }
    isSyncingRight = false;
  }, { passive: true });
  function syncRowHeights() {
    let leftLines = document.querySelectorAll('#content-left .dm-line');
    let rightLines = document.querySelectorAll('#content-right .dm-line');
    let leftBlocks = document.querySelectorAll('#content-left .dm-block-wrap');
    let gutterBlocks = document.querySelectorAll('#content-gutter .dm-gutter-block');
    let len = leftLines.length;
    let heights = new Array(len);
    // Batch all resets
    for (let i = 0; i < len; i++) {
      leftLines[i].style.height = 'auto';
      rightLines[i].style.height = 'auto';
    }
    // Single batch read after resets (one reflow)
    for (let i = 0; i < len; i++) {
      heights[i] = Math.max(leftLines[i].offsetHeight, rightLines[i].offsetHeight);
    }
    // Batch all writes
    for (let i = 0; i < len; i++) {
      let h = heights[i] + 'px';
      leftLines[i].style.height = h;
      rightLines[i].style.height = h;
    }
    // Read then write for gutter blocks
    let blockHeights = new Array(leftBlocks.length);
    for (let j = 0; j < leftBlocks.length; j++) {
      blockHeights[j] = leftBlocks[j].offsetHeight;
    }
    for (let j = 0; j < leftBlocks.length; j++) {
      gutterBlocks[j].style.height = blockHeights[j] + 'px';
    }
  }
  function renderDiff() {
    var cb = typeof requestIdleCallback === 'function' ? requestIdleCallback : function(fn) { setTimeout(fn, 0); };
    cb(function() { renderDiffSync(); }, { timeout: 500 });
  }
  function renderDiffSync() {
    currentDiff = lcsDiffAligned($('t-left').value, $('t-right').value);
    $('dm-stats-bar').innerHTML = 
      `<div class="dm-stats"><span class="dm-st-rem"><b>-${currentDiff.stats.rem}</b> removed (Left)</span><span class="dm-st-add"><b>+${currentDiff.stats.add}</b> added (Right)</span></div>` +
      `<div class="dm-stats"><span style="color:var(--muted)"><b>${currentDiff.stats.match}</b> unchanged lines</span></div>`;
    let blocks = [];
    let currentBlock = { isDiff: false, id: null, lines: [] };
    for (let k = 0; k < currentDiff.left.length; k++) {
      let lNode = currentDiff.left[k];
      let rNode = currentDiff.right[k];
      let bId = lNode.blockId;
      let isDiff = bId !== null;
      if (isDiff !== currentBlock.isDiff || bId !== currentBlock.id) {
        if (currentBlock.lines.length > 0) blocks.push(currentBlock);
        currentBlock = { isDiff: isDiff, id: bId, lines: [] };
      }
      currentBlock.lines.push({ lNode, rNode, k });
    }
    if (currentBlock.lines.length > 0) blocks.push(currentBlock);
    let leftHTML = '', rightHTML = '', gutterHTML = '';
    let lLine = 1, rLine = 1;
    blocks.forEach(block => {
      let blockLeftLines = '', blockRightLines = '';
      let rowVisibilityCls = block.isDiff ? 'dm-row-diff' : 'dm-row-match';
      block.lines.forEach(lineItem => {
        let lNode = lineItem.lNode;
        let rNode = lineItem.rNode;
        let k = lineItem.k;
        let lcls = lNode.type === 'remove' ? 'dm-rem' : lNode.type === 'empty' ? 'dm-empty' : '';
        let rcls = rNode.type === 'add' ? 'dm-add' : rNode.type === 'empty' ? 'dm-empty' : '';
        let lNum = lNode.type !== 'empty' ? lLine++ : '';
        let rNum = rNode.type !== 'empty' ? rLine++ : '';
        let lText, rText;
        if (lNode.type === 'remove' && rNode.type === 'add') {
          var inl = inlineDiffChars(lNode.text, rNode.text);
          lText = inl.leftHtml;
          rText = inl.rightHtml;
        } else {
          lText = lNode.type !== 'empty' ? esc(lNode.text) : '';
          rText = rNode.type !== 'empty' ? esc(rNode.text) : '';
        }
        blockLeftLines += `<div class="dm-line ${lcls}"><span class="dm-line-num">${lNum}</span><span class="dm-line-txt" ${lNode.type !== 'empty' ? `contenteditable="true" spellcheck="false" onblur="window._ckInlineEdit('left', ${k}, this)"` : ''}>${lText}</span></div>`;
        blockRightLines += `<div class="dm-line ${rcls}"><span class="dm-line-num">${rNum}</span><span class="dm-line-txt" ${rNode.type !== 'empty' ? `contenteditable="true" spellcheck="false" onblur="window._ckInlineEdit('right', ${k}, this)"` : ''}>${rText}</span></div>`;
      });
      leftHTML += `<div class="dm-block-wrap ${rowVisibilityCls}">${blockLeftLines}</div>`;
      rightHTML += `<div class="dm-block-wrap ${rowVisibilityCls}">${blockRightLines}</div>`;
      let gutterContent = '';
      if (block.isDiff) {
        gutterContent = `
          <div class="dm-sticky-arrows">
            <div class="dm-btn-grp">
              <button class="dm-btn-arrow" onclick="window._ckPushBlock(${block.id}, 'toRight')" title="Take Left Block">${IC.arrowRight}</button>
              <button class="dm-btn-arrow" onclick="window._ckPushBlock(${block.id}, 'toLeft')" title="Take Right Block">${IC.arrowLeft}</button>
            </div>
          </div>`;
      }
      gutterHTML += `<div class="dm-gutter-block ${rowVisibilityCls}">${gutterContent}</div>`;
    });
    $('content-left').innerHTML = leftHTML;
    $('content-gutter').innerHTML = gutterHTML;
    $('content-right').innerHTML = rightHTML;
    setTimeout(function () {
      syncRowHeights();
      diffBlockEls = Array.from(document.querySelectorAll('#content-left .dm-row-diff'));
      currentNavIndex = -1;
      updateNavButtons();
      updateViewportIndicator();
      // Defer tick rendering until browser has reflowed after syncRowHeights
      setTimeout(function () { requestAnimationFrame(function () { renderOverviewBar(); }); }, 50);
    }, 0);
  }
  function updateNavButtons() {
    var total = diffBlockEls.length;
    $('btn-prev-diff').disabled = currentNavIndex <= 0;
    $('btn-next-diff').disabled = total === 0 || currentNavIndex >= total - 1;
    if (total === 0) {
      $('dm-nav-label').textContent = 'No diffs';
    } else if (currentNavIndex < 0) {
      $('dm-nav-label').textContent = total + ' diff' + (total > 1 ? 's' : '');
    } else {
      $('dm-nav-label').textContent = 'Diff ' + (currentNavIndex + 1) + ' of ' + total;
    }
  }
  function scrollToDiffBlock(idx) {
    if (idx < 0 || idx >= diffBlockEls.length) return;
    currentNavIndex = idx;
    updateNavButtons();
    var el = diffBlockEls[idx];
    var pane = $('pane-left');
    var scrollTo = el.offsetTop - 40;
    if (scrollTo < 0) scrollTo = 0;
    pane.scrollTop = scrollTo;
    $('pane-right').scrollTop = scrollTo;
    $('pane-gutter').scrollTop = scrollTo;
    updateViewportIndicator();
  }
  $('btn-prev-diff').addEventListener('click', function () {
    if (currentNavIndex <= 0 && diffBlockEls.length > 0) { scrollToDiffBlock(0); return; }
    if (currentNavIndex > 0) scrollToDiffBlock(currentNavIndex - 1);
  });
  $('btn-next-diff').addEventListener('click', function () {
    if (currentNavIndex < 0 && diffBlockEls.length > 0) { scrollToDiffBlock(0); return; }
    if (currentNavIndex < diffBlockEls.length - 1) scrollToDiffBlock(currentNavIndex + 1);
  });
  function updateViewportIndicator() {
    var pane = $('pane-left');
    var bar = $('pane-overview');
    var vp = $('overview-viewport');
    if (!pane || !bar || !vp) return;
    var scrollH = pane.scrollHeight;
    var barH = bar.offsetHeight;
    if (scrollH === 0 || barH === 0) { vp.style.display = 'none'; return; }
    vp.style.display = '';
    var vpTop = (pane.scrollTop / scrollH) * barH;
    var vpHeight = (pane.clientHeight / scrollH) * barH;
    if (vpHeight < 4) vpHeight = 4;
    vp.style.top = vpTop + 'px';
    vp.style.height = vpHeight + 'px';
  }
  function renderOverviewBar() {
    var bar = $('pane-overview');
    var pane = $('pane-left');
    // Remove old ticks but keep the viewport indicator
    var oldTicks = bar.querySelectorAll('.dm-overview-tick');
    for (var t = 0; t < oldTicks.length; t++) oldTicks[t].remove();
    var scrollH = pane.scrollHeight;
    var barH = bar.offsetHeight;
    if (scrollH === 0 || barH === 0) return;
    // Walk offsetTop chain to get position relative to the scrollable pane
    function getOffsetInPane(el) {
      var top = 0;
      var cur = el;
      while (cur && cur !== pane) {
        top += cur.offsetTop;
        cur = cur.offsetParent;
      }
      return top;
    }
    var leftLines = document.querySelectorAll('#content-left .dm-line');
    var rightLines = document.querySelectorAll('#content-right .dm-line');
    var maxLen = Math.min(leftLines.length, rightLines.length);
    for (var i = 0; i < maxLen; i++) {
      var ll = leftLines[i];
      var rl = rightLines[i];
      var isRem = ll.classList.contains('dm-rem');
      var isAdd = rl.classList.contains('dm-add');
      if (!isRem && !isAdd) continue;
      var lineTop = getOffsetInPane(ll);
      var tickTop = (lineTop / scrollH) * barH;
      var tick = document.createElement('div');
      tick.className = 'dm-overview-tick';
      tick.style.top = tickTop + 'px';
      tick.style.background = isRem ? '#ff444466' : '#00ff8866';
      bar.appendChild(tick);
    }
  }
  // Click overview bar → jump to proportional scroll position
  $('pane-overview').addEventListener('click', function (e) {
    var bar = this;
    var barH = bar.offsetHeight;
    if (barH === 0) return;
    var clickY = e.clientY - bar.getBoundingClientRect().top;
    var ratio = clickY / barH;
    var pane = $('pane-left');
    var scrollTo = ratio * pane.scrollHeight;
    pane.scrollTop = scrollTo;
    $('pane-right').scrollTop = scrollTo;
    $('pane-gutter').scrollTop = scrollTo;
    updateViewportIndicator();
  });
  // Update viewport indicator on every scroll of the left pane
  $('pane-left').addEventListener('scroll', function () {
    updateViewportIndicator();
  }, { passive: true });
  // Recalculate ticks + viewport on window resize
  window.addEventListener('resize', function () {
    if (!currentDiff) return;
    setTimeout(function () { requestAnimationFrame(function () { renderOverviewBar(); updateViewportIndicator(); }); }, 50);
  });
  window._ckInlineEdit = function(side, idx, el) {
    if (!currentDiff) return;
    let node = side === 'left' ? currentDiff.left[idx] : currentDiff.right[idx];
    let newText = el.innerText || '';
    if (node.text === newText) return; 
    node.text = newText;
    syncStateToEditors();
  };
  function syncStateToEditors() {
    if (!currentDiff) return;
    let savedScrollTop = $('pane-left').scrollTop;
    let savedScrollLeft = $('pane-left').scrollLeft;
    var newLeft = currentDiff.left.filter(l => l.type !== 'empty' || l.text !== '').map(l => l.text).join('\n');
    var newRight = currentDiff.right.filter(r => r.type !== 'empty' || r.text !== '').map(r => r.text).join('\n');
    $('t-left').value = newLeft; $('t-right').value = newRight;
    saveHistory(newLeft, newRight);
    renderDiff(); 
    setTimeout(() => {
      $('pane-left').scrollTop = savedScrollTop;
      $('pane-right').scrollTop = savedScrollTop;
      $('pane-gutter').scrollTop = savedScrollTop;
      $('pane-left').scrollLeft = savedScrollLeft;
      $('pane-right').scrollLeft = savedScrollLeft;
    }, 10);
  }
  window._ckPushBlock = function(blockId, direction) {
    if(!currentDiff) return;
    let newLeft = [], newRight = [];
    for(let i=0; i<currentDiff.left.length; i++) {
      let lNode = currentDiff.left[i];
      let rNode = currentDiff.right[i];
      if (lNode.blockId === blockId) {
        if (direction === 'toRight') {
          if (lNode.type !== 'empty') { newLeft.push(lNode.text); newRight.push(lNode.text); }
        } else {
          if (rNode.type !== 'empty') { newLeft.push(rNode.text); newRight.push(rNode.text); }
        }
      } else {
        if (lNode.type !== 'empty') newLeft.push(lNode.text);
        if (rNode.type !== 'empty') newRight.push(rNode.text);
      }
    }
    $('t-left').value = newLeft.join('\n');
    $('t-right').value = newRight.join('\n');
    saveHistory($('t-left').value, $('t-right').value);
    let savedScrollTop = $('pane-left').scrollTop;
    renderDiff();
    setTimeout(() => {
      $('pane-left').scrollTop = savedScrollTop;
      $('pane-right').scrollTop = savedScrollTop;
      $('pane-gutter').scrollTop = savedScrollTop;
    }, 10);
  };
  CK.wireCopy($('btn-cp-left'), function () { return $('t-left').value; });
  CK.wireCopy($('btn-cp-right'), function () { return $('t-right').value; });
  if (typeof CK !== 'undefined' && CK.setUsageContent) {
    var usageHTML = `
      <ol class="ck-usage-list">
        <li><strong>Input:</strong> Paste your original code into the <em>Left Editor</em> and your modified code into the <em>Right Editor</em>.</li>
        <li><strong>Compare:</strong> Click <strong>Compare & Resolve Workspace</strong> to view the side-by-side visual difference.</li>
        <li><strong>Resolve:</strong> Click the directional arrows in the center gutter to push an entire highlighted conflict block from one side to the other.</li>
        <li><strong>Inline Edit:</strong> Click directly on any line of code within the workspace to make manual adjustments on the fly. Clicking away will automatically save and resync the workspace.</li>
        <li><strong>Export:</strong> Once conflicts are resolved, use the <strong>Copy Left</strong> or <strong>Copy Right</strong> buttons at the top right to extract your final merged code.</li>
      </ol>
      <p class="ck-usage-note"><strong>Pro Tip:</strong> Use the <em>Wrap Lines</em> and <em>Hide Unchanged</em> toggles in the top toolbar to navigate large, complex files much faster.</p>
    `;
    CK.setUsageContent(usageHTML);
  }
})();