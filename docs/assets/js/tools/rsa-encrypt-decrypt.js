(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function pem2ab(pem) {
    var b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    var bin = atob(b64); var buf = new ArrayBuffer(bin.length); var view = new Uint8Array(buf);
    for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    return buf;
  }
  function ab2b64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
  function b642ab(b64) { var bin = atob(b64); var buf = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); return buf.buffer; }
  root.innerHTML =
    '<div class="tool-two-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.lock + '</div><h2 id="enc-heading">RSA Encrypt</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Encrypt</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="enc-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="enc-key">Public Key (PEM)</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-ek" aria-label="Clear public key">' + IC.trash + '</button></div></div><textarea id="enc-key" placeholder="Paste RSA public key\u2026" rows="4" spellcheck="false"></textarea><div class="inline-error" id="enc-k-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="enc-input">Plaintext</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-ei" aria-label="Clear plaintext">' + IC.trash + '</button></div></div><textarea id="enc-input" placeholder="Enter text to encrypt\u2026" rows="3"></textarea><div class="inline-error" id="enc-i-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-enc" aria-label="Encrypt with RSA">' + IC.lock + ' <span>Encrypt</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Ciphertext (Base64)</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp-enc" aria-label="Copy ciphertext">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl-enc" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="enc-result" role="status" aria-live="polite">Ciphertext will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.unlock + '</div><h2 id="dec-heading">RSA Decrypt</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Decrypt</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="dec-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="dec-key">Private Key (PEM)</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-dk" aria-label="Clear private key">' + IC.trash + '</button></div></div><textarea id="dec-key" placeholder="Paste RSA private key\u2026" rows="4" spellcheck="false"></textarea><div class="inline-error" id="dec-k-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="dec-input">Ciphertext (Base64)</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr-di" aria-label="Clear ciphertext">' + IC.trash + '</button></div></div><textarea id="dec-input" placeholder="Paste Base64 ciphertext\u2026" rows="3" spellcheck="false"></textarea><div class="inline-error" id="dec-i-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-dec" aria-label="Decrypt with RSA">' + IC.unlock + ' <span>Decrypt</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Decrypted Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp-dec" aria-label="Copy decrypted output">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl-dec" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="dec-result" role="status" aria-live="polite">Plaintext will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr-ek').addEventListener('click', function () { $('enc-key').value = ''; });
  $('btn-clr-ei').addEventListener('click', function () { $('enc-input').value = ''; });
  $('btn-clr-dk').addEventListener('click', function () { $('dec-key').value = ''; });
  $('btn-clr-di').addEventListener('click', function () { $('dec-input').value = ''; });
  CK.wireCopy($('btn-cp-enc'), function () { var t = $('enc-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireCopy($('btn-cp-dec'), function () { var t = $('dec-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  $('btn-enc').addEventListener('click', function () {
    var pem = $('enc-key').value.trim();
    var msg = $('enc-input').value;
    $('enc-k-err').textContent = ''; $('enc-k-err').style.display = 'none';
    $('enc-i-err').textContent = ''; $('enc-i-err').style.display = 'none';
    if (!pem) { $('enc-k-err').textContent = 'Public key is required.'; $('enc-k-err').style.display = 'block'; return; }
    if (!msg) { $('enc-i-err').textContent = 'Plaintext is required.'; $('enc-i-err').style.display = 'block'; return; }
    $('btn-enc').disabled = true;
    crypto.subtle.importKey('spki', pem2ab(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']).then(function (key) {
      return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(msg));
    }).then(function (ct) {
      $('enc-result').className = 'out-body mono b';
      $('enc-result').textContent = ab2b64(ct);
      CK.toast('RSA encryption complete');
    }).catch(function (e) {
      $('enc-result').className = 'out-body err';
      $('enc-result').textContent = 'Encryption failed: ' + e.message;
    }).finally(function () { $('btn-enc').disabled = false; });
  });
  $('btn-dec').addEventListener('click', function () {
    var pem = $('dec-key').value.trim();
    var ct = $('dec-input').value.trim();
    $('dec-k-err').textContent = ''; $('dec-k-err').style.display = 'none';
    $('dec-i-err').textContent = ''; $('dec-i-err').style.display = 'none';
    if (!pem) { $('dec-k-err').textContent = 'Private key is required.'; $('dec-k-err').style.display = 'block'; return; }
    if (!ct) { $('dec-i-err').textContent = 'Ciphertext is required.'; $('dec-i-err').style.display = 'block'; return; }
    $('btn-dec').disabled = true;
    crypto.subtle.importKey('pkcs8', pem2ab(pem), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']).then(function (key) {
      return crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, b642ab(ct));
    }).then(function (pt) {
      $('dec-result').className = 'out-body mono b';
      $('dec-result').textContent = new TextDecoder().decode(pt);
      CK.toast('RSA decryption complete');
    }).catch(function (e) {
      $('dec-result').className = 'out-body err';
      $('dec-result').textContent = 'Decryption failed: ' + e.message;
    }).finally(function () { $('btn-dec').disabled = false; });
  });
  CK.wireCtrlEnter('btn-enc');
  CK.setUsageContent('<ol><li><strong>Encrypt:</strong> Paste an RSA public key (PEM) and plaintext, then click Encrypt.</li><li><strong>Decrypt:</strong> Paste an RSA private key (PEM) and the Base64 ciphertext, then click Decrypt.</li></ol><p>RSA encryption uses the Web Crypto API (RSA-OAEP with SHA-256). Maximum message size depends on key size (e.g., ~190 bytes for 2048-bit keys). Generate key pairs using the RSA Key Generator tool.</p>');
})();