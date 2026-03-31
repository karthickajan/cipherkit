/**
 * CipherKit — Markdown to PDF  (marked.js tokens → jsPDF direct render)
 *
 * Quality features:
 *   • Page numbers in footer with separator line
 *   • Proper heading typography with scaled sizes + h1/h2 underlines
 *   • Inline code with grey background pill
 *   • Fenced code blocks: grey background, line numbers, language label
 *   • Blockquotes with coloured left border + light background
 *   • Tables with header shading + alternating row stripes
 *   • Nested lists with depth-aware bullets (•, ◦, ▪)
 *   • Links rendered in blue with underline
 *   • Proper paragraph / element spacing
 *
 * Limitations (client-side only, no server):
 *   • 14 built-in PDF fonts only (Helvetica, Times, Courier)
 *   • No embedded images
 *   • Complex CSS layouts impossible
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

  /* ── UI ── */
  root.innerHTML =
    '<div class="tool-single-col"><div class="tool-card-ui">'
    + '<div class="tc-head"><div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">Markdown to PDF</h2></div><span class="tc-badge tc-badge-purple">Convert</span></div>'
    + '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +   '<div class="field"><div class="field-hdr"><label for="t-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div>'
    +     '<textarea id="t-input" placeholder="# Hello World\n\nType or paste **Markdown** here\u2026\n\n- Supports headings, bold, italic\n- Code blocks, tables, blockquotes\n- Links, lists, horizontal rules" rows="14" class="mono"></textarea>'
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

  /* ── helpers ── */
  function getMarked() {
    if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') return window.marked;
    return null;
  }

  /* ── PREVIEW ── */
  $('btn-preview').addEventListener('click', function () {
    var md = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded. Please refresh.'; $('t-err').style.display = 'block'; return; }
    var html = m.parse(md, { gfm: true, breaks: true });
    var css = 'background:#fff;color:#1a1a1a;padding:28px 24px;border-radius:6px;'
      + 'font-family:Georgia,\"Times New Roman\",serif;font-size:' + $('t-font').value + 'pt;line-height:1.8';
    $('t-result').innerHTML = '<div style="' + css + '">' + html + '</div>';
  });

  /* ═══════════════════════════════════════════════════════════════════════
     PDF GENERATOR — walks marked.lexer() tokens → jsPDF draw commands
     ═══════════════════════════════════════════════════════════════════ */
  $('btn-gen').addEventListener('click', function () {
    var md = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }

    var jsPDFClass;
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) jsPDFClass = window.jspdf.jsPDF;
    else if (typeof window.jsPDF !== 'undefined') jsPDFClass = window.jsPDF;
    else { $('t-err').textContent = 'jsPDF not loaded. Please refresh.'; $('t-err').style.display = 'block'; return; }

    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded. Please refresh.'; $('t-err').style.display = 'block'; return; }

    $('t-result').innerHTML = '<span style="color:var(--muted)">Generating PDF\u2026</span>';

    /* ── Config ── */
    var fontSize = parseInt($('t-font').value, 10);
    var doc = new jsPDFClass({ unit: 'pt', format: 'a4' });
    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    var ml = 56, mr = 56, mt = 60, mb = 60;
    var mw = pw - ml - mr;
    var y = mt;
    var lh = fontSize * 1.65;

    /* Colours */
    var C = {
      black:   [30, 30, 30],
      grey60:  [100, 100, 100],
      grey90:  [220, 220, 220],
      codeBg:  [245, 247, 250],
      codeBdr: [215, 220, 228],
      bqBg:    [245, 245, 250],
      bqBar:   [120, 130, 220],
      link:    [30, 80, 200],
      tblHead: [235, 238, 245],
      tblAlt:  [248, 249, 252]
    };

    /* ── Pages ── */
    var pageNum = 1;

    function addFooter() {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      var fy = ph - 30;
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(ml, fy - 12, pw - mr, fy - 12);
      doc.text(pageNum.toString(), pw / 2, fy, { align: 'center' });
    }

    function newPage() {
      addFooter();
      doc.addPage();
      pageNum++;
      y = mt;
    }

    function needPage(h) {
      if (y + h > ph - mb) newPage();
    }

    /* ── Fonts ── */
    function setF(style, size) {
      var s = size || fontSize;
      switch (style) {
        case 'b':  doc.setFont('helvetica', 'bold'); break;
        case 'i':  doc.setFont('helvetica', 'oblique'); break;
        case 'bi': doc.setFont('helvetica', 'boldoblique'); break;
        case 'c':  doc.setFont('courier', 'normal'); break;
        case 'cb': doc.setFont('courier', 'bold'); break;
        default:   doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(s);
    }

    function setC(c) { doc.setTextColor(c[0], c[1], c[2]); }

    /* ── Plain text extractor ── */
    function plain(tokens) {
      if (!tokens) return '';
      var s = '';
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.type === 'text' || t.type === 'codespan') s += t.text || t.raw || '';
        else if (t.type === 'strong' || t.type === 'em' || t.type === 'link') s += plain(t.tokens);
        else if (t.type === 'br') s += '\n';
        else s += t.text || t.raw || '';
      }
      return s;
    }

    /* ── Render inline tokens with styling ── */
    function renderInline(tokens, xStart, maxW, baseSz) {
      if (!tokens || !tokens.length) return;
      var sz = baseSz || fontSize;
      var ilh = sz * 1.65;
      var x = xStart;
      var w = maxW || mw;

      for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];
        var txt = '', style = 'n', color = C.black, isLink = false, isCode = false;

        switch (tk.type) {
          case 'text':   txt = tk.text || ''; break;
          case 'escape': txt = tk.text || ''; break;
          case 'strong':
            if (tk.tokens && tk.tokens.length === 1 && tk.tokens[0].type === 'em') {
              txt = plain(tk.tokens[0].tokens); style = 'bi';
            } else { txt = plain(tk.tokens); style = 'b'; }
            break;
          case 'em':
            if (tk.tokens && tk.tokens.length === 1 && tk.tokens[0].type === 'strong') {
              txt = plain(tk.tokens[0].tokens); style = 'bi';
            } else { txt = plain(tk.tokens); style = 'i'; }
            break;
          case 'codespan':
            txt = tk.text || ''; style = 'c'; isCode = true; break;
          case 'link':
            txt = plain(tk.tokens); isLink = true; color = C.link; break;
          case 'br':
            x = xStart; y += ilh; needPage(ilh); continue;
          default:
            txt = tk.text || tk.raw || '';
        }

        if (!txt) continue;

        var csz = isCode ? sz * 0.88 : sz;
        setF(style, csz);
        setC(color);

        var words = txt.split(/( +)/);
        for (var wi = 0; wi < words.length; wi++) {
          var word = words[wi];
          if (!word) continue;
          var ww = doc.getTextWidth(word);

          if (x + ww > xStart + w && x > xStart) {
            x = xStart; y += ilh; needPage(ilh);
          }
          needPage(ilh);

          // Code background pill
          if (isCode && word.trim()) {
            var p = 2.5;
            doc.setFillColor(C.codeBg[0], C.codeBg[1], C.codeBg[2]);
            doc.setDrawColor(C.codeBdr[0], C.codeBdr[1], C.codeBdr[2]);
            doc.roundedRect(x - p, y - csz + 1, ww + p * 2, csz + 4, 2, 2, 'FD');
            setC(C.black);
          }

          doc.text(word, x, y);

          // Link underline
          if (isLink && word.trim()) {
            doc.setDrawColor(C.link[0], C.link[1], C.link[2]);
            doc.setLineWidth(0.5);
            doc.line(x, y + 2, x + ww, y + 2);
          }

          x += ww;
        }

        setF('n', sz); setC(C.black);
      }
      y += ilh;
    }

    /* ── Render a list ── */
    function renderList(items, ordered, depth) {
      var indent = ml + depth * 20;
      var bullets = ['\u2022', '\u25E6', '\u25AA'];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var bullet = ordered ? (i + 1) + '.' : bullets[Math.min(depth, 2)];

        needPage(lh);
        setF('n'); setC(C.grey60);
        doc.text(bullet, indent, y);
        setC(C.black);
        var bw = doc.getTextWidth(bullet + ' ');

        var inlineTk = [], subLists = [];
        if (item.tokens) {
          for (var j = 0; j < item.tokens.length; j++) {
            var sub = item.tokens[j];
            if ((sub.type === 'text' || sub.type === 'paragraph') && sub.tokens)
              inlineTk = inlineTk.concat(sub.tokens);
            else if (sub.type === 'list') subLists.push(sub);
          }
        }

        if (inlineTk.length) {
          var sy = y;
          y = sy - lh;
          renderInline(inlineTk, indent + bw, mw - (indent - ml) - bw);
        } else {
          var raw = plain(item.tokens);
          if (raw) {
            setF('n');
            var wl = doc.splitTextToSize(raw, mw - (indent - ml) - bw);
            for (var k = 0; k < wl.length; k++) {
              needPage(lh);
              doc.text(wl[k], indent + bw, y);
              if (k < wl.length - 1) y += lh;
            }
          }
          y += lh;
        }

        for (var n = 0; n < subLists.length; n++)
          renderList(subLists[n].items, subLists[n].ordered, depth + 1);
      }
    }

    /* ── Walk tokens ── */
    var tokens;
    try { tokens = m.lexer(md); }
    catch (e) {
      $('t-err').textContent = 'Parse error: ' + e.message;
      $('t-err').style.display = 'block'; return;
    }

    setC(C.black);

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      /* ── Heading ── */
      if (token.type === 'heading') {
        var hSz  = [0, fontSize + 14, fontSize + 10, fontSize + 6, fontSize + 3, fontSize + 1, fontSize];
        var hClr = [null, C.black, C.black, [40,40,40], [50,50,50], C.grey60, C.grey60];
        var hs = hSz[token.depth] || fontSize;
        var hlh = hs * 1.6;

        y += token.depth <= 2 ? fontSize * 1.2 : fontSize * 0.7;
        needPage(hlh + 10);

        setF('b', hs);
        setC(hClr[token.depth] || C.black);

        var hText = plain(token.tokens);
        var hLines = doc.splitTextToSize(hText, mw);
        for (var hi = 0; hi < hLines.length; hi++) {
          needPage(hlh); doc.text(hLines[hi], ml, y); y += hlh;
        }

        if (token.depth <= 2) {
          doc.setDrawColor(C.grey90[0], C.grey90[1], C.grey90[2]);
          doc.setLineWidth(token.depth === 1 ? 2 : 0.75);
          doc.line(ml, y - hlh * 0.3, pw - mr, y - hlh * 0.3);
          y += token.depth === 1 ? 4 : 2;
        }

        y += fontSize * 0.3;
        setF('n'); setC(C.black);
        continue;
      }

      /* ── Paragraph ── */
      if (token.type === 'paragraph') {
        needPage(lh);
        renderInline(token.tokens, ml, mw);
        y += fontSize * 0.35;
        continue;
      }

      /* ── Code block ── */
      if (token.type === 'code') {
        var codeText = token.text || '';
        var codeLines = codeText.split('\n');
        var cSz = fontSize * 0.82;
        var cLH = cSz * 1.55;
        var padV = 12, padH = 14;
        var lnW = codeLines.length >= 100 ? 32 : codeLines.length >= 10 ? 24 : 18;
        var blockH = codeLines.length * cLH + padV * 2;

        y += 4;
        needPage(Math.min(blockH, ph - mt - mb));
        var bTop = y - padV + 2;

        // Background
        doc.setFillColor(C.codeBg[0], C.codeBg[1], C.codeBg[2]);
        doc.setDrawColor(C.codeBdr[0], C.codeBdr[1], C.codeBdr[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(ml, bTop, mw, blockH, 4, 4, 'FD');

        // Language label
        if (token.lang) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(cSz * 0.85);
          doc.setTextColor(150, 155, 165);
          doc.text(token.lang.toUpperCase(), pw - mr - padH, bTop + cSz * 0.85 + 4, { align: 'right' });
        }

        y += 2;
        setF('c', cSz);

        for (var ci = 0; ci < codeLines.length; ci++) {
          needPage(cLH);
          // Line number
          doc.setTextColor(170, 175, 185);
          doc.text((ci + 1).toString(), ml + padH + lnW - 2, y, { align: 'right' });
          // Code text
          doc.setTextColor(50, 55, 65);
          var cl = doc.splitTextToSize(codeLines[ci] || ' ', mw - padH * 2 - lnW - 8);
          for (var cli = 0; cli < cl.length; cli++) {
            doc.text(cl[cli], ml + padH + lnW + 6, y);
            if (cli < cl.length - 1) { y += cLH; needPage(cLH); }
          }
          y += cLH;
        }

        y += padV + 4;
        setF('n'); setC(C.black);
        continue;
      }

      /* ── Blockquote ── */
      if (token.type === 'blockquote') {
        var bqText = plain(token.tokens);
        setF('i');
        var bqLines = doc.splitTextToSize(bqText, mw - 28);
        var bqH = bqLines.length * lh + 12;

        y += 4;
        needPage(bqH);

        doc.setFillColor(C.bqBg[0], C.bqBg[1], C.bqBg[2]);
        doc.roundedRect(ml, y - lh + 4, mw, bqH, 3, 3, 'F');
        doc.setFillColor(C.bqBar[0], C.bqBar[1], C.bqBar[2]);
        doc.rect(ml, y - lh + 4, 3.5, bqH, 'F');

        setF('i'); setC(C.grey60);
        for (var bi = 0; bi < bqLines.length; bi++) {
          needPage(lh); doc.text(bqLines[bi], ml + 16, y); y += lh;
        }
        y += 8; setC(C.black); setF('n');
        continue;
      }

      /* ── List ── */
      if (token.type === 'list') {
        y += 2;
        renderList(token.items, token.ordered, 0);
        y += fontSize * 0.3;
        continue;
      }

      /* ── HR ── */
      if (token.type === 'hr') {
        y += fontSize * 0.8; needPage(4);
        doc.setDrawColor(C.grey90[0], C.grey90[1], C.grey90[2]);
        doc.setLineWidth(1);
        doc.line(ml + mw * 0.1, y, pw - mr - mw * 0.1, y);
        y += fontSize * 0.8;
        continue;
      }

      /* ── Table ── */
      if (token.type === 'table') {
        var cols = token.header.length;
        var colW = mw / cols;
        var tSz = fontSize * 0.88;
        var tLH = tSz * 1.5;
        var cp = 6;

        y += 6;

        // Header
        needPage(tLH + cp * 2);
        doc.setFillColor(C.tblHead[0], C.tblHead[1], C.tblHead[2]);
        doc.rect(ml, y - tLH + 2, mw, tLH + cp, 'F');
        doc.setDrawColor(C.grey90[0], C.grey90[1], C.grey90[2]);
        doc.setLineWidth(0.5);
        doc.line(ml, y + cp + 2, pw - mr, y + cp + 2);

        setF('b', tSz); setC(C.black);
        for (var hi2 = 0; hi2 < cols; hi2++) {
          doc.text(plain(token.header[hi2].tokens), ml + hi2 * colW + cp, y, { maxWidth: colW - cp * 2 });
        }
        y += tLH + cp;

        // Rows
        setF('n', tSz);
        for (var ri = 0; ri < token.rows.length; ri++) {
          needPage(tLH + cp);
          if (ri % 2 === 1) {
            doc.setFillColor(C.tblAlt[0], C.tblAlt[1], C.tblAlt[2]);
            doc.rect(ml, y - tLH + 2, mw, tLH + cp - 2, 'F');
          }
          setC(C.black);
          for (var ci2 = 0; ci2 < cols; ci2++) {
            doc.text(plain(token.rows[ri][ci2].tokens), ml + ci2 * colW + cp, y, { maxWidth: colW - cp * 2 });
          }
          y += tLH + 2;
          doc.setDrawColor(240, 240, 242);
          doc.setLineWidth(0.3);
          doc.line(ml, y - tLH + 2, pw - mr, y - tLH + 2);
        }
        doc.setDrawColor(C.grey90[0], C.grey90[1], C.grey90[2]);
        doc.setLineWidth(0.5);
        doc.line(ml, y - tLH + 2, pw - mr, y - tLH + 2);
        y += 8;
        continue;
      }

      /* ── Space ── */
      if (token.type === 'space') { y += fontSize * 0.5; continue; }
    }

    addFooter();
    doc.save('cipherkit-export.pdf');
    $('t-result').innerHTML = '<span style="color:var(--purple)">\u2713 PDF generated and downloaded (' + pageNum + ' page' + (pageNum > 1 ? 's' : '') + ')</span>';
    CK.toast('PDF downloaded');
  });

  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    $('t-result').innerHTML = '<span style="color:var(--muted);font-style:italic">Click Generate PDF or Preview to see output\u2026</span>';
  });

  CK.wireCtrlEnter('btn-gen');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent(
    '<ol><li>Type or paste <strong>Markdown</strong> text.</li>'
    + '<li>Choose a <strong>font size</strong> (10\u201314pt).</li>'
    + '<li>Click <strong>Preview</strong> to see rendered HTML output.</li>'
    + '<li>Click <strong>Generate PDF</strong> or press <kbd>Ctrl+Enter</kbd>.</li></ol>'
    + '<p><strong>Supported formatting:</strong> headings with underlines, <strong>bold</strong>, <em>italic</em>, '
    + '<code>inline code</code> (with background), fenced code blocks (with line numbers &amp; language label), '
    + 'blockquotes (with left border), tables (with alternating row shading), links (blue + underline), '
    + 'ordered &amp; unordered lists (with nesting), and horizontal rules.</p>'
    + '<p><strong>Limitations:</strong> jsPDF can only use built-in PDF fonts (Helvetica, Times, Courier). '
    + 'Custom fonts, images, and complex CSS layouts require a server-side renderer (Puppeteer/wkhtmltopdf). '
    + 'This tool generates clean, well-formatted PDFs entirely in your browser.</p>'
  );
})();
