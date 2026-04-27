(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    eye:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    play:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.shield + '</div><h2 id="h-heading">HMAC Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-green">HMAC</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="h-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="hm-algo">Algorithm</label><select id="hm-algo"><option>SHA-256</option><option>SHA-512</option><option>SHA-1</option><option>SHA-3</option><option>MD5</option></select></div><div class="sel-group"><label for="hm-fmt">Output Format</label><select id="hm-fmt"><option>Hex</option><option>Base64</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="hm-msg">Message</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear message">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="hm-msg" placeholder="Enter message to authenticate\u2026" rows="4"></textarea><div class="inline-error" id="hm-m-err" role="alert"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="hm-key">Secret Key</label></div><div class="input-wrap"><input type="password" id="hm-key" placeholder="Enter secret key\u2026" autocomplete="off"><div class="input-suffix"><button type="button" class="icon-btn vis" id="btn-vis" aria-label="Toggle key visibility">' + IC.eye + '</button></div></div><div class="inline-error" id="hm-k-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-gen" aria-label="Generate HMAC">' + IC.shield + ' <span>Generate HMAC</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>HMAC Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy HMAC">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="hm-result" role="status" aria-live="polite">HMAC will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('hm-msg').value = ''; });
  CK.wirePassToggle($('hm-key'), $('btn-vis'));
  CK.wireCopy($('btn-cp'), function () { var t = $('hm-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('hm-msg'));
  var algoMap = { 'SHA-256': CryptoJS.algo.SHA256, 'SHA-512': CryptoJS.algo.SHA512, 'SHA-1': CryptoJS.algo.SHA1, 'SHA-3': CryptoJS.algo.SHA3, 'MD5': CryptoJS.algo.MD5 };
  $('btn-gen').addEventListener('click', function () {
    var msg = $('hm-msg').value;
    var key = $('hm-key').value;
    var fmt = $('hm-fmt').value;
    var algo = $('hm-algo').value;
    $('hm-m-err').textContent = ''; $('hm-m-err').style.display = 'none';
    $('hm-k-err').textContent = ''; $('hm-k-err').style.display = 'none';
    if (!msg) { $('hm-m-err').textContent = 'Message is required.'; $('hm-m-err').style.display = 'block'; return; }
    if (!key) { $('hm-k-err').textContent = 'Secret key is required.'; $('hm-k-err').style.display = 'block'; return; }
    var hmac = CryptoJS.HmacSHA256(msg, key);
    if (algo === 'SHA-512') hmac = CryptoJS.HmacSHA512(msg, key);
    else if (algo === 'SHA-1') hmac = CryptoJS.HmacSHA1(msg, key);
    else if (algo === 'SHA-3') hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA3, key).update(msg).finalize();
    else if (algo === 'MD5') hmac = CryptoJS.HmacMD5(msg, key);
    var out = fmt === 'Base64' ? hmac.toString(CryptoJS.enc.Base64) : hmac.toString(CryptoJS.enc.Hex);
    $('hm-result').className = 'out-body mono b'; $('hm-result').textContent = out;
    CK.toast('HMAC generated');
  });
  CK.wireCtrlEnter('btn-gen');
  CK.setUsageContent('<ol><li><strong>Enter the message</strong> you want to authenticate.</li><li><strong>Enter a secret key</strong> shared between sender and receiver.</li><li>Select the <strong>hash algorithm</strong> (SHA-256, SHA-512, SHA-1, SHA-3, or MD5).</li><li>Choose <strong>Hex</strong> or <strong>Base64</strong> output format.</li><li>Click <strong>Generate HMAC</strong> to produce the authentication code.</li></ol><p>HMAC (Hash-based Message Authentication Code) provides message integrity and authenticity. It combines a cryptographic hash function with a secret key, making it resistant to length-extension attacks.</p>');
  (function(){var inp=$('h-input');if(inp&&!inp.value){inp.value='Hello, World!';inp.dispatchEvent(new Event('input'));}})();
})();