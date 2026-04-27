(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    + '<div class="field"><div class="field-hdr"><label for="markdown-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div>'
    + '<textarea id="markdown-input" placeholder="# Hello World\n\nType or paste **Markdown** here\u2026" rows="14" class="mono"></textarea>'
    + '<div class="input-meta"><span id="md-counter" style="font-size:0.75rem;color:var(--muted,#666);float:right">0 chars \u00b7 0 bytes</span></div>'
    + '<div class="shortcut-hint">\u2318/Ctrl + Enter to generate</div>'
    + '<div class="inline-error" id="t-err" role="alert"></div>'
    + '</div>'
    + '<div class="ctrl-row">'
    + '<div class="sel-group"><label for="font-size">Font Size</label><select id="font-size"><option value="11">11px</option><option value="12">12px</option><option value="13" selected>13px</option><option value="14">14px</option><option value="16">16px</option></select></div>'
    + '</div>'
    + '<button type="button" class="act-btn act-purple" id="btn-gen">' + IC.dl + ' <span>Generate PDF</span></button>'
    + '<div id="md-status" style="margin-top:10px;min-height:24px" role="status"></div>'
    + '<div class="out-box">'
    + '<div class="out-head"><div class="out-label">' + IC.play + ' <span>Preview</span></div><div class="out-btns"><button type="button" class="pill-btn" id="btn-preview">' + IC.eye + ' <span>Preview</span></button></div></div>'
    + '<div id="t-result" role="status" style="max-height:400px;overflow-y:auto;resize:vertical;padding:0;background:#f8f8f8;border-radius:0 0 6px 6px;min-height:52px"><div id="t-result-inner" style="padding:13px 14px;color:var(--muted);font-style:italic;font-size:12px;font-family:var(--mono)">Click Generate PDF or Preview to see output\u2026</div></div>'
    + '</div>'
    + '</div></div></div>';
  /* ── Inject print-safe CSS isolation ──────────────────────────
     These rules use !important to win against tool.css which sets
     color:var(--text) on .out-body and cascades into all children.
     We scope everything to #md-print-scope so zero risk of leaking. */
  var styleTag = document.createElement('style');
  styleTag.textContent = [
    '#md-render-container{all:initial;display:block;position:absolute;left:-9999px;top:0;width:794px;background:#ffffff!important;color:#111111!important;padding:48px 56px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:13px;line-height:1.7;box-sizing:border-box;overflow:hidden}',
    '#md-render-container *{max-width:100%!important;box-sizing:border-box!important}',
    '#md-render-container h1{font-size:2em!important;color:#000!important;margin:.6em 0 .3em!important;border-bottom:2px solid #ddd!important;padding-bottom:6px!important;font-weight:700!important}',
    '#md-render-container h2{font-size:1.5em!important;color:#111!important;margin:1em 0 .3em!important;border-bottom:1px solid #eee!important;padding-bottom:4px!important;font-weight:700!important}',
    '#md-render-container h3{font-size:1.2em!important;color:#222!important;margin:.8em 0 .2em!important;font-weight:700!important}',
    '#md-render-container h4,#md-render-container h5,#md-render-container h6{font-size:1em!important;color:#333!important;margin:.6em 0 .2em!important;font-weight:700!important}',
    '#md-render-container p{color:#111!important;margin:.5em 0!important;word-break:break-word!important;overflow-wrap:break-word!important}',
    '#md-render-container li{color:#111!important;margin:.2em 0!important}',
    '#md-render-container strong{color:#000!important;font-weight:700!important}',
    '#md-render-container em{color:#222!important;font-style:italic!important}',
    '#md-render-container a{color:#0066cc!important;word-break:break-all!important}',
    '#md-render-container blockquote{border-left:4px solid #ccc!important;margin:.8em 0!important;padding:4px 12px!important;color:#444!important;background:#f9f9f9!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:hidden!important;word-break:break-word!important;overflow-wrap:break-word!important;display:block!important}',
    '#md-render-container code{background:#f0f0f0!important;color:#c7254e!important;padding:2px 5px!important;border-radius:3px!important;font-family:"Courier New",monospace!important;font-size:.88em!important;word-break:break-all!important;overflow-wrap:break-word!important;white-space:pre-wrap!important}',
    '#md-render-container pre{background:#f5f5f5!important;border:1px solid #e0e0e0!important;padding:12px 16px!important;border-radius:4px!important;overflow-x:hidden!important;white-space:pre-wrap!important;word-break:break-all!important;max-width:100%!important}',
    '#md-render-container pre code{background:transparent!important;color:#333!important;padding:0!important;border-radius:0!important;white-space:pre-wrap!important;word-break:break-all!important}',
    '#md-render-container table{width:100%!important;border-collapse:collapse!important;margin:1em 0!important;font-size:.88em!important;table-layout:fixed!important;word-break:break-word!important;max-width:100%!important}',
    '#md-render-container th{background:#f0f0f0!important;color:#000!important;border:1px solid #ccc!important;padding:6px 10px!important;text-align:left!important;font-weight:700!important;word-break:break-word!important}',
    '#md-render-container td{background:#fff!important;color:#111!important;border:1px solid #ccc!important;padding:6px 10px!important;text-align:left!important;word-break:break-word!important;overflow-wrap:break-word!important}',
    '#md-render-container tr:nth-child(even) td{background:#fafafa!important}',
    '#md-render-container ul,#md-render-container ol{padding-left:1.5em!important;margin:.5em 0!important;color:#111!important}',
    '#md-render-container hr{border:none!important;border-top:1px solid #ddd!important;margin:1em 0!important}',
    '#md-render-container img{max-width:100%!important;height:auto!important}',
    '#md-preview-content{all:initial;display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-size:13px;line-height:1.7;color:#111111!important;background:#ffffff!important;padding:20px 24px;box-sizing:border-box;width:100%;word-break:break-word;overflow-wrap:break-word}',
    '#md-preview-content *{box-sizing:border-box!important;font-family:inherit}',
    '#md-preview-content h1{font-size:2em!important;color:#000!important;margin:.6em 0 .3em!important;border-bottom:2px solid #ddd!important;padding-bottom:6px!important;font-weight:700!important;line-height:1.3!important}',
    '#md-preview-content h2{font-size:1.5em!important;color:#1a1a1a!important;margin:1em 0 .3em!important;border-bottom:1px solid #eee!important;padding-bottom:4px!important;font-weight:700!important}',
    '#md-preview-content h3{font-size:1.2em!important;color:#222!important;margin:.8em 0 .2em!important;font-weight:700!important}',
    '#md-preview-content h4,#md-preview-content h5,#md-preview-content h6{font-size:1em!important;color:#333!important;margin:.6em 0 .2em!important;font-weight:700!important}',
    '#md-preview-content p{color:#111!important;margin:.5em 0!important;word-break:break-word!important;overflow-wrap:break-word!important}',
    '#md-preview-content li{color:#111!important;margin:.2em 0!important}',
    '#md-preview-content strong{color:#000!important;font-weight:700!important}',
    '#md-preview-content em{color:#222!important;font-style:italic!important}',
    '#md-preview-content a{color:#0066cc!important;word-break:break-all!important}',
    '#md-preview-content blockquote{border-left:4px solid #ccc!important;margin:.8em 0!important;padding:4px 12px!important;color:#444!important;background:#f9f9f9!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:hidden!important;word-break:break-word!important;overflow-wrap:break-word!important;display:block!important}',
    '#md-preview-content code{background:#f0f0f0!important;color:#c7254e!important;padding:2px 5px!important;border-radius:3px!important;font-family:"Courier New",monospace!important;font-size:.88em!important;word-break:break-all!important;overflow-wrap:break-word!important;white-space:pre-wrap!important}',
    '#md-preview-content pre{background:#f5f5f5!important;border:1px solid #e0e0e0!important;padding:12px 16px!important;border-radius:4px!important;overflow-x:hidden!important;white-space:pre-wrap!important;word-break:break-all!important;max-width:100%!important;margin:.5em 0!important}',
    '#md-preview-content pre code{background:transparent!important;color:#333!important;padding:0!important;border-radius:0!important;white-space:pre-wrap!important;word-break:break-all!important}',
    '#md-preview-content table{width:100%!important;border-collapse:collapse!important;margin:1em 0!important;font-size:.88em!important;table-layout:fixed!important;word-break:break-word!important;max-width:100%!important}',
    '#md-preview-content th{background:#f0f0f0!important;color:#000!important;border:1px solid #ccc!important;padding:6px 10px!important;text-align:left!important;font-weight:700!important}',
    '#md-preview-content td{background:#fff!important;color:#111!important;border:1px solid #ccc!important;padding:6px 10px!important;text-align:left!important;word-break:break-word!important}',
    '#md-preview-content tr:nth-child(even) td{background:#fafafa!important}',
    '#md-preview-content ul,#md-preview-content ol{padding-left:1.5em!important;margin:.5em 0!important;color:#111!important}',
    '#md-preview-content hr{border:none!important;border-top:1px solid #ddd!important;margin:1em 0!important}',
    '#md-preview-content img{max-width:100%!important;height:auto!important}'
  ].join('\n');
  document.head.appendChild(styleTag);
  var container = document.createElement('div');
  container.id = 'md-render-container';
  /* Use system sans-serif — Georgia (serif) causes uneven number/data
     alignment in table cells due to proportional character widths */
  document.body.appendChild(container);
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
  $('markdown-input').addEventListener('input', function () {
    var v = $('markdown-input').value;
    var bytes = 0;
    try { bytes = new TextEncoder().encode(v).length; } catch (e) { bytes = v.length; }
    $('md-counter').textContent = v.length + ' chars \u00b7 ' + bytes + ' bytes';
  });
  function renderPreview(html, fontSize) {
    var result = $('t-result');
    result.innerHTML = '<div id="md-preview-content" style="font-size:' + (fontSize || 13) + 'px">' + html + '</div>';
  }
  $('btn-preview').addEventListener('click', function () {
    var md = $('markdown-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded.'; $('t-err').style.display = 'block'; return; }
    var html = m.parse(md, { gfm: true, breaks: true });
    var fs = parseInt($('font-size').value || '13', 10);
    renderPreview(html, fs);
  });
  function findSafeBreakPoint(canvas, startPixel, maxPixel) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var consecutiveWhite = 0;
    var requiredGap = 8;
    var lastWhiteStart = -1;
    for (var y = maxPixel; y > maxPixel - 120 && y > startPixel + 20; y--) {
      var data = ctx.getImageData(0, y, width, 1).data;
      var isWhite = true;
      for (var x = 0; x < width * 4; x += 32) {
        if (data[x] < 240 || data[x+1] < 240 || data[x+2] < 240) {
          isWhite = false;
          break;
        }
      }
      if (isWhite) {
        consecutiveWhite++;
        if (consecutiveWhite === 1) lastWhiteStart = y;
      } else {
        if (consecutiveWhite >= requiredGap) {
          return lastWhiteStart + consecutiveWhite;
        }
        consecutiveWhite = 0;
        lastWhiteStart = -1;
      }
    }
    return maxPixel;
  }
  $('btn-gen').addEventListener('click', async function () {
    var md = $('markdown-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { showStatus('marked.js not loaded.', 'error'); return; }
    if (typeof html2canvas === 'undefined') { showStatus('html2canvas not loaded.', 'error'); return; }
    var J = null;
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) J = window.jspdf.jsPDF;
    else if (typeof window.jsPDF !== 'undefined') J = window.jsPDF;
    if (!J) { showStatus('jsPDF not loaded.', 'error'); return; }
    showStatus('Rendering PDF\u2026', 'loading');
    var html = m.parse(md, { gfm: true, breaks: true });
    var fontSize = parseInt($('font-size').value || '13', 10);
    container.style.fontSize = fontSize + 'px';
    container.innerHTML = html;
    renderPreview(html, fontSize);
    await new Promise(function (r) { setTimeout(r, 150); });
    try {
      var canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 900
      });
      var pdf = new J({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var imgW = pageW;
      var totalImgH = (canvas.height * imgW) / canvas.width;
      var pageCanvasH = Math.round((pageH / totalImgH) * canvas.height);
      var startPixel = 0;
      var pageCount = 0;
      var firstPage = true;
      while (startPixel < canvas.height) {
        if (!firstPage) pdf.addPage();
        firstPage = false;
        pageCount++;
        var rawEnd = startPixel + pageCanvasH;
        var safeEnd = rawEnd >= canvas.height
          ? canvas.height
          : findSafeBreakPoint(canvas, startPixel, rawEnd);
        var sliceH = safeEnd - startPixel;
        var sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceH);
        sliceCanvas.getContext('2d').drawImage(
          canvas, 0, startPixel, canvas.width, sliceH,
          0, 0, canvas.width, sliceH
        );
        var sliceMmH = (sliceH / canvas.height) * totalImgH;
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.82), 'JPEG', 0, 0, pageW, sliceMmH);
        startPixel = safeEnd;
      }
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
  $('btn-clr').addEventListener('click', function () {
    $('markdown-input').value = '';
    $('md-counter').textContent = '0 chars \u00b7 0 bytes';
    $('t-result').innerHTML = '<div id="t-result-inner" style="padding:13px 14px;color:var(--muted);font-style:italic;font-size:12px;font-family:var(--mono)">Click Generate PDF or Preview to see output\u2026</div>';
    $('md-status').innerHTML = '';
  });
  CK.wireCtrlEnter('btn-gen');
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