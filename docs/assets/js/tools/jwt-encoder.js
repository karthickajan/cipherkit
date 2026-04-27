(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    key:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function b64urlEnc(str) { return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function hmacSign(header, payload, secret, algo) {
    var msg = b64urlEnc(header) + '.' + b64urlEnc(payload);
    var enc = new TextEncoder();
    var names = {'HS256':'SHA-256','HS384':'SHA-384','HS512':'SHA-512'};
    return crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:names[algo]}, false, ['sign'])
      .then(function(k){ return crypto.subtle.sign('HMAC', k, enc.encode(msg)); })
      .then(function(sig){
        var bytes = new Uint8Array(sig);
        var bin = ''; for(var i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
        return msg + '.' + b64urlEnc(bin);
      });
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.key + '</div><h2 id="t-heading">JWT Encoder</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Encode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-algo">Algorithm</label><select id="t-algo"><option value="HS256" selected>HS256</option><option value="HS384">HS384</option><option value="HS512">HS512</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-payload">Payload (JSON)</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-payload" placeholder=\'{"sub":"1234567890","name":"John Doe","iat":1516239022}\' rows="6" class="mono"></textarea></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-secret">Secret Key</label></div><input type="password" id="t-secret" placeholder="Enter your HMAC secret\u2026"></div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-enc" aria-label="Create JWT">' + IC.key + ' <span>Create JWT</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>JWT Token</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">JWT will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-payload').value=''; $('t-secret').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='JWT will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  CK.initAutoGrow($('t-payload'));
  $('btn-enc').addEventListener('click', function () {
    var payloadStr = $('t-payload').value.trim();
    var secret = $('t-secret').value;
    var algo = $('t-algo').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!payloadStr) { $('t-err').textContent = 'Please enter a JSON payload.'; $('t-err').style.display = 'block'; return; }
    if (!secret) { $('t-err').textContent = 'Please enter a secret key.'; $('t-err').style.display = 'block'; return; }
    try { JSON.parse(payloadStr); } catch(e) { $('t-err').textContent = 'Invalid JSON payload: ' + e.message; $('t-err').style.display = 'block'; return; }
    var header = JSON.stringify({"alg":algo,"typ":"JWT"});
    hmacSign(header, payloadStr, secret, algo).then(function(token) {
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = token;
      CK.toast('JWT created');
    }).catch(function(e) {
      $('t-err').textContent = 'Signing failed: ' + e.message; $('t-err').style.display = 'block';
    });
  });
  CK.wireCtrlEnter('btn-enc');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'jwt-encoder-output.txt');
  CK.setUsageContent('<ol><li>Enter a <strong>JSON payload</strong> with your claims.</li><li>Choose an <strong>algorithm</strong> (HS256/384/512).</li><li>Enter a <strong>secret key</strong> for HMAC signing.</li><li>Click <strong>Create JWT</strong> to generate the token.</li></ol><p>Uses the Web Crypto API for HMAC signing. Your secret never leaves the browser. For RS256/ES256, use a library like jose.js.</p>');
})();