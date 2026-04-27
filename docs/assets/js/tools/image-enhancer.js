(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>'};
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui">'
    +'<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-green">'+IC.image+'</div><h2 id="t-heading">Image Filters & Effects</h2></div><span class="tc-badge tc-badge-green">Filters</span></div>'
    +'<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +'<div class="field"><div class="field-hdr"><label>Upload Image</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div>'
    +'<div class="upload-zone" id="ie-drop"><input type="file" id="t-file" accept="image/*" hidden><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p class="upload-label">Drop your image here</p><p class="upload-sub">or <span class="upload-link">browse to upload</span></p><p class="upload-formats">Supports: PNG, JPG, WebP, GIF</p></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +'<div id="t-limit" style="color:var(--muted);font-size:.85rem;margin-bottom:8px"></div>'
    +'<div class="ctrl-row"><div class="sel-group"><label for="t-mode">Enhancement</label><select id="t-mode"><option value="sharpen">Sharpen</option><option value="brightness">Brighten</option><option value="contrast">High Contrast</option><option value="grayscale">Grayscale</option><option value="sepia">Sepia</option><option value="invert">Invert</option></select></div>'
    +'<div class="sel-group"><label for="t-intensity">Intensity</label><select id="t-intensity"><option value="0.5">Low</option><option value="1" selected>Medium</option><option value="1.5">High</option></select></div></div>'
    +'<button type="button" class="act-btn act-green" id="btn-enhance">'+IC.image+' <span>Enhance</span></button>'
    +'<div class="notice notice-amber" style="margin-bottom:0">'
    +'<div class="notice-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg></div>'
    +'<div><strong style="color:var(--amber)">\u26a1 AI Upscaling coming soon</strong>'
    +'<br><span style="font-size:11px;color:var(--muted)">Real 2\u00d7/4\u00d7 AI upscaling via secure Cloudflare Worker \u00b7 Not stored \u00b7 Rate limited \u00b7 Free tier included</span></div>'
    +'</div>'
    +'<div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div>'
    +'<div class="out-body" id="t-result" role="status" style="text-align:center;min-height:80px;padding:16px"><span style="color:var(--muted);font-style:italic">Enhanced image will appear here\u2026</span></div></div>'
    +'</div></div></div>';
  (function(){
    var zone=$('ie-drop'),fi=$('t-file');
    zone.addEventListener('click',function(e){if(e.target===fi)return;fi.click();});
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.classList.add('drag-over');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('drag-over');});
    zone.addEventListener('drop',function(e){e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files[0]){fi.files=e.dataTransfer.files;showFileInfo(fi.files[0]);}});
    fi.addEventListener('change',function(){if(fi.files[0])showFileInfo(fi.files[0]);});
    function showFileInfo(f){zone.classList.add('has-file');zone.innerHTML='<p style="color:#e0e0e0;font-size:14px;margin:0">'+f.name+'</p><p style="color:#555;font-size:12px;margin:4px 0 0">'+(f.size/1024).toFixed(1)+' KB</p>';}
  })();
  var RL_KEY='ck_imgenhance_uses';
  function getUsesToday(){
    try{var d=JSON.parse(localStorage.getItem(RL_KEY)||'{}');var today=new Date().toISOString().slice(0,10);if(d.date!==today)return 0;return d.count||0;}catch(e){return 0;}
  }
  function incUses(){
    var today=new Date().toISOString().slice(0,10);var count=getUsesToday()+1;
    localStorage.setItem(RL_KEY,JSON.stringify({date:today,count:count}));
  }
  function showLimit(){$('t-limit').textContent='Daily enhancements: '+getUsesToday()+' / 3 (resets midnight)';}
  showLimit();
  var _dataUrl='';
  function applyFilter(img,mode,intensity){
    var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
    var ctx=c.getContext('2d');
    var filterStr='';
    var intVal=parseFloat(intensity);
    if(mode==='sharpen'){ctx.drawImage(img,0,0);sharpenCanvas(ctx,c.width,c.height,intVal);return c;}
    if(mode==='brightness')filterStr='brightness('+(1+0.3*intVal)+')';
    else if(mode==='contrast')filterStr='contrast('+(1+0.5*intVal)+')';
    else if(mode==='grayscale')filterStr='grayscale('+Math.min(1,0.5+0.5*intVal)+')';
    else if(mode==='sepia')filterStr='sepia('+Math.min(1,0.5+0.5*intVal)+')';
    else if(mode==='invert')filterStr='invert('+Math.min(1,0.5+0.5*intVal)+')';
    ctx.filter=filterStr;ctx.drawImage(img,0,0);
    return c;
  }
  function sharpenCanvas(ctx,w,h,strength){
    var imageData=ctx.getImageData(0,0,w,h);
    var data=imageData.data;
    var copy=new Uint8ClampedArray(data);
    var k=strength*0.5;
    for(var y=1;y<h-1;y++){
      for(var x=1;x<w-1;x++){
        var idx=(y*w+x)*4;
        for(var c=0;c<3;c++){
          var val=5*copy[idx+c]-copy[((y-1)*w+x)*4+c]-copy[((y+1)*w+x)*4+c]-copy[(y*w+x-1)*4+c]-copy[(y*w+x+1)*4+c];
          data[idx+c]=Math.round(copy[idx+c]+(val-copy[idx+c])*k);
        }
      }
    }
    ctx.putImageData(imageData,0,0);
  }
  $('btn-enhance').addEventListener('click',function(){
    var file=$('t-file').files[0];$('t-err').textContent='';$('t-err').style.display='none';
    if(!file){$('t-err').textContent='Select an image file.';$('t-err').style.display='block';return;}
    var mode=$('t-mode').value;var intensity=$('t-intensity').value;
    $('t-result').innerHTML='<span style="color:var(--muted)">Processing\u2026</span>';
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();
      img.onload=function(){
        try{
          var canvas=applyFilter(img,mode,intensity);
          _dataUrl=canvas.toDataURL('image/png');
          $('t-result').innerHTML='<img src="'+_dataUrl+'" style="max-width:100%;border-radius:4px" alt="Enhanced image"><p style="margin-top:8px;color:var(--muted);font-size:.85rem">'+canvas.width+' \u00d7 '+canvas.height+'</p>';
          incUses();showLimit();
          CK.toast('Image enhanced');
        }catch(err){$('t-err').textContent='Error: '+err.message;$('t-err').style.display='block';}
      };
      img.onerror=function(){$('t-err').textContent='Cannot load image.';$('t-err').style.display='block';};
      img.src=e.target.result;
    };reader.readAsDataURL(file);
  });
  $('btn-dl').addEventListener('click',function(){if(!_dataUrl){CK.toast('Enhance first','err');return;}var a=document.createElement('a');a.download='enhanced.png';a.href=_dataUrl;a.click();CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){$('t-file').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Enhanced image will appear here\u2026</span>';_dataUrl='';});
  CK.wireCtrlEnter('btn-enhance');
  CK.setUsageContent('<ol><li>Upload an <strong>image file</strong>.</li><li>Choose an <strong>enhancement mode</strong> (Sharpen, Brighten, Contrast, Grayscale, Sepia, Invert).</li><li>Select the <strong>intensity</strong> level.</li><li>Click <strong>Enhance</strong> and download the result.</li></ol><p>All processing is done locally in your browser using Canvas API. No images are uploaded to any server.</p><p style="font-size:.85rem;color:var(--muted)">\u2139\ufe0f Basic filters are free and unlimited in a future update \u2014 rate limit will apply to AI upscaling only.</p>');
})();