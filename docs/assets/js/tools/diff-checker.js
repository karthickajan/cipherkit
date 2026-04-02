/**
 * CipherKit — 2-Pane Interactive Text Diff & Merge (Pro Architecture)
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
  sty.textContent = 
    '.dm-pane { flex: 1; display: flex; flex-direction: column; gap: 8px; }' +
    
    /* Unified scroll wrapper */
    '.dm-res-wrap { max-height: 65vh; overflow-y: auto; overflow-x: hidden; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; display: flex; flex-direction: column; }' +
    '.dm-sticky-hdr { position: sticky; top: 0; display: flex; justify-content: space-between; padding: 12px 16px; background: var(--bg-body); border-bottom: 1px solid var(--border); font-size: 13px; z-index: 10; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }' +
    
    /* Grid layout - stretches to natural content height */
    '.dm-res-grid { display: grid; grid-template-columns: 1fr 50px 1fr; min-height: min-content; }' +
    '.dm-res-col { overflow-x: auto; padding: 12px 0; font-family: var(--mono); font-size: 13px; line-height: 24px; }' +
    '.dm-col-inner { min-width: max-content; }' + /* Fixes horizontal scroll color clip */
    
    /* Gutter - NO scroll properties, naturally matches height of neighbors */
    '.dm-gutter { background: rgba(0,0,0,0.2); border-left: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0; }' +
    
    /* Lines & Highlighting */
    '.dm-line { display: flex; align-items: flex-start; height: 24px; padding: 0 12px; box-sizing: border-box; }' +
    '.dm-line-num { opacity: 0.4; font-size: 11px; width: 36px; flex-shrink: 0; text-align: right; margin-right: 16px; user-select: none; font-variant-numeric: tabular-nums; }' +
    '.dm-line-txt { white-space: pre; }' +
    '.dm-add { background: rgba(61,214,140,0.12); color: #3dd68c; }' +
    '.dm-rem { background: rgba(255,107,107,0.12); color: #ff6b6b; }' +
    '.dm-empty { background: rgba(255,255,255,0.02); }' +
    
    /* Action Buttons */
    '.dm-btn-grp { display: flex; width: 100%; height: 24px; justify-content: space-evenly; align-items: center; background: rgba(255,255,255,0.05); border-radius: 4px; padding: 0 4px; }' +
    '.dm-btn-arrow { background: none; border: none; color: var(--muted); cursor: pointer; height: 20px; width: 20px; display: flex; align-items: center; justify-content: center; transition: 0.2s; padding: 2px; }' +
    '.dm-btn-arrow:hover { color: var(--text); background: rgba(255,255,255,0.15); border-radius: 4px; }' +
    '.dm-history-btn:disabled { opacity: 0.3; cursor: not-allowed; }' +
    '.dm-st-add { color: #3dd68c; margin-right: 12px; } .dm-st-rem { color: #ff6b6b; margin-right: 12px; } .dm-stats b { font-weight: 700; }';
  document.head.appendChild(sty);

  /* ── STATE & HISTORY ────────────────────────────────────────────────────── */
  var currentDiff = null;
  var historyStack = [];
  var historyIndex = -1;

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
    if(btn.id === 'btn-undo' && historyIndex > 0) {
      historyIndex--;
      restoreHistoryState();
    } else if(btn.id === 'btn-redo' && historyIndex < historyStack.length - 1) {
      historyIndex++;
      restoreHistoryState();
    }
  });

  function restoreHistoryState() {
    var state = historyStack[historyIndex];
    $('t-left').value = state.l;
    $('t-right').value = state.r;
    renderDiff();
  }

  /* ── LCS DIFF ENGINE (WITH BLOCK GROUPING) ──────────────────────────────── */
  function lcsDiff(textA, textB) {
    var a = textA === '' ? [] : textA.split('\n');
    var b = textB === '' ? [] : textB.split('\n');
    var matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1] + 1;
        else matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }

    let i = a.length, j = b.length;
    let resA = [], resB = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        resA.unshift({ text: a[i - 1], type: 'match' });
        resB.unshift({ text: b[j - 1], type: 'match' });
        i--; j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        resA.unshift({ text: '', type: 'empty' });
        resB.unshift({ text: b[j - 1], type: 'add' });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        resA.unshift({ text: a[i - 1], type: 'remove' });
        resB.unshift({ text: '', type: 'empty' });
        i--;
      }
    }

    // Assign Block IDs to contiguous differences
    let blockId = 0, inDiff = false;
    let addCount = 0, remCount = 0, matchCount = 0;

    for (let k = 0; k < resA.length; k++) {
      if (resA[k].type !== 'match' || resB[k].type !== 'match') {
        if (!inDiff) { blockId++; inDiff = true; }
        resA[k].blockId = blockId;
        resB[k].blockId = blockId;
      } else {
        inDiff = false;
        matchCount++;
      }
      if (resA[k].type === 'remove') remCount++;
      if (resB[k].type === 'add') addCount++;
    }

    return { left: resA, right: resB, stats: { add: addCount, rem: remCount, match: matchCount } };
  }

  /* ── UI LAYOUT ──────────────────────────────────────────────────────────── */
  root.innerHTML =
    '<div class="tool-single-col" style="max-width: 1400px; margin: 0 auto;">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.diff + '</div><h2 id="t-heading">Interactive Diff & Merge</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">2-Pane Editor</span>'
    +   '</div>'
    +   '<div class="tc-body">'
    
    // VIEW 1: Input Editors
    +     '<div id="view-input">'
    +       '<div style="display:flex; gap:16px; margin-bottom:16px;">'
    +         '<div class="dm-pane"><div class="field-hdr"><label for="t-left">Left Editor (Original)</label></div><textarea id="t-left" placeholder="Paste left text..." rows="16" class="mono"></textarea></div>'
    +         '<div class="dm-pane"><div class="field-hdr"><label for="t-right">Right Editor (Modified)</label></div><textarea id="t-right" placeholder="Paste right text..." rows="16" class="mono"></textarea></div>'
    +       '</div>'
    +       '<div style="display:flex; justify-content:space-between;">'
    +         '<button type="button" class="act-btn act-amber" id="btn-compare">' + IC.diff + ' <span>Compare & Resolve Workspace</span></button>'
    +         '<button type="button" class="pill-btn" id="btn-clr">' + IC.trash + ' <span>Clear All</span></button>'
    +       '</div>'
    +     '</div>'

    // VIEW 2: Resolution Workspace
    +     '<div id="view-resolve" style="display:none;">'
    +       '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">'
    +         '<div style="display:flex; gap:12px; align-items:center;">'
    +           '<button type="button" class="pill-btn" id="btn-back">' + IC.edit + ' <span>Edit Manually</span></button>'
    +           '<div style="width:1px; height:20px; background:var(--border); margin: 0 4px;"></div>'
    +           '<button type="button" class="pill-btn dm-history-btn" id="btn-undo" title="Undo Last Merge" disabled>' + IC.undo + '</button>'
    +           '<button type="button" class="pill-btn dm-history-btn" id="btn-redo" title="Redo Merge" disabled>' + IC.redo + '</button>'
    +         '</div>'
    +         '<div style="display:flex; gap:12px;">'
    +           '<button type="button" class="pill-btn" id="btn-cp-left">' + IC.copy + ' <span>Copy Left</span></button>'
    +           '<button type="button" class="pill-btn" id="btn-cp-right">' + IC.copy + ' <span>Copy Right</span></button>'
    +         '</div>'
    +       '</div>'
    
    // Unified Vertical Scroll Wrapper
    +       '<div class="dm-res-wrap">'
    +         '<div class="dm-sticky-hdr" id="dm-stats-bar">Stats Loading...</div>'
    +         '<div class="dm-res-grid">'
    +           '<div id="diff-left" class="dm-res-col"><div class="dm-col-inner" id="diff-left-inner"></div></div>'
    +           '<div id="diff-gutter" class="dm-gutter"></div>'
    +           '<div id="diff-right" class="dm-res-col"><div class="dm-col-inner" id="diff-right-inner"></div></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'

    +   '</div>'
    + '</div>'
    + '</div>';

  /* ── VIEW ROUTING ───────────────────────────────────────────────────────── */
  function showResolveView() { $('view-input').style.display = 'none'; $('view-resolve').style.display = 'block'; }
  function showInputView() { $('view-input').style.display = 'block'; $('view-resolve').style.display = 'none'; }

  $('btn-clr').addEventListener('click', function () { 
    $('t-left').value=''; $('t-right').value=''; 
    historyStack = []; historyIndex = -1; updateHistoryButtons();
  });
  
  $('btn-back').addEventListener('click', showInputView);

  $('btn-compare').addEventListener('click', function () {
    if(historyIndex === -1) saveHistory($('t-left').value, $('t-right').value);
    renderDiff();
    showResolveView();
  });

  /* ── CORE RENDER LOGIC ──────────────────────────────────────────────────── */
  function renderDiff() {
    var leftVal = $('t-left').value;
    var rightVal = $('t-right').value;
    currentDiff = lcsDiff(leftVal, rightVal);
    
    $('dm-stats-bar').innerHTML = 
      `<div class="dm-stats"><span class="dm-st-rem"><b>-${currentDiff.stats.rem}</b> removed (Left)</span><span class="dm-st-add"><b>+${currentDiff.stats.add}</b> added (Right)</span></div>` +
      `<div class="dm-stats"><span style="color:var(--muted)"><b>${currentDiff.stats.match}</b> unchanged lines</span></div>`;

    var leftHTML = '', gutterHTML = '', rightHTML = '';
    var lLine = 1, rLine = 1;
    var lastBlockId = null;
    
    for (let k = 0; k < currentDiff.left.length; k++) {
      let lNode = currentDiff.left[k];
      let rNode = currentDiff.right[k];
      let bId = lNode.blockId || rNode.blockId;
      
      let lcls = lNode.type === 'remove' ? 'dm-rem' : lNode.type === 'empty' ? 'dm-empty' : '';
      let rcls = rNode.type === 'add' ? 'dm-add' : rNode.type === 'empty' ? 'dm-empty' : '';
      
      let lNum = lNode.type !== 'empty' ? lLine++ : '';
      let rNum = rNode.type !== 'empty' ? rLine++ : '';

      leftHTML += `<div class="dm-line ${lcls}"><span class="dm-line-num">${lNum}</span><span class="dm-line-txt">${lNode.type !== 'empty' ? esc(lNode.text) || ' ' : ''}</span></div>`;
      rightHTML += `<div class="dm-line ${rcls}"><span class="dm-line-num">${rNum}</span><span class="dm-line-txt">${rNode.type !== 'empty' ? esc(rNode.text) || ' ' : ''}</span></div>`;
      
      if (bId) {
        let isFirstInBlock = bId !== lastBlockId;
        lastBlockId = bId;

        if (isFirstInBlock) {
          gutterHTML += `
            <div style="height:24px; display:flex; justify-content:center; align-items:center; width:100%; padding: 0 4px;">
              <div class="dm-btn-grp">
                <button class="dm-btn-arrow" onclick="window._ckPushBlock(${bId}, 'toRight')" title="Accept Left Block">${IC.arrowRight}</button>
                <button class="dm-btn-arrow" onclick="window._ckPushBlock(${bId}, 'toLeft')" title="Accept Right Block">${IC.arrowLeft}</button>
              </div>
            </div>`;
        } else {
          gutterHTML += `<div style="height:24px;"></div>`;
        }
      } else {
        gutterHTML += `<div style="height:24px;"></div>`;
        lastBlockId = null;
      }
    }

    $('diff-left-inner').innerHTML = leftHTML;
    $('diff-gutter').innerHTML = gutterHTML;
    $('diff-right-inner').innerHTML = rightHTML;
  }

  /* ── STATE SYNCHRONIZATION ──────────────────────────────────────────────── */
  function syncStateToEditors() {
    if (!currentDiff) return;
    var newLeft = currentDiff.left.filter(l => l.type !== 'empty').map(l => l.text).join('\n');
    var newRight = currentDiff.right.filter(r => r.type !== 'empty').map(r => r.text).join('\n');
    $('t-left').value = newLeft;
    $('t-right').value = newRight;
    saveHistory(newLeft, newRight);
    renderDiff(); 
  }

  /* ── FLAWLESS BLOCK ACTIONS ─────────────────────────────────────────────── */
  window._ckPushBlock = function(blockId, direction) {
    if(!currentDiff) return;
    
    currentDiff.left.forEach((lNode, i) => {
      let rNode = currentDiff.right[i];
      let bId = lNode.blockId || rNode.blockId;

      if (bId === blockId) {
        if (direction === 'toRight') {
          // Force Right to perfectly mirror Left
          if (lNode.type === 'remove') { rNode.text = lNode.text; rNode.type = 'match'; lNode.type = 'match'; } 
          else if (rNode.type === 'add') { rNode.text = ''; rNode.type = 'empty'; }
        } else {
          // Force Left to perfectly mirror Right
          if (rNode.type === 'add') { lNode.text = rNode.text; lNode.type = 'match'; rNode.type = 'match'; } 
          else if (lNode.type === 'remove') { lNode.text = ''; lNode.type = 'empty'; }
        }
      }
    });
    syncStateToEditors();
  };

  /* ── EXPORT ACTIONS ─────────────────────────────────────────────────────── */
  CK.wireCopy($('btn-cp-left'), function () { return $('t-left').value; });
  CK.wireCopy($('btn-cp-right'), function () { return $('t-right').value; });

  if (typeof CK !== 'undefined' && CK.setUsageContent) {
    CK.setUsageContent('<ol><li>Paste text into <strong>Left</strong> and <strong>Right</strong>.</li><li>Click <strong>Compare</strong> to enter the workspace.</li><li>Use the arrows in the gutter to resolve conflicts.<br>➔ Push <strong>Entire Block Right</strong>.<br>⬅ Push <strong>Entire Block Left</strong>.</li><li>Use <strong>Undo/Redo</strong> if you make a mistake, or click <strong>Edit Manually</strong> to type directly.</li></ol>');
  }
})();