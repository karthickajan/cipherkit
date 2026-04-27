(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
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
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.code + '</div><h2 id="t-heading">HTML Entity Decoder</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Decode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Encoded HTML</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste HTML entities to decode\u2026" rows="5" spellcheck="false"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-dec" aria-label="Decode HTML entities">' + IC.code + ' <span>Decode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Decoded Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">⇄ <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Decoded output will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Decoded output will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-dec').addEventListener('click', function () {
    var input = $('t-input').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter encoded HTML.'; $('t-err').style.display = 'block'; return; }
    var ta = document.createElement('textarea'); ta.innerHTML = input;
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = ta.value;
    CK.toast('HTML decoded');
  });
  CK.wireCtrlEnter('btn-dec');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'html-decode-output.txt');
  CK.setUsageContent('<ol><li><strong>Paste HTML with entities</strong> (e.g. <code>&amp;amp;</code>, <code>&amp;lt;</code>) into the input.</li><li>Click <strong>Decode</strong> to convert back to original characters.</li></ol><p>Decodes all named HTML entities (<code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, etc.) and numeric entities (<code>&amp;#38;</code>, <code>&amp;#x26;</code>) back to their original characters.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='&lt;h1&gt;Hello &amp; &quot;World&quot;&lt;/h1&gt;';inp.dispatchEvent(new Event('input'));var b=$('btn-dec');if(b)b.click();}})();
  (function(){var _dt;var _inp=$('t-input');var _btn=$('btn-dec');if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();
  (function(){var sb=$('btn-swap');if(sb){sb.addEventListener('click',function(){var oe=$('t-result');var ie=$('t-input');var ov=oe?oe.value||oe.textContent:'';if(!ov||ov.indexOf('appear')!==-1)return;ie.value=ov;ie.dispatchEvent(new Event('input'));ie.scrollIntoView({behavior:'smooth',block:'start'});CK.toast('Output moved to input')})}})();
})();