/**
 * CipherKit — Image Resizer (Canvas API)
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}

  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.image+'</div><h2 id="t-heading">Image Resizer</h2></div><span class="tc-badge tc-badge-purple">Resize</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Upload Image</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="file" id="t-file" accept="image/*"><div id="t-info" style="color:var(--muted);font-size:.85rem;margin-top:4px"></div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-w">Width (px)</label><input type="number" id="t-w" class="mono" min="1" max="8000" placeholder="auto"></div><div class="sel-group"><label for="t-h">Height (px)</label><input type="number" id="t-h" class="mono" min="1" max="8000" placeholder="auto"></div><label class="cb-label" style="display:flex;align-items:center;gap:6px;margin-top:6px"><input type="checkbox" id="t-lock" checked> Maintain aspect ratio</label></div><div class="ctrl-row"><div class="sel-group"><label for="t-fmt">Format</label><select id="t-fmt"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div></div><button type="button" class="act-btn act-purple" id="btn-resize">'+IC.image+' <span>Resize</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="t-result" role="status" style="text-align:center;min-height:80px;padding:16px"><span style="color:var(--muted);font-style:italic">Resized image will appear here\u2026</span></div></div></div></div></div>';

  var _dataUrl='',_ext='png',_origW=0,_origH=0;
  $('t-file').addEventListener('change',function(){
    var file=this.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();img.onload=function(){_origW=img.naturalWidth;_origH=img.naturalHeight;$('t-w').value=_origW;$('t-h').value=_origH;$('t-info').textContent='Original: '+_origW+' \u00d7 '+_origH;};
      img.src=e.target.result;
    };reader.readAsDataURL(file);
  });
  $('t-w').addEventListener('input',function(){if($('t-lock').checked&&_origW){var r=_origH/_origW;$('t-h').value=Math.round((parseInt(this.value)||0)*r);}});
  $('t-h').addEventListener('input',function(){if($('t-lock').checked&&_origH){var r=_origW/_origH;$('t-w').value=Math.round((parseInt(this.value)||0)*r);}});

  $('btn-resize').addEventListener('click',function(){
    var file=$('t-file').files[0];$('t-err').textContent='';$('t-err').style.display='none';
    if(!file){$('t-err').textContent='Select an image file.';$('t-err').style.display='block';return;}
    var nw=parseInt($('t-w').value)||_origW,nh=parseInt($('t-h').value)||_origH;
    if(nw<1||nh<1){$('t-err').textContent='Width/height must be positive.';$('t-err').style.display='block';return;}
    var fmt=$('t-fmt').value;_ext=fmt==='image/jpeg'?'jpg':fmt==='image/webp'?'webp':'png';
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();img.onload=function(){
        var c=document.createElement('canvas');c.width=nw;c.height=nh;
        var ctx=c.getContext('2d');
        if(fmt==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,nw,nh);}
        ctx.drawImage(img,0,0,nw,nh);
        _dataUrl=c.toDataURL(fmt,0.92);
        var sizeKB=Math.round(_dataUrl.length*3/4/1024);
        $('t-result').innerHTML='<img src="'+_dataUrl+'" style="max-width:100%;border-radius:4px" alt="Resized image"><p style="margin-top:8px;color:var(--muted);font-size:.85rem">'+nw+' \u00d7 '+nh+' \u2022 ~'+sizeKB+' KB</p>';
        CK.toast('Resized to '+nw+'\u00d7'+nh);
      };img.src=e.target.result;
    };reader.readAsDataURL(file);
  });
  $('btn-dl').addEventListener('click',function(){if(!_dataUrl){CK.toast('Resize first','err');return;}var a=document.createElement('a');a.download='resized.'+_ext;a.href=_dataUrl;a.click();CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){$('t-file').value='';$('t-w').value='';$('t-h').value='';$('t-info').textContent='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Resized image will appear here\u2026</span>';_dataUrl='';_origW=0;_origH=0;});
  CK.wireCtrlEnter('btn-resize');
  CK.setUsageContent('<ol><li>Upload an <strong>image file</strong>.</li><li>Enter desired <strong>width/height</strong> in pixels.</li><li>Toggle <strong>Maintain aspect ratio</strong> to lock proportions.</li><li>Click <strong>Resize</strong> and download.</li></ol><p>All processing happens locally using Canvas API.</p>');
})();
