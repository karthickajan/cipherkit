(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    key:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function ab2pem(buf, type) {
    var b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
    var lines = []; for (var i = 0; i < b64.length; i += 64) lines.push(b64.slice(i, i + 64));
    return '-----BEGIN ' + type + '-----\n' + lines.join('\n') + '\n-----END ' + type + '-----';
  }
  function dlFile(text, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.key + '</div><h2 id="r-heading">RSA Key Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">RSA</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="r-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="r-bits">Key Size</label><select id="r-bits"><option value="2048">2048-bit</option><option value="4096">4096-bit</option></select></div><div class="sel-group"><label for="r-hash">Hash</label><select id="r-hash"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-gen" aria-label="Generate RSA key pair">' + IC.key + ' <span>Generate Key Pair</span></button>'
    +     '<div id="r-loading" class="loading-msg" style="display:none" aria-live="polite">Generating key pair\u2026</div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Public Key</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp-pub" aria-label="Copy public key">' + IC.copy + ' <span>Copy</span></button><button type="button" class="copy-btn" id="btn-dl-pub" aria-label="Download public key">' + IC.dl + ' <span>.pem</span></button></div></div><div class="out-body mono ph" id="r-pub" role="status" aria-live="polite">Public key will appear here\u2026</div></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Private Key</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp-priv" aria-label="Copy private key">' + IC.copy + ' <span>Copy</span></button><button type="button" class="copy-btn" id="btn-dl-priv" aria-label="Download private key">' + IC.dl + ' <span>.pem</span></button></div></div><div class="out-body mono ph" id="r-priv" role="status" aria-live="polite">Private key will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.wireCopy($('btn-cp-pub'), function () { var t = $('r-pub').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireCopy($('btn-cp-priv'), function () { var t = $('r-priv').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  $('btn-dl-pub').addEventListener('click', function () { var t = $('r-pub').textContent; if (t.indexOf('appear') === -1) dlFile(t, 'rsa_public.pem'); });
  $('btn-dl-priv').addEventListener('click', function () { var t = $('r-priv').textContent; if (t.indexOf('appear') === -1) dlFile(t, 'rsa_private.pem'); });
  $('btn-gen').addEventListener('click', function () {
    var bits = parseInt($('r-bits').value, 10);
    var hash = $('r-hash').value;
    $('r-loading').style.display = 'block';
    $('btn-gen').disabled = true;
    window.crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: hash },
      true, ['encrypt', 'decrypt']
    ).then(function (pair) {
      return Promise.all([
        window.crypto.subtle.exportKey('spki', pair.publicKey),
        window.crypto.subtle.exportKey('pkcs8', pair.privateKey)
      ]);
    }).then(function (keys) {
      var pub = ab2pem(keys[0], 'PUBLIC KEY');
      var priv = ab2pem(keys[1], 'PRIVATE KEY');
      $('r-pub').className = 'out-body mono b'; $('r-pub').textContent = pub;
      $('r-priv').className = 'out-body mono b'; $('r-priv').textContent = priv;
      CK.toast('RSA key pair generated');
    }).catch(function (e) {
      $('r-pub').className = 'out-body err'; $('r-pub').textContent = 'Error: ' + e.message;
    }).finally(function () {
      $('r-loading').style.display = 'none';
      $('btn-gen').disabled = false;
    });
  });
  CK.wireCtrlEnter('btn-gen');
  CK.setUsageContent('<ol><li>Select the <strong>key size</strong> (2048 or 4096 bits).</li><li>Choose the <strong>hash algorithm</strong> (SHA-256, SHA-384, or SHA-512).</li><li>Click <strong>Generate Key Pair</strong> to create the RSA public and private keys.</li><li>Copy or download the keys as <strong>.pem</strong> files.</li></ol><p>RSA key generation uses the Web Crypto API for secure, browser-native key pair creation. Private keys never leave your browser. Use 4096-bit keys for maximum security.</p>');
})();