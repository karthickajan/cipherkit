(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.02 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z"/></svg>',shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'};
  function $(id){return document.getElementById(id);}
  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-amber">'+IC.palette+'</div><h2 id="t-heading">Color Palette Generator</h2></div><span class="tc-badge tc-badge-amber">Design</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="ctrl-row"><div class="sel-group"><label for="t-base">Base Color</label><input type="color" id="t-base" value="#3dd68c" class="ck-swatch" style="width:48px;height:32px"></div><div class="sel-group"><label for="t-mode">Harmony</label><select id="t-mode"><option value="complementary">Complementary</option><option value="analogous">Analogous</option><option value="triadic">Triadic</option><option value="split">Split Complementary</option><option value="tetradic">Tetradic</option><option value="monochrome" selected>Monochrome</option></select></div><div class="sel-group"><label for="t-count">Colors</label><select id="t-count"><option value="5" selected>5</option><option value="6">6</option><option value="8">8</option><option value="10">10</option></select></div></div><button type="button" class="act-btn act-amber" id="btn-gen">'+IC.palette+' <span>Generate</span></button><button type="button" class="pill-btn" id="btn-rand" style="margin-top:8px">'+IC.shuffle+' <span>Random Base</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Palette</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-copy-all" aria-label="Copy all">'+IC.copy+' <span>Copy All</span></button></div></div><div class="out-body" id="t-result" role="status"><span style="color:var(--muted);font-style:italic">Generated palette will appear here\u2026</span></div></div></div></div></div>';
  function hexToHSL(hex){
    var r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
    var max=Math.max(r,g,b),min=Math.min(r,g,b),h=0,s=0,l=(max+min)/2;
    if(max!==min){var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
    return [h*360,s*100,l*100];
  }
  function hslToHex(h,s,l){
    h=((h%360)+360)%360;s/=100;l/=100;
    var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
    var r=0,g=0,b=0;
    if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
    r=Math.round((r+m)*255);g=Math.round((g+m)*255);b=Math.round((b+m)*255);
    return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
  }
  function generate(){
    var hex=$('t-base').value;var mode=$('t-mode').value;var count=parseInt($('t-count').value,10);
    var hsl=hexToHSL(hex);var h=hsl[0],s=hsl[1],l=hsl[2];
    var colors=[];
    if(mode==='monochrome'){for(var i=0;i<count;i++){var li=Math.max(10,Math.min(90,l-30+60*i/(count-1)));colors.push(hslToHex(h,s,li));}}
    else if(mode==='analogous'){var step=30;for(var i=0;i<count;i++){colors.push(hslToHex(h-step*(count-1)/2+step*i,s,l));}}
    else if(mode==='complementary'){colors.push(hex);colors.push(hslToHex(h+180,s,l));for(var i=2;i<count;i++){var li2=l-20+40*i/(count-1);colors.push(hslToHex(h+(i%2===0?0:180),s,li2));}}
    else if(mode==='triadic'){colors.push(hex);colors.push(hslToHex(h+120,s,l));colors.push(hslToHex(h+240,s,l));for(var i=3;i<count;i++){colors.push(hslToHex(h+120*(i%3),s,l-15+30*(i/count)));}}
    else if(mode==='split'){colors.push(hex);colors.push(hslToHex(h+150,s,l));colors.push(hslToHex(h+210,s,l));for(var i=3;i<count;i++){colors.push(hslToHex(h+150*(i%2===0?1:-1),s,l-15+30*(i/count)));}}
    else if(mode==='tetradic'){colors.push(hex);colors.push(hslToHex(h+90,s,l));colors.push(hslToHex(h+180,s,l));colors.push(hslToHex(h+270,s,l));for(var i=4;i<count;i++){colors.push(hslToHex(h+90*(i%4),s,l-10+20*(i/count)));}}
    colors=colors.slice(0,count);
    return colors;
  }
  function render(colors){
    var html='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
    colors.forEach(function(c){
      var textColor=hexToHSL(c)[2]>55?'#000':'#fff';
      html+='<div class="pal-swatch" style="width:80px;text-align:center;cursor:pointer" data-hex="'+c+'" title="Click to copy"><div style="width:80px;height:60px;border-radius:6px;background:'+c+';border:1px solid var(--border)"></div><span style="font-size:.75rem;font-family:var(--font-mono);color:var(--fg);margin-top:4px;display:block">'+c.toUpperCase()+'</span></div>';
    });
    html+='</div>';
    $('t-result').innerHTML=html;
    $('t-result').querySelectorAll('.pal-swatch').forEach(function(el){
      el.addEventListener('click',function(){navigator.clipboard.writeText(this.dataset.hex).then(function(){CK.toast('Copied');});});
    });
    _allColors=colors;
  }
  var _allColors=[];
  $('btn-gen').addEventListener('click',function(){render(generate());CK.toast('Palette generated');});
  $('btn-rand').addEventListener('click',function(){$('t-base').value='#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');render(generate());});
  $('btn-copy-all').addEventListener('click',function(){if(!_allColors.length){CK.toast('Generate first','err');return;}navigator.clipboard.writeText(_allColors.join(', ')).then(function(){CK.toast('All colors copied');});});
  render(generate());
  CK.wireCtrlEnter('btn-gen');
  CK.setUsageContent('<ol><li>Pick a <strong>base color</strong> or click <strong>Random</strong>.</li><li>Choose a <strong>color harmony</strong> (monochrome, analogous, triadic, etc.).</li><li>Set the number of <strong>colors</strong>.</li><li>Click <strong>Generate</strong>. Click any swatch to copy its hex value.</li></ol>');
})();