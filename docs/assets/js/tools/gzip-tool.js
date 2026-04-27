(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={zip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.zip+'</div><h2 id="t-heading">Gzip Compress / Decompress</h2></div><span class="tc-badge tc-badge-amber">Dev</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="mode-tabs" id="t-tabs"><button class="mt active" data-mode="compress">Compress</button><button class="mt" data-mode="decompress">Decompress</button></div><div class="field"><div class="field-hdr"><label for="t-input">Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter text to compress\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div><button type="button" class="act-btn act-amber" id="btn-run">'+IC.zip+' <span>Compress</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" data-target="t-output" aria-label="Copy output">'+IC.copy+' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body"><textarea id="t-output" readonly class="mono" rows="6" placeholder="Output will appear here\u2026"></textarea></div><div id="t-stats" style="color:var(--muted);font-size:.85rem;margin-top:6px"></div></div></div></div></div>';
  var _mode='compress',_blob=null;
  var tabBtns=document.querySelectorAll('#t-tabs .mt');
  tabBtns.forEach(function(btn){btn.addEventListener('click',function(){tabBtns.forEach(function(b){b.classList.remove('active');});this.classList.add('active');_mode=this.dataset.mode;$('btn-run').querySelector('span').textContent=_mode==='compress'?'Compress':'Decompress';$('t-input').placeholder=_mode==='compress'?'Enter text to compress\u2026':'Paste Base64-encoded gzip data\u2026';});});
  function toBase64(u8){var bin='';for(var i=0;i<u8.length;i++)bin+=String.fromCharCode(u8[i]);return btoa(bin);}
  function fromBase64(b64){var bin=atob(b64),u8=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return u8;}
  $('btn-run').addEventListener('click',function(){
    var input=$('t-input').value.trim();$('t-err').textContent='';$('t-err').style.display='none';$('t-stats').textContent='';
    if(!input){$('t-err').textContent='Enter input data.';$('t-err').style.display='block';return;}
    if(typeof pako==='undefined'){$('t-err').textContent='Pako library not loaded.';$('t-err').style.display='block';return;}
    try{
      if(_mode==='compress'){
        var compressed=pako.gzip(input);
        var b64=toBase64(compressed);
        $('t-output').value=b64;
        var origSize=new TextEncoder().encode(input).length;
        var compSize=compressed.length;
        var ratio=((1-compSize/origSize)*100).toFixed(1);
        $('t-stats').textContent='Original: '+origSize+' bytes \u2192 Compressed: '+compSize+' bytes ('+ratio+'% reduction)';
        _blob=new Blob([compressed],{type:'application/gzip'});
        CK.toast('Compressed');
      }else{
        var u8=fromBase64(input);
        var decompressed=pako.ungzip(u8,{to:'string'});
        $('t-output').value=decompressed;
        $('t-stats').textContent='Compressed: '+u8.length+' bytes \u2192 Decompressed: '+new TextEncoder().encode(decompressed).length+' bytes';
        _blob=new Blob([decompressed],{type:'text/plain'});
        CK.toast('Decompressed');
      }
    }catch(e){$('t-err').textContent='Error: '+e.message;$('t-err').style.display='block';}
  });
  $('btn-dl').addEventListener('click',function(){
    if(!_blob){CK.toast('Run first','err');return;}
    var ext=_mode==='compress'?'.gz':'.txt';
    var a=document.createElement('a');a.download='output'+ext;a.href=URL.createObjectURL(_blob);a.click();URL.revokeObjectURL(a.href);CK.toast('Downloaded');
  });
  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-output').value='';$('t-stats').textContent='';_blob=null;});
  CK.wireCopy($('btn-copy'),function(){return $('t-output').value;});CK.wireCtrlEnter('btn-run');CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Choose <strong>Compress</strong> or <strong>Decompress</strong> mode.</li><li>Enter text (compress) or Base64-encoded gzip data (decompress).</li><li>Click the action button.</li><li>Copy or download the result.</li></ol><p>Powered by pako.js. All processing is client-side.</p>');
})();