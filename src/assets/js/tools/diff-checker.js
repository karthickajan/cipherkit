/**
 * CipherKit — Text Diff Checker
 * VS Code-style side-by-side split view with LCS diff algorithm
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    diff:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="M18 6H6"/><path d="M18 18H6"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  /* ── Inject scoped CSS ─────────────────────────────────────── */
  var styleTag = document.createElement('style');
  styleTag.textContent = [
    '.diff-split{display:flex;gap:12px;min-height:0}',
    '.diff-split>div{flex:1;min-width:0}',
    '.diff-pane{font-family:"Courier New",monospace;font-size:12px;line-height:1.6;overflow:auto;max-height:400px;resize:vertical;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:0}',
    '.diff-line{display:flex;align-items:stretch;min-width:0}',
    '.diff-ln{min-width:36px;padding:0 8px;text-align:right;color:var(--muted);background:rgba(0,0,0,.2);user-select:none;flex-shrink:0;font-size:11px;line-height:1.6;border-right:1px solid var(--border)}',
    '.diff-text{padding:0 10px;white-space:pre-wrap;word-break:break-all;flex:1;min-width:0}',
    '.diff-removed{background:rgba(255,80,80,.15);color:#ff8080}',
    '.diff-added{background:rgba(61,214,140,.12);color:#3dd68c}',
    '.diff-unchanged{color:var(--muted)}',
    '.diff-empty{background:rgba(100,100,100,.05);color:transparent}',
    '.diff-action-bar{display:none;gap:10px;margin-bottom:8px;align-items:center;flex-wrap:wrap}',
    '.diff-action-bar.visible{display:flex}',
    '.diff-stats{font-size:12px;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap;margin-top:8px}',
    '.stat-added{color:#3dd68c;font-weight:700}',
    '.stat-removed{color:#ff6b6b;font-weight:700}',
    '.stat-unchanged{color:var(--muted)}',
    '.diff-panel-header{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}',
    '@media(max-width:640px){.diff-split{flex-direction:column!important}}'
  ].join('\n');
  document.head.appendChild(styleTag);

  /* ── Sample data ───────────────────────────────────────────── */
  var SAMPLE_LEFT = 'function greet(name) {\n  console.log("Hello, " + name);\n  return true;\n}\n\nconst user = "Alice";\ngreet(user);';
  var SAMPLE_RIGHT = 'function greet(name, greeting = "Hello") {\n  console.log(greeting + ", " + name + "!");\n  return name;\n}\n\nconst user = "Bob";\ngreet(user, "Hi");';

  /* ── Build UI ──────────────────────────────────────────────── */
  root.innerHTML =
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.diff + '</div><h2 id="t-heading">Diff Checker</h2></div><span class="tc-badge tc-badge-amber">Compare</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'

    /* --- Input textareas (side-by-side) --- */
    + '<div class="diff-split">'
    +   '<div>'
    +     '<div class="diff-panel-header"><span>Original (Left)</span></div>'
    +     '<textarea id="t-left" placeholder="Paste original text\u2026" rows="10" class="mono" style="width:100%;resize:vertical;min-height:200px"></textarea>'
    +   '</div>'
    +   '<div>'
    +     '<div class="diff-panel-header"><span>Changed (Right)</span><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div>'
    +     '<textarea id="t-right" placeholder="Paste changed text\u2026" rows="10" class="mono" style="width:100%;resize:vertical;min-height:200px"></textarea>'
    +   '</div>'
    + '</div>'

    /* --- Compare button --- */
    + '<button type="button" class="act-btn act-amber" id="btn-compare" aria-label="Compare">' + IC.diff + ' <span>Compare</span></button>'
    + '<div class="shortcut-hint">\u2318/Ctrl + Enter to compare</div>'

    /* --- Action bar (hidden until compared) --- */
    + '<div class="diff-action-bar" id="diff-action-bar">'
    +   '<button type="button" class="pill-btn" id="btn-use-left">\u2190 Use Left</button>'
    +   '<button type="button" class="pill-btn" id="btn-use-right">Use Right \u2192</button>'
    +   '<div style="flex:1"></div>'
    +   '<button type="button" class="pill-btn" id="btn-cp-left">' + IC.copy + ' <span>Copy Left</span></button>'
    +   '<button type="button" class="pill-btn" id="btn-cp-right">' + IC.copy + ' <span>Copy Right</span></button>'
    +   '<button type="button" class="pill-btn" id="btn-dl-diff">' + IC.dl + ' <span>Download .diff</span></button>'
    + '</div>'

    /* --- Result panels (side-by-side) --- */
    + '<div class="diff-split" id="diff-result-wrap" style="display:none">'
    +   '<div>'
    +     '<div class="diff-panel-header"><span>Original</span></div>'
    +     '<div class="diff-pane" id="diff-left" role="status"></div>'
    +   '</div>'
    +   '<div>'
    +     '<div class="diff-panel-header"><span>Changed</span></div>'
    +     '<div class="diff-pane" id="diff-right" role="status"></div>'
    +   '</div>'
    + '</div>'

    /* --- Stats --- */
    + '<div class="diff-stats" id="diff-stats"></div>'

    + '</div></div></div>';

  /* ── Helpers ────────────────────────────────────────────────── */
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── LCS Diff Algorithm ─────────────────────────────────────── */
  function computeDiff(originalLines, changedLines) {
    var m = originalLines.length, n = changedLines.length;
    var dp = [];
    var i, j;
    for (i = 0; i <= m; i++) {
      dp[i] = new Array(n + 1);
      for (j = 0; j <= n; j++) dp[i][j] = 0;
    }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        if (originalLines[i - 1] === changedLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    var leftLines = [];
    var rightLines = [];
    i = m; j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === changedLines[j - 1]) {
        leftLines.unshift({ type: 'unchanged', text: originalLines[i - 1], ln: i });
        rightLines.unshift({ type: 'unchanged', text: changedLines[j - 1], ln: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        leftLines.unshift({ type: 'empty', text: '', ln: null });
        rightLines.unshift({ type: 'added', text: changedLines[j - 1], ln: j });
        j--;
      } else {
        leftLines.unshift({ type: 'removed', text: originalLines[i - 1], ln: i });
        rightLines.unshift({ type: 'empty', text: '', ln: null });
        i--;
      }
    }

    return { leftLines: leftLines, rightLines: rightLines };
  }

  /* ── Render a diff panel ────────────────────────────────────── */
  function renderPanel(lines) {
    return lines.map(function (line) {
      var textCls = 'diff-text ';
      if (line.type === 'removed') textCls += 'diff-removed';
      else if (line.type === 'added') textCls += 'diff-added';
      else if (line.type === 'empty') textCls += 'diff-empty';
      else textCls += 'diff-unchanged';

      var ln = line.ln !== null
        ? '<span class="diff-ln">' + line.ln + '</span>'
        : '<span class="diff-ln">&nbsp;</span>';

      var prefix = line.type === 'removed' ? '\u2212 '
                 : line.type === 'added'   ? '+ '
                 : '  ';

      var content = line.type === 'empty' ? '&nbsp;' : escapeHtml(line.text);

      return '<div class="diff-line">'
        + ln
        + '<span class="' + textCls + '">'
        + prefix + content
        + '</span></div>';
    }).join('');
  }

  /* ── State ──────────────────────────────────────────────────── */
  var lastDiff = null;

  /* ── Run diff ───────────────────────────────────────────────── */
  function runDiff() {
    var left = $('t-left').value;
    var right = $('t-right').value;

    if (!left && !right) {
      $('diff-result-wrap').style.display = 'none';
      $('diff-action-bar').className = 'diff-action-bar';
      $('diff-stats').innerHTML = '';
      return;
    }

    var origLines = left.split('\n');
    var changedLines = right.split('\n');
    var result = computeDiff(origLines, changedLines);
    lastDiff = result;

    $('diff-left').innerHTML = renderPanel(result.leftLines);
    $('diff-right').innerHTML = renderPanel(result.rightLines);
    $('diff-result-wrap').style.display = '';
    $('diff-action-bar').className = 'diff-action-bar visible';

    /* Stats */
    var added = 0, removed = 0, unchanged = 0;
    for (var k = 0; k < result.leftLines.length; k++) {
      var lt = result.leftLines[k].type;
      var rt = result.rightLines[k].type;
      if (lt === 'removed') removed++;
      if (rt === 'added') added++;
      if (lt === 'unchanged') unchanged++;
    }

    $('diff-stats').innerHTML =
      '<span class="stat-added">+' + added + ' added</span>'
      + '<span class="stat-removed">\u2212' + removed + ' removed</span>'
      + '<span class="stat-unchanged">=' + unchanged + ' unchanged</span>';

    CK.toast('Diff computed');
  }

  /* ── Compare button ─────────────────────────────────────────── */
  $('btn-compare').addEventListener('click', runDiff);

  /* ── Clear ──────────────────────────────────────────────────── */
  $('btn-clr').addEventListener('click', function () {
    $('t-left').value = '';
    $('t-right').value = '';
    $('diff-result-wrap').style.display = 'none';
    $('diff-action-bar').className = 'diff-action-bar';
    $('diff-stats').innerHTML = '';
    lastDiff = null;
  });

  /* ── Use Left / Use Right ───────────────────────────────────── */
  $('btn-use-left').addEventListener('click', function () {
    $('t-right').value = $('t-left').value;
    runDiff();
    CK.toast('Left copied to Right');
  });
  $('btn-use-right').addEventListener('click', function () {
    $('t-left').value = $('t-right').value;
    runDiff();
    CK.toast('Right copied to Left');
  });

  /* ── Copy left/right result ─────────────────────────────────── */
  function extractText(lines) {
    return lines.filter(function (l) { return l.type !== 'empty'; })
      .map(function (l) { return l.text; }).join('\n');
  }

  CK.wireCopy($('btn-cp-left'), function () {
    if (!lastDiff) return '';
    return extractText(lastDiff.leftLines);
  });
  CK.wireCopy($('btn-cp-right'), function () {
    if (!lastDiff) return '';
    return extractText(lastDiff.rightLines);
  });

  /* ── Download unified diff ──────────────────────────────────── */
  $('btn-dl-diff').addEventListener('click', function () {
    if (!lastDiff) return;
    var lines = ['--- Original', '+++ Changed'];
    for (var k = 0; k < lastDiff.leftLines.length; k++) {
      var ll = lastDiff.leftLines[k];
      var rl = lastDiff.rightLines[k];
      if (ll.type === 'removed') lines.push('- ' + ll.text);
      else if (rl.type === 'added') lines.push('+ ' + rl.text);
      else if (ll.type === 'unchanged') lines.push('  ' + ll.text);
    }
    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cipherkit-diff.diff';
    a.click();
    URL.revokeObjectURL(a.href);
    CK.toast('Diff downloaded');
  });

  /* ── Synchronized scrolling ─────────────────────────────────── */
  var syncing = false;
  $('diff-left').addEventListener('scroll', function () {
    if (syncing) return;
    syncing = true;
    $('diff-right').scrollTop = $('diff-left').scrollTop;
    syncing = false;
  });
  $('diff-right').addEventListener('scroll', function () {
    if (syncing) return;
    syncing = true;
    $('diff-left').scrollTop = $('diff-right').scrollTop;
    syncing = false;
  });

  /* ── Keyboard shortcut ──────────────────────────────────────── */
  CK.wireCtrlEnter('btn-compare');

  /* ── Pre-populate sample data and run diff ──────────────────── */
  $('t-left').value = SAMPLE_LEFT;
  $('t-right').value = SAMPLE_RIGHT;
  runDiff();

  /* ── Usage guide ────────────────────────────────────────────── */
  CK.setUsageContent(
    '<ol>'
    + '<li>Paste <strong>original text</strong> in the left panel and <strong>changed text</strong> in the right panel.</li>'
    + '<li>Click <strong>Compare</strong> or press <kbd>Ctrl+Enter</kbd> to see the diff.</li>'
    + '<li>Results appear side-by-side: removed lines in <span style="color:#ff8080">red</span> (left) and added lines in <span style="color:#3dd68c">green</span> (right).</li>'
    + '</ol>'
    + '<p>Uses an LCS (Longest Common Subsequence) algorithm for accurate line-level diff. Panels scroll in sync. Use <strong>\u2190 Use Left</strong> or <strong>Use Right \u2192</strong> to accept one version. Download a unified <code>.diff</code> file for sharing.</p>'
  );
})();
