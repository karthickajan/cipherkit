(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'};
  function $(id){return document.getElementById(id);}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var ctrlNames=['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','HT','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US'];
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.table+'</div><h2 id="t-heading">ASCII Table</h2></div><span class="tc-badge tc-badge-amber">Reference</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-search">Search / Filter</label></div><div style="position:relative"><input type="text" id="t-search" placeholder="Search by decimal, hex, char, or name\u2026" class="mono" style="padding-left:32px"><span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--muted);width:18px;height:18px;display:inline-flex">'+IC.search+'</span></div></div><div id="t-table" style="overflow-x:auto"></div></div></div></div>';
  function charLabel(code){
    if(code<32)return ctrlNames[code];
    if(code===32)return 'SP';
    if(code===127)return 'DEL';
    return String.fromCharCode(code);
  }
  function charDisplay(code){
    if(code<32)return '<span style="color:var(--amber)">'+ctrlNames[code]+'</span>';
    if(code===32)return '<span style="color:var(--amber)">SP</span>';
    if(code===127)return '<span style="color:var(--amber)">DEL</span>';
    return '<span style="color:var(--green)">'+esc(String.fromCharCode(code))+'</span>';
  }
  function buildRow(code){
    var hex=code.toString(16).toUpperCase().padStart(2,'0');
    var oct=code.toString(8).padStart(3,'0');
    var bin=code.toString(2).padStart(8,'0');
    return '<tr data-search="'+code+' 0x'+hex+' '+charLabel(code).toLowerCase()+'"><td>'+code+'</td><td>0x'+hex+'</td><td>'+oct+'</td><td>'+bin+'</td><td>'+charDisplay(code)+'</td><td style="color:var(--muted)">'+htmlDesc(code)+'</td></tr>';
  }
  function htmlDesc(code){
    if(code<32)return ctrlNames[code];
    if(code===32)return 'Space';
    if(code===127)return 'Delete';
    if(code>=48&&code<=57)return 'Digit '+String.fromCharCode(code);
    if(code>=65&&code<=90)return 'Uppercase '+String.fromCharCode(code);
    if(code>=97&&code<=122)return 'Lowercase '+String.fromCharCode(code);
    return 'Symbol';
  }
  var thStyle='padding:6px 10px;border:1px solid var(--border);background:var(--surface);color:var(--green);text-align:left;position:sticky;top:0;z-index:1';
  var html='<table style="width:100%;border-collapse:collapse;font-size:.85rem;font-family:var(--font-mono)"><thead><tr><th style="'+thStyle+'">Dec</th><th style="'+thStyle+'">Hex</th><th style="'+thStyle+'">Oct</th><th style="'+thStyle+'">Bin</th><th style="'+thStyle+'">Char</th><th style="'+thStyle+'">Description</th></tr></thead><tbody>';
  for(var i=0;i<128;i++)html+=buildRow(i);
  html+='</tbody></table>';
  $('t-table').innerHTML=html;
  $('t-search').addEventListener('input',function(){
    var q=this.value.trim().toLowerCase();
    var rows=$('t-table').querySelectorAll('tbody tr');
    rows.forEach(function(r){r.style.display=(!q||r.dataset.search.indexOf(q)!==-1)?'':'none';});
  });
  CK.setUsageContent('<ol><li>Browse the complete <strong>ASCII table</strong> (0–127).</li><li>Use the <strong>search box</strong> to filter by decimal, hex, character name, or symbol.</li></ol><p>Includes decimal, hexadecimal, octal, binary, and character descriptions for all 128 ASCII codes.</p>');
})();