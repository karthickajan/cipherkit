(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={
    image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 7h3a5 5 0 0 1 0 10h-3m-6 0H6a5 5 0 0 1 0-10h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    unlink:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 7h3a5 5 0 0 1 0 10h-3m-6 0H6a5 5 0 0 1 0-10h3"/></svg>'
  };
  function $(id){return document.getElementById(id);}
  var sty=document.createElement('style');
  sty.textContent='.ir-tabs{display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap}.ir-tab{background:#111;border:1px solid #1e1e1e;border-radius:6px;padding:7px 14px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .2s;font-family:var(--mono)}.ir-tab:hover{border-color:#333}.ir-tab.active{background:#111;border-color:#00ff88;color:#00ff88}.ir-panel{display:none}.ir-panel.active{display:block}.ir-row{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px}.ir-field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:100px}.ir-field label{font-size:11px;color:var(--muted)}.ir-field input,.ir-field select{background:#111;border:1px solid #1e1e1e;border-radius:6px;padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;transition:border-color .2s}.ir-field input:focus,.ir-field select:focus{border-color:#00ff88}.ir-chain{width:36px;height:36px;border-radius:50%;background:#111;border:1px solid #1e1e1e;display:grid;place-items:center;cursor:pointer;transition:all .2s;flex-shrink:0;align-self:flex-end}.ir-chain:hover,.ir-chain.locked{border-color:#00ff88}.ir-chain.locked svg{stroke:#00ff88}.ir-chain svg{width:16px;height:16px;stroke:var(--muted);fill:none}.ir-slider-row{display:flex;align-items:center;gap:12px}.ir-slider-row input[type=range]{flex:1;accent-color:#00ff88;height:6px}.ir-slider-val{font-size:13px;color:#00ff88;font-family:var(--mono);min-width:50px;text-align:right}.ir-dim-readout{font-size:12px;color:var(--muted);margin-top:4px}.ir-upload{border:2px dashed #2a2a2a;border-radius:10px;padding:32px 16px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:16px}.ir-upload:hover,.ir-upload.dragover{border-color:#00ff88;background:rgba(0,255,136,.03)}.ir-upload svg{width:32px;height:32px;stroke:var(--muted);margin-bottom:8px}.ir-upload-text{font-size:12px;color:var(--muted)}.ir-upload-info{font-size:12px;color:var(--muted);margin-top:6px}.ir-out-tabs{display:flex;gap:4px;margin-bottom:10px}.ir-out-tab{background:#111;border:1px solid #1e1e1e;border-radius:5px;padding:5px 12px;font-size:11px;color:var(--muted);cursor:pointer;font-family:var(--mono);transition:all .2s}.ir-out-tab.active{border-color:#00ff88;color:#00ff88}.ir-quality-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}.ir-quality-row label{font-size:11px;color:var(--muted);min-width:55px}.ir-quality-row input[type=range]{flex:1;accent-color:#00ff88}.ir-quality-row .ir-qval{font-size:12px;color:var(--text);font-family:var(--mono);min-width:30px}.ir-stats{font-size:12px;color:var(--muted);margin:10px 0;line-height:1.8}.ir-stats b{color:var(--text)}.ir-warn{background:rgba(232,160,32,.08);border:1px solid rgba(232,160,32,.25);border-radius:6px;padding:8px 12px;font-size:11px;color:#e8a020;margin-bottom:10px;display:none}.ir-crop-container{position:relative;max-height:420px;overflow:hidden;background:#000;border-radius:8px;margin-bottom:12px;touch-action:none;padding-bottom:10px}.ir-crop-img{display:block;max-width:100%;transform-origin:0 0}.ir-crop-overlay{position:absolute;inset:0;pointer-events:none;overflow:visible}.ir-crop-frame{position:absolute;border:2px solid #00ff88;box-shadow:0 0 0 9999px rgba(0,0,0,.5);pointer-events:auto;cursor:move}.ir-crop-handle{position:absolute;width:16px;height:16px;background:#00ff88;border-radius:2px;pointer-events:auto;z-index:5}.ir-crop-handle::before{content:\'\';position:absolute;inset:-20px;z-index:1}.ir-crop-handle.tl{top:-8px;left:-8px;cursor:nw-resize}.ir-crop-handle.tr{top:-8px;right:-8px;cursor:ne-resize}.ir-crop-handle.bl{bottom:-8px;left:-8px;cursor:sw-resize}.ir-crop-handle.br{bottom:-8px;right:-8px;cursor:se-resize}.ir-aspect-row{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}.ir-aspect-btn{background:#111;border:1px solid #1e1e1e;border-radius:4px;padding:4px 10px;font-size:11px;color:var(--muted);cursor:pointer;font-family:var(--mono);transition:all .2s}.ir-aspect-btn.active{border-color:#00ff88;color:#00ff88}.ir-edge-preview{position:absolute;width:90px;height:90px;border:2px solid rgba(0,255,136,.3);border-radius:6px;overflow:hidden;z-index:10;background:#000;pointer-events:none;display:none;box-shadow:0 2px 10px rgba(0,0,0,.6);transition:border-color .15s,width .15s,height .15s}.ir-edge-preview canvas{width:100%;height:100%}.ir-edge-preview.active{border-color:#00ff88;width:120px;height:120px;box-shadow:0 4px 20px rgba(0,255,136,.15)}.ir-zoom-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}.ir-zoom-row label{font-size:11px;color:var(--muted)}.ir-zoom-row input[type=range]{flex:1;accent-color:#00ff88}.ir-zoom-row .ir-zval{font-size:12px;color:var(--text);font-family:var(--mono);min-width:40px}.ir-preview{max-width:100%;border-radius:6px;margin-top:8px}';
  document.head.appendChild(sty);
  var _img=null,_origW=0,_origH=0,_origName='image',_origSize=0,_origFmt='';
  var _mode='exact',_outFmt='image/png',_quality=0.92,_blob=null;
  var _cropX=0,_cropY=0,_cropW=0,_cropH=0,_zoom=1,_aspect=0;
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.image+'</div><h2 id="t-heading">Image Resizer</h2></div><span class="tc-badge tc-badge-purple">Image</span></div><div class="tc-body" role="region" aria-labelledby="t-heading">'
  +'<div class="ir-upload" id="ir-drop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div class="ir-upload-text">Drop image here or <u>click to browse</u></div><input type="file" id="ir-file" accept="image/*" style="display:none"></div>'
  +'<div class="ir-upload-info" id="ir-info"></div>'
  +'<div class="inline-error" id="ir-err" role="alert"></div>'
  +'<div class="ir-tabs" id="ir-mode-tabs"><button class="ir-tab active" data-mode="exact">Exact Size</button><button class="ir-tab" data-mode="percent">By Percentage</button><button class="ir-tab" data-mode="max">Max Dimension</button><button class="ir-tab" data-mode="crop">Crop &amp; Zoom</button></div>'
  +'<div class="ir-panel active" id="p-exact"><div class="ir-row"><div class="ir-field"><label for="ir-w">Width (px)</label><input type="number" id="ir-w" min="1" max="8000" placeholder="Width"></div><button type="button" class="ir-chain locked" id="ir-lock" title="Lock aspect ratio">'+IC.link+'</button><div class="ir-field"><label for="ir-h">Height (px)</label><input type="number" id="ir-h" min="1" max="8000" placeholder="Height"></div></div></div>'
  +'<div class="ir-panel" id="p-percent"><div class="ir-slider-row"><input type="range" id="ir-pct" min="1" max="400" value="100"><div class="ir-slider-val" id="ir-pct-val">100%</div></div><div class="ir-dim-readout" id="ir-pct-dim"></div></div>'
  +'<div class="ir-panel" id="p-max"><div class="ir-field" style="max-width:200px"><label for="ir-maxd">Longest side (px)</label><input type="number" id="ir-maxd" min="1" max="8000" placeholder="e.g. 1920"></div><div class="ir-dim-readout" id="ir-max-dim"></div></div>'
  +'<div class="ir-panel" id="p-crop"><div class="ir-aspect-row" id="ir-aspects"><button class="ir-aspect-btn active" data-a="0">Free</button><button class="ir-aspect-btn" data-a="1">1:1</button><button class="ir-aspect-btn" data-a="1.7778">16:9</button><button class="ir-aspect-btn" data-a="1.3333">4:3</button><button class="ir-aspect-btn" data-a="1.5">3:2</button><button class="ir-aspect-btn" data-a="0.5625">9:16</button></div><div class="ir-crop-container" id="ir-crop-box"><img id="ir-crop-img" class="ir-crop-img"><div class="ir-crop-overlay" id="ir-crop-overlay"><div class="ir-crop-frame" id="ir-crop-frame"><div class="ir-crop-handle tl" data-h="tl"></div><div class="ir-crop-handle tr" data-h="tr"></div><div class="ir-crop-handle bl" data-h="bl"></div><div class="ir-crop-handle br" data-h="br"></div></div></div><div class="ir-edge-preview" id="ir-ep-tl"><canvas width="240" height="240"></canvas></div><div class="ir-edge-preview" id="ir-ep-tr"><canvas width="240" height="240"></canvas></div><div class="ir-edge-preview" id="ir-ep-bl"><canvas width="240" height="240"></canvas></div><div class="ir-edge-preview" id="ir-ep-br"><canvas width="240" height="240"></canvas></div></div><div class="ir-zoom-row"><label>Zoom</label><input type="range" id="ir-zoom" min="100" max="400" value="100"><span class="ir-zval" id="ir-zoom-val">100%</span></div><button type="button" class="pill-btn" id="ir-crop-reset" style="margin-bottom:10px">Reset</button></div>'
  +'<div class="ir-out-tabs" id="ir-fmt-tabs"><button class="ir-out-tab active" data-fmt="image/png">PNG</button><button class="ir-out-tab" data-fmt="image/jpeg">JPEG</button><button class="ir-out-tab" data-fmt="image/webp">WebP</button></div>'
  +'<div class="ir-quality-row" id="ir-q-row" style="display:none"><label>Quality</label><input type="range" id="ir-q" min="60" max="100" value="92"><span class="ir-qval" id="ir-q-val">92</span></div>'
  +'<div class="ir-warn" id="ir-warn">PNG output will likely be larger than the original JPEG \u2014 consider keeping JPEG format.</div>'
  +'<button type="button" class="act-btn act-purple" id="btn-resize">'+IC.image+' <span>Resize</span></button>'
  +'<div class="ir-stats" id="ir-stats"></div>'
  +'<div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body" id="ir-result" role="status" style="text-align:center;min-height:80px;padding:16px"><span style="color:var(--muted);font-style:italic">Resized image will appear here\u2026</span></div></div>'
  +'</div></div></div>';
  var dropZone=$('ir-drop'),fileInput=$('ir-file');
  dropZone.addEventListener('click',function(){fileInput.click();});
  dropZone.addEventListener('dragover',function(e){e.preventDefault();dropZone.classList.add('dragover');});
  dropZone.addEventListener('dragleave',function(){dropZone.classList.remove('dragover');});
  dropZone.addEventListener('drop',function(e){e.preventDefault();dropZone.classList.remove('dragover');if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
  fileInput.addEventListener('change',function(){if(this.files[0])loadFile(this.files[0]);});
  function loadFile(file){
    _origName=file.name.replace(/\.[^.]+$/,'');_origSize=file.size;_origFmt=file.type;
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();img.onload=function(){
        _img=img;_origW=img.naturalWidth;_origH=img.naturalHeight;
        $('ir-info').textContent=file.name+' \u2014 '+_origW+' \u00d7 '+_origH+' \u2022 '+(_origSize/1024).toFixed(1)+' KB';
        $('ir-w').value=_origW;$('ir-h').value=_origH;
        $('ir-pct').value=100;updatePctReadout();
        $('ir-maxd').value=Math.max(_origW,_origH);updateMaxReadout();
        checkWarn();initCrop();
      };img.src=e.target.result;
    };reader.readAsDataURL(file);
  }
  var modeTabs=document.querySelectorAll('#ir-mode-tabs .ir-tab');
  modeTabs.forEach(function(t){t.addEventListener('click',function(){
    modeTabs.forEach(function(b){b.classList.remove('active');});t.classList.add('active');_mode=t.dataset.mode;
    document.querySelectorAll('.ir-panel').forEach(function(p){p.classList.remove('active');});$('p-'+_mode).classList.add('active');
  });});
  var _locked=true;
  $('ir-lock').addEventListener('click',function(){_locked=!_locked;this.classList.toggle('locked',_locked);this.innerHTML=_locked?IC.link:IC.unlink;});
  $('ir-w').addEventListener('input',function(){if(_locked&&_origW){var r=_origH/_origW;$('ir-h').value=Math.round((parseInt(this.value)||0)*r);}});
  $('ir-h').addEventListener('input',function(){if(_locked&&_origH){var r=_origW/_origH;$('ir-w').value=Math.round((parseInt(this.value)||0)*r);}});
  $('ir-pct').addEventListener('input',updatePctReadout);
  function updatePctReadout(){var p=parseInt($('ir-pct').value)||100;$('ir-pct-val').textContent=p+'%';if(_origW){$('ir-pct-dim').textContent=Math.round(_origW*p/100)+' \u00d7 '+Math.round(_origH*p/100);}}
  $('ir-maxd').addEventListener('input',updateMaxReadout);
  function updateMaxReadout(){if(!_origW)return;var mx=parseInt($('ir-maxd').value)||Math.max(_origW,_origH);var longer=Math.max(_origW,_origH);var s=mx/longer;$('ir-max-dim').textContent=Math.round(_origW*s)+' \u00d7 '+Math.round(_origH*s);}
  document.querySelectorAll('#ir-fmt-tabs .ir-out-tab').forEach(function(t){t.addEventListener('click',function(){
    document.querySelectorAll('#ir-fmt-tabs .ir-out-tab').forEach(function(b){b.classList.remove('active');});
    t.classList.add('active');_outFmt=t.dataset.fmt;
    $('ir-q-row').style.display=(_outFmt==='image/png')?'none':'flex';checkWarn();
  });});
  $('ir-q').addEventListener('input',function(){_quality=parseInt(this.value)/100;$('ir-q-val').textContent=this.value;});
  function checkWarn(){$('ir-warn').style.display=(_outFmt==='image/png'&&_origFmt&&_origFmt.indexOf('jpeg')!==-1)?'block':'none';}
  var _dragType=null,_dragStartX=0,_dragStartY=0,_startCrop={};
  var cropImg=$('ir-crop-img'),cropFrame=$('ir-crop-frame'),cropBox=$('ir-crop-box');
  var edgePreviews={tl:$('ir-ep-tl'),tr:$('ir-ep-tr'),bl:$('ir-ep-bl'),br:$('ir-ep-br')};
  var edgeCanvases={};var edgeCtxs={};
  ['tl','tr','bl','br'].forEach(function(k){edgeCanvases[k]=edgePreviews[k].querySelector('canvas');edgeCtxs[k]=edgeCanvases[k].getContext('2d');});
  function initCrop(){
    if(!_img)return;cropImg.src=_img.src;_zoom=1;$('ir-zoom').value=100;$('ir-zoom-val').textContent='100%';cropImg.style.transform='scale(1)';
    setTimeout(function(){
      var dw=cropImg.offsetWidth,dh=cropImg.offsetHeight;if(!dw){dw=cropBox.offsetWidth;dh=dw*_origH/_origW;}
      _cropX=0;_cropY=0;_cropW=dw;_cropH=dh;updateCropFrame();
    },100);
  }
  document.querySelectorAll('#ir-aspects .ir-aspect-btn').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('#ir-aspects .ir-aspect-btn').forEach(function(x){x.classList.remove('active');});b.classList.add('active');
    _aspect=parseFloat(b.dataset.a);if(_aspect>0)enforceAspect();
  });});
  function enforceAspect(){
    if(!_aspect)return;var dw=cropImg.offsetWidth*_zoom,dh=cropImg.offsetHeight*_zoom;
    var nw=_cropW,nh=_cropW/_aspect;if(nh>dh){nh=dh;nw=nh*_aspect;}if(nw>dw){nw=dw;nh=nw/_aspect;}
    _cropW=Math.min(nw,dw);_cropH=Math.min(nh,dh);_cropX=Math.max(0,Math.min(_cropX,dw-_cropW));_cropY=Math.max(0,Math.min(_cropY,dh-_cropH));updateCropFrame();
  }
  function updateCropFrame(){cropFrame.style.left=_cropX+'px';cropFrame.style.top=_cropY+'px';cropFrame.style.width=_cropW+'px';cropFrame.style.height=_cropH+'px';}
  function drawCornerPreview(corner,ctx){
    if(!_img)return;
    var dw=cropImg.offsetWidth,dh=cropImg.offsetHeight;if(!dw)return;
    var hx=0,hy=0;
    if(corner==='tl'||corner==='bl')hx=_cropX;
    if(corner==='tr'||corner==='br')hx=_cropX+_cropW;
    if(corner==='tl'||corner==='tr')hy=_cropY;
    if(corner==='bl'||corner==='br')hy=_cropY+_cropH;
    var srcX=hx/dw*_origW/_zoom,srcY=hy/dh*_origH/_zoom;
    var viewR=40*(_origW/(dw*_zoom));
    var sx=srcX-viewR,sy=srcY-viewR,sw=viewR*2,sh=viewR*2;
    if(sx<0)sx=0;if(sy<0)sy=0;if(sx+sw>_origW)sx=_origW-sw;if(sy+sh>_origH)sy=_origH-sh;
    ctx.clearRect(0,0,240,240);
    try{ctx.drawImage(_img,Math.max(0,sx),Math.max(0,sy),Math.max(1,sw),Math.max(1,sh),0,0,240,240);}catch(e){}
    ctx.strokeStyle='rgba(0,255,136,.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(120,0);ctx.lineTo(120,240);ctx.moveTo(0,120);ctx.lineTo(240,120);ctx.stroke();
  }
  function positionCornerPreview(corner,el){
    var cw=cropBox.offsetWidth,ch=cropBox.offsetHeight;
    var margin=8;
    if(corner==='tl'){el.style.left=margin+'px';el.style.top=margin+'px';}
    else if(corner==='tr'){el.style.right=margin+'px';el.style.left='auto';el.style.top=margin+'px';}
    else if(corner==='bl'){el.style.left=margin+'px';el.style.bottom=margin+'px';el.style.top='auto';}
    else if(corner==='br'){el.style.right=margin+'px';el.style.left='auto';el.style.bottom=margin+'px';el.style.top='auto';}
  }
  function showAllCornerPreviews(activeCorner){
    if(!_img)return;
    ['tl','tr','bl','br'].forEach(function(k){
      var el=edgePreviews[k];
      el.style.display='block';
      positionCornerPreview(k,el);
      drawCornerPreview(k,edgeCtxs[k]);
      if(k===activeCorner){el.classList.add('active');}else{el.classList.remove('active');}
    });
  }
  function hideAllCornerPreviews(){
    ['tl','tr','bl','br'].forEach(function(k){edgePreviews[k].style.display='none';edgePreviews[k].classList.remove('active');});
  }
  cropFrame.addEventListener('mousedown',startDrag);cropFrame.addEventListener('touchstart',startDrag,{passive:false});
  function startDrag(e){e.preventDefault();var t=e.target;_dragType=t.dataset&&t.dataset.h?t.dataset.h:'move';var pt=getPointer(e);_dragStartX=pt.x;_dragStartY=pt.y;_startCrop={x:_cropX,y:_cropY,w:_cropW,h:_cropH};document.addEventListener('mousemove',onDrag);document.addEventListener('mouseup',endDrag);document.addEventListener('touchmove',onDrag,{passive:false});document.addEventListener('touchend',endDrag);if(_dragType!=='move')showAllCornerPreviews(_dragType);}
  function getPointer(e){return e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY};}
  function onDrag(e){e.preventDefault();var pt=getPointer(e),dx=pt.x-_dragStartX,dy=pt.y-_dragStartY,maxW=cropImg.offsetWidth*_zoom,maxH=cropImg.offsetHeight*_zoom;
    if(_dragType==='move'){_cropX=Math.max(0,Math.min(_startCrop.x+dx,maxW-_cropW));_cropY=Math.max(0,Math.min(_startCrop.y+dy,maxH-_cropH));}
    else{var nx=_startCrop.x,ny=_startCrop.y,nw=_startCrop.w,nh=_startCrop.h;
      if(_dragType==='br'||_dragType==='tr')nw=Math.max(20,_startCrop.w+dx);if(_dragType==='bl'||_dragType==='tl'){var ddx=Math.min(dx,_startCrop.w-20);nx=_startCrop.x+ddx;nw=_startCrop.w-ddx;}
      if(_dragType==='br'||_dragType==='bl')nh=Math.max(20,_startCrop.h+dy);if(_dragType==='tl'||_dragType==='tr'){var ddy=Math.min(dy,_startCrop.h-20);ny=_startCrop.y+ddy;nh=_startCrop.h-ddy;}
      if(_aspect>0)nh=nw/_aspect;_cropX=Math.max(0,Math.min(nx,maxW-20));_cropY=Math.max(0,Math.min(ny,maxH-20));_cropW=Math.min(nw,maxW-_cropX);_cropH=Math.min(nh,maxH-_cropY);}
    updateCropFrame();if(_dragType!=='move')showAllCornerPreviews(_dragType);}
  function endDrag(){hideAllCornerPreviews();document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',endDrag);document.removeEventListener('touchmove',onDrag);document.removeEventListener('touchend',endDrag);}
  $('ir-zoom').addEventListener('input',function(){_zoom=parseInt(this.value)/100;$('ir-zoom-val').textContent=this.value+'%';cropImg.style.transform='scale('+_zoom+')';var maxW=cropImg.offsetWidth*_zoom,maxH=cropImg.offsetHeight*_zoom;_cropW=Math.min(_cropW,maxW);_cropH=Math.min(_cropH,maxH);_cropX=Math.min(_cropX,maxW-_cropW);_cropY=Math.min(_cropY,maxH-_cropH);updateCropFrame();});
  cropBox.addEventListener('wheel',function(e){e.preventDefault();var z=parseInt($('ir-zoom').value)+(e.deltaY<0?5:-5);z=Math.max(100,Math.min(400,z));$('ir-zoom').value=z;$('ir-zoom').dispatchEvent(new Event('input'));},{passive:false});
  $('ir-crop-reset').addEventListener('click',function(){initCrop();});
  function resizeWithQuality(source,targetW,targetH){
    var src=source,w=source.naturalWidth||source.width,h=source.naturalHeight||source.height;
    while(w/targetW>2||h/targetH>2){var step=document.createElement('canvas');w=Math.max(Math.round(w/2),targetW);h=Math.max(Math.round(h/2),targetH);step.width=w;step.height=h;var ctx=step.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(src,0,0,w,h);src=step;}
    var out=document.createElement('canvas');out.width=targetW;out.height=targetH;var ctx2=out.getContext('2d');ctx2.imageSmoothingEnabled=true;ctx2.imageSmoothingQuality='high';ctx2.drawImage(src,0,0,targetW,targetH);return out;
  }
  $('btn-resize').addEventListener('click',function(){
    $('ir-err').textContent='';$('ir-err').style.display='none';
    if(!_img){$('ir-err').textContent='Upload an image first.';$('ir-err').style.display='block';return;}
    try{var nw,nh,canvas;
      if(_mode==='exact'){nw=parseInt($('ir-w').value)||_origW;nh=parseInt($('ir-h').value)||_origH;if(nw<1||nh<1){$('ir-err').textContent='Width/height must be positive.';$('ir-err').style.display='block';return;}canvas=resizeWithQuality(_img,nw,nh);}
      else if(_mode==='percent'){var p=parseInt($('ir-pct').value)||100;nw=Math.round(_origW*p/100);nh=Math.round(_origH*p/100);canvas=resizeWithQuality(_img,nw,nh);}
      else if(_mode==='max'){var mx=parseInt($('ir-maxd').value)||Math.max(_origW,_origH);var longer=Math.max(_origW,_origH);var s=mx/longer;nw=Math.round(_origW*s);nh=Math.round(_origH*s);canvas=resizeWithQuality(_img,nw,nh);}
      else if(_mode==='crop'){var dw=cropImg.offsetWidth,dh=cropImg.offsetHeight;if(!dw){$('ir-err').textContent='Crop area not initialized.';$('ir-err').style.display='block';return;}var sx=_cropX/dw*_origW/_zoom,sy=_cropY/dh*_origH/_zoom,sw=_cropW/dw*_origW/_zoom,sh=_cropH/dh*_origH/_zoom;nw=Math.round(sw);nh=Math.round(sh);canvas=document.createElement('canvas');canvas.width=nw;canvas.height=nh;var cctx=canvas.getContext('2d');cctx.imageSmoothingEnabled=true;cctx.imageSmoothingQuality='high';cctx.drawImage(_img,sx,sy,sw,sh,0,0,nw,nh);}
      if(_outFmt==='image/jpeg'){var tmp=document.createElement('canvas');tmp.width=nw;tmp.height=nh;var tctx=tmp.getContext('2d');tctx.fillStyle='#fff';tctx.fillRect(0,0,nw,nh);tctx.drawImage(canvas,0,0);canvas=tmp;}
      canvas.toBlob(function(blob){if(!blob)return;_blob=blob;var url=URL.createObjectURL(blob);var sizeKB=(blob.size/1024).toFixed(1);var origKB=(_origSize/1024).toFixed(1);
        $('ir-result').innerHTML='<img src="'+url+'" class="ir-preview" alt="Resized image">';
        $('ir-stats').innerHTML='Original: <b>'+_origW+'\u00d7'+_origH+'</b> \u00b7 '+origKB+' KB \u2192 Output: <b>'+nw+'\u00d7'+nh+'</b> \u00b7 \u2248 '+sizeKB+' KB';
        CK.toast('Resized to '+nw+'\u00d7'+nh);
      },_outFmt,_quality);
    }catch(err){$('ir-err').textContent='Error: '+err.message;$('ir-err').style.display='block';window.CKFeedback&&window.CKFeedback.reportError(err.message,{"Mode":_mode,"Format":_outFmt,"Quality":_quality,"Original Size":_origW+'\u00d7'+_origH,"File Name":_origName||'','Width':$('ir-w').value||'','Height':$('ir-h').value||'','Percent':$('ir-pct').value||'','Max Dimension':$('ir-maxd').value||''});}
  });
  $('btn-dl').addEventListener('click',function(){if(!_blob){CK.toast('Resize first','err');return;}var ext=_outFmt==='image/jpeg'?'jpg':_outFmt==='image/webp'?'webp':'png';var resultImg=$('ir-result').querySelector('img');var dims=resultImg?resultImg.naturalWidth+'x'+resultImg.naturalHeight:'output';var a=document.createElement('a');a.download=_origName+'_'+dims+'.'+ext;a.href=URL.createObjectURL(_blob);a.click();CK.toast('Downloaded');});
  CK.wireCtrlEnter('btn-resize');
  CK.setUsageContent('<ol><li>Upload an <strong>image</strong> (drag-drop or click).</li><li>Choose a resize mode: <strong>Exact Size</strong>, <strong>By Percentage</strong>, <strong>Max Dimension</strong>, or <strong>Crop &amp; Zoom</strong>.</li><li>Select output <strong>format</strong> (PNG/JPEG/WebP) and quality.</li><li>Click <strong>Resize</strong> to process.</li><li><strong>Download</strong> the result.</li></ol><p>Multi-step downscaling produces sharp results. All processing runs locally in your browser.</p>');
})();