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
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.hash + '</div><h2 id="t-heading">Number Base Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-from">From Base</label><select id="t-from"><option value="10" selected>Decimal (10)</option><option value="2">Binary (2)</option><option value="8">Octal (8)</option><option value="16">Hex (16)</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Input Number</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><input type="text" id="t-input" placeholder="Enter a number\u2026" class="mono"><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-conv" aria-label="Convert">' + IC.hash + ' <span>Convert</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>All Bases</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Results will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Results will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  var BASE='';
  var _pathSlug=(window.location.pathname.match(/\/tools\/([^/]+)/)||[])[1]||'';
  if(_pathSlug==='decimal-to-hex'){$('t-from').value='10';}
  else if(_pathSlug==='hex-to-decimal'){$('t-from').value='16';}
  $('t-from').addEventListener('change',function(){
    var v=this.value;
    var slugMap={'10':'decimal-to-hex','16':'hex-to-decimal'};
    var newSlug=slugMap[v]||'number-base-converter';
    var newPath=BASE+'/tools/'+newSlug+'/';
    if(window.location.pathname!==newPath)history.pushState(null,'',newPath);
  });
  $('btn-conv').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var base = parseInt($('t-from').value, 10);
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!input) { $('t-err').textContent='Enter a number.'; $('t-err').style.display='block'; return; }
    try {
      var num = BigInt(base === 10 ? input : '0x0');
      if (base === 10) num = BigInt(input);
      else if (base === 16) num = BigInt('0x' + input);
      else if (base === 8) num = BigInt('0o' + input);
      else if (base === 2) num = BigInt('0b' + input);
      var lines = [
        'Binary (2):   ' + num.toString(2),
        'Octal (8):    ' + num.toString(8),
        'Decimal (10): ' + num.toString(10),
        'Hex (16):     ' + num.toString(16).toUpperCase()
      ];
      $('t-result').className='out-body mono b'; $('t-result').textContent = lines.join('\n');
      CK.toast('Converted');
    } catch (e) {
      $('t-err').textContent = 'Invalid number for base ' + base + '.'; $('t-err').style.display = 'block';
    }
  });
  CK.wireCtrlEnter('btn-conv');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'number-base-converter-output.txt');
  CK.setUsageContent('<ol><li>Select the <strong>source base</strong> (binary, octal, decimal, hex).</li><li>Enter the <strong>number</strong> and click <strong>Convert</strong>.</li></ol><p>Supports arbitrarily large numbers via <code>BigInt</code>. Outputs in all four bases simultaneously.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='255';inp.dispatchEvent(new Event('input'));}})();
  (function(){var _dt;var _inp=$('t-input');var _btn=$('btn-conv');if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();
})();