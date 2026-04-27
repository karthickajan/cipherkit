(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  var sty=document.createElement('style');
  sty.textContent='.d2h-tabs{display:flex;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:10px;padding:4px;gap:4px;margin-bottom:4px}.d2h-tab{flex:1;padding:10px 16px;border-radius:7px;border:none;background:transparent;color:#555;font-size:14px;font-family:inherit;cursor:pointer;transition:all .18s ease;text-align:center;white-space:nowrap}.d2h-tab:hover{color:#aaa;background:#161616}.d2h-tab.active{background:#1a1a1a;color:#b083f0;border:1px solid #2a2a2a;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04)}.d2h-preview{background:#fff;color:#000;padding:16px;border-radius:4px;max-height:320px;overflow-y:auto;resize:vertical}.d2h-source{max-height:320px;overflow-y:auto;resize:vertical;white-space:pre-wrap;word-break:break-all;font-size:.82rem;line-height:1.6;padding:12px}';
  document.head.appendChild(sty);
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.file+'</div><h2 id="t-heading">DOCX to HTML</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Upload DOCX File</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><div class="upload-zone" id="d2h-drop"><input type="file" id="t-file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p class="upload-label">Drop your DOCX file here</p><p class="upload-sub">or <span class="upload-link">browse to upload</span></p><p class="upload-formats">Supports: .docx files</p></div><div class="inline-error" id="t-err" role="alert"></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.file+' <span>Convert to HTML</span></button><div class="d2h-tabs"><button class="d2h-tab active" data-tab="preview">\ud83d\udc41 Preview</button><button class="d2h-tab" data-tab="source">\u27e8/\u27e9 HTML Source</button></div><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" aria-label="Copy HTML">'+IC.copy+' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download HTML">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="t-result" role="status" style="max-height:320px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Converted HTML will appear here\u2026</span></div></div></div></div></div>';
  (function(){
    var zone=$('d2h-drop'),fi=$('t-file');
    zone.addEventListener('click',function(e){if(e.target===fi)return;fi.click();});
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.classList.add('drag-over');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('drag-over');});
    zone.addEventListener('drop',function(e){e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files[0]){fi.files=e.dataTransfer.files;showFI(fi.files[0]);}});
    fi.addEventListener('change',function(){if(fi.files[0])showFI(fi.files[0]);});
    function showFI(f){zone.classList.add('has-file');zone.innerHTML='<p style="color:#e0e0e0;font-size:14px;margin:0">'+f.name+'</p><p style="color:#555;font-size:12px;margin:4px 0 0">'+(f.size/1024).toFixed(1)+' KB</p>';}
  })();
  var _html='',_tab='preview';
  document.querySelectorAll('.d2h-tab').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.d2h-tab').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');_tab=this.dataset.tab;showOutput();
    });
  });
  function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function syntaxHL(html){
    var e=escHtml(html);
    return e.replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9]*)((?:\s+[^&]*?)?)&gt;/g,function(m,tag,attrs){
      var hAttrs=attrs.replace(/([a-zA-Z-]+)(=)(&quot;[^&]*?&quot;|&apos;[^&]*?&apos;|\S+)/g,'<span style="color:#b083f0">$1</span>$2<span style="color:#ffd700">$3</span>');
      return '<span style="color:#00d4ff">&lt;'+tag+'</span>'+hAttrs+'<span style="color:#00d4ff">&gt;</span>';
    });
  }
  function showOutput(){
    if(!_html){$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Converted HTML will appear here\u2026</span>';return;}
    if(_tab==='preview'){$('t-result').innerHTML='<div class="d2h-preview">'+_html+'</div>';}
    else{$('t-result').innerHTML='<pre class="d2h-source">'+syntaxHL(_html)+'</pre>';}
  }
  $('btn-conv').addEventListener('click',function(){
    var file=$('t-file').files[0];$('t-err').textContent='';$('t-err').style.display='none';
    if(!file){$('t-err').textContent='Select a .docx file.';$('t-err').style.display='block';return;}
    if(typeof mammoth==='undefined'){$('t-err').textContent='Mammoth.js library not loaded.';$('t-err').style.display='block';return;}
    $('t-result').innerHTML='<span style="color:var(--muted)">Converting\u2026</span>';
    var reader=new FileReader();
    reader.onload=function(e){
      mammoth.convertToHtml({arrayBuffer:e.target.result}).then(function(result){
        _html=result.value;showOutput();
        if(result.messages.length)console.log('Mammoth warnings:',result.messages);
        CK.toast('Converted to HTML');
      }).catch(function(err){$('t-err').textContent='Conversion error: '+err.message;$('t-err').style.display='block';});
    };reader.readAsArrayBuffer(file);
  });
  $('btn-copy').addEventListener('click',function(){if(!_html){CK.toast('Convert first','err');return;}CK.copyText(_html,this);});
  $('btn-dl').addEventListener('click',function(){if(!_html){CK.toast('Convert first','err');return;}CK.downloadOutput(_html,'converted.html');});
  $('btn-clr').addEventListener('click',function(){$('t-file').value='';_html='';showOutput();});
  CK.wireCtrlEnter('btn-conv');
  CK.setUsageContent('<ol><li>Upload a <strong>.docx file</strong>.</li><li>Click <strong>Convert to HTML</strong> or press <kbd>Ctrl+Enter</kbd>.</li><li>Switch between <strong>Preview</strong> and <strong>HTML Source</strong> tabs.</li><li>Copy or download the HTML output.</li></ol><p>Powered by Mammoth.js. All processing is client-side.</p>');
})();