(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  var nowS=Math.floor(Date.now()/1000);
  var defPayload=JSON.stringify({sub:"1234567890",name:"CipherKit User",iat:nowS,exp:nowS+3600},null,2);
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-green">'+IC.key+'</div><h2 id="t-heading">JWT Builder</h2></div><span class="tc-badge tc-badge-green">Crypto</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-payload">Payload (JSON)</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><textarea id="t-payload" rows="8" class="mono">'+defPayload.replace(/</g,'&lt;')+'</textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-alg">Algorithm</label><select id="t-alg"><option value="HS256" selected>HS256</option><option value="none">none (unsigned)</option></select></div></div><div class="field" id="sec-field"><div class="field-hdr"><label for="t-secret">Secret Key</label></div><input type="text" id="t-secret" class="mono" value="your-256-bit-secret" placeholder="Enter secret key\u2026"></div><button type="button" class="act-btn act-green" id="btn-sign">'+IC.key+' <span>Sign JWT</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Signed JWT</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" data-target="t-output" aria-label="Copy JWT">'+IC.copy+' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">'+IC.dl+' <span>Download</span></button></div></div><div class="out-body"><textarea id="t-output" readonly class="mono" rows="4" placeholder="Signed JWT will appear here\u2026" style="word-break:break-all"></textarea></div></div></div></div></div>';
  $('t-alg').addEventListener('change',function(){$('sec-field').style.display=this.value==='none'?'none':'';});
  function b64url(str){return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function b64urlU8(u8){var bin='';for(var i=0;i<u8.length;i++)bin+=String.fromCharCode(u8[i]);return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  $('btn-sign').addEventListener('click',function(){
    var payloadStr=$('t-payload').value.trim();$('t-err').textContent='';$('t-err').style.display='none';
    var payload;
    try{payload=JSON.parse(payloadStr);}catch(e){$('t-err').textContent='Invalid JSON: '+e.message;$('t-err').style.display='block';return;}
    var alg=$('t-alg').value;
    var header=alg==='none'?{alg:'none',typ:'JWT'}:{alg:'HS256',typ:'JWT'};
    var headerB64=b64url(JSON.stringify(header));
    var payloadB64=b64url(JSON.stringify(payload));
    var unsigned=headerB64+'.'+payloadB64;
    if(alg==='none'){
      $('t-output').value=unsigned+'.';
      CK.toast('Unsigned JWT created');
      return;
    }
    var secret=$('t-secret').value;
    if(!secret){$('t-err').textContent='Enter a secret key.';$('t-err').style.display='block';return;}
    var enc=new TextEncoder();
    crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']).then(function(key){
      return crypto.subtle.sign('HMAC',key,enc.encode(unsigned));
    }).then(function(sig){
      var sigB64=b64urlU8(new Uint8Array(sig));
      $('t-output').value=unsigned+'.'+sigB64;
      CK.toast('JWT signed with HS256');
    }).catch(function(e){$('t-err').textContent='Sign error: '+e.message;$('t-err').style.display='block';});
  });
  $('btn-dl').addEventListener('click',function(){var v=$('t-output').value;if(!v){CK.toast('Sign a JWT first','err');return;}CK.downloadOutput(v,'token.jwt');CK.toast('Downloaded');});
  $('btn-clr').addEventListener('click',function(){$('t-payload').value=defPayload;$('t-output').value='';});
  CK.wireCopy($('btn-copy'),function(){return $('t-output').value;});CK.wireCtrlEnter('btn-sign');CK.wireCharCounter($('t-payload'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Edit the <strong>JSON payload</strong> with your claims (sub, iat, exp, etc.).</li><li>Choose <strong>HS256</strong> or <strong>none</strong> (unsigned).</li><li>Enter a <strong>secret key</strong> for HS256.</li><li>Click <strong>Sign JWT</strong>.</li></ol><p>Uses Web Crypto HMAC-SHA256 for signing. No data leaves your browser.</p>');
})();