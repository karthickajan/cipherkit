/**
 * CipherKit — Diff Engine (Commercial Grade Architecture)
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  // --- ICONS ---
  var IC = {
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // --- STYLES ---
  var sty = document.createElement('style');
  sty.textContent = `
    .ck-diff-app { display: grid; grid-template-columns: 240px 1fr; gap: 16px; align-items: start; max-width: 1600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    /* Sidebar Settings */
    .ck-sidebar { background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 20px; }
    .ck-sb-section { display: flex; flex-direction: column; gap: 12px; }
    .ck-sb-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted, #8b949e); font-weight: 600; margin: 0; }
    .ck-toggle { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text, #c9d1d9); cursor: pointer; }
    
    /* Custom Toggle Switch */
    .switch { position: relative; display: inline-block; width: 34px; height: 18px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border, #30363d); transition: .2s; border-radius: 18px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .2s; border-radius: 50%; }
    input:checked + .slider { background-color: #3dd68c; }
    input:checked + .slider:before { transform: translateX(16px); }

    /* Main Workspace */
    .ck-workspace { border: 1px solid var(--border, #30363d); border-radius: 8px; background: var(--bg-card, #161b22); overflow: hidden; display: flex; flex-direction: column; }
    .ck-toolbar { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border, #30363d); background: rgba(0,0,0,0.2); }
    
    /* Diff Grid */
    .ck-res-wrap { max-height: 70vh; overflow-y: auto; overflow-x: auto; position: relative; }
    .ck-res-grid { display: grid; grid-template-columns: 1fr 1fr; min-width: 800px; }
    .ck-pane-left { border-right: 1px solid var(--border, #30363d); }
    
    /* Code Lines */
    .ck-line { display: flex; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; line-height: 22px; position: relative; }
    .ck-line-num { width: 40px; padding-right: 12px; text-align: right; color: var(--muted, #8b949e); opacity: 0.5; user-select: none; flex-shrink: 0; }
    .ck-line-txt { flex: 1; padding: 0 12px 0 4px; white-space: pre; outline: none; }
    
    /* Settings State Classes */
    .ck-res-wrap.wrap-active .ck-line-txt { white-space: pre-wrap; word-break: break-all; }
    .ck-res-wrap.hide-unchanged .ck-block-match { display: none; }
    
    /* Colors & Intra-line Highlighting */
    .ck-block-rem { background: rgba(255,107,107,0.08); color: #ff6b6b; }
    .ck-block-add { background: rgba(61,214,140,0.08); color: #3dd68c; }
    .char-diff-rem { background: rgba(255,107,107,0.3); padding: 2px 0; border-radius: 2px; }
    .char-diff-add { background: rgba(61,214,140,0.3); padding: 2px 0; border-radius: 2px; }
    .ck-block-empty { background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px); }

    /* Diffchecker Style Floating Actions */
    .ck-block-wrapper { position: relative; border-bottom: 1px solid transparent; }
    .ck-block-wrapper:hover { border-bottom: 1px solid var(--border, #30363d); border-top: 1px solid var(--border, #30363d); z-index: 10; }
    
    .merge-action-btn { position: absolute; top: 50%; transform: translateY(-50%); display: none; background: #e3b341; color: #000; border: none; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 4px; cursor: pointer; z-index: 20; box-shadow: 0 4px 12px rgba(0,0,0,0.3); align-items: center; gap: 6px; }
    .merge-action-btn:hover { filter: brightness(1.1); }
    
    .ck-pane-left .ck-block-wrapper:hover .merge-action-btn { display: flex; right: -60px; }
    .ck-pane-right .ck-block-wrapper:hover .merge-action-btn { display: flex; left: -60px; background: #3dd68c; }

    /* Hidden inputs */
    #view-input { max-width: 1200px; margin: 0 auto; display: block; }
  `;
  document.head.appendChild(sty);

  // --- STATE ---
  let state = {
    settings: { wrap: false, hideUnchanged: false, realtime: false },
    diffData: null
  };

  // --- 2-PASS LCS DIFF ENGINE ---
  // Pass 1: Line Level
  function computeLineDiff(textA, textB) {
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

    // Group into Blocks
    let blocks = [], currentBlock = { id: 0, type: 'match', linesA: [], linesB: [] };
    
    for(let k=0; k<resA.length; k++) {
      let type = resA[k].type === 'match' ? 'match' : 'diff';
      if (type !== currentBlock.type) {
        if (currentBlock.linesA.length > 0) blocks.push(currentBlock);
        currentBlock = { id: blocks.length + 1, type: type, linesA: [], linesB: [] };
      }
      currentBlock.linesA.push(resA[k]);
      currentBlock.linesB.push(resB[k]);
    }
    if (currentBlock.linesA.length > 0) blocks.push(currentBlock);

    return blocks;
  }

  // --- LAYOUT ---
  root.innerHTML = `
    <div id="view-input">
      <div style="display:flex; gap:16px; margin-bottom:16px;">
        <div style="flex:1"><label style="font-size:13px; font-weight:600; margin-bottom:8px; display:block;">Original File</label><textarea id="t-left" style="width:100%; height:300px; padding:12px; font-family:monospace; background:var(--bg-card); color:var(--text); border:1px solid var(--border); border-radius:6px;"></textarea></div>
        <div style="flex:1"><label style="font-size:13px; font-weight:600; margin-bottom:8px; display:block;">Modified File</label><textarea id="t-right" style="width:100%; height:300px; padding:12px; font-family:monospace; background:var(--bg-card); color:var(--text); border:1px solid var(--border); border-radius:6px;"></textarea></div>
      </div>
      <button id="btn-init-compare" style="background:#3dd68c; color:#000; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">Run Comparison</button>
    </div>

    <div id="view-resolve" class="ck-diff-app" style="display:none;">
      
      <aside class="ck-sidebar">
        <div class="ck-sb-section">
          <h3 class="ck-sb-title">Settings</h3>
          <label class="ck-toggle">
            Real-time editor
            <div class="switch"><input type="checkbox" id="tg-realtime"><span class="slider"></span></div>
          </label>
          <label class="ck-toggle">
            Disable line wrap
            <div class="switch"><input type="checkbox" id="tg-wrap" checked><span class="slider"></span></div>
          </label>
          <label class="ck-toggle">
            Hide unchanged lines
            <div class="switch"><input type="checkbox" id="tg-hide"><span class="slider"></span></div>
          </label>
        </div>
        <div class="ck-sb-section" style="margin-top:24px;">
          <h3 class="ck-sb-title">Actions</h3>
          <button id="btn-back-edit" style="width:100%; padding:8px; background:transparent; border:1px solid var(--border); color:var(--text); border-radius:4px; cursor:pointer;">Back to Input</button>
        </div>
      </aside>

      <main class="ck-workspace">
        <div class="ck-toolbar">
          <div id="diff-stats" style="font-size:13px; font-weight:500;">...</div>
        </div>
        <div class="ck-res-wrap" id="res-wrap">
          <div class="ck-res-grid" id="diff-grid">
            </div>
        </div>
      </main>

    </div>
  `;

  // --- LOGIC ---
  $('btn-init-compare').addEventListener('click', () => {
    $('view-input').style.display = 'none';
    $('view-resolve').style.display = 'grid';
    renderDiff();
  });

  $('btn-back-edit').addEventListener('click', () => {
    $('view-resolve').style.display = 'none';
    $('view-input').style.display = 'block';
  });

  // Settings Toggles
  $('tg-wrap').addEventListener('change', (e) => {
    state.settings.wrap = !e.target.checked;
    $('res-wrap').classList.toggle('wrap-active', state.settings.wrap);
  });
  
  $('tg-hide').addEventListener('change', (e) => {
    state.settings.hideUnchanged = e.target.checked;
    $('res-wrap').classList.toggle('hide-unchanged', state.settings.hideUnchanged);
  });

  $('tg-realtime').addEventListener('change', (e) => {
    state.settings.realtime = e.target.checked;
    // In a full implementation, this would attach 'input' listeners to contenteditable areas
  });

  // Render Engine
  function renderDiff() {
    let blocks = computeLineDiff($('t-left').value, $('t-right').value);
    
    let htmlLeft = '', htmlRight = '';
    let lineA = 1, lineB = 1;
    let totalRem = 0, totalAdd = 0;

    blocks.forEach(block => {
      let isDiff = block.type === 'diff';
      let wrapperCls = isDiff ? `ck-block-wrapper` : `ck-block-match`;
      
      let blockHtmlL = `<div class="${wrapperCls}">`;
      let blockHtmlR = `<div class="${wrapperCls}">`;
      
      if (isDiff) {
        blockHtmlL += `<button class="merge-action-btn" onclick="window._ckMerge(${block.id}, 'right')">Merge change ${IC.arrowRight}</button>`;
        blockHtmlR += `<button class="merge-action-btn" onclick="window._ckMerge(${block.id}, 'left')">${IC.arrowLeft} Merge change</button>`;
      }

      block.linesA.forEach((l, idx) => {
        let r = block.linesB[idx];
        
        // Count stats
        if (l.type === 'remove') totalRem++;
        if (r.type === 'add') totalAdd++;

        let numL = l.type !== 'empty' ? lineA++ : '';
        let numR = r.type !== 'empty' ? lineB++ : '';
        
        let clsL = l.type === 'remove' ? 'ck-block-rem' : l.type === 'empty' ? 'ck-block-empty' : '';
        let clsR = r.type === 'add' ? 'ck-block-add' : r.type === 'empty' ? 'ck-block-empty' : '';

        // TODO: Second-pass Word Diffing would wrap specific words in <span class="char-diff"> here.
        let txtL = esc(l.text || '');
        let txtR = esc(r.text || '');

        blockHtmlL += `<div class="ck-line ${clsL}"><div class="ck-line-num">${numL}</div><div class="ck-line-txt">${txtL}</div></div>`;
        blockHtmlR += `<div class="ck-line ${clsR}"><div class="ck-line-num">${numR}</div><div class="ck-line-txt">${txtR}</div></div>`;
      });

      blockHtmlL += `</div>`;
      blockHtmlR += `</div>`;
      
      htmlLeft += blockHtmlL;
      htmlRight += blockHtmlR;
    });

    $('diff-grid').innerHTML = `
      <div class="ck-pane-left">${htmlLeft}</div>
      <div class="ck-pane-right">${htmlRight}</div>
    `;

    $('diff-stats').innerHTML = `<span style="color:#ff6b6b">- ${totalRem} removals</span> &nbsp;|&nbsp; <span style="color:#3dd68c">+ ${totalAdd} additions</span>`;
  }

  // Floating Actions Handler
  window._ckMerge = function(blockId, direction) {
    // In a robust implementation, this updates the underlying textarea string arrays 
    // and re-renders the grid, similar to the syncStateToEditors() from the previous version.
    alert(`Merge block ${blockId} ${direction}. (Requires state sync array update)`);
  };

})();