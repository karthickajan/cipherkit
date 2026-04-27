(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'};
  function $(id){return document.getElementById(id);}
  var units=[
    {label:'Bits (b)',factor:1},
    {label:'Bytes (B)',factor:8},
    {label:'Kilobits (Kb)',factor:1e3},
    {label:'Kilobytes (KB)',factor:8e3},
    {label:'Kibibytes (KiB)',factor:8*1024},
    {label:'Megabits (Mb)',factor:1e6},
    {label:'Megabytes (MB)',factor:8e6},
    {label:'Mebibytes (MiB)',factor:8*1048576},
    {label:'Gigabits (Gb)',factor:1e9},
    {label:'Gigabytes (GB)',factor:8e9},
    {label:'Gibibytes (GiB)',factor:8*1073741824},
    {label:'Terabits (Tb)',factor:1e12},
    {label:'Terabytes (TB)',factor:8e12},
    {label:'Tebibytes (TiB)',factor:8*1099511627776},
    {label:'Petabits (Pb)',factor:1e15},
    {label:'Petabytes (PB)',factor:8e15},
    {label:'Pebibytes (PiB)',factor:8*1125899906842624}
  ];
  var unitOpts='';units.forEach(function(u,i){unitOpts+='<option value="'+i+'"'+(i===6?' selected':'')+'>'+u.label+'</option>';});
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.calc+'</div><h2 id="t-heading">Bit / Byte Calculator</h2></div><span class="tc-badge tc-badge-amber">Dev</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-val">Value</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><input type="number" id="t-val" class="mono" step="any" value="1" min="0"></div><div class="ctrl-row"><div class="sel-group"><label for="t-unit">Unit</label><select id="t-unit">'+unitOpts+'</select></div></div><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>All Conversions</span></div></div><div class="out-body" id="t-result" role="status"></div></div></div></div></div>';
  function convert(){
    var val=parseFloat($('t-val').value);
    if(isNaN(val)||val<0){$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Enter a valid positive number.</span>';return;}
    var idx=parseInt($('t-unit').value,10);
    var bits=val*units[idx].factor;
    var rows='';
    units.forEach(function(u){
      var converted=bits/u.factor;
      var display=converted===0?'0':(converted>=0.01?converted.toLocaleString(undefined,{maximumFractionDigits:6}):converted.toExponential(4));
      var isActive=u===units[idx];
      rows+='<tr style="'+(isActive?'background:rgba(61,214,140,.08)':'')+'">'
        +'<td style="padding:4px 10px;border-bottom:1px solid var(--border);color:'+(isActive?'var(--green)':'var(--fg)')+'">'+u.label+'</td>'
        +'<td style="padding:4px 10px;border-bottom:1px solid var(--border);font-family:var(--font-mono);text-align:right;color:'+(isActive?'var(--green)':'var(--fg)')+'">'+display+'</td></tr>';
    });
    $('t-result').innerHTML='<table style="width:100%;border-collapse:collapse;font-size:.85rem">'+rows+'</table>';
  }
  $('t-val').addEventListener('input',convert);
  $('t-unit').addEventListener('change',convert);
  $('btn-clr').addEventListener('click',function(){$('t-val').value='1';$('t-unit').selectedIndex=6;convert();});
  convert();
  CK.setUsageContent('<ol><li>Enter a <strong>numeric value</strong>.</li><li>Select the <strong>source unit</strong>.</li><li>All conversions update instantly (bits, bytes, KB, MB, GB, TB, PB and their binary equivalents).</li></ol><p>Supports both SI (decimal) and IEC (binary) units.</p>');
})();