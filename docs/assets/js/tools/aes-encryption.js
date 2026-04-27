(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    lock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    copy:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    eye:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    arrowL:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    sync:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function clearField(id) {
    var el = $(id);
    if (el) { el.value = ''; el.dispatchEvent(new Event('input')); }
  }
  function setOut(id, text, cls) {
    var el = $(id);
    if (!el) return;
    el.className = 'out-body';
    if (!text) { el.classList.add('ph'); el.textContent = 'Output will appear here\u2026'; return; }
    if (cls) el.classList.add(cls);
    el.textContent = text;
  }
  function setError(id, msg) {
    var el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }
  function clearError(id) {
    var el = $(id);
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
  }
  function padKey(key, size) {
    var bytes  = parseInt(size, 10) / 8;
    var hexLen = bytes * 2;
    if (new RegExp('^[0-9a-fA-F]{' + hexLen + '}$').test(key)) {
      return CryptoJS.enc.Hex.parse(key);
    }
    var utf8WA = CryptoJS.enc.Utf8.parse(key);
    if (utf8WA.sigBytes === bytes) return utf8WA;
    var hex = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
    return CryptoJS.enc.Hex.parse(hex.substring(0, hexLen));
  }
  function parseIV(ivStr) {
    var s = (ivStr || '').trim();
    if (!s) return null;
    if (/^[0-9a-fA-F]{32}$/.test(s)) return CryptoJS.enc.Hex.parse(s);
    return CryptoJS.enc.Utf8.parse(s.padEnd(16, '0').substring(0, 16));
  }
  function generateRandomHex(bytes) {
    var arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function modeObj(m) {
    var modes = {
      CBC: CryptoJS.mode.CBC, ECB: CryptoJS.mode.ECB,
      CTR: CryptoJS.mode.CTR, OFB: CryptoJS.mode.OFB,
      CFB: CryptoJS.mode.CFB
    };
    return modes[m] || CryptoJS.mode.CBC;
  }
  function requiredKeyLen(size) {
    return parseInt(size, 10) / 8;
  }
  function updateStrength(inputId, barId) {
    var v  = $(inputId).value;
    var el = $(barId);
    if (!el) return;
    var s = 0;
    if (v.length >= 8)  s += 20;
    if (v.length >= 16) s += 20;
    if (v.length >= 32) s += 20;
    if (/[0-9]/.test(v)) s += 20;
    if (/[^a-zA-Z0-9]/.test(v)) s += 20;
    el.style.width = s + '%';
    el.style.background = s < 40 ? 'var(--red)' : s < 80 ? 'var(--amber)' : 'var(--green)';
    var bar = el.closest('[role=progressbar]');
    if (bar) bar.setAttribute('aria-valuenow', String(s));
  }
  root.innerHTML = ''
    + '<div class="tool-two-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title">'
    +       '<div class="tc-icon tc-icon-green">' + IC.lock + '</div>'
    +       '<h2 id="encrypt-heading">Encrypt</h2>'
    +     '</div>'
    +     '<span class="tc-badge tc-badge-green" aria-label="Algorithm: AES">AES</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="encrypt-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="sel-group">'
    +         '<label for="enc-keysize">Key Size</label>'
    +         '<select id="enc-keysize">'
    +           '<option value="256">256-bit</option>'
    +           '<option value="192">192-bit</option>'
    +           '<option value="128">128-bit</option>'
    +         '</select>'
    +       '</div>'
    +       '<div class="sel-group">'
    +         '<label for="enc-mode">Mode</label>'
    +         '<select id="enc-mode">'
    +           '<option>CBC</option><option>ECB</option><option>CTR</option><option>OFB</option><option>CFB</option>'
    +         '</select>'
    +       '</div>'
    +       '<div class="sel-group">'
    +         '<label for="enc-output">Output</label>'
    +         '<select id="enc-output"><option>Base64</option><option>Hex</option></select>'
    +       '</div>'
    +     '</div>'
    +     '<div class="field">'
    +       '<div class="field-hdr">'
    +         '<label for="enc-plain">Plaintext</label>'
    +         '<div class="field-btns">'
    +           '<button type="button" class="pill-btn" aria-label="Clear plaintext" id="btn-clear-plain">' + IC.trash + ' <span>Clear</span></button>'
    +         '</div>'
    +       '</div>'
    +       '<textarea id="enc-plain" placeholder="Enter text to encrypt\u2026" rows="4"></textarea>'
    +       '<div class="inline-error" id="enc-plain-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<div class="field">'
    +       '<div class="field-hdr"><label for="enc-key">Secret Key</label></div>'
    +       '<div class="input-wrap">'
    +         '<input type="text" id="enc-key" placeholder="Enter or generate a secret key\u2026" autocomplete="off" aria-describedby="enc-key-strength enc-key-err">'
    +         '<div class="input-suffix">'
    +           '<button type="button" class="icon-btn" id="btn-gen-key" aria-label="Generate random encryption key">' + IC.refresh + '</button>'
    +           '<button type="button" class="icon-btn vis" id="btn-toggle-enc-key" aria-label="Toggle key visibility">' + IC.eye + '</button>'
    +         '</div>'
    +       '</div>'
    +       '<div class="kbar-wrap">'
    +         '<div class="kbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Key strength" id="enc-key-strength">'
    +           '<div class="kfill" id="enc-strength"></div>'
    +         '</div>'
    +       '</div>'
    +       '<div class="inline-error" id="enc-key-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<div class="field" id="enc-iv-wrap">'
    +       '<div class="field-hdr">'
    +         '<label for="enc-iv">IV &mdash; Initialization Vector</label>'
    +         '<div class="field-btns">'
    +           '<button type="button" class="pill-btn amber" id="btn-gen-iv" aria-label="Generate random IV">' + IC.refresh + ' <span>Generate</span></button>'
    +         '</div>'
    +       '</div>'
    +       '<input type="text" id="enc-iv" placeholder="Leave blank to auto-generate" autocomplete="off">'
    +       '<div class="inline-error" id="enc-iv-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<button type="button" class="act-btn act-green" id="btn-encrypt" aria-label="Encrypt plaintext with AES">'
    +       IC.lock + ' <span>Encrypt</span>'
    +     '</button>'
    +     '<div class="out-box">'
    +       '<div class="out-head">'
    +         '<div class="out-label">' + IC.play + ' <span>Encrypted Output</span></div>'
    +         '<button type="button" class="copy-btn" id="btn-copy-enc" aria-label="Copy encrypted output">' + IC.copy + ' <span>Copy</span></button>'
    +       '</div>'
    +       '<div class="out-body ph" id="enc-result" role="status" aria-live="polite" aria-label="Encrypted output">Output will appear here\u2026</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title">'
    +       '<div class="tc-icon tc-icon-blue">' + IC.unlock + '</div>'
    +       '<h2 id="decrypt-heading">Decrypt</h2>'
    +     '</div>'
    +     '<span class="tc-badge tc-badge-blue" aria-label="Algorithm: AES">AES</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="decrypt-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="sel-group">'
    +         '<label for="dec-keysize">Key Size</label>'
    +         '<select id="dec-keysize">'
    +           '<option value="256">256-bit</option>'
    +           '<option value="192">192-bit</option>'
    +           '<option value="128">128-bit</option>'
    +         '</select>'
    +       '</div>'
    +       '<div class="sel-group">'
    +         '<label for="dec-mode">Mode</label>'
    +         '<select id="dec-mode">'
    +           '<option>CBC</option><option>ECB</option><option>CTR</option><option>OFB</option><option>CFB</option>'
    +         '</select>'
    +       '</div>'
    +       '<div class="sel-group">'
    +         '<label for="dec-input-fmt">Input Format</label>'
    +         '<select id="dec-input-fmt"><option>Base64</option><option>Hex</option></select>'
    +       '</div>'
    +     '</div>'
    +     '<div class="field">'
    +       '<div class="field-hdr">'
    +         '<label for="dec-cipher">Ciphertext</label>'
    +         '<div class="field-btns">'
    +           '<button type="button" class="pill-btn blue" id="btn-from-enc" aria-label="Transfer output from encrypt panel">' + IC.arrowL + ' <span>From Encrypt</span></button>'
    +           '<button type="button" class="pill-btn" id="btn-clear-cipher" aria-label="Clear ciphertext">' + IC.trash + ' <span>Clear</span></button>'
    +         '</div>'
    +       '</div>'
    +       '<textarea id="dec-cipher" placeholder="Paste encrypted ciphertext here\u2026" rows="4"></textarea>'
    +       '<div class="inline-error" id="dec-cipher-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<div class="field">'
    +       '<div class="field-hdr"><label for="dec-key">Secret Key</label></div>'
    +       '<div class="input-wrap">'
    +         '<input type="text" id="dec-key" placeholder="Enter the decryption key\u2026" autocomplete="off">'
    +         '<div class="input-suffix">'
    +           '<button type="button" class="icon-btn" id="btn-sync-key" aria-label="Sync key from encrypt panel">' + IC.sync + '</button>'
    +           '<button type="button" class="icon-btn vis" id="btn-toggle-dec-key" aria-label="Toggle key visibility">' + IC.eye + '</button>'
    +         '</div>'
    +       '</div>'
    +       '<div class="kbar-wrap" aria-hidden="true"></div>'
    +       '<div class="inline-error" id="dec-key-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<div class="field" id="dec-iv-wrap">'
    +       '<div class="field-hdr">'
    +         '<label for="dec-iv">IV &mdash; Initialization Vector</label>'
    +         '<div style="height:20px" aria-hidden="true"></div>'
    +       '</div>'
    +       '<input type="text" id="dec-iv" placeholder="IV used during encryption" autocomplete="off">'
    +       '<div class="inline-error" id="dec-iv-err" role="alert" aria-live="assertive"></div>'
    +     '</div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-decrypt" aria-label="Decrypt AES ciphertext">'
    +       IC.unlock + ' <span>Decrypt</span>'
    +     '</button>'
    +     '<div class="out-box">'
    +       '<div class="out-head">'
    +         '<div class="out-label">' + IC.play + ' <span>Decrypted Output</span></div>'
    +         '<button type="button" class="copy-btn" id="btn-copy-dec" aria-label="Copy decrypted output">' + IC.copy + ' <span>Copy</span></button>'
    +       '</div>'
    +       '<div class="out-body ph b" id="dec-result" role="status" aria-live="polite" aria-label="Decrypted output">Output will appear here\u2026</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>'; /* close .tool-two-col */
  function toggleIV(prefix, mode) {
    var wrap = $(prefix + '-iv-wrap');
    if (wrap) wrap.style.display = mode === 'ECB' ? 'none' : '';
  }
  $('enc-mode').addEventListener('change', function () { toggleIV('enc', this.value); });
  $('dec-mode').addEventListener('change', function () { toggleIV('dec', this.value); });
  $('btn-clear-plain').addEventListener('click', function () { clearField('enc-plain'); clearError('enc-plain-err'); });
  $('btn-clear-cipher').addEventListener('click', function () { clearField('dec-cipher'); clearError('dec-cipher-err'); });
  $('btn-gen-key').addEventListener('click', function () {
    $('enc-key').value = generateRandomHex(32);
    updateStrength('enc-key', 'enc-strength');
    CK.toast('Key generated');
  });
  $('btn-gen-iv').addEventListener('click', function () {
    $('enc-iv').value = generateRandomHex(16);
    CK.toast('IV generated');
  });
  CK.wirePassToggle($('enc-key'), $('btn-toggle-enc-key'));
  CK.wirePassToggle($('dec-key'), $('btn-toggle-dec-key'));
  $('enc-key').addEventListener('input', function () {
    updateStrength('enc-key', 'enc-strength');
    clearError('enc-key-err');
  });
  $('enc-plain').addEventListener('input', function () { clearError('enc-plain-err'); });
  $('dec-cipher').addEventListener('input', function () { clearError('dec-cipher-err'); });
  $('dec-key').addEventListener('input', function () { clearError('dec-key-err'); });
  $('btn-from-enc').addEventListener('click', function () {
    var v = $('enc-result').textContent;
    if (v && v.indexOf('appear here') === -1 && v.indexOf('failed') === -1) {
      $('dec-cipher').value    = v;
      $('dec-mode').value      = $('enc-mode').value;
      $('dec-keysize').value   = $('enc-keysize').value;
      $('dec-input-fmt').value = $('enc-output').value;
      $('dec-iv').value        = $('enc-iv').value;
      CK.toast('Output transferred to decrypt');
    }
  });
  $('btn-sync-key').addEventListener('click', function () {
    var k = $('enc-key').value;
    if (k) { $('dec-key').value = k; CK.toast('Key synced'); }
  });
  CK.wireCopy($('btn-copy-enc'), function () {
    var t = $('enc-result').textContent;
    return (t && t.indexOf('appear here') === -1 && t.indexOf('failed') === -1) ? t : '';
  });
  CK.wireCopy($('btn-copy-dec'), function () {
    var t = $('dec-result').textContent;
    return (t && t.indexOf('appear here') === -1 && t.indexOf('failed') === -1) ? t : '';
  });
  $('btn-encrypt').addEventListener('click', function () {
    clearError('enc-plain-err');
    clearError('enc-key-err');
    clearError('enc-iv-err');
    var plain  = $('enc-plain').value;
    var key    = $('enc-key').value;
    var mode   = $('enc-mode').value;
    var ksz    = $('enc-keysize').value;
    var outFmt = $('enc-output').value;
    var ivStr  = $('enc-iv').value;
    if (!plain.trim()) { setError('enc-plain-err', 'Plaintext is required.'); return; }
    if (!key.trim())   { setError('enc-key-err', 'Secret key is required.'); return; }
    try {
      var keyWA = padKey(key, ksz);
      var cfg   = { mode: modeObj(mode), padding: CryptoJS.pad.Pkcs7 };
      if (mode !== 'ECB') {
        var ivWA = parseIV(ivStr);
        if (!ivWA) {
          var autoIV = generateRandomHex(16);
          $('enc-iv').value = autoIV;
          ivWA = CryptoJS.enc.Hex.parse(autoIV);
        }
        cfg.iv = ivWA;
      }
      var enc = CryptoJS.AES.encrypt(plain, keyWA, cfg);
      var out = outFmt === 'Base64'
        ? enc.toString()
        : enc.ciphertext.toString(CryptoJS.enc.Hex);
      setOut('enc-result', out, 'g');
      CK.toast('Encrypted successfully');
    } catch (e) {
      setOut('enc-result', 'Encryption failed: ' + e.message, 'err');
      window.CKFeedback && window.CKFeedback.reportError(e.message, {"Plaintext": ($('enc-plain').value || '').substring(0, 2000), "Secret Key": ($('enc-key').value || '').substring(0, 2000), "IV": ($('enc-iv').value || '').substring(0, 2000), "Mode": $('enc-mode').value, "Key Size": $('enc-keysize').value, "Output Format": $('enc-output').value});
    }
  });
  $('btn-decrypt').addEventListener('click', function () {
    clearError('dec-cipher-err');
    clearError('dec-key-err');
    clearError('dec-iv-err');
    var cipher = ($('dec-cipher').value || '').trim();
    var key    = $('dec-key').value;
    var mode   = $('dec-mode').value;
    var ksz    = $('dec-keysize').value;
    var inFmt  = $('dec-input-fmt').value;
    var ivStr  = $('dec-iv').value;
    if (!cipher) { setError('dec-cipher-err', 'Ciphertext is required.'); return; }
    if (!key.trim()) { setError('dec-key-err', 'Secret key is required.'); return; }
    try {
      var keyWA = padKey(key, ksz);
      var cfg   = { mode: modeObj(mode), padding: CryptoJS.pad.Pkcs7 };
      if (mode !== 'ECB' && ivStr.trim()) {
        cfg.iv = /^[0-9a-fA-F]{32}$/.test(ivStr.trim())
          ? CryptoJS.enc.Hex.parse(ivStr.trim())
          : CryptoJS.enc.Utf8.parse(ivStr.padEnd(16, '0').substring(0, 16));
      }
      var cp = CryptoJS.lib.CipherParams.create({
        ciphertext: inFmt === 'Base64'
          ? CryptoJS.enc.Base64.parse(cipher)
          : CryptoJS.enc.Hex.parse(cipher)
      });
      var dec = CryptoJS.AES.decrypt(cp, keyWA, cfg);
      var res = dec.toString(CryptoJS.enc.Utf8);
      if (!res) throw new Error('Wrong key, IV, or format.');
      setOut('dec-result', res, 'b');
      CK.toast('Decrypted successfully');
    } catch (e) {
      setOut('dec-result', 'Decryption failed: ' + e.message, 'err');
      window.CKFeedback && window.CKFeedback.reportError(e.message, {"Ciphertext": ($('dec-cipher').value || '').substring(0, 2000), "Secret Key": ($('dec-key').value || '').substring(0, 2000), "IV": ($('dec-iv').value || '').substring(0, 2000), "Mode": $('dec-mode').value, "Key Size": $('dec-keysize').value, "Input Format": $('dec-input-fmt').value});
    }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      var active = document.activeElement;
      if (active && active.closest && active.closest('[aria-labelledby="decrypt-heading"]')) {
        $('btn-decrypt').click();
      } else {
        $('btn-encrypt').click();
      }
    }
  });
  CK.wireCtrlEnter('btn-gen-key');
  CK.setUsageContent(
    '<ol>'
    + '<li>Enter the text you want to encrypt.</li>'
    + '<li>Enter a secret key (password). Use a strong, unique key.</li>'
    + '<li>Choose key size: 128, 192, or 256-bit (256 recommended).</li>'
    + '<li>Click <strong>Encrypt</strong>. Copy the output ciphertext.</li>'
    + '<li>To decrypt, use the AES Decryption tool with the same key.</li>'
    + '</ol>'
    + '<h3>What is AES?</h3>'
    + '<p>AES (Advanced Encryption Standard) is a symmetric block cipher — the same key encrypts and decrypts. It is the most widely used encryption algorithm, adopted by the US government and used in TLS, WPA2, and most secure applications.</p>'
    + '<p><strong>Security note:</strong> This tool uses AES-GCM mode with a random IV for each encryption. Never reuse the same key for highly sensitive data in production — use a proper key management system.</p>'
  );
})();