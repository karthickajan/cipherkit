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
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.hash + '</div><h2 id="t-heading">Hex Decoder</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Decode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Hex String</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter hex string (e.g. 48656c6c6f)\u2026" rows="5"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-dec" aria-label="Decode hex">' + IC.hash + ' <span>Decode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Decoded Text</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">⇄ <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Decoded text will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Decoded text will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-dec').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter a hex string.'; $('t-err').style.display = 'block'; return; }
    var clean = input.replace(/[\s:,\-]/g, '');
    if (!/^[0-9a-fA-F]+$/.test(clean)) { $('t-err').textContent = 'Invalid hex characters detected.'; $('t-err').style.display = 'block'; return; }
    if (clean.length % 2 !== 0) { $('t-err').textContent = 'Hex string must have even number of characters.'; $('t-err').style.display = 'block'; return; }
    var bytes = new Uint8Array(clean.length / 2);
    for (var i = 0; i < clean.length; i += 2) { bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16); }
    try {
      var text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = text;
      CK.toast('Hex decoded');
    } catch (e) {
      $('t-err').textContent = 'Failed to decode bytes as UTF-8 text.'; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-dec');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'hex-decode-output.txt');
  CK.setUsageContent('<ol><li><strong>Enter a hex string</strong> (e.g. <code>48656c6c6f</code>).</li><li>Separators (spaces, colons, dashes) are automatically stripped.</li><li>Click <strong>Decode</strong> to convert back to text.</li></ol><p>The hex bytes are decoded as UTF-8 text. Supports all common hex formats used in network tools, debuggers, and hex editors.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21';inp.dispatchEvent(new Event('input'));var b=$('btn-dec');if(b)b.click();}})();
  (function(){var _dt;var _inp=$('t-input');var _btn=$('btn-dec');if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();
  (function(){var sb=$('btn-swap');if(sb){sb.addEventListener('click',function(){var oe=$('t-result');var ie=$('t-input');var ov=oe?oe.value||oe.textContent:'';if(!ov||ov.indexOf('appear')!==-1)return;ie.value=ov;ie.dispatchEvent(new Event('input'));ie.scrollIntoView({behavior:'smooth',block:'start'});CK.toast('Output moved to input')})}})();
})();