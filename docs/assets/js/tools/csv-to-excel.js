(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.table+'</div><h2 id="t-heading">CSV to Excel</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-input">CSV Data</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="name,email,age\nAlice,alice@example.com,30\nBob,bob@example.com,25" rows="10" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-sheet">Sheet Name</label><input type="text" id="t-sheet" value="Sheet1" class="mono" style="width:120px"></div></div><button type="button" class="act-btn act-purple" id="btn-conv">'+IC.dl+' <span>Download Excel</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Preview</span></div></div><div class="out-body" id="t-result" role="status"><span style="color:var(--muted);font-style:italic">Table preview will appear here\u2026</span></div></div></div></div></div>';
  function parseCSV(text){
    var rows=[],row=[],field='',inQ=false;
    for(var i=0;i<text.length;i++){
      var c=text[i],next=text[i+1]||'';
      if(inQ){
        if(c==='"'&&next==='"'){field+='"';i++;}
        else if(c==='"'){inQ=false;}
        else{field+=c;}
      }else{
        if(c==='"'){inQ=true;}
        else if(c===','){row.push(field);field='';}
        else if(c==='\n'||(c==='\r'&&next==='\n')){if(c==='\r')i++;row.push(field);rows.push(row);row=[];field='';}
        else{field+=c;}
      }
    }
    row.push(field);if(row.length>1||row[0]!=='')rows.push(row);
    return rows;
  }
  function renderTable(rows){
    if(!rows.length)return '';
    var h='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.85rem"><thead><tr>';
    rows[0].forEach(function(c){h+='<th style="padding:4px 8px;border:1px solid var(--border);background:var(--surface);color:var(--green);text-align:left">'+esc(c)+'</th>';});
    h+='</tr></thead><tbody>';
    for(var i=1;i<Math.min(rows.length,50);i++){h+='<tr>';rows[i].forEach(function(c){h+='<td style="padding:4px 8px;border:1px solid var(--border)">'+esc(c)+'</td>';});h+='</tr>';}
    h+='</tbody></table></div>';
    if(rows.length>50)h+='<p style="color:var(--muted);font-size:.8rem;margin-top:6px">Showing 50 of '+rows.length+' rows</p>';
    return h;
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  $('btn-conv').addEventListener('click',function(){
    var csv=$('t-input').value.trim();$('t-err').textContent='';$('t-err').style.display='none';
    if(!csv){$('t-err').textContent='Paste CSV data.';$('t-err').style.display='block';return;}
    if(typeof XLSX==='undefined'){$('t-err').textContent='SheetJS library not loaded.';$('t-err').style.display='block';return;}
    var rows=parseCSV(csv);
    $('t-result').innerHTML=renderTable(rows);
    var ws=XLSX.utils.aoa_to_sheet(rows);
    var wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,$('t-sheet').value||'Sheet1');
    XLSX.writeFile(wb,'data.xlsx');
    CK.toast('Excel downloaded');
  });
  $('t-input').addEventListener('input',function(){var csv=this.value.trim();if(csv){var rows=parseCSV(csv);$('t-result').innerHTML=renderTable(rows);}});
  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Table preview will appear here\u2026</span>';});
  CK.wireCtrlEnter('btn-conv');CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Paste <strong>CSV data</strong> (comma-separated).</li><li>Optionally set a <strong>sheet name</strong>.</li><li>Click <strong>Download Excel</strong> to get an .xlsx file.</li></ol><p>Powered by SheetJS. All processing is local.</p>');
})();