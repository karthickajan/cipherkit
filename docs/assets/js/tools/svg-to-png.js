(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.code+'</div><h2 id="t-heading">SVG to PNG</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-input">SVG Code</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste SVG markup here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-scale">Scale</label><select id="t-scale"><option value="1">1x</option><option value="2" selected>2x</option><option value="3">3x</option><option value="4">4x</option></select></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.code+' <span>Convert to PNG</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>PNG Preview</span></div><div class="out-btns"><button type="button" class="dl-btn" id="btn-dl" aria-label="Download PNG">'+IC.dl+' <span>Download PNG</span></button></div></div><div class="out-body" id="t-result" role="status" style="text-align:center;min-height:80px;padding:16px"><span style="color:var(--muted);font-style:italic">PNG preview will appear here\u2026</span></div></div></div></div></div>';
  var _dataUrl='';
  $('btn-conv').addEventListener('click',function(){
    var svg=$('t-input').value.trim();$('t-err').textContent='';$('t-err').style.display='none';
    if(!svg){$('t-err').textContent='Paste SVG markup.';$('t-err').style.display='block';return;}
    var scale=parseInt($('t-scale').value,10);
    var blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var img=new Image();
    img.onload=function(){
      var w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
      _dataUrl=canvas.toDataURL('image/png');
      $('t-result').innerHTML='<img src="'+_dataUrl+'" style="max-width:100%;border-radius:4px" alt="Converted PNG">';
      URL.revokeObjectURL(url);CK.toast('Converted to PNG');
    };
    img.onerror=function(){$('t-err').textContent='Invalid SVG markup.';$('t-err').style.display='block';URL.revokeObjectURL(url);};
    img.src=url;
  });
  $('btn-dl').addEventListener('click',function(){if(!_dataUrl){CK.toast('Convert first','err');return;}var a=document.createElement('a');a.download='converted.png';a.href=_dataUrl;a.click();CK.toast('Downloaded PNG');});
  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">PNG preview will appear here\u2026</span>';_dataUrl='';});
  CK.wireCtrlEnter('btn-conv');CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Paste <strong>SVG markup</strong>.</li><li>Choose a <strong>scale multiplier</strong> for higher resolution.</li><li>Click <strong>Convert to PNG</strong>.</li><li>Download the result.</li></ol><p>Uses the Canvas API for client-side conversion. No data leaves your browser.</p>');
})();