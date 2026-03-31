/**
 * CipherKit - Markdown to PDF (marked.js tokens to jsPDF)
 * Auto-shrinks code blocks to fit. Per-line backgrounds for page breaks.
 */
(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;

  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  root.innerHTML =
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +   '<div class="field"><div class="field-hdr"><label for="t-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div>'
    +     '<textarea id="t-input" placeholder="# Hello World\n\nType or paste **Markdown** here\u2026" rows="14" class="mono"></textarea>'
    +     '<div class="input-meta" id="t-input-meta"></div>'
    +     '<div class="shortcut-hint">\u2318/Ctrl + Enter to generate</div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +   '</div>'
    +   '<div class="ctrl-row">'
    +     '<div class="sel-group"><label for="t-font">Font Size</label><select id="t-font"><option value="10">10pt</option><option value="11">11pt</option><option value="12" selected>12pt</option><option value="14">14pt</option></select></div>'
    +   '</div>'
    +   '<button type="button" class="act-btn act-purple" id="btn-gen">' + IC.dl + ' <span>Generate PDF</span></button>'
    +   '<div class="out-box">'
    +     '<div class="out-head"><div class="out-label">' + IC.play + ' <span>Preview & Status</span></div><div class="out-btns"><button type="button" class="pill-btn" id="btn-preview">' + IC.eye + ' <span>Preview</span></button></div></div>'
    +     '<div class="out-body" id="t-result" role="status" style="max-height:400px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span></div>'
    +   '</div>'
    + '</div></div></div>';

  function getMarked() {
    if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') return window.marked;
    return null;
  }

  $('btn-preview').addEventListener('click', function () {
    var md = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded.'; $('t-err').style.display = 'block'; return; }
    var html = m.parse(md, { gfm: true, breaks: true });
    $('t-result').innerHTML = '<div style="background:#fff;color:#1a1a1a;padding:28px 24px;border-radius:6px;font-family:Georgia,serif;font-size:' + $('t-font').value + 'pt;line-height:1.8">' + html + '</div>';
  });

  $('btn-gen').addEventListener('click', function () {
    var md = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var J;
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) J = window.jspdf.jsPDF;
    else if (typeof window.jsPDF !== 'undefined') J = window.jsPDF;
    else { $('t-err').textContent = 'jsPDF not loaded.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded.'; $('t-err').style.display = 'block'; return; }
    $('t-result').innerHTML = '<span style="color:var(--muted)">Generating\u2026</span>';

    var fontSize = parseInt($('t-font').value, 10);
    var doc = new J({ unit: 'pt', format: 'a4' });
    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    var ml = 50, mr = 50, mt = 50, mb = 50;
    var mw = pw - ml - mr;
    var y = mt;
    var lh = fontSize * 1.55;
    var C = { blk:[30,30,30], g60:[100,100,100], g90:[220,220,220], cBg:[245,247,250], cBd:[215,220,228], bBg:[245,245,250], bBr:[120,130,220], lnk:[30,80,200], thB:[235,238,245], tA:[248,249,252] };
    var pageNum = 1;

    function footer() { doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(160,160,160); var fy=ph-25; doc.setDrawColor(230,230,230); doc.setLineWidth(0.4); doc.line(ml,fy-8,pw-mr,fy-8); doc.text(pageNum.toString(),pw/2,fy,{align:'center'}); }
    function newPg() { footer(); doc.addPage(); pageNum++; y = mt; }
    function need(h) { if (y + h > ph - mb) newPg(); }
    function setF(s,z) { z=z||fontSize; switch(s){case 'b':doc.setFont('helvetica','bold');break;case 'i':doc.setFont('helvetica','oblique');break;case 'bi':doc.setFont('helvetica','boldoblique');break;case 'c':doc.setFont('courier','normal');break;default:doc.setFont('helvetica','normal');} doc.setFontSize(z); }
    function setC(c) { doc.setTextColor(c[0],c[1],c[2]); }

    function plain(tks) {
      if (!tks) return '';
      var s = '';
      for (var i = 0; i < tks.length; i++) {
        var t = tks[i];
        if (t.type==='text'||t.type==='codespan') s += t.text||t.raw||'';
        else if (t.type==='strong'||t.type==='em'||t.type==='link') s += plain(t.tokens);
        else if (t.type==='br') s += '\n';
        else s += t.text||t.raw||'';
      }
      return s;
    }

    function renderInline(tks, x0, maxW, bsz) {
      if (!tks||!tks.length) return;
      var sz=bsz||fontSize, ilh=sz*1.55, x=x0, w=maxW||mw;
      for (var i=0;i<tks.length;i++) {
        var tk=tks[i], txt='', sty='n', col=C.blk, isLnk=false, isCd=false;
        switch(tk.type) {
          case 'text': txt=tk.text||''; break;
          case 'escape': txt=tk.text||''; break;
          case 'strong':
            if(tk.tokens&&tk.tokens.length===1&&tk.tokens[0].type==='em'){txt=plain(tk.tokens[0].tokens);sty='bi';}
            else{txt=plain(tk.tokens);sty='b';} break;
          case 'em':
            if(tk.tokens&&tk.tokens.length===1&&tk.tokens[0].type==='strong'){txt=plain(tk.tokens[0].tokens);sty='bi';}
            else{txt=plain(tk.tokens);sty='i';} break;
          case 'codespan': txt=tk.text||''; sty='c'; isCd=true; break;
          case 'link': txt=plain(tk.tokens); isLnk=true; col=C.lnk; break;
          case 'br': x=x0; y+=ilh; need(ilh); continue;
          default: txt=tk.text||tk.raw||'';
        }
        if(!txt) continue;
        var csz=isCd?sz*0.88:sz;
        setF(sty,csz); setC(col);
        var words=txt.split(/( +)/);
        for(var wi=0;wi<words.length;wi++){
          var wd=words[wi]; if(!wd) continue;
          var ww=doc.getTextWidth(wd);
          if(x+ww>x0+w&&x>x0){x=x0;y+=ilh;need(ilh);}
          need(ilh);
          if(isCd&&wd.trim()){doc.setFillColor(C.cBg[0],C.cBg[1],C.cBg[2]);doc.setDrawColor(C.cBd[0],C.cBd[1],C.cBd[2]);doc.roundedRect(x-2,y-csz+1,ww+4,csz+3,2,2,'FD');setC(col);}
          doc.text(wd,x,y);
          if(isLnk&&wd.trim()){doc.setDrawColor(C.lnk[0],C.lnk[1],C.lnk[2]);doc.setLineWidth(0.4);doc.line(x,y+1.5,x+ww,y+1.5);}
          x+=ww;
        }
        setF('n',sz); setC(C.blk);
      }
      y+=ilh;
    }

    function renderList(items,ord,dep) {
      var ind=ml+dep*18, bul=['\u2022','\u25E6','\u25AA'];
      for(var i=0;i<items.length;i++){
        var it=items[i], b=ord?(i+1)+'.':bul[Math.min(dep,2)];
        need(lh); setF('n'); setC(C.g60); doc.text(b,ind,y); setC(C.blk);
        var bw=doc.getTextWidth(b+' '), inl=[], sub=[];
        if(it.tokens){for(var j=0;j<it.tokens.length;j++){var s=it.tokens[j];if((s.type==='text'||s.type==='paragraph')&&s.tokens)inl=inl.concat(s.tokens);else if(s.type==='list')sub.push(s);}}
        if(inl.length){renderInline(inl,ind+bw,mw-(ind-ml)-bw);}
        else{var raw=plain(it.tokens);if(raw){setF('n');var wl=doc.splitTextToSize(raw,mw-(ind-ml)-bw);for(var k=0;k<wl.length;k++){need(lh);doc.text(wl[k],ind+bw,y);y+=lh;}}else{y+=lh;}}
        for(var n=0;n<sub.length;n++)renderList(sub[n].items,sub[n].ordered,dep+1);
      }
    }

    var tks;
    try{tks=m.lexer(md);}catch(e){$('t-err').textContent='Parse error: '+e.message;$('t-err').style.display='block';return;}
    setC(C.blk);

    for(var i=0;i<tks.length;i++){
      var tk=tks[i];

      if(tk.type==='heading'){
        var hSz=[0,fontSize+12,fontSize+8,fontSize+5,fontSize+3,fontSize+1,fontSize];
        var hs=hSz[tk.depth]||fontSize, hlh=hs*1.45;
        y+=tk.depth<=2?fontSize*0.9:fontSize*0.5;
        need(hlh+6);
        setF('b',hs); setC(tk.depth>=5?C.g60:C.blk);
        var ht=plain(tk.tokens);
        var hL=doc.splitTextToSize(ht,mw);
        for(var hi=0;hi<hL.length;hi++){need(hlh);doc.text(hL[hi],ml,y);y+=hlh;}
        if(tk.depth<=2){doc.setDrawColor(C.g90[0],C.g90[1],C.g90[2]);doc.setLineWidth(tk.depth===1?1.5:0.5);doc.line(ml,y-hlh*0.2,pw-mr,y-hlh*0.2);y+=3;}
        y+=fontSize*0.2; setF('n'); setC(C.blk); continue;
      }

      if(tk.type==='paragraph'){need(lh);renderInline(tk.tokens,ml,mw);y+=fontSize*0.15;continue;}

      if(tk.type==='code'){
        var cTxt=tk.text||'', cLines=cTxt.split('\n');
        var padV=8, padH=8;
        var lnW=cLines.length>=100?28:cLines.length>=10?20:14;
        var codeW=mw-padH*2-lnW-4;
        var cSz=fontSize*0.8;
        setF('c',cSz);
        var maxLW=0;
        for(var j3=0;j3<cLines.length;j3++){var tw=doc.getTextWidth(cLines[j3]||'');if(tw>maxLW)maxLW=tw;}
        while(maxLW>codeW&&cSz>5.5){cSz-=0.5;setF('c',cSz);maxLW=0;for(var j4=0;j4<cLines.length;j4++){var tw2=doc.getTextWidth(cLines[j4]||'');if(tw2>maxLW)maxLW=tw2;}}
        var cLH=cSz*1.4;
        y+=4;
        for(var ci=0;ci<cLines.length;ci++){
          need(cLH+(ci===0?padV:0));
          var bgY=y-cLH+2,bgH=cLH;
          if(ci===0){bgY-=padV;bgH+=padV;}
          if(ci===cLines.length-1)bgH+=padV;
          doc.setFillColor(C.cBg[0],C.cBg[1],C.cBg[2]);doc.rect(ml,bgY,mw,bgH,'F');
          doc.setDrawColor(C.cBd[0],C.cBd[1],C.cBd[2]);doc.setLineWidth(0.4);
          doc.line(ml,bgY,ml,bgY+bgH);doc.line(ml+mw,bgY,ml+mw,bgY+bgH);
          if(ci===0)doc.line(ml,bgY,ml+mw,bgY);
          if(ci===cLines.length-1)doc.line(ml,bgY+bgH,ml+mw,bgY+bgH);
          if(ci===0&&tk.lang){doc.setFont('helvetica','normal');doc.setFontSize(cSz*0.75);doc.setTextColor(160,165,175);doc.text(tk.lang.toUpperCase(),pw-mr-padH,bgY+cSz*0.75+3,{align:'right'});}
          setF('c',cSz);
          doc.setTextColor(170,175,185);doc.text((ci+1).toString(),ml+padH+lnW-2,y,{align:'right'});
          doc.setTextColor(50,55,65);doc.text(cLines[ci]||'',ml+padH+lnW+3,y);
          y+=cLH;
        }
        y+=padV+4; setF('n'); setC(C.blk); continue;
      }

      if(tk.type==='blockquote'){
        var bqTxt=plain(tk.tokens);setF('i');
        var bqL=doc.splitTextToSize(bqTxt,mw-20);
        y+=4;
        for(var bi=0;bi<bqL.length;bi++){
          need(lh);var byy=y-lh+3,bh=lh;if(bi===0){byy-=5;bh+=5;}if(bi===bqL.length-1)bh+=5;
          doc.setFillColor(C.bBg[0],C.bBg[1],C.bBg[2]);doc.rect(ml,byy,mw,bh,'F');
          doc.setFillColor(C.bBr[0],C.bBr[1],C.bBr[2]);doc.rect(ml,byy,3,bh,'F');
          setF('i');setC(C.g60);doc.text(bqL[bi],ml+12,y);y+=lh;
        }
        y+=6;setC(C.blk);setF('n');continue;
      }

      if(tk.type==='list'){y+=2;renderList(tk.items,tk.ordered,0);y+=fontSize*0.15;continue;}

      if(tk.type==='hr'){y+=fontSize*0.5;need(4);doc.setDrawColor(C.g90[0],C.g90[1],C.g90[2]);doc.setLineWidth(0.75);doc.line(ml+mw*0.1,y,pw-mr-mw*0.1,y);y+=fontSize*0.5;continue;}

      if(tk.type==='table'){
        var cols=tk.header.length,colW=mw/cols,tSz=fontSize*0.82,tLH=tSz*1.35,cp=4;
        y+=4;
        var hTexts=[],mhH=tLH;
        for(var h2=0;h2<cols;h2++){var ht2=plain(tk.header[h2].tokens);hTexts.push(ht2);setF('b',tSz);var ch=doc.splitTextToSize(ht2,colW-cp*2).length*tLH;if(ch>mhH)mhH=ch;}
        need(mhH+cp*2);
        doc.setFillColor(C.thB[0],C.thB[1],C.thB[2]);doc.rect(ml,y,mw,mhH+cp*2,'F');
        setF('b',tSz);setC(C.blk);
        for(var h3=0;h3<cols;h3++){var hll=doc.splitTextToSize(hTexts[h3],colW-cp*2);for(var hl=0;hl<hll.length;hl++)doc.text(hll[hl],ml+h3*colW+cp,y+cp+tLH*(hl+0.7));}
        y+=mhH+cp*2;
        doc.setDrawColor(C.g90[0],C.g90[1],C.g90[2]);doc.setLineWidth(0.6);doc.line(ml,y,pw-mr,y);
        for(var ri=0;ri<tk.rows.length;ri++){
          var rTexts=[],mrH=tLH;
          for(var rc=0;rc<cols;rc++){var ct=plain(tk.rows[ri][rc].tokens);rTexts.push(ct);setF('n',tSz);var rch=doc.splitTextToSize(ct,colW-cp*2).length*tLH;if(rch>mrH)mrH=rch;}
          need(mrH+cp);
          if(ri%2===1){doc.setFillColor(C.tA[0],C.tA[1],C.tA[2]);doc.rect(ml,y,mw,mrH+cp,'F');}
          setF('n',tSz);setC(C.blk);
          for(var rc2=0;rc2<cols;rc2++){var rll=doc.splitTextToSize(rTexts[rc2],colW-cp*2);for(var rl=0;rl<rll.length;rl++)doc.text(rll[rl],ml+rc2*colW+cp,y+cp+tLH*(rl+0.7));}
          y+=mrH+cp;
          doc.setDrawColor(240,240,242);doc.setLineWidth(0.25);doc.line(ml,y,pw-mr,y);
        }
        doc.setDrawColor(C.g90[0],C.g90[1],C.g90[2]);doc.setLineWidth(0.4);doc.line(ml,y,pw-mr,y);
        y+=6;continue;
      }

      if(tk.type==='space'){y+=fontSize*0.35;continue;}
    }

    footer();
    doc.save('cipherkit-export.pdf');
    $('t-result').innerHTML='<span style="color:var(--purple)">\u2713 PDF generated ('+pageNum+' page'+(pageNum>1?'s':'')+')</span>';
    CK.toast('PDF downloaded');
  });

  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview\u2026</span>';});
  CK.wireCtrlEnter('btn-gen');
  CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Type or paste <strong>Markdown</strong>.</li><li>Choose a <strong>font size</strong>.</li><li>Click <strong>Generate PDF</strong> or <kbd>Ctrl+Enter</kbd>.</li></ol><p>Code blocks auto-shrink to fit the page width. Supports headings, bold, italic, inline code, code blocks (line numbers, language label), blockquotes, tables, links, nested lists, HR.</p><p>Limitation: jsPDF uses built-in fonts only (Helvetica, Courier). For custom fonts/images, a server is needed.</p>');
})();
