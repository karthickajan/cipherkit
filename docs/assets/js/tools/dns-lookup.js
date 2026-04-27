(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'};
  function $(id){return document.getElementById(id);}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var types=['A','AAAA','CNAME','MX','NS','TXT','SOA','SRV','CAA','PTR'];
  var typeOpts='';types.forEach(function(t){typeOpts+='<option value="'+t+'">'+t+'</option>';});
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.globe+'</div><h2 id="t-heading">DNS Lookup</h2></div><span class="tc-badge tc-badge-amber">Network</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-domain">Domain Name</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="text" id="t-domain" class="mono" placeholder="example.com"><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-type">Record Type</label><select id="t-type">'+typeOpts+'</select></div></div><button type="button" class="act-btn act-amber" id="btn-lookup">'+IC.globe+' <span>Lookup</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Results</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy" data-target="t-output" aria-label="Copy results">'+IC.copy+' <span>Copy</span></button></div></div><div class="out-body" id="t-result" role="status"><span style="color:var(--muted);font-style:italic">DNS records will appear here\u2026</span></div></div><textarea id="t-output" class="mono" style="display:none" aria-hidden="true"></textarea></div></div></div>';
  $('btn-lookup').addEventListener('click',function(){
    var domain=$('t-domain').value.trim();$('t-err').textContent='';$('t-err').style.display='none';
    if(!domain){$('t-err').textContent='Enter a domain name.';$('t-err').style.display='block';return;}
    var type=$('t-type').value;
    $('t-result').innerHTML='<span style="color:var(--muted)">Looking up\u2026</span>';
    fetch('https://dns.google/resolve?name='+encodeURIComponent(domain)+'&type='+type)
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
      .then(function(data){
        if(!data.Answer||!data.Answer.length){
          $('t-result').innerHTML='<span style="color:var(--amber)">No '+esc(type)+' records found for '+esc(domain)+'</span>';
          $('t-output').value='No '+type+' records found for '+domain;
          return;
        }
        var thS='padding:6px 10px;border:1px solid var(--border);background:var(--surface);color:var(--green);text-align:left';
        var html='<table style="width:100%;border-collapse:collapse;font-size:.85rem;font-family:var(--font-mono)"><thead><tr><th style="'+thS+'">Name</th><th style="'+thS+'">Type</th><th style="'+thS+'">TTL</th><th style="'+thS+'">Data</th></tr></thead><tbody>';
        var txt='';
        data.Answer.forEach(function(a){
          var tName=types[a.type-1]||a.type;
          html+='<tr><td style="padding:4px 10px;border:1px solid var(--border)">'+esc(a.name)+'</td><td style="padding:4px 10px;border:1px solid var(--border)">'+esc(String(tName))+'</td><td style="padding:4px 10px;border:1px solid var(--border)">'+a.TTL+'s</td><td style="padding:4px 10px;border:1px solid var(--border);word-break:break-all">'+esc(a.data)+'</td></tr>';
          txt+=a.name+'\t'+tName+'\t'+a.TTL+'\t'+a.data+'\n';
        });
        html+='</tbody></table>';
        if(data.Comment)html+='<p style="margin-top:8px;color:var(--muted);font-size:.8rem">'+esc(data.Comment)+'</p>';
        $('t-result').innerHTML=html;
        $('t-output').value=txt.trim();
        CK.toast(data.Answer.length+' record(s) found');
      })
      .catch(function(e){$('t-err').textContent='Lookup failed: '+e.message;$('t-err').style.display='block';$('t-result').innerHTML='';});
  });
  $('btn-clr').addEventListener('click',function(){$('t-domain').value='';$('t-output').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">DNS records will appear here\u2026</span>';});
  CK.wireCopy($('btn-copy'),function(){return $('t-output').value;});CK.wireCtrlEnter('btn-lookup');
  CK.setUsageContent('<ol><li>Enter a <strong>domain name</strong> (e.g. example.com).</li><li>Select the <strong>record type</strong> (A, AAAA, MX, NS, TXT, etc.).</li><li>Click <strong>Lookup</strong> to query Google DNS-over-HTTPS.</li></ol><p>Uses the public <code>dns.google</code> DoH API. No server-side code required.</p>');
})();