/**
 * CipherKit — Markdown to PDF
 * Pipeline: marked.js → HTML → html2canvas → jsPDF (multi-page)
 * Browser handles all text layout, word wrap, code, tables.
 */
(function () {
  'use strict';

  var root = document.getElementById('tool-root');
  if (!root) return;

  /* ── SVG icons ─────────────────────────────────────────────── */
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  /* ── Render tool UI ────────────────────────────────────────── */
  root.innerHTML =
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    /* textarea */
    +   '<div class="field"><div class="field-hdr"><label for="markdown-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div>'
    +     '<textarea id="markdown-input" placeholder="# Hello World\n\nType or paste **Markdown** here\u2026" rows="14" class="mono"></textarea>'
    +     '<div class="input-meta"><span id="md-counter" style="font-size:0.75rem;color:var(--muted,#666);float:right">0 chars \u00b7 0 bytes</span></div>'
    +     '<div class="shortcut-hint">\u2318/Ctrl + Enter to generate</div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +   '</div>'
    /* controls */
    +   '<div class="ctrl-row">'
    +     '<div class="sel-group"><label for="font-size">Font Size</label><select id="font-size"><option value="11">11px</option><option value="12">12px</option><option value="13" selected>13px</option><option value="14">14px</option><option value="16">16px</option></select></div>'
    +   '</div>'
    +   '<button type="button" class="act-btn act-purple" id="btn-gen">' + IC.dl + ' <span>Generate PDF</span></button>'
    +   '<div id="md-status" style="margin-top:10px;min-height:24px" role="status"></div>'
    /* preview */
    +   '<div class="out-box">'
    +     '<div class="out-head"><div class="out-label">' + IC.play + ' <span>Preview</span></div><div class="out-btns"><button type="button" class="pill-btn" id="btn-preview">' + IC.eye + ' <span>Preview</span></button></div></div>'
    +     '<div class="out-body" id="t-result" role="status" style="max-height:400px;overflow-y:auto;resize:vertical"><span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span></div>'
    +   '</div>'
    + '</div></div></div>';

  /* ── Hidden render container (white bg for PDF) ────────────── */
  var renderCSS =
    '#md-render-container h1{font-size:2em;margin:.6em 0 .3em;border-bottom:2px solid #ddd;padding-bottom:6px}'
    + '#md-render-container h2{font-size:1.5em;margin:1em 0 .3em;border-bottom:1px solid #eee;padding-bottom:4px}'
    + '#md-render-container h3{font-size:1.2em;margin:.8em 0 .2em}'
    + '#md-render-container h4,#md-render-container h5,#md-render-container h6{font-size:1em;margin:.6em 0 .2em}'
    + '#md-render-container p{margin:.5em 0;word-break:break-word;overflow-wrap:break-word}'
    + '#md-render-container code{background:#f4f4f4;padding:2px 5px;border-radius:3px;font-family:"Courier New",monospace;font-size:.88em;word-break:break-all}'
    + '#md-render-container pre{background:#f4f4f4;padding:12px 16px;border-radius:4px;overflow-x:hidden;white-space:pre-wrap;word-break:break-all;font-family:"Courier New",monospace;font-size:.85em}'
    + '#md-render-container pre code{background:none;padding:0;border-radius:0;word-break:break-all}'
    + '#md-render-container blockquote{border-left:4px solid #ccc;margin:.8em 0;padding:4px 16px;color:#555}'
    + '#md-render-container table{width:100%;border-collapse:collapse;margin:1em 0;font-size:.9em;table-layout:fixed;word-break:break-word}'
    + '#md-render-container th,#md-render-container td{border:1px solid #ccc;padding:6px 10px;text-align:left}'
    + '#md-render-container th{background:#f0f0f0;font-weight:700}'
    + '#md-render-container ul,#md-render-container ol{padding-left:1.5em;margin:.5em 0}'
    + '#md-render-container li{margin:.2em 0}'
    + '#md-render-container a{color:#0066cc;word-break:break-all}'
    + '#md-render-container hr{border:none;border-top:1px solid #ddd;margin:1em 0}'
    + '#md-render-container img{max-width:100%;height:auto}'
    + '#md-render-container strong{font-weight:700}'
    + '#md-render-container em{font-style:italic}';

  var styleTag = document.createElement('style');
  styleTag.textContent = renderCSS;
  document.head.appendChild(styleTag);

  var container = document.createElement('div');
  container.id = 'md-render-container';
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;background:white;color:#111;padding:48px 56px;font-family:Georgia,serif;font-size:13px;line-height:1.7;box-sizing:border-box;';
  document.body.appendChild(container);

  /* ── Helpers ────────────────────────────────────────────────── */
  function getMarked() {
    if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') return window.marked;
    return null;
  }

  var statusTimer = null;
  function showStatus(msg, type) {
    var el = $('md-status');
    if (!el) return;
    clearTimeout(statusTimer);
    var icon = type === 'loading' ? '\u23f3' : type === 'success' ? '\u2705' : '\u274c';
    var color = type === 'loading' ? 'var(--muted,#999)' : type === 'success' ? 'var(--purple,#b083f0)' : '#f44';
    el.innerHTML = '<span style="color:' + color + '">' + icon + ' ' + msg + '</span>';
    if (type !== 'loading') {
      statusTimer = setTimeout(function () { el.innerHTML = ''; }, 4000);
    }
  }

  /* ── Char / byte counter ────────────────────────────────────── */
  $('markdown-input').addEventListener('input', function () {
    var v = $('markdown-input').value;
    var bytes = 0;
    try { bytes = new TextEncoder().encode(v).length; } catch (e) { bytes = v.length; }
    $('md-counter').textContent = v.length + ' chars \u00b7 ' + bytes + ' bytes';
  });

  /* ── Preview ────────────────────────────────────────────────── */
  $('btn-preview').addEventListener('click', function () {
    var md = $('markdown-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded.'; $('t-err').style.display = 'block'; return; }
    var html = m.parse(md, { gfm: true, breaks: true });
    var fs = $('font-size').value || '13';
    $('t-result').innerHTML = '<div style="background:#fff;color:#1a1a1a;padding:28px 24px;border-radius:6px;font-family:Georgia,serif;font-size:' + fs + 'px;line-height:1.7">' + html + '</div>';
  });

  /* ── Generate PDF (marked → html2canvas → jsPDF) ───────────── */
  $('btn-gen').addEventListener('click', async function () {
    var md = $('markdown-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }

    /* check libs */
    var m = getMarked();
    if (!m) { showStatus('marked.js not loaded.', 'error'); return; }
    if (typeof html2canvas === 'undefined') { showStatus('html2canvas not loaded.', 'error'); return; }
    var J = null;
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) J = window.jspdf.jsPDF;
    else if (typeof window.jsPDF !== 'undefined') J = window.jsPDF;
    if (!J) { showStatus('jsPDF not loaded.', 'error'); return; }

    showStatus('Rendering PDF\u2026', 'loading');

    /* 1. Parse markdown → HTML */
    var html = m.parse(md, { gfm: true, breaks: true });

    /* 2. Inject into hidden render container */
    var fontSize = parseInt($('font-size').value || '13', 10);
    container.style.fontSize = fontSize + 'px';
    container.innerHTML = html;

    /* 3. Wait a tick for browser layout */
    await new Promise(function (r) { setTimeout(r, 150); });

    try {
      /* 4. Capture with html2canvas */
      var canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794
      });

      /* 5. Build PDF — A4 in mm: 210 x 297 */
      var pdf = new J({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();

      var imgW = pageW;
      var imgH = (canvas.height * imgW) / canvas.width;

      /* Multi-page: slice the canvas image across pages */
      var yOffset = 0;
      var pageCount = 0;

      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pageCount++;

        /* source slice from canvas */
        var srcY = (yOffset / imgH) * canvas.height;
        var srcH = Math.min(
          (pageH / imgH) * canvas.height,
          canvas.height - srcY
        );

        /* create a temp canvas for this page slice */
        var sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(srcH);
        var ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        var sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        var sliceH = (srcH / canvas.height) * imgH;

        pdf.addImage(sliceData, 'JPEG', 0, 0, pageW, sliceH);

        yOffset += pageH;
      }

      /* 6. Download */
      pdf.save('cipherkit-export.pdf');
      showStatus('PDF generated (' + pageCount + ' page' + (pageCount > 1 ? 's' : '') + ')', 'success');
      CK.toast('PDF downloaded');

    } catch (err) {
      console.error('[MD-to-PDF]', err);
      showStatus('Error: ' + err.message, 'error');
    } finally {
      container.innerHTML = '';
    }
  });

  /* ── Clear ──────────────────────────────────────────────────── */
  $('btn-clr').addEventListener('click', function () {
    $('markdown-input').value = '';
    $('md-counter').textContent = '0 chars \u00b7 0 bytes';
    $('t-result').innerHTML = '<span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span>';
    $('md-status').innerHTML = '';
  });

  /* ── Keyboard shortcut ──────────────────────────────────────── */
  CK.wireCtrlEnter('btn-gen');

  /* ── Usage guide ────────────────────────────────────────────── */
  CK.setUsageContent(
    '<ol>'
    + '<li>Type or paste <strong>Markdown</strong> into the editor.</li>'
    + '<li>Choose a <strong>font size</strong> (default 13px).</li>'
    + '<li>Click <strong>Generate PDF</strong> or press <kbd>Ctrl+Enter</kbd>.</li>'
    + '</ol>'
    + '<p>The tool renders your Markdown as styled HTML, captures it as a high-resolution image, then embeds it into a multi-page A4 PDF. This means <strong>all formatting</strong> &mdash; headings, bold/italic, code blocks, tables, blockquotes, lists, links, horizontal rules &mdash; is pixel-perfect.</p>'
    + '<p>Limitation: The PDF contains rasterised text (image-based), so text is not selectable in the PDF. For selectable text, use a dedicated Markdown editor.</p>'
  );

})();
