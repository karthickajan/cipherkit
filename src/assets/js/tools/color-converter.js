/**
 * CipherKit — Color Code Converter
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.63 1.5-1.36 0-.35-.14-.69-.38-.93-.23-.24-.37-.56-.37-.93 0-.74.6-1.34 1.34-1.34H16c3.31 0 6-2.69 6-6 0-5.52-4.48-10-10-10z"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
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

  function updateAll(r,g,b) {
    var hex = rgbToHex(r,g,b);
    var hsl = rgbToHsl(r,g,b);
    $('t-hex').value = hex;
    $('t-rgb').value = 'rgb('+r+', '+g+', '+b+')';
    $('t-hsl').value = 'hsl('+hsl.h+', '+hsl.s+'%, '+hsl.l+'%)';
    $('t-preview').style.background = hex;
    $('t-picker').value = hex;
  }

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.palette + '</div><h2 id="t-heading">Color Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div style="display:flex;gap:12px;align-items:center"><div id="t-preview" style="width:48px;height:48px;border-radius:8px;border:1px solid var(--border);flex-shrink:0;background:#3dd68c"></div><input type="color" id="t-picker" value="#3dd68c" style="width:48px;height:48px;border:none;padding:0;cursor:pointer;background:none;border-radius:8px"></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-hex">HEX</label><button type="button" class="copy-btn" id="cp-hex" aria-label="Copy HEX">' + IC.copy + ' <span>Copy</span></button></div><input type="text" id="t-hex" value="#3dd68c" class="mono"></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-rgb">RGB</label><button type="button" class="copy-btn" id="cp-rgb" aria-label="Copy RGB">' + IC.copy + ' <span>Copy</span></button></div><input type="text" id="t-rgb" value="rgb(61, 214, 140)" class="mono"></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-hsl">HSL</label><button type="button" class="copy-btn" id="cp-hsl" aria-label="Copy HSL">' + IC.copy + ' <span>Copy</span></button></div><input type="text" id="t-hsl" value="hsl(151, 64%, 54%)" class="mono"></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  CK.wireCopy($('cp-hex'), function(){ return $('t-hex').value; });
  CK.wireCopy($('cp-rgb'), function(){ return $('t-rgb').value; });
  CK.wireCopy($('cp-hsl'), function(){ return $('t-hsl').value; });

  $('t-picker').addEventListener('input', function () { var c = hexToRgb(this.value); updateAll(c.r,c.g,c.b); });

  $('t-hex').addEventListener('change', function () {
    var v = this.value.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(v)) { var c=hexToRgb(v); updateAll(c.r,c.g,c.b); }
  });
  $('t-rgb').addEventListener('change', function () {
    var m = this.value.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
    if (m) updateAll(parseInt(m[1]),parseInt(m[2]),parseInt(m[3]));
  });
  $('t-hsl').addEventListener('change', function () {
    var m = this.value.match(/(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/);
    if (m) { var c=hslToRgb(parseInt(m[1]),parseInt(m[2]),parseInt(m[3])); updateAll(c.r,c.g,c.b); }
  });

  CK.setUsageContent('<ol><li>Use the <strong>color picker</strong> or type a color in any format (HEX, RGB, HSL).</li><li>All formats update automatically.</li></ol><p>Convert between <code>#hex</code>, <code>rgb(r,g,b)</code>, and <code>hsl(h,s%,l%)</code> instantly. Copy any format with one click.</p>');
})();
