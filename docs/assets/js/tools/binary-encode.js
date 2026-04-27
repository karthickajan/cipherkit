(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    binary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="8" height="18" rx="2"/><rect x="14" y="3" width="8" height="18" rx="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="18" y1="8" x2="18" y2="12"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.binary + '</div><h2 id="t-heading">Binary Encoder</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Encode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-bits">Bit Width</label><select id="t-bits"><option value="8" selected>8-bit</option><option value="16">16-bit</option></select></div><div class="sel-group"><label for="t-sep">Separator</label><select id="t-sep"><option value=" " selected>Space</option><option value="">None</option><option value="\n">Newline</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Plain Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter text to convert to binary\u2026" rows="5"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-enc" aria-label="Convert to binary">' + IC.binary + ' <span>Encode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Binary Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">⇄ <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Binary output will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Binary output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-enc').addEventListener('click', function () {
    var input = $('t-input').value;
    var bits = parseInt($('t-bits').value, 10);
    var sep = $('t-sep').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter text to encode.'; $('t-err').style.display = 'block'; return; }
    var parts = [];
    for (var i = 0; i < input.length; i++) {
      var code = input.charCodeAt(i);
      parts.push(code.toString(2).padStart(bits, '0'));
    }
    var result = parts.join(sep);
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = result;
    CK.toast('Binary encoded');
  });
  CK.wireCtrlEnter('btn-enc');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'binary-encode-output.txt');
  CK.setUsageContent('<ol><li><strong>Enter text</strong> you want to convert to binary.</li><li>Choose <strong>bit width</strong> (8-bit for ASCII, 16-bit for Unicode) and a <strong>separator</strong>.</li><li>Click <strong>Encode</strong> to get the binary representation.</li></ol><p>Each character is converted to its binary value based on its character code. Useful for learning binary, digital electronics, and low-level programming.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='Hi';inp.dispatchEvent(new Event('input'));var b=$('btn-enc');if(b)b.click();}})();
  (function(){var _dt;var _inp=$('t-input');var _btn=$('btn-enc');if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();
  (function(){var sb=$('btn-swap');if(sb){sb.addEventListener('click',function(){var oe=$('t-result');var ie=$('t-input');var ov=oe?oe.value||oe.textContent:'';if(!ov||ov.indexOf('appear')!==-1)return;ie.value=ov;ie.dispatchEvent(new Event('input'));ie.scrollIntoView({behavior:'smooth',block:'start'});CK.toast('Output moved to input')})}})();
})();