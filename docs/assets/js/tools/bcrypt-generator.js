(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    eye:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-two-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.lock + '</div><h2 id="bh-heading">Bcrypt Hash</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Hash</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="bh-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="b-rounds">Rounds (Cost)</label><select id="b-rounds"><option>8</option><option>10</option><option selected>12</option><option>14</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="b-pass">Password</label></div><div class="input-wrap"><input type="password" id="b-pass" placeholder="Enter password\u2026" autocomplete="off"><div class="input-suffix"><button type="button" class="icon-btn vis" id="btn-vis" aria-label="Toggle password visibility">' + IC.eye + '</button></div></div><div class="inline-error" id="b-p-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-hash" aria-label="Generate bcrypt hash">' + IC.lock + ' <span>Generate Hash</span></button>'
    +     '<div id="b-load" class="loading-msg" style="display:none" aria-live="polite">Hashing\u2026</div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Bcrypt Hash</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp-h" aria-label="Copy bcrypt hash">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl-h" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="b-result" role="status" aria-live="polite">Hash will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.check + '</div><h2 id="bv-heading">Bcrypt Verify</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Verify</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="bv-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="bv-pass">Password</label></div><div class="input-wrap"><input type="password" id="bv-pass" placeholder="Enter password to verify\u2026" autocomplete="off"><div class="input-suffix"><button type="button" class="icon-btn vis" id="btn-vis2" aria-label="Toggle password visibility">' + IC.eye + '</button></div></div><div class="inline-error" id="bv-p-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="bv-hash">Bcrypt Hash</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-vh" aria-label="Clear hash">' + IC.trash + '</button></div></div><textarea id="bv-hash" placeholder="Paste bcrypt hash ($2a$, $2b$\u2026)" rows="2" spellcheck="false"></textarea><div class="inline-error" id="bv-h-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-verify" aria-label="Verify bcrypt hash">' + IC.check + ' <span>Verify</span></button>'
    +     '<div id="bv-load" class="loading-msg" style="display:none" aria-live="polite">Verifying\u2026</div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Verification Result</span></div></div><div class="out-body ph" id="bv-result" role="status" aria-live="polite">Result will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.wirePassToggle($('b-pass'), $('btn-vis'));
  CK.wirePassToggle($('bv-pass'), $('btn-vis2'));
  $('btn-clr-vh').addEventListener('click', function () { $('bv-hash').value = ''; });
  CK.wireCopy($('btn-cp-h'), function () { var t = $('b-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  $('btn-hash').addEventListener('click', function () {
    var pass = $('b-pass').value;
    var rounds = parseInt($('b-rounds').value, 10);
    $('b-p-err').textContent = ''; $('b-p-err').style.display = 'none';
    if (!pass) { $('b-p-err').textContent = 'Password is required.'; $('b-p-err').style.display = 'block'; return; }
    if (typeof dcodeIO === 'undefined' || !dcodeIO.bcrypt) { $('b-result').className = 'out-body err'; $('b-result').textContent = 'bcryptjs library not loaded.'; return; }
    $('b-load').style.display = 'block'; $('btn-hash').disabled = true;
    dcodeIO.bcrypt.hash(pass, rounds, function (err, hash) {
      $('b-load').style.display = 'none'; $('btn-hash').disabled = false;
      if (err) { $('b-result').className = 'out-body err'; $('b-result').textContent = 'Error: ' + err.message; return; }
      $('b-result').className = 'out-body mono b'; $('b-result').textContent = hash;
      CK.toast('Bcrypt hash generated');
    });
  });
  $('btn-verify').addEventListener('click', function () {
    var pass = $('bv-pass').value;
    var hash = $('bv-hash').value.trim();
    $('bv-p-err').textContent = ''; $('bv-p-err').style.display = 'none';
    $('bv-h-err').textContent = ''; $('bv-h-err').style.display = 'none';
    if (!pass) { $('bv-p-err').textContent = 'Password is required.'; $('bv-p-err').style.display = 'block'; return; }
    if (!hash) { $('bv-h-err').textContent = 'Bcrypt hash is required.'; $('bv-h-err').style.display = 'block'; return; }
    if (typeof dcodeIO === 'undefined' || !dcodeIO.bcrypt) { $('bv-result').className = 'out-body err'; $('bv-result').textContent = 'bcryptjs library not loaded.'; return; }
    $('bv-load').style.display = 'block'; $('btn-verify').disabled = true;
    dcodeIO.bcrypt.compare(pass, hash, function (err, match) {
      $('bv-load').style.display = 'none'; $('btn-verify').disabled = false;
      if (err) { $('bv-result').className = 'out-body err'; $('bv-result').textContent = 'Error: ' + err.message; return; }
      if (match) {
        $('bv-result').className = 'out-body match';
        $('bv-result').innerHTML = '<span class="match-icon">' + IC.check + '</span><strong>Match!</strong> Password matches the hash.';
        CK.toast('Password matches', 'success');
      } else {
        $('bv-result').className = 'out-body no-match';
        $('bv-result').innerHTML = '<span class="no-match-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span><strong>No Match.</strong> Password does not match.';
        CK.toast('Password does not match', 'error');
      }
    });
  });
  CK.wireCtrlEnter('btn-hash');
  CK.setUsageContent('<ol><li>Enter the password you want to hash.</li><li>Choose a cost factor (10-12 recommended for production).</li><li>Click <strong>Hash</strong>. Copy the bcrypt hash.</li><li>Use <strong>Verify</strong> to check if a password matches a stored hash.</li></ol><h3>Why bcrypt for passwords?</h3><p>Unlike SHA-256 or MD5, bcrypt is specifically designed for password hashing. It is intentionally slow (configurable via the cost factor) and includes a random salt automatically, making rainbow table attacks and brute-force attacks impractical.</p><p><strong>Cost factor guide:</strong> 10 = ~100ms, 12 = ~400ms, 14 = ~1.5s. Higher is more secure but slower. For most web apps, 10-12 is the right balance.</p>');
})();