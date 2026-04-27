(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.63 1.5-1.36 0-.35-.14-.69-.38-.93-.23-.24-.37-.56-.37-.93 0-.74.6-1.34 1.34-1.34H16c3.31 0 6-2.69 6-6 0-5.52-4.48-10-10-10z"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var n=parseInt(hex,16); return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
  }
  function rgbToHex(r,g,b) { return '#'+[r,g,b].map(function(x){return x.toString(16).padStart(2,'0');}).join(''); }
  function rgbToHsl(r,g,b) {
    r/=255;g/=255;b/=255;
    var max=Math.max(r,g,b),min=Math.min(r,g,b),h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
  }
  function hslToRgb(h,s,l) {
    h/=360;s/=100;l/=100;
    var r,g,b;
    if(s===0){r=g=b=l;}else{
      function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
      var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
      r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);
    }
    return {r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};
  }
  function rgbToHsv(r,g,b){
    r/=255;g/=255;b/=255;
    var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0,s=max===0?0:d/max,v=max;
    if(d!==0){switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return {h:Math.round(h*360),s:Math.round(s*100),v:Math.round(v*100)};
  }
  var RECENT_KEY='ck_recent_colors';
  function getRecent(){try{return JSON.parse(localStorage.getItem(RECENT_KEY))||[];}catch(e){return[];}}
  function pushRecent(hex){
    var arr=getRecent().filter(function(c){return c!==hex;});
    arr.unshift(hex);if(arr.length>8)arr=arr.slice(0,8);
    localStorage.setItem(RECENT_KEY,JSON.stringify(arr));renderRecent();
  }
  function renderRecent(){
    var el=$('t-recent');if(!el)return;
    var arr=getRecent();
    if(!arr.length){el.innerHTML='';return;}
    el.innerHTML=arr.map(function(c){return '<button class="ck-recent-swatch" data-color="'+c+'" style="background:'+c+'" aria-label="Use '+c+'" title="'+c+'"></button>';}).join('');
    el.querySelectorAll('.ck-recent-swatch').forEach(function(btn){
      btn.addEventListener('click',function(){var c=hexToRgb(this.dataset.color);updateAll(c.r,c.g,c.b);pushRecent(this.dataset.color);});
    });
  }
  function updateAll(r,g,b) {
    var hex = rgbToHex(r,g,b);
    var hsl = rgbToHsl(r,g,b);
    var hsv = rgbToHsv(r,g,b);
    $('t-picker').value = hex;
    $('t-hex-input').value = hex;
    $('t-preview').style.background = hex;
    $('v-hex').textContent = hex;
    $('v-rgb').textContent = 'rgb('+r+', '+g+', '+b+')';
    $('v-rgba').textContent = 'rgba('+r+', '+g+', '+b+', 1)';
    $('v-hsl').textContent = 'hsl('+hsl.h+', '+hsl.s+'%, '+hsl.l+'%)';
    $('v-hsv').textContent = 'hsv('+hsv.h+', '+hsv.s+'%, '+hsv.v+'%)';
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.palette + '</div><h2 id="t-heading">Color Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:-8px">Input</div>'
    +     '<div class="ck-color-row"><input type="color" id="t-picker" value="#3dd68c" class="ck-swatch"><div style="flex:1"><input type="text" id="t-hex-input" value="#3dd68c" class="ck-hex-input" placeholder="#000000" spellcheck="false"><div id="t-preview" style="height:8px;border-radius:0 0 6px 6px;margin-top:-1px;background:#3dd68c;transition:background .15s"></div></div></div>'
    +     '<div id="t-recent" class="ck-recent-colors"></div>'
    +     '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;border-top:1px solid var(--border);padding-top:12px;margin-bottom:-8px">Output — All Formats</div>'
    +     '<div class="ck-color-grid">'
    +       '<div class="ck-color-format-row"><span class="ck-color-format-label">HEX</span><span class="ck-color-format-value" id="v-hex">#3dd68c</span><button type="button" class="copy-btn sm" id="cp-hex" aria-label="Copy HEX">' + IC.copy + '</button></div>'
    +       '<div class="ck-color-format-row"><span class="ck-color-format-label">RGB</span><span class="ck-color-format-value" id="v-rgb">rgb(61, 214, 140)</span><button type="button" class="copy-btn sm" id="cp-rgb" aria-label="Copy RGB">' + IC.copy + '</button></div>'
    +       '<div class="ck-color-format-row"><span class="ck-color-format-label">RGBA</span><span class="ck-color-format-value" id="v-rgba">rgba(61, 214, 140, 1)</span><button type="button" class="copy-btn sm" id="cp-rgba" aria-label="Copy RGBA">' + IC.copy + '</button></div>'
    +       '<div class="ck-color-format-row"><span class="ck-color-format-label">HSL</span><span class="ck-color-format-value" id="v-hsl">hsl(151, 64%, 54%)</span><button type="button" class="copy-btn sm" id="cp-hsl" aria-label="Copy HSL">' + IC.copy + '</button></div>'
    +       '<div class="ck-color-format-row"><span class="ck-color-format-label">HSV</span><span class="ck-color-format-value" id="v-hsv">hsv(151, 71%, 84%)</span><button type="button" class="copy-btn sm" id="cp-hsv" aria-label="Copy HSV">' + IC.copy + '</button></div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  renderRecent();
  CK.wireCopy($('cp-hex'), function(){ return $('v-hex').textContent; });
  CK.wireCopy($('cp-rgb'), function(){ return $('v-rgb').textContent; });
  CK.wireCopy($('cp-rgba'), function(){ return $('v-rgba').textContent; });
  CK.wireCopy($('cp-hsl'), function(){ return $('v-hsl').textContent; });
  CK.wireCopy($('cp-hsv'), function(){ return $('v-hsv').textContent; });
  $('t-picker').addEventListener('input', function () { var c = hexToRgb(this.value); updateAll(c.r,c.g,c.b); pushRecent(this.value); });
  $('t-hex-input').addEventListener('change', function () {
    var v = this.value.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(v)) { if(v[0]!=='#')v='#'+v; var c=hexToRgb(v); updateAll(c.r,c.g,c.b); pushRecent(rgbToHex(c.r,c.g,c.b)); }
  });
  var initC=hexToRgb('#3dd68c'); updateAll(initC.r,initC.g,initC.b);
  CK.setUsageContent('<ol><li>Use the <strong>color picker swatch</strong> or type a hex code directly.</li><li>All formats (HEX, RGB, RGBA, HSL, HSV) update <strong>live</strong>.</li><li>Click any <strong>Copy</strong> button to copy a format.</li><li>Your last 8 colors are saved as swatches for quick access.</li></ol>');
})();