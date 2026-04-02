/**
 * CipherKit — 2-Pane Interactive Text Diff (Aligned Block Architecture)
 */
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

  /* ── SCOPED STYLES (Bulletproof Layout) ─────────────────────────────────── */
  var sty = document.createElement('style');
  sty.textContent = `
    .dm-pane { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    
    /* Toolbars & Stats */
    .dm-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .dm-stats-bar { display: flex; justify-content: space-between; padding: 10px 16px; background: rgba(0,0,0,0.15); border: 1px solid var(--border); border-bottom: none; border-radius: 6px 6px 0 0; font-size: 13px; }
    .dm-st-add { color: #3dd68c; margin-right: 12px; } .dm-st-rem { color: #ff6b6b; margin-right: 12px; } .dm-stats b { font-weight: 700; }
    
    /* Toggle Switches in Toolbar */
    .dm-feature-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: var(--muted); transition: 0.2s; user-select: none; }
    .dm-feature-toggle:hover { color: var(--text); }
    .dm-feature-toggle input { accent-color: var(--amber); cursor: pointer; width: 14px; height: 14px; }

    /* Unified scroll wrapper */
    .dm-res-wrap { max-height: 60vh; overflow-y: auto; overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 0 0 6px 6px; }
    .dm-res-grid { display: grid; grid-template-columns: 1fr 48px 1fr; min-width: 800px; }
    .dm-res-col { padding: 8px 0; font-family: var(--mono); font-size: 13px; line-height: 24px; }
    .dm-gutter { background: rgba(0,0,0,0.2); border-left: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 8px 0; user-select: none; }
    
    /* Lines & Highlighting */
    .dm-line { display: flex; align-items: flex-start; min-height: 24px; padding: 0 12px; }
    .dm-line-num { opacity: 0.4; font-size: 11px; width: 36px; flex-shrink: 0; text-align: right; margin-right: 16px; user-select: none; font-variant-numeric: tabular-nums; }
    .dm-line-txt { flex: 1; outline: none; transition: background 0.2s; }
    .dm-line-txt[contenteditable="true"]:focus { background: rgba(255,255,255,0.05); border-radius: 2px; }
    
    .dm-add { background: rgba(61,214,140,0.12); color: #3dd68c; }
    .dm-rem { background: rgba(255,107,107,0.12); color: #ff6b6b; }
    .dm-empty { background: rgba(255,255,255,0.02); }
    
    /* Action Buttons */
    .dm-btn-grp { display: flex; width: 100%; height: 24px; justify-content: space-evenly; align-items: center; background: rgba(255,255,255,0.05); border-radius: 4px; }
    .dm-btn-arrow { background: none; border: none; color: var(--muted); cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; padding: 2px; transition: 0.2s; }
    .dm-btn-arrow:hover { color: var(--text); background: rgba(255,255,255,0.15); border-radius: 4px; }
    .dm-history-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* DYNAMIC TOGGLE CLASSES */
    .dm-res-wrap.wrap-active .dm-line-txt { white-space: pre-wrap; word-break: break-all; }
    .dm-res-wrap:not(.wrap-active) .dm-line-txt { white-space: pre; }
    .dm-res-wrap.hide-match .dm-row-match { display: none !important; }
  `;
  document.head.appendChild(sty);

  /* ── STATE & HISTORY ────────────────────────────────────────────────────── */
  var currentDiff = null;
  var historyStack = [];
  var historyIndex = -1;
  var settings = { wrap: true, hideUnchanged: false };

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

  /* ── ADVANCED DIFF ENGINE (BLOCK ALIGNMENT) ─────────────────────────────── */
  function lcsDiffAligned(textA, textB) {
    let a = textA === '' ? [] : textA.split('\n');
    let b = textB === '' ? [] : textB.split('\n');
    let matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

    // Pass 1: Standard LCS
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1] + 1;
        else matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }

    // Pass 2: Extract Operations
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

    // Pass 3: Compaction & Block Zipping (Fixes the "Staircase" bug)
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
        
        // Gather all contiguous diffs into a single block
        while (iOp < ops.length && ops[iOp].type !== 'match') {
          if (ops[iOp].type === 'remove') { localRem.push(ops[iOp].l); remCount++; }
          if (ops[iOp].type === 'add') { localAdd.push(ops[iOp].r); addCount++; }
          iOp++;
        }
        
        // Zip them together side-by-side, padding the shorter side
        let maxLen = Math.max(localRem.length, localAdd.length);
        for (let k = 0; k < maxLen; k++) {
          resA.push({
            type: k < localRem.length ? 'remove' : 'empty',
            text: k < localRem.length ? localRem[k] : '',
            blockId: blockId
          });
          resB.push({
            type: k < localAdd.length ? 'add' : 'empty',
            text: k < localAdd.length ? localAdd[k] : '',
            blockId: blockId
          });
        }
      }
    }

    return { left: resA, right: resB, stats: { add: addCount, rem: remCount, match: matchCount } };
  }

  /* ── UI LAYOUT ──────────────────────────────────────────────────────────── */
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
            
            <div class="dm-res-wrap wrap-active" id="dm-res-wrap">
              <div class="dm-res-grid">
                <div id="diff-left" class="dm-res-col"></div>
                <div id="diff-gutter" class="dm-gutter"></div>
                <div id="diff-right" class="dm-res-col"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  /* ── VIEW ROUTING & SETTINGS ────────────────────────────────────────────── */
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

  // Toggle Listeners
  $('cb-wrap').addEventListener('change', (e) => {
    settings.wrap = e.target.checked;
    $('dm-res-wrap').classList.toggle('wrap-active', settings.wrap);
  });

  $('cb-hide').addEventListener('change', (e) => {
    settings.hideUnchanged = e.target.checked;
    $('dm-res-wrap').classList.toggle('hide-match', settings.hideUnchanged);
  });

  /* ── CORE RENDER LOGIC ──────────────────────────────────────────────────── */
  function renderDiff() {
    let scrollContainer = $('dm-res-wrap');
    let savedScroll = scrollContainer ? scrollContainer.scrollTop : 0;

    currentDiff = lcsDiffAligned($('t-left').value, $('t-right').value);
    
    $('dm-stats-bar').innerHTML = 
      `<div class="dm-stats"><span class="dm-st-rem"><b>-${currentDiff.stats.rem}</b> removed (Left)</span><span class="dm-st-add"><b>+${currentDiff.stats.add}</b> added (Right)</span></div>` +
      `<div class="dm-stats"><span style="color:var(--muted)"><b>${currentDiff.stats.match}</b> unchanged lines</span></div>`;

    var leftHTML = '', gutterHTML = '', rightHTML = '';
    var lLine = 1, rLine = 1, lastBlockId = null;
    
    for (let k = 0; k < currentDiff.left.length; k++) {
      let lNode = currentDiff.left[k];
      let rNode = currentDiff.right[k];
      let bId = lNode.blockId;
      
      let isMatch = bId === null;
      let rowVisibilityCls = isMatch ? 'dm-row-match' : 'dm-row-diff';

      let lcls = lNode.type === 'remove' ? 'dm-rem' : lNode.type === 'empty' ? 'dm-empty' : '';
      let rcls = rNode.type === 'add' ? 'dm-add' : rNode.type === 'empty' ? 'dm-empty' : '';
      
      let lNum = lNode.type !== 'empty' ? lLine++ : '';
      let rNum = rNode.type !== 'empty' ? rLine++ : '';
      
      let lText = lNode.type !== 'empty' ? esc(lNode.text) : '';
      let rText = rNode.type !== 'empty' ? esc(rNode.text) : '';

      leftHTML += `<div class="dm-line ${lcls} ${rowVisibilityCls}"><span class="dm-line-num">${lNum}</span><span class="dm-line-txt" ${lNode.type !== 'empty' ? 'contenteditable="true" spellcheck="false" onblur="window._ckInlineEdit(\'left\', '+k+', this)"' : ''}>${lText}</span></div>`;
      rightHTML += `<div class="dm-line ${rcls} ${rowVisibilityCls}"><span class="dm-line-num">${rNum}</span><span class="dm-line-txt" ${rNode.type !== 'empty' ? 'contenteditable="true" spellcheck="false" onblur="window._ckInlineEdit(\'right\', '+k+', this)"' : ''}>${rText}</span></div>`;
      
      if (bId) {
        let isFirstInBlock = bId !== lastBlockId;
        lastBlockId = bId;

        // Render Action Buttons ONLY on the first line of an aligned block
        if (isFirstInBlock) {
          gutterHTML += `
            <div class="${rowVisibilityCls}" style="height:24px; display:flex; justify-content:center; align-items:flex-start; width:100%; padding: 0 4px;">
              <div class="dm-btn-grp">
                <button class="dm-btn-arrow" onclick="window._ckPushBlock(${bId}, 'toRight')" title="Take Left Block">${IC.arrowRight}</button>
                <button class="dm-btn-arrow" onclick="window._ckPushBlock(${bId}, 'toLeft')" title="Take Right Block">${IC.arrowLeft}</button>
              </div>
            </div>`;
        } else {
          gutterHTML += `<div class="${rowVisibilityCls}" style="height:24px;"></div>`;
        }
      } else {
        gutterHTML += `<div class="${rowVisibilityCls}" style="height:24px;"></div>`;
        lastBlockId = null;
      }
    }

    $('diff-left').innerHTML = leftHTML;
    $('diff-gutter').innerHTML = gutterHTML;
    $('diff-right').innerHTML = rightHTML;
    if (scrollContainer) scrollContainer.scrollTop = savedScroll;
  }

  /* ── INLINE EDITING LOGIC ───────────────────────────────────────────────── */
  window._ckInlineEdit = function(side, idx, el) {
    if (!currentDiff) return;
    let node = side === 'left' ? currentDiff.left[idx] : currentDiff.right[idx];
    let newText = el.innerText || '';
    if (node.text === newText) return; 
    node.text = newText;
    syncStateToEditors();
  };

  /* ── STATE SYNCHRONIZATION ──────────────────────────────────────────────── */
  function syncStateToEditors() {
    if (!currentDiff) return;
    // Safely reconstruct the string, ensuring empty padded lines aren't injected as newlines
    var newLeft = currentDiff.left.filter(l => l.type !== 'empty' || l.text !== '').map(l => l.text).join('\n');
    var newRight = currentDiff.right.filter(r => r.type !== 'empty' || r.text !== '').map(r => r.text).join('\n');
    $('t-left').value = newLeft; $('t-right').value = newRight;
    saveHistory(newLeft, newRight);
    renderDiff(); 
  }

  /* ── BLOCK RESOLUTION LOGIC ─────────────────────────────────────────────── */
  window._ckPushBlock = function(blockId, direction) {
    if(!currentDiff) return;
    
    let newLeft = [], newRight = [];
    
    // Reconstruct the raw arrays, substituting the block entirely
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
    renderDiff();
  };

  /* ── EXPORT ACTIONS ─────────────────────────────────────────────────────── */
  CK.wireCopy($('btn-cp-left'), function () { return $('t-left').value; });
  CK.wireCopy($('btn-cp-right'), function () { return $('t-right').value; });
})();