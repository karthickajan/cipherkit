/**
 * CipherKit — 2-Pane Interactive Text Diff & Merge (VS Code Style)
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
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ── SCOPED STYLES ──────────────────────────────────────────────────────── */
  var sty = document.createElement('style');
  sty.textContent = 
    '.dm-pane { flex: 1; display: flex; flex-direction: column; gap: 8px; }' +
    '.dm-res-grid { display: grid; grid-template-columns: 1fr 40px 1fr; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }' +
    '.dm-res-col { overflow-x: auto; font-family: var(--mono); font-size: 13px; line-height: 1.6; padding: 12px 0; }' +
    '.dm-gutter { background: rgba(0,0,0,0.2); border-left: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 12px 0; }' +
    '.dm-line { display: flex; align-items: center; min-height: 24px; padding: 0 12px; white-space: pre; }' +
    '.dm-line-num { opacity: 0.4; font-size: 10px; width: 24px; text-align: right; margin-right: 12px; user-select: none; }' +
    '.dm-add { background: rgba(61,214,140,0.12); color: #3dd68c; }' +
    '.dm-rem { background: rgba(255,107,107,0.12); color: #ff6b6b; }' +
    '.dm-empty { background: rgba(255,255,255,0.02); }' +
    '.dm-btn-arrow { background: none; border: none; color: var(--muted); cursor: pointer; height: 24px; width: 100%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }' +
    '.dm-btn-arrow:hover { color: var(--text); background: rgba(255,255,255,0.1); }';
  document.head.appendChild(sty);

  /* ── LCS DIFF ALGORITHM ─────────────────────────────────────────────────── */
  function lcsDiff(textA, textB) {
    var a = textA === '' ? [] : textA.split('\n');
    var b = textB === '' ? [] : textB.split('\n');
    var matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
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
    return { left: resA, right: resB };
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
    +         '<div class="dm-pane"><div class="field-hdr"><label for="t-left">Left Editor (Original)</label></div><textarea id="t-left" placeholder="Paste left text..." rows="14" class="mono"></textarea></div>'
    +         '<div class="dm-pane"><div class="field-hdr"><label for="t-right">Right Editor (Modified)</label></div><textarea id="t-right" placeholder="Paste right text..." rows="14" class="mono"></textarea></div>'
    +       '</div>'
    +       '<div style="display:flex; justify-content:space-between;">'
    +         '<button type="button" class="act-btn act-amber" id="btn-compare">' + IC.diff + ' <span>Compare & Resolve Workspace</span></button>'
    +         '<button type="button" class="pill-btn" id="btn-clr">' + IC.trash + ' <span>Clear All</span></button>'
    +       '</div>'
    +     '</div>'

    // VIEW 2: Resolution Workspace
    +     '<div id="view-resolve" style="display:none;">'
    +       '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">'
    +         '<div style="display:flex; gap:12px;">'
    +           '<button type="button" class="pill-btn" id="btn-back">' + IC.edit + ' <span>Back to Editors</span></button>'
    +         '</div>'
    +         '<div style="display:flex; gap:12px;">'
    +           '<button type="button" class="pill-btn" id="btn-cp-left" title="Copy Left Code">' + IC.copy + ' <span>Copy Left</span></button>'
    +           '<button type="button" class="pill-btn" id="btn-cp-right" title="Copy Right Code">' + IC.copy + ' <span>Copy Right</span></button>'
    +         '</div>'
    +       '</div>'
    +       '<div class="dm-res-grid">'
    +         '<div id="diff-left" class="dm-res-col"></div>'
    +         '<div id="diff-gutter" class="dm-gutter"></div>'
    +         '<div id="diff-right" class="dm-res-col"></div>'
    +       '</div>'
    +     '</div>'

    +   '</div>'
    + '</div>'
    + '</div>';

  var currentDiff = null;

  /* ── VIEW ROUTING ───────────────────────────────────────────────────────── */
  function showResolveView() { $('view-input').style.display = 'none'; $('view-resolve').style.display = 'block'; }
  function showInputView() { $('view-input').style.display = 'block'; $('view-resolve').style.display = 'none'; }

  $('btn-clr').addEventListener('click', function () { $('t-left').value=''; $('t-right').value=''; });
  $('btn-back').addEventListener('click', showInputView);

  $('btn-compare').addEventListener('click', function () {
    renderDiff();
    showResolveView();
    if (typeof CK !== 'undefined' && CK.toast) CK.toast('Resolution workspace ready');
  });

  /* ── CORE RENDER LOGIC ──────────────────────────────────────────────────── */
  function renderDiff() {
    var leftVal = $('t-left').value;
    var rightVal = $('t-right').value;
    currentDiff = lcsDiff(leftVal, rightVal);
    
    var leftHTML = '', gutterHTML = '', rightHTML = '';
    var lLine = 1, rLine = 1;
    
    for (let k = 0; k < currentDiff.left.length; k++) {
      let lNode = currentDiff.left[k];
      let rNode = currentDiff.right[k];
      
      let lcls = lNode.type === 'remove' ? 'dm-rem' : lNode.type === 'empty' ? 'dm-empty' : '';
      let rcls = rNode.type === 'add' ? 'dm-add' : rNode.type === 'empty' ? 'dm-empty' : '';
      
      let lNum = lNode.type !== 'empty' ? lLine++ : '';
      let rNum = rNode.type !== 'empty' ? rLine++ : '';

      leftHTML += `<div class="dm-line ${lcls}"><span class="dm-line-num">${lNum}</span>${esc(lNode.text)}</div>`;
      rightHTML += `<div class="dm-line ${rcls}"><span class="dm-line-num">${rNum}</span>${esc(rNode.text)}</div>`;
      
      if (lNode.type === 'remove' || rNode.type === 'add') {
        gutterHTML += `
          <div style="height:24px; display:flex; width:100%;">
            <button class="dm-btn-arrow" onclick="window._ckPushRight(${k})" title="Push Left to Right">${IC.arrowRight}</button>
            <button class="dm-btn-arrow" onclick="window._ckPushLeft(${k})" title="Push Right to Left">${IC.arrowLeft}</button>
          </div>`;
      } else {
        gutterHTML += `<div style="height:24px;"></div>`;
      }
    }

    $('diff-left').innerHTML = leftHTML;
    $('diff-gutter').innerHTML = gutterHTML;
    $('diff-right').innerHTML = rightHTML;
  }

  /* ── STATE SYNCHRONIZATION ──────────────────────────────────────────────── */
  function syncStateToEditors() {
    if (!currentDiff) return;
    $('t-left').value = currentDiff.left.filter(l => l.type !== 'empty').map(l => l.text).join('\n');
    $('t-right').value = currentDiff.right.filter(r => r.type !== 'empty').map(r => r.text).join('\n');
    renderDiff(); // Instantly recalculate from the newly synced text
  }

  /* ── PUSH ACTIONS (The magic happens here) ──────────────────────────────── */
  window._ckPushRight = function(idx) {
    if(!currentDiff) return;
    let lNode = currentDiff.left[idx];
    let rNode = currentDiff.right[idx];

    if (lNode.type === 'remove') {
      rNode.text = lNode.text;
      rNode.type = 'match';
      lNode.type = 'match';
    } else if (rNode.type === 'add') {
      rNode.text = '';
      rNode.type = 'empty';
    }
    syncStateToEditors();
  };

  window._ckPushLeft = function(idx) {
    if(!currentDiff) return;
    let lNode = currentDiff.left[idx];
    let rNode = currentDiff.right[idx];

    if (rNode.type === 'add') {
      lNode.text = rNode.text;
      lNode.type = 'match';
      rNode.type = 'match';
    } else if (lNode.type === 'remove') {
      lNode.text = '';
      lNode.type = 'empty';
    }
    syncStateToEditors();
  };

  /* ── EXPORT ACTIONS ─────────────────────────────────────────────────────── */
  CK.wireCopy($('btn-cp-left'), function () { return $('t-left').value; });
  CK.wireCopy($('btn-cp-right'), function () { return $('t-right').value; });

  if (typeof CK !== 'undefined' && CK.setUsageContent) {
    CK.setUsageContent('<ol><li>Paste your text into the <strong>Left</strong> and <strong>Right</strong> editors.</li><li>Click <strong>Compare & Resolve</strong> to enter the workspace.</li><li>Use the center arrows to sync code: <br>➔ Pushes Left changes into the Right pane.<br>⬅ Pushes Right changes into the Left pane.</li><li>Your edits update the underlying editors in real-time. Click <strong>Back to Editors</strong> if you need to type manually.</li></ol>');
  }
})();
