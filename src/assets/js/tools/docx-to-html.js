/**
 * CipherKit — DOCX to HTML (uses mammoth.js CDN)
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}

  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.file+'</div><h2 id="t-heading">DOCX to HTML</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Upload DOCX File</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="file" id="t-file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"><div class="inline-error" id="t-err" role="alert"></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.file+' <span>Convert to HTML</span></button><div class="mode-tabs" id="t-tabs"><button class="mt active" data-tab="preview">Preview</button><button class="mt" data-tab="source">HTML Source</button></div><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" data-target="t-html" aria-label="Copy HTML">'+IC.copy+' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download HTML">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="t-result" role="status"><span style="color:var(--muted);font-style:italic">Converted HTML will appear here\u2026</span></div></div><textarea id="t-html" class="mono" style="display:none" aria-hidden="true"></textarea></div></div></div>';

  var _html='',_tab='preview';
  /* tabs */
  var tabBtns=document.querySelectorAll('#t-tabs .mt');
  tabBtns.forEach(function(btn){btn.addEventListener('click',function(){tabBtns.forEach(function(b){b.classList.remove('active');});this.classList.add('active');_tab=this.dataset.tab;showOutput();});});
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function showOutput(){
    if(!_html){$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Converted HTML will appear here\u2026</span>';return;}
    if(_tab==='preview'){$('t-result').innerHTML='<div style="background:#fff;color:#000;padding:16px;border-radius:4px">'+_html+'</div>';}
    else{$('t-result').innerHTML='<pre style="white-space:pre-wrap;word-break:break-all">'+esc(_html)+'</pre>';}
  }

  $('btn-conv').addEventListener('click',function(){
    var file=$('t-file').files[0];$('t-err').textContent='';$('t-err').style.display='none';
    if(!file){$('t-err').textContent='Select a .docx file.';$('t-err').style.display='block';return;}
    if(typeof mammoth==='undefined'){$('t-err').textContent='Mammoth.js library not loaded.';$('t-err').style.display='block';return;}
    var reader=new FileReader();
    reader.onload=function(e){
      var ab=e.target.result;
      mammoth.convertToHtml({arrayBuffer:ab}).then(function(result){
        _html=result.value;
        $('t-html').value=_html;
        showOutput();
        if(result.messages.length){console.log('Mammoth warnings:',result.messages);}
        CK.toast('Converted to HTML');
      }).catch(function(err){$('t-err').textContent='Conversion error: '+err.message;$('t-err').style.display='block';});
    };
    reader.readAsArrayBuffer(file);
  });
  $('btn-dl').addEventListener('click',function(){if(!_html){CK.toast('Convert first','err');return;}CK.downloadOutput(_html,'converted.html');CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){$('t-file').value='';_html='';$('t-html').value='';showOutput();});
  CK.wireCopy('btn-copy','t-html');CK.wireCtrlEnter('btn-conv');
  CK.setUsageContent('<ol><li>Upload a <strong>.docx file</strong>.</li><li>Click <strong>Convert to HTML</strong>.</li><li>Switch between <strong>Preview</strong> and <strong>HTML Source</strong> tabs.</li><li>Copy or download the HTML output.</li></ol><p>Powered by Mammoth.js. All processing is client-side.</p>');
})();
