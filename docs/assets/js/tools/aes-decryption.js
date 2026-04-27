(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    unlock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    copy:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    eye:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.unlock + '</div><h2 id="dec-heading">AES Decryption</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">AES</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="dec-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="sel-group"><label for="dec-keysize">Key Size</label><select id="dec-keysize"><option value="256">256-bit</option><option value="192">192-bit</option><option value="128">128-bit</option></select></div>'
    +       '<div class="sel-group"><label for="dec-mode">Mode</label><select id="dec-mode"><option>CBC</option><option>ECB</option><option>CTR</option><option>OFB</option><option>CFB</option></select></div>'
    +       '<div class="sel-group"><label for="dec-fmt">Input Format</label><select id="dec-fmt"><option>Base64</option><option>Hex</option></select></div>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="dec-cipher">Ciphertext</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clear-c" aria-label="Clear ciphertext">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="dec-cipher" placeholder="Paste AES ciphertext here\u2026" rows="4"></textarea><div class="inline-error" id="dec-c-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="dec-key">Secret Key</label></div><div class="input-wrap"><input type="text" id="dec-key" placeholder="Enter the decryption key\u2026" autocomplete="off"><div class="input-suffix"><button type="button" class="icon-btn vis" id="btn-vis" aria-label="Toggle key visibility">' + IC.eye + '</button></div></div><div class="inline-error" id="dec-k-err" role="alert"></div></div>'
    +     '<div class="field" id="dec-iv-wrap"><div class="field-hdr"><label for="dec-iv">IV &mdash; Initialization Vector</label></div><input type="text" id="dec-iv" placeholder="IV used during encryption" autocomplete="off"></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-dec" aria-label="Decrypt AES ciphertext">' + IC.unlock + ' <span>Decrypt</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Decrypted Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy decrypted output">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body ph" id="dec-result" role="status" aria-live="polite">Output will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('dec-mode').addEventListener('change', function () {
    $('dec-iv-wrap').style.display = this.value === 'ECB' ? 'none' : '';
  });
  $('btn-clear-c').addEventListener('click', function () { $('dec-cipher').value = ''; });
  CK.wirePassToggle($('dec-key'), $('btn-vis'));
  CK.wireCopy($('btn-cp'), function () {
    var t = $('dec-result').textContent;
    return (t && t.indexOf('appear') === -1) ? t : '';
  });
  $('btn-dec').addEventListener('click', function () {
    var cipher = ($('dec-cipher').value || '').trim();
    var key = $('dec-key').value;
    var mode = $('dec-mode').value;
    var ksz = $('dec-keysize').value;
    var fmt = $('dec-fmt').value;
    var iv = $('dec-iv').value;
    var el = $('dec-result');
    $('dec-c-err').textContent = ''; $('dec-c-err').style.display = 'none';
    $('dec-k-err').textContent = ''; $('dec-k-err').style.display = 'none';
    if (!cipher) { $('dec-c-err').textContent = 'Ciphertext is required.'; $('dec-c-err').style.display = 'block'; return; }
    if (!key.trim()) { $('dec-k-err').textContent = 'Secret key is required.'; $('dec-k-err').style.display = 'block'; return; }
    try {
      var bytes = parseInt(ksz, 10) / 8, hexLen = bytes * 2;
      var keyWA = new RegExp('^[0-9a-fA-F]{' + hexLen + '}$').test(key) ? CryptoJS.enc.Hex.parse(key) : (function () { var u = CryptoJS.enc.Utf8.parse(key); return u.sigBytes === bytes ? u : CryptoJS.enc.Hex.parse(CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substring(0, hexLen)); })();
      var modes = { CBC: CryptoJS.mode.CBC, ECB: CryptoJS.mode.ECB, CTR: CryptoJS.mode.CTR, OFB: CryptoJS.mode.OFB, CFB: CryptoJS.mode.CFB };
      var cfg = { mode: modes[mode] || CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
      if (mode !== 'ECB' && iv.trim()) {
        cfg.iv = /^[0-9a-fA-F]{32}$/.test(iv.trim()) ? CryptoJS.enc.Hex.parse(iv.trim()) : CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').substring(0, 16));
      }
      var cp = CryptoJS.lib.CipherParams.create({ ciphertext: fmt === 'Base64' ? CryptoJS.enc.Base64.parse(cipher) : CryptoJS.enc.Hex.parse(cipher) });
      var res = CryptoJS.AES.decrypt(cp, keyWA, cfg).toString(CryptoJS.enc.Utf8);
      if (!res) throw new Error('Wrong key, IV, or format.');
      el.className = 'out-body b'; el.textContent = res;
      CK.toast('Decrypted successfully');
    } catch (e) { el.className = 'out-body err'; el.textContent = 'Decryption failed: ' + e.message; window.CKFeedback && window.CKFeedback.reportError(e.message, {"Ciphertext": ($('dec-cipher').value || '').substring(0, 2000), "Secret Key": ($('dec-key').value || '').substring(0, 2000), "IV": ($('dec-iv').value || '').substring(0, 2000), "Mode": $('dec-mode').value, "Key Size": $('dec-keysize').value, "Input Format": $('dec-fmt').value}); }
  });
  CK.wireCtrlEnter('btn-dec');
  CK.setUsageContent('<ol><li><strong>Paste the AES ciphertext</strong> you want to decrypt.</li><li><strong>Select the key size</strong> (128, 192, or 256-bit) used during encryption.</li><li><strong>Choose the mode</strong> (CBC, ECB, CTR, OFB, or CFB) — must match encryption mode.</li><li><strong>Enter the secret key</strong> and <strong>IV</strong> used during encryption.</li><li>Click <strong>Decrypt</strong> to recover the plaintext.</li></ol><p>All decryption runs 100% in your browser using CryptoJS.</p>');
})();