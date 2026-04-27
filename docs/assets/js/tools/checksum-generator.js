(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  var algos = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'SHA-3 (256)', 'RIPEMD-160'];
  function $(id) { return document.getElementById(id); }
  function makeRow(label, id) {
    return '<div class="ck-row"><div class="ck-label">' + label + '</div><div class="ck-val"><code id="' + id + '" class="mono">—</code><button type="button" class="copy-btn sm" data-target="' + id + '" aria-label="Copy ' + label + ' hash">' + IC.copy + '</button></div></div>';
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.shield + '</div><h2 id="cs-heading">Checksum Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Checksum</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="cs-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="cs-input">Input Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear input">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="cs-input" placeholder="Enter text to generate checksums\u2026" rows="5"></textarea><div class="inline-error" id="cs-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-gen" aria-label="Generate checksums">' + IC.shield + ' <span>Generate Checksums</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Results</span></div></div><div class="out-body ck-grid" id="cs-results" role="status" aria-live="polite">'
    +       makeRow('MD5', 'r-md5')
    +       makeRow('SHA-1', 'r-sha1')
    +       makeRow('SHA-256', 'r-sha256')
    +       makeRow('SHA-512', 'r-sha512')
    +       makeRow('SHA-3 (256)', 'r-sha3')
    +       makeRow('RIPEMD-160', 'r-ripemd')
    +     '</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('cs-input').value = ''; ['r-md5', 'r-sha1', 'r-sha256', 'r-sha512', 'r-sha3', 'r-ripemd'].forEach(function (id) { $(id).textContent = '\u2014'; }); });
  CK.initAutoGrow($('cs-input'));
  $('cs-results').addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn[data-target]');
    if (!btn) return;
    var t = $(btn.getAttribute('data-target')).textContent;
    if (t && t !== '\u2014') CK.copyText(t, btn);
  });
  $('btn-gen').addEventListener('click', function () {
    var input = $('cs-input').value;
    $('cs-err').textContent = ''; $('cs-err').style.display = 'none';
    if (!input) { $('cs-err').textContent = 'Please enter text to hash.'; $('cs-err').style.display = 'block'; return; }
    $('r-md5').textContent = CryptoJS.MD5(input).toString();
    $('r-sha1').textContent = CryptoJS.SHA1(input).toString();
    $('r-sha256').textContent = CryptoJS.SHA256(input).toString();
    $('r-sha512').textContent = CryptoJS.SHA512(input).toString();
    $('r-sha3').textContent = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
    $('r-ripemd').textContent = CryptoJS.RIPEMD160(input).toString();
    CK.toast('All checksums generated');
  });
  CK.wireCtrlEnter('btn-gen');
  CK.setUsageContent('<ol><li><strong>Enter or paste text</strong> into the input field.</li><li>Click <strong>Generate Checksums</strong> to compute all hash digests at once.</li><li>Copy any individual hash by clicking the copy button beside it.</li></ol><p>This tool generates MD5, SHA-1, SHA-256, SHA-512, SHA-3 (256-bit), and RIPEMD-160 checksums simultaneously. Useful for verifying file integrity and comparing hash outputs across algorithms.</p>');
})();