(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    hash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
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
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.hash + '</div><h2 id="h-heading">SHA-512 Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-green">SHA-512</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="h-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="h-fmt">Output Format</label><select id="h-fmt"><option>Hex</option><option>Base64</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="h-input">Input Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear input">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="h-input" placeholder="Enter text to hash\u2026" rows="5"></textarea><div class="input-meta" id="h-input-meta"></div><div class="inline-error" id="h-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-gen" aria-label="Generate SHA-512 hash">' + IC.hash + ' <span>Generate Hash</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>SHA-512 Hash</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy hash">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="h-result" role="status" aria-live="polite">Hash will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('h-input').value = ''; $('h-result').className = 'out-body mono ph'; $('h-result').textContent = 'Hash will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('h-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('h-input'));
  $('btn-gen').addEventListener('click', function () {
    var input = $('h-input').value;
    var fmt = $('h-fmt').value;
    $('h-err').textContent = ''; $('h-err').style.display = 'none';
    if (!input) { $('h-err').textContent = 'Please enter text to hash.'; $('h-err').style.display = 'block'; return; }
    var hash = CryptoJS.SHA512(input);
    var out = fmt === 'Base64' ? hash.toString(CryptoJS.enc.Base64) : hash.toString(CryptoJS.enc.Hex);
    $('h-result').className = 'out-body mono b'; $('h-result').textContent = out;
    CK.toast('SHA-512 hash generated');
  });
  CK.wireCtrlEnter('btn-gen');
  CK.wireCharCounter($('h-input'), $('h-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('h-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'sha512-generator-output.txt');
  CK.setUsageContent('<ol><li><strong>Enter or paste text</strong> into the input field.</li><li>Select <strong>Hex</strong> or <strong>Base64</strong> output format.</li><li>Click <strong>Generate Hash</strong> to compute the SHA-512 digest.</li></ol><p>SHA-512 produces a 512-bit (64-byte) cryptographic hash from the SHA-2 family. It offers stronger collision resistance than SHA-256 and is used in TLS, SSH, and digital certificates.</p>');
  (function(){var inp=$('h-input');if(inp&&!inp.value){inp.value='Hello, World!';inp.dispatchEvent(new Event('input'));var b=$('btn-gen');if(b)b.click();}})();
  (function(){var _dt;var _inp=$('h-input');var _btn=$('btn-gen');if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();
})();