(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  var BASE='';
  var fmtMime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',heic:'image/heic',heif:'image/heif'};
  var fmtLabel={png:'PNG',jpg:'JPEG',jpeg:'JPEG',webp:'WebP',heic:'HEIC',heif:'HEIC'};
  var slugRoutes={'png-to-jpg':['png','jpg'],'jpg-to-png':['jpg','png'],'png-to-webp':['png','webp'],'jpg-to-webp':['jpg','webp'],'webp-to-png':['webp','png'],'webp-to-jpg':['webp','jpg'],'heic-to-jpg':['heic','jpg'],'heic-to-png':['heic','png'],'heic-to-webp':['heic','webp']};
  var pathSlug=(window.location.pathname.match(/\/tools\/([^/]+)/)||[])[1]||'';
  var preFrom='',preTo='';
  if(slugRoutes[pathSlug]){preFrom=slugRoutes[pathSlug][0];preTo=slugRoutes[pathSlug][1];}
  var fmtOptsFrom='<option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option><option value="image/heic">HEIC</option>';
  var fmtOptsTo='<option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option>';
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.image+'</div><h2 id="t-heading">Image Format Converter</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Upload Image</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><div class="upload-zone" id="ic-drop"><input type="file" id="t-file" accept="image/*,.heic,.heif" hidden><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p class="upload-label">Drop your image here</p><p class="upload-sub">or <span class="upload-link">browse to upload</span></p><p class="upload-formats">Supports: PNG, JPG, WebP, HEIC</p></div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-from-fmt">From</label><select id="t-from-fmt">'+fmtOptsFrom+'</select></div><div class="sel-group"><label for="t-fmt">To</label><select id="t-fmt">'+fmtOptsTo+'</select></div><div class="sel-group"><label for="t-quality">Quality</label><select id="t-quality"><option value="1">100%</option><option value="0.9" selected>90%</option><option value="0.8">80%</option><option value="0.6">60%</option><option value="0.4">40%</option></select></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.image+' <span>Convert</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="t-result" role="status" style="text-align:center;min-height:80px;padding:16px;max-height:320px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Converted image will appear here\u2026</span></div></div></div></div></div>';
  if(preFrom){$('t-from-fmt').value=fmtMime[preFrom]||'image/png';}
  if(preTo){$('t-fmt').value=fmtMime[preTo]||'image/jpeg';}
  function updateURL(){
    var fromKey=Object.keys(fmtMime).find(function(k){return fmtMime[k]===$('t-from-fmt').value&&k!=='jpeg'&&k!=='heif';})||'png';
    var toKey=Object.keys(fmtMime).find(function(k){return fmtMime[k]===$('t-fmt').value&&k!=='jpeg'&&k!=='heif';})||'jpg';
    var routeKey=fromKey+'-to-'+toKey;
    if(slugRoutes[routeKey]){
      var newPath=BASE+'/tools/'+routeKey+'/';
      if(window.location.pathname!==newPath){history.pushState(null,'',newPath);}
    }else{
      var basePath=BASE+'/tools/image-converter/';
      if(window.location.pathname!==basePath){history.pushState(null,'',basePath);}
    }
  }
  $('t-from-fmt').addEventListener('change',updateURL);
  $('t-fmt').addEventListener('change',updateURL);
  var _blob=null,_blobUrl='',_ext='png',_origName='image',_selectedFile=null;
  function detectFromMime(file){
    var t=file.type||'';var n=(file.name||'').toLowerCase();
    if(t==='image/png'||n.endsWith('.png'))return 'image/png';
    if(t==='image/jpeg'||n.endsWith('.jpg')||n.endsWith('.jpeg'))return 'image/jpeg';
    if(t==='image/webp'||n.endsWith('.webp'))return 'image/webp';
    if(t==='image/heic'||t==='image/heif'||n.endsWith('.heic')||n.endsWith('.heif'))return 'image/heic';
    return '';
  }
  (function(){
    var zone=$('ic-drop'),fi=$('t-file');
    zone.addEventListener('click',function(e){if(e.target===fi)return;fi.click();});
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.classList.add('drag-over');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('drag-over');});
    zone.addEventListener('drop',function(e){e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files[0]){fi.files=e.dataTransfer.files;handleFile(fi.files[0]);}});
    fi.addEventListener('change',function(){if(fi.files[0])handleFile(fi.files[0]);});
    function handleFile(f){
      _selectedFile=f;_origName=f.name.replace(/\.[^.]+$/,'');
      var detected=detectFromMime(f);
      if(detected){$('t-from-fmt').value=detected;updateURL();}
      var info=zone.querySelector('.ic-file-info');
      if(!info){zone.classList.add('has-file');var children=zone.querySelectorAll(':not(input)');children.forEach(function(c){c.style.display='none';});info=document.createElement('div');info.className='ic-file-info';zone.appendChild(info);}
      info.innerHTML='<p style="color:#e0e0e0;font-size:14px;margin:0">'+f.name+'</p><p style="color:#555;font-size:12px;margin:4px 0 0">'+(f.size/1024).toFixed(1)+' KB</p>';
    }
  })();
  $('btn-conv').addEventListener('click',function(){
    $('t-err').textContent='';$('t-err').style.display='none';
    if(!_selectedFile){$('t-err').textContent='Select an image file.';$('t-err').style.display='block';return;}
    var fromFmt=$('t-from-fmt').value;
    var fmt=$('t-fmt').value;var q=parseFloat($('t-quality').value);
    _ext=fmt==='image/jpeg'?'jpg':fmt==='image/webp'?'webp':'png';
    /* Block HEIC as output — browsers can't encode HEIC */
    if(fmt==='image/heic'){$('t-err').textContent='Browser cannot encode HEIC. Choose PNG, JPEG, or WebP as output.';$('t-err').style.display='block';return;}
    if(fromFmt==='image/heic'){
      if(typeof heic2any==='undefined'){$('t-err').textContent='HEIC library still loading, try again in a moment.';$('t-err').style.display='block';return;}
      heic2any({blob:_selectedFile,toType:'image/png',quality:1}).then(function(convBlob){
        var b=Array.isArray(convBlob)?convBlob[0]:convBlob;
        loadAndConvert(b,fmt,q);
      }).catch(function(err){$('t-err').textContent='HEIC decode failed: '+(err.message||err);$('t-err').style.display='block';});
      return;
    }
    loadAndConvert(_selectedFile,fmt,q);
  });
  function loadAndConvert(fileOrBlob,fmt,q){
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();
      img.onload=function(){
        var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        var ctx=c.getContext('2d');
        if(fmt==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);}
        ctx.drawImage(img,0,0);
        c.toBlob(function(blob){
          if(!blob){$('t-err').textContent='Conversion failed.';$('t-err').style.display='block';return;}
          if(_blobUrl)URL.revokeObjectURL(_blobUrl);
          _blob=blob;_blobUrl=URL.createObjectURL(blob);
          var sizeKB=(blob.size/1024).toFixed(1);
          $('t-result').innerHTML='<img src="'+_blobUrl+'" style="max-width:100%;border-radius:4px" alt="Converted image"><p style="margin-top:8px;color:var(--muted);font-size:.85rem">'+img.naturalWidth+' \u00d7 '+img.naturalHeight+' \u2022 '+sizeKB+' KB</p>';
          CK.toast('Converted to '+_ext.toUpperCase());
        },fmt,q);
      };
      img.onerror=function(){$('t-err').textContent='Cannot load image.';$('t-err').style.display='block';};
      img.src=e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  }
  $('btn-dl').addEventListener('click',function(){if(!_blob){CK.toast('Convert first','err');return;}var a=document.createElement('a');a.download=_origName+'.'+_ext;a.href=_blobUrl;a.click();CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){_selectedFile=null;_blob=null;if(_blobUrl)URL.revokeObjectURL(_blobUrl);_blobUrl='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Converted image will appear here\u2026</span>';var z=$('ic-drop');if(z){z.classList.remove('has-file');var info=z.querySelector('.ic-file-info');if(info)info.remove();var children=z.querySelectorAll(':not(input)');children.forEach(function(c){c.style.display='';});$('t-file').value='';}});
  CK.wireCtrlEnter('btn-conv');
  CK.setUsageContent('<ol><li>Upload an <strong>image file</strong> (PNG, JPEG, WebP, HEIC, GIF, BMP, etc.).</li><li>The <strong>From</strong> format is auto-detected. Select <strong>To</strong> format and quality.</li><li>Click <strong>Convert</strong> and download the result.</li></ol><p>HEIC files (from iPhones) are decoded via heic2any, then converted locally. All processing is client-side — no uploads.</p>');
})();