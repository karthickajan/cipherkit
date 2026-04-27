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
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.key + '</div><h2 id="t-heading">TOTP Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-green">2FA</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-secret">Base32 Secret</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><input type="text" id="t-secret" placeholder="e.g. JBSWY3DPEHPK3PXP" class="mono"><div class="input-meta" id="t-secret-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-digits">Digits</label><select id="t-digits"><option value="6" selected>6</option><option value="8">8</option></select></div><div class="sel-group"><label for="t-period">Period</label><select id="t-period"><option value="30" selected>30s</option><option value="60">60s</option></select></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-gen">' + IC.key + ' <span>Generate Code</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>TOTP Code</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite" style="font-size:28px;text-align:center;letter-spacing:8px">Code will appear here\u2026</div></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">Time Remaining</div></div><div class="out-body mono" id="t-timer" style="text-align:center;font-size:14px">--</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function b32decode(s) {
    var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', bits = '', bytes = [];
    s = s.replace(/[\s=-]/g, '').toUpperCase();
    for (var i = 0; i < s.length; i++) {
      var v = alpha.indexOf(s[i]);
      if (v === -1) throw new Error('Invalid Base32 character: ' + s[i]);
      bits += ('00000' + v.toString(2)).slice(-5);
    }
    for (var j = 0; j + 8 <= bits.length; j += 8) bytes.push(parseInt(bits.substr(j, 8), 2));
    return new Uint8Array(bytes);
  }
  async function hmacSha1(key, msg) {
    var ckey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    var sig = await crypto.subtle.sign('HMAC', ckey, msg);
    return new Uint8Array(sig);
  }
  async function generateTOTP(secret, digits, period) {
    var keyBytes = b32decode(secret);
    var epoch = Math.floor(Date.now() / 1000);
    var counter = Math.floor(epoch / period);
    var buf = new ArrayBuffer(8);
    var view = new DataView(buf);
    view.setUint32(4, counter, false);
    var hmac = await hmacSha1(keyBytes, buf);
    var offset = hmac[hmac.length - 1] & 0x0f;
    var code = ((hmac[offset] & 0x7f) << 24 | hmac[offset+1] << 16 | hmac[offset+2] << 8 | hmac[offset+3]) % Math.pow(10, digits);
    return String(code).padStart(digits, '0');
  }
  var _interval = null;
  function startTimer() {
    if (_interval) clearInterval(_interval);
    _interval = setInterval(function () {
      var period = parseInt($('t-period').value, 10);
      var remaining = period - (Math.floor(Date.now() / 1000) % period);
      $('t-timer').textContent = remaining + 's remaining';
      $('t-timer').style.color = remaining <= 5 ? 'var(--red)' : 'var(--green)';
      if (remaining === period) $('btn-gen').click(); // auto-refresh
    }, 1000);
  }
  $('btn-gen').addEventListener('click', async function () {
    var secret = $('t-secret').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!secret) { $('t-err').textContent = 'Enter a Base32 secret key.'; $('t-err').style.display = 'block'; return; }
    try {
      var digits = parseInt($('t-digits').value, 10);
      var period = parseInt($('t-period').value, 10);
      var code = await generateTOTP(secret, digits, period);
      $('t-result').className = 'out-body mono b';
      $('t-result').style.fontSize = '28px'; $('t-result').style.textAlign = 'center'; $('t-result').style.letterSpacing = '8px';
      $('t-result').textContent = code;
      startTimer();
      CK.toast('TOTP code generated');
    } catch (e) { $('t-err').textContent = 'Error: ' + e.message; $('t-err').style.display = 'block'; }
  });
  $('btn-clr').addEventListener('click', function () { $('t-secret').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Code will appear here\u2026'; $('t-timer').textContent = '--'; if (_interval) clearInterval(_interval); });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireCtrlEnter('btn-gen');
  CK.setUsageContent('<ol><li>Enter your <strong>Base32 secret</strong> (from your authenticator app setup).</li><li>Choose digits (6 or 8) and period (30s or 60s).</li><li>Click <strong>Generate Code</strong> — auto-refreshes each period.</li></ol><p>Uses HMAC-SHA1 per <a href="https://tools.ietf.org/html/rfc6238" target="_blank">RFC 6238</a>. Compatible with Google Authenticator, Authy, etc. Your secret never leaves your device.</p>');
})();