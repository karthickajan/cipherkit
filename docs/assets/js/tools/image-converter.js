/**
 * CipherKit — Image Format Converter (Canvas API)
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}

  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.image+'</div><h2 id="t-heading">Image Format Converter</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Upload Image</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="file" id="t-file" accept="image/*"><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-fmt">Output Format</label><select id="t-fmt"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div><div class="sel-group"><label for="t-quality">Quality</label><select id="t-quality"><option value="1">100%</option><option value="0.9" selected>90%</option><option value="0.8">80%</option><option value="0.6">60%</option><option value="0.4">40%</option></select></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.image+' <span>Convert</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="t-result" role="status" style="text-align:center;min-height:80px;padding:16px"><span style="color:var(--muted);font-style:italic">Converted image will appear here\u2026</span></div></div></div></div></div>';

  var _dataUrl='',_ext='png';
  $('btn-conv').addEventListener('click',function(){
    var file=$('t-file').files[0];$('t-err').textContent='';$('t-err').style.display='none';
    if(!file){$('t-err').textContent='Select an image file.';$('t-err').style.display='block';return;}
    var fmt=$('t-fmt').value;var q=parseFloat($('t-quality').value);
    _ext=fmt==='image/jpeg'?'jpg':fmt==='image/webp'?'webp':'png';
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();
      img.onload=function(){
        var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        var ctx=c.getContext('2d');
        if(fmt==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);}
        ctx.drawImage(img,0,0);
        _dataUrl=c.toDataURL(fmt,q);
        var sizeKB=(Math.round(_dataUrl.length*3/4/1024));
        $('t-result').innerHTML='<img src="'+_dataUrl+'" style="max-width:100%;border-radius:4px" alt="Converted image"><p style="margin-top:8px;color:var(--muted);font-size:.85rem">'+img.naturalWidth+' \u00d7 '+img.naturalHeight+' \u2022 ~'+sizeKB+' KB</p>';
        CK.toast('Converted to '+_ext.toUpperCase());
      };
      img.onerror=function(){$('t-err').textContent='Cannot load image.';$('t-err').style.display='block';};
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
  $('btn-dl').addEventListener('click',function(){if(!_dataUrl){CK.toast('Convert first','err');return;}var a=document.createElement('a');a.download='converted.'+_ext;a.href=_dataUrl;a.click();CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){$('t-file').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Converted image will appear here\u2026</span>';_dataUrl='';});
  CK.wireCtrlEnter('btn-conv');
  CK.setUsageContent('<ol><li>Upload an <strong>image file</strong> (PNG, JPEG, WebP, GIF, BMP, etc.).</li><li>Select the desired <strong>output format</strong> and quality.</li><li>Click <strong>Convert</strong> and download the result.</li></ol><p>Uses the Canvas API. All processing is local — no uploads.</p>');
})();
