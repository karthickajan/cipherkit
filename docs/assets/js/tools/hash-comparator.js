(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    x:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    trash:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.compare + '</div><h2 id="hc-heading">Hash Comparator</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Compare</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="hc-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="hc-case">Case Sensitive</label><select id="hc-case"><option value="0">No (recommended)</option><option value="1">Yes</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="hc-a">Hash A</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-a" aria-label="Clear hash A">' + IC.trash + '</button></div></div><textarea id="hc-a" placeholder="Paste first hash\u2026" rows="3" spellcheck="false"></textarea><div class="inline-error" id="hc-a-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="hc-b">Hash B</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-b" aria-label="Clear hash B">' + IC.trash + '</button></div></div><textarea id="hc-b" placeholder="Paste second hash\u2026" rows="3" spellcheck="false"></textarea><div class="inline-error" id="hc-b-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-cmp" aria-label="Compare hashes">' + IC.compare + ' <span>Compare</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Result</span></div></div><div class="out-body ph" id="hc-result" role="status" aria-live="polite">Comparison result will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr-a').addEventListener('click', function () { $('hc-a').value = ''; });
  $('btn-clr-b').addEventListener('click', function () { $('hc-b').value = ''; });
  $('btn-cmp').addEventListener('click', function () {
    var a = $('hc-a').value.trim();
    var b = $('hc-b').value.trim();
    var cs = $('hc-case').value === '1';
    var el = $('hc-result');
    $('hc-a-err').textContent = ''; $('hc-a-err').style.display = 'none';
    $('hc-b-err').textContent = ''; $('hc-b-err').style.display = 'none';
    if (!a) { $('hc-a-err').textContent = 'Hash A is required.'; $('hc-a-err').style.display = 'block'; return; }
    if (!b) { $('hc-b-err').textContent = 'Hash B is required.'; $('hc-b-err').style.display = 'block'; return; }
    var match = cs ? a === b : a.toLowerCase() === b.toLowerCase();
    if (match) {
      el.className = 'out-body match';
      el.innerHTML = '<span class="match-icon">' + IC.check + '</span><strong>Match!</strong> The two hashes are identical' + (cs ? '' : ' (case-insensitive)') + '.';
      CK.toast('Hashes match', 'success');
    } else {
      el.className = 'out-body no-match';
      el.innerHTML = '<span class="no-match-icon">' + IC.x + '</span><strong>No Match.</strong> The hashes are different.';
      CK.toast('Hashes do not match', 'error');
    }
  });
  CK.wireCtrlEnter('btn-cmp');
  CK.setUsageContent('<ol><li><strong>Paste the first hash</strong> into Hash A.</li><li><strong>Paste the second hash</strong> into Hash B.</li><li>Choose case sensitivity (case-insensitive is recommended for hex hashes).</li><li>Click <strong>Compare</strong> to check if they match.</li></ol><p>Use this tool to verify file integrity, compare checksums, or validate password hashes. Supports any hash format (MD5, SHA-1, SHA-256, SHA-512, etc.).</p>');
})();