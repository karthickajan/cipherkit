/**
 * CipherKit — Markdown to PDF (uses jsPDF CDN)
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'};
  function $(id){return document.getElementById(id);}

  root.innerHTML='<div class="tool-single-col"><div class="tool-card-ui"><div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.code+'</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div><div class="tc-body" role="region" aria-labelledby="t-heading"><div class="field"><div class="field-hdr"><label for="t-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="# Hello World\n\nType or paste Markdown here\u2026" rows="12" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="shortcut-hint">\u2318/Ctrl + Enter to generate</div><div class="inline-error" id="t-err" role="alert"></div></div><div class="ctrl-row"><div class="sel-group"><label for="t-font">Font Size</label><select id="t-font"><option value="10">10pt</option><option value="11">11pt</option><option value="12" selected>12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div><button type="button" class="act-btn act-purple" id="btn-gen">'+IC.dl+' <span>Generate PDF</span></button><div class="out-box"><div class="out-head"><div class="out-label">'+IC.play+' <span>Status</span></div></div><div class="out-body" id="t-result" role="status" style="max-height:320px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Click Generate PDF to create your document\u2026</span></div></div></div></div></div>';

  $('btn-gen').addEventListener('click',function(){
    var md=$('t-input').value.trim();$('t-err').textContent='';$('t-err').style.display='none';
    if(!md){$('t-err').textContent='Enter some Markdown text.';$('t-err').style.display='block';return;}
    /* Access jsPDF — support both global patterns */
    var jsPDFClass;
    if(typeof window.jspdf!=='undefined'&&window.jspdf.jsPDF){jsPDFClass=window.jspdf.jsPDF;}
    else if(typeof window.jsPDF!=='undefined'){jsPDFClass=window.jsPDF;}
    else{$('t-err').textContent='jsPDF library not loaded. Please refresh.';$('t-err').style.display='block';return;}

    var fontSize=parseInt($('t-font').value,10);
    var doc=new jsPDFClass({unit:'pt',format:'a4'});
    var pageW=doc.internal.pageSize.getWidth(),pageH=doc.internal.pageSize.getHeight();
    var margin=40,maxW=pageW-margin*2,y=margin+fontSize;
    function checkPage(h){if(y+h>pageH-margin){doc.addPage();y=margin+fontSize;}}
    doc.setFont('helvetica','normal');doc.setFontSize(fontSize);

    var lines=md.split('\n');
    for(var i=0;i<lines.length;i++){
      var line=lines[i];

      /* Headings */
      var hMatch=line.match(/^(#{1,6})\s+(.*)/);
      if(hMatch){
        var level=hMatch[1].length,hSize=fontSize+(7-level)*2;
        doc.setFontSize(hSize);doc.setFont('helvetica','bold');
        var hText=hMatch[2].replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/`(.+?)`/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1');
        var wrapped=doc.splitTextToSize(hText,maxW);
        for(var w=0;w<wrapped.length;w++){checkPage(hSize*1.4);doc.text(wrapped[w],margin,y);y+=hSize*1.4;}
        y+=4;doc.setFontSize(fontSize);doc.setFont('helvetica','normal');continue;
      }

      /* Horizontal rule */
      if(/^(---|\*\*\*|___)\s*$/.test(line)){y+=6;checkPage(2);doc.setDrawColor(150);doc.line(margin,y,pageW-margin,y);y+=10;continue;}

      /* Blank line = paragraph break */
      if(line.trim()===''){y+=fontSize*0.6;continue;}

      /* Strip inline markdown */
      var txt=line.replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/_(.+?)_/g,'$1').replace(/`(.+?)`/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/!\[([^\]]*)\]\([^)]+\)/g,'[$1]');
      /* Unordered list */
      txt=txt.replace(/^(\s*)[-*+]\s+/,function(m,sp){return (sp||'')+'  \u2022 ';});
      /* Ordered list */
      txt=txt.replace(/^(\s*)\d+\.\s+/,function(m,sp){return (sp||'')+'  '+m.trim()+' ';});

      var wLines=doc.splitTextToSize(txt,maxW);
      for(var j=0;j<wLines.length;j++){checkPage(fontSize*1.4);doc.text(wLines[j],margin,y);y+=fontSize*1.4;}
    }

    doc.save('cipherkit-export.pdf');
    $('t-result').innerHTML='<span style="color:var(--green)">\u2713 PDF generated and downloaded as <code>cipherkit-export.pdf</code></span>';
    CK.toast('PDF downloaded');
  });

  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Click Generate PDF to create your document\u2026</span>';});
  CK.wireCtrlEnter('btn-gen');CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Type or paste <strong>Markdown</strong> text.</li><li>Choose a <strong>font size</strong> (10\u201316pt).</li><li>Click <strong>Generate PDF</strong> or press <kbd>Ctrl+Enter</kbd>.</li></ol><p>Supports: <code># headings</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- lists</code>, numbered lists, <code>---</code> horizontal rules, and paragraph breaks. Multi-page output is automatic.</p><p>Uses jsPDF for 100% client-side PDF generation. No data leaves your browser.</p>');
})();
