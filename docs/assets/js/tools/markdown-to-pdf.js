/**
 * CipherKit — Markdown to PDF (marked.js + jsPDF html())
 * Uses marked.js for full GFM parsing → renders styled HTML → jsPDF html() for PDF.
 * Supports: headings, bold, italic, code, fenced code blocks, blockquotes,
 * tables, links, images (as text), lists, horizontal rules.
 */
(function(){
  'use strict';
  var root=document.getElementById('tool-root');if(!root)return;
  var IC={code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'};
  function $(id){return document.getElementById(id);}

  /* ── Scoped preview styles injected into the hidden render container ── */
  var PDF_CSS = [
    'body{font-family:Helvetica,Arial,sans-serif;font-size:__SIZE__pt;line-height:1.7;color:#1a1a1a;max-width:540px;margin:0 auto;padding:0;}',
    'h1{font-size:2em;font-weight:700;margin:0.5em 0 0.3em;border-bottom:2px solid #ddd;padding-bottom:0.2em}',
    'h2{font-size:1.5em;font-weight:700;margin:0.5em 0 0.3em;border-bottom:1px solid #eee;padding-bottom:0.15em}',
    'h3{font-size:1.25em;font-weight:700;margin:0.4em 0 0.2em}',
    'h4{font-size:1.1em;font-weight:700;margin:0.3em 0 0.2em}',
    'h5,h6{font-size:1em;font-weight:700;margin:0.3em 0 0.2em}',
    'p{margin:0 0 0.6em}',
    'a{color:#0366d6;text-decoration:underline}',
    'strong{font-weight:700}',
    'em{font-style:italic}',
    'code{font-family:Courier,monospace;font-size:0.88em;background:#f4f4f4;padding:1px 5px;border-radius:3px;border:1px solid #e0e0e0}',
    'pre{background:#f6f8fa;border:1px solid #ddd;border-radius:4px;padding:10px 14px;overflow-x:auto;margin:0.6em 0;line-height:1.5}',
    'pre code{background:none;border:none;padding:0;font-size:0.85em}',
    'blockquote{margin:0.5em 0;padding:0.3em 0 0.3em 14px;border-left:4px solid #ddd;color:#555}',
    'blockquote p{margin:0}',
    'ul,ol{margin:0 0 0.6em 0;padding-left:1.8em}',
    'li{margin-bottom:0.25em}',
    'hr{border:none;border-top:2px solid #ddd;margin:1em 0}',
    'table{border-collapse:collapse;width:100%;margin:0.6em 0;font-size:0.9em}',
    'th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}',
    'th{background:#f6f8fa;font-weight:700}',
    'img{max-width:100%}'
  ].join('\n');

  root.innerHTML=
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">'+IC.code+'</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +   '<div class="field"><div class="field-hdr"><label for="t-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">'+IC.trash+' <span>Clear</span></button></div></div>'
    +     '<textarea id="t-input" placeholder="# Hello World\n\nType or paste **Markdown** here\u2026\n\n- Supports headings, bold, italic\n- Code blocks, tables, blockquotes\n- Links, lists, horizontal rules" rows="14" class="mono"></textarea>'
    +     '<div class="input-meta" id="t-input-meta"></div>'
    +     '<div class="shortcut-hint">\u2318/Ctrl + Enter to generate</div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +   '</div>'
    +   '<div class="ctrl-row"><div class="sel-group"><label for="t-font">Font Size</label><select id="t-font"><option value="10">10pt</option><option value="11">11pt</option><option value="12" selected>12pt</option><option value="14">14pt</option></select></div></div>'
    +   '<button type="button" class="act-btn act-purple" id="btn-gen">'+IC.dl+' <span>Generate PDF</span></button>'
    +   '<div class="out-box">'
    +     '<div class="out-head"><div class="out-label">'+IC.play+' <span>Preview & Status</span></div><div class="out-btns"><button type="button" class="pill-btn" id="btn-preview">'+IC.eye+' <span>Preview</span></button></div></div>'
    +     '<div class="out-body" id="t-result" role="status" style="max-height:400px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span></div>'
    +   '</div>'
    + '</div></div></div>';

  /* ── Hidden render container for jsPDF html() ── */
  var _renderDiv = document.createElement('div');
  _renderDiv.id = 'md-render';
  _renderDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:540px;background:#fff;padding:0;';
  document.body.appendChild(_renderDiv);

  function getMarked() {
    if (typeof window.marked !== 'undefined') {
      if (typeof window.marked.parse === 'function') return window.marked;
      if (typeof window.marked === 'function') return { parse: window.marked };
    }
    return null;
  }

  function getHTML(md, fontSize) {
    var m = getMarked();
    if (!m) return null;
    var html = m.parse(md, { gfm: true, breaks: true });
    return '<style>' + PDF_CSS.replace(/__SIZE__/g, fontSize) + '</style>' + html;
  }

  /* ── PREVIEW ── */
  $('btn-preview').addEventListener('click', function(){
    var md = $('t-input').value.trim();
    $('t-err').textContent=''; $('t-err').style.display='none';
    if(!md){$('t-err').textContent='Enter some Markdown text.';$('t-err').style.display='block';return;}
    var html = getHTML(md, $('t-font').value);
    if(!html){$('t-err').textContent='marked.js library not loaded. Please refresh.';$('t-err').style.display='block';return;}
    /* Show styled preview in a white container */
    $('t-result').innerHTML = '<div style="background:#fff;color:#1a1a1a;padding:24px;border-radius:6px;font-family:Helvetica,Arial,sans-serif;font-size:'+$('t-font').value+'pt;line-height:1.7">' + html.replace(/<style>[\s\S]*?<\/style>/,'') + '</div>';
  });

  /* ── GENERATE PDF ── */
  $('btn-gen').addEventListener('click',function(){
    var md=$('t-input').value.trim();
    $('t-err').textContent='';$('t-err').style.display='none';
    if(!md){$('t-err').textContent='Enter some Markdown text.';$('t-err').style.display='block';return;}

    var jsPDFClass;
    if(typeof window.jspdf!=='undefined'&&window.jspdf.jsPDF) jsPDFClass=window.jspdf.jsPDF;
    else if(typeof window.jsPDF!=='undefined') jsPDFClass=window.jsPDF;
    else{$('t-err').textContent='jsPDF library not loaded. Please refresh.';$('t-err').style.display='block';return;}

    var html = getHTML(md, $('t-font').value);
    if(!html){$('t-err').textContent='marked.js library not loaded. Please refresh.';$('t-err').style.display='block';return;}

    $('t-result').innerHTML='<span style="color:var(--muted)">Generating PDF\u2026 please wait</span>';

    /* Render HTML into the hidden container */
    _renderDiv.innerHTML = html;

    var doc = new jsPDFClass({ unit:'pt', format:'a4' });

    doc.html(_renderDiv, {
      callback: function(d) {
        d.save('cipherkit-export.pdf');
        $('t-result').innerHTML='<span style="color:var(--green)">\u2713 PDF generated and downloaded as <code>cipherkit-export.pdf</code></span>';
        CK.toast('PDF downloaded');
        _renderDiv.innerHTML = '';
      },
      x: 36,
      y: 36,
      width: 523,
      windowWidth: 540,
      margin: [36, 36, 36, 36],
      autoPaging: 'text',
      html2canvas: { scale: 2, useCORS: true }
    });
  });

  $('btn-clr').addEventListener('click',function(){$('t-input').value='';$('t-result').innerHTML='<span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span>';});
  CK.wireCtrlEnter('btn-gen');
  CK.wireCharCounter($('t-input'),$('t-input-meta'));
  CK.setUsageContent('<ol><li>Type or paste <strong>Markdown</strong> text.</li><li>Choose a <strong>font size</strong>.</li><li>Click <strong>Preview</strong> to see the rendered output.</li><li>Click <strong>Generate PDF</strong> or press <kbd>Ctrl+Enter</kbd>.</li></ol><p>Uses <strong>marked.js</strong> for full GitHub-Flavored Markdown parsing: headings, bold, italic, code blocks, blockquotes, tables, links, lists, horizontal rules, and more. PDF is generated with <strong>jsPDF</strong> using pixel-perfect HTML rendering via html2canvas. All processing happens locally in your browser.</p>');
})();
