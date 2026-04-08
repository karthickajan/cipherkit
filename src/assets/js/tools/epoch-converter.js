/**
 * CipherKit — Epoch / Unix Timestamp Converter
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'};
  function $(id){return document.getElementById(id);}

  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.clock+'</div><h2 id="t-heading">Epoch Converter</h2></div><span class="tc-badge tc-badge-amber">Dev</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label>Current Epoch</label></div><div id="t-live" style="font-family:var(--font-mono);font-size:1.6rem;color:var(--green);letter-spacing:1px"></div></div><div class="mode-tabs" id="t-tabs"><button class="mt active" data-mode="toDate">Epoch \u2192 Date</button><button class="mt" data-mode="toEpoch">Date \u2192 Epoch</button></div><div id="panel-toDate"><div class="field"><div class="field-hdr"><label for="t-epoch">Unix Timestamp</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-now" aria-label="Now">Now</button><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="text" id="t-epoch" class="mono" placeholder="e.g. 1700000000"><div class="inline-error" id="t-err1" role="alert"></div></div><button type="button" class="act-btn act-amber" id="btn-to-date">'+IC.clock+' <span>Convert to Date</span></button></div><div id="panel-toEpoch" style="display:none"><div class="field"><div class="field-hdr"><label>Date &amp; Time</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-use-now" aria-label="Use current date/time">'+IC.clock+' <span>Now</span></button><button type="button" class="pill-btn" id="btn-clr2" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><div class="dt-split-row"><input type="date" id="t-date-part" aria-label="Date"><input type="time" id="t-time-part" step="1" aria-label="Time"></div><div class="inline-error" id="t-err2" role="alert"></div></div><button type="button" class="act-btn act-amber" id="btn-to-epoch">'+IC.clock+' <span>Convert to Epoch</span></button></div><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" data-target="t-output" aria-label="Copy">'+IC.copy+' <span>Copy</span></button></div></div><div class="out-body" id="t-result" role="status"><span style="color:var(--muted);font-style:italic">Conversion result will appear here\u2026</span></div></div><textarea id="t-output" class="mono" style="display:none" aria-hidden="true"></textarea></div></div></div>';

  var _mode='toDate';
  var tabBtns=document.querySelectorAll('#t-tabs .mt');
  tabBtns.forEach(function(btn){btn.addEventListener('click',function(){tabBtns.forEach(function(b){b.classList.remove('active');});this.classList.add('active');_mode=this.dataset.mode;$('panel-toDate').style.display=_mode==='toDate'?'':'none';$('panel-toEpoch').style.display=_mode==='toEpoch'?'':'none';});});

  /* live clock */
  function tick(){$('t-live').textContent=Math.floor(Date.now()/1000);}
  tick();setInterval(tick,1000);

  function pad(n){return n<10?'0'+n:''+n;}
  function formatDate(d){
    var utc=d.toUTCString();
    var iso=d.toISOString();
    var local=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    var relative=relTime(d);
    return {utc:utc,iso:iso,local:local,relative:relative};
  }
  function relTime(d){
    var diff=(Date.now()-d.getTime())/1000;
    var future=diff<0;diff=Math.abs(diff);
    if(diff<60)return Math.floor(diff)+'s '+(future?'from now':'ago');
    if(diff<3600)return Math.floor(diff/60)+'m '+(future?'from now':'ago');
    if(diff<86400)return Math.floor(diff/3600)+'h '+(future?'from now':'ago');
    return Math.floor(diff/86400)+'d '+(future?'from now':'ago');
  }

  function resultRow(label,val){return '<tr><td style="padding:4px 10px;color:var(--muted);white-space:nowrap">'+label+'</td><td style="padding:4px 10px;font-family:var(--font-mono);color:var(--fg)">'+val+'</td></tr>';}

  $('btn-to-date').addEventListener('click',function(){
    var v=$('t-epoch').value.trim();$('t-err1').textContent='';$('t-err1').style.display='none';
    if(!v){$('t-err1').textContent='Enter an epoch timestamp.';$('t-err1').style.display='block';return;}
    var ts=parseInt(v,10);if(isNaN(ts)){$('t-err1').textContent='Invalid number.';$('t-err1').style.display='block';return;}
    /* auto-detect seconds vs milliseconds */
    if(ts>1e12)var d=new Date(ts);else var d=new Date(ts*1000);
    var f=formatDate(d);
    var html='<table style="width:100%;border-collapse:collapse;font-size:.9rem">'+resultRow('UTC',f.utc)+resultRow('ISO 8601',f.iso)+resultRow('Local',f.local)+resultRow('Relative',f.relative)+resultRow('Epoch (s)',Math.floor(d.getTime()/1000))+resultRow('Epoch (ms)',d.getTime())+'</table>';
    $('t-result').innerHTML=html;
    $('t-output').value='UTC: '+f.utc+'\nISO: '+f.iso+'\nLocal: '+f.local+'\nEpoch (s): '+Math.floor(d.getTime()/1000)+'\nEpoch (ms): '+d.getTime();
    CK.toast('Converted');
  });

  $('btn-to-epoch').addEventListener('click',function(){
    var dp=$('t-date-part').value,tp=$('t-time-part').value;$('t-err2').textContent='';$('t-err2').style.display='none';
    if(!dp){$('t-err2').textContent='Select a date.';$('t-err2').style.display='block';return;}
    var combined=dp+'T'+(tp||'00:00:00');
    var d=new Date(combined);if(isNaN(d)){$('t-err2').textContent='Invalid date.';$('t-err2').style.display='block';return;}
    var f=formatDate(d);
    var epochS=Math.floor(d.getTime()/1000);
    var html='<table style="width:100%;border-collapse:collapse;font-size:.9rem">'+resultRow('Epoch (s)','<span style="color:var(--green);font-size:1.1rem">'+epochS+'</span>')+resultRow('Epoch (ms)',d.getTime())+resultRow('UTC',f.utc)+resultRow('ISO 8601',f.iso)+'</table>';
    $('t-result').innerHTML=html;
    $('t-output').value='Epoch (s): '+epochS+'\nEpoch (ms): '+d.getTime()+'\nUTC: '+f.utc;
    CK.toast('Converted');
  });

  /* Auto-convert when both date and time have values (debounced 300ms) */
  var _autoTimer=null;
  function autoConvertEpoch(){clearTimeout(_autoTimer);_autoTimer=setTimeout(function(){var dp=$('t-date-part').value;if(dp)$('btn-to-epoch').click();},300);}
  $('t-date-part').addEventListener('change',autoConvertEpoch);
  $('t-time-part').addEventListener('change',autoConvertEpoch);

  /* "Use current date/time" button */
  $('btn-use-now').addEventListener('click',function(){
    var now=new Date();
    $('t-date-part').value=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
    $('t-time-part').value=pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
    $('btn-to-epoch').click();
  });

  $('btn-now').addEventListener('click',function(){$('t-epoch').value=Math.floor(Date.now()/1000);});
  $('btn-clr').addEventListener('click',function(){$('t-epoch').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Conversion result will appear here\u2026</span>';$('t-output').value='';});
  $('btn-clr2').addEventListener('click',function(){$('t-date-part').value='';$('t-time-part').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Conversion result will appear here\u2026</span>';$('t-output').value='';});
  CK.wireCopy($('btn-copy'),function(){return $('t-output').value;});CK.wireCtrlEnter('btn-to-date');
  CK.setUsageContent('<ol><li>Use <strong>Epoch \u2192 Date</strong> to convert a Unix timestamp to a human-readable date.</li><li>Use <strong>Date \u2192 Epoch</strong> to get the Unix timestamp from a date/time picker.</li><li>Auto-detects seconds vs. milliseconds.</li></ol><p>The live clock at the top shows the current epoch in real time.</p>');
})();
