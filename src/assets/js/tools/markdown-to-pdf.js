/**
 * CipherKit — Markdown to PDF  (marked.js tokens → jsPDF direct render)
 *
 * Pipeline:  markdown → marked.lexer() tokens → walk tokens → jsPDF text/line/rect
 *
 * Supported: headings 1-6, bold, italic, bold-italic, inline code, fenced
 * code blocks, blockquotes, unordered & ordered lists (nested), horizontal
 * rules, links (rendered as text + URL), tables, paragraph text wrapping,
 * and page breaks.
 *
 * Why not jsPDF.html()? — html2canvas cannot capture off-screen elements
 * reliably, producing blank pages. Token-based rendering is deterministic,
 * produces small PDFs (~50-200 KB), and works 100% offline.
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

  /* ── PREVIEW (renders HTML via marked.parse for visual check) ── */
  $('btn-preview').addEventListener('click', function () {
    var md = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!md) { $('t-err').textContent = 'Enter some Markdown text.'; $('t-err').style.display = 'block'; return; }
    var m = getMarked();
    if (!m) { $('t-err').textContent = 'marked.js not loaded. Please refresh.'; $('t-err').style.display = 'block'; return; }
    var html = m.parse(md, { gfm: true, breaks: true });
    $('t-result').innerHTML = '<div style="background:#fff;color:#1a1a1a;padding:24px;border-radius:6px;font-family:Helvetica,Arial,sans-serif;font-size:' + $('t-font').value + 'pt;line-height:1.7">' + html + '</div>';
  });

  /* ═══════════════════════════════════════════════════════════════════════
     PDF GENERATOR  — walks marked.lexer() tokens and draws with jsPDF
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

    var fontSize = parseInt($('t-font').value, 10);
    var doc = new jsPDFClass({ unit: 'pt', format: 'a4' });
    var pw = doc.internal.pageSize.getWidth();    // ~595
    var ph = doc.internal.pageSize.getHeight();   // ~842
    var mx = 50, my = 50;                         // margins
    var mw = pw - mx * 2;                         // max text width
    var y = my;
    var lineH = fontSize * 1.55;

    /* ── Page check ── */
    function needPage(h) {
      if (y + h > ph - my) { doc.addPage(); y = my; }
    }

    /* ── Font helper ── */
    function setFont(style, size) {
      var s = size || fontSize;
      if (style === 'bold')       doc.setFont('helvetica', 'bold');
      else if (style === 'italic') doc.setFont('helvetica', 'oblique');
      else if (style === 'bolditalic') doc.setFont('helvetica', 'boldoblique');
      else if (style === 'code')  doc.setFont('courier', 'normal');
      else                        doc.setFont('helvetica', 'normal');
      doc.setFontSize(s);
    }

    /* ── Extract plain text from inline tokens ── */
    function plainText(tokens) {
      if (!tokens) return '';
      var s = '';
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.type === 'text' || t.type === 'codespan') s += t.text || t.raw || '';
        else if (t.type === 'strong' || t.type === 'em') s += plainText(t.tokens);
        else if (t.type === 'link') s += plainText(t.tokens);
        else if (t.type === 'br') s += '\n';
        else s += t.text || t.raw || '';
      }
      return s;
    }

    /* ── Render inline tokens with bold/italic/code styling ── */
    function renderInline(tokens, xStart, maxWidth, baseSize) {
      if (!tokens || !tokens.length) return;
      var sz = baseSize || fontSize;
      var lh = sz * 1.55;
      var x = xStart;
      var wrapW = maxWidth || mw;

      for (var i = 0; i < tokens.length; i++) {
        var tk = tokens[i];
        var txt = '';
        var style = 'normal';

        if (tk.type === 'text') {
          txt = tk.text || '';
        } else if (tk.type === 'strong') {
          txt = plainText(tk.tokens);
          style = 'bold';
        } else if (tk.type === 'em') {
          txt = plainText(tk.tokens);
          style = 'italic';
        } else if (tk.type === 'codespan') {
          txt = tk.text || '';
          style = 'code';
        } else if (tk.type === 'link') {
          txt = plainText(tk.tokens) + ' (' + tk.href + ')';
          style = 'normal';
        } else if (tk.type === 'br') {
          x = xStart;
          y += lh;
          needPage(lh);
          continue;
        } else if (tk.type === 'escape') {
          txt = tk.text || '';
        } else {
          txt = tk.text || tk.raw || '';
        }

        if (!txt) continue;

        setFont(style, style === 'code' ? sz * 0.9 : sz);
        // Word-wrap this text segment
        var words = txt.split(/( +)/);
        for (var w = 0; w < words.length; w++) {
          var word = words[w];
          if (!word) continue;
          var ww = doc.getTextWidth(word);
          if (x + ww > xStart + wrapW && x > xStart) {
            x = xStart;
            y += lh;
            needPage(lh);
          }
          needPage(lh);
          doc.text(word, x, y);
          x += ww;
        }
        setFont('normal', sz);
      }

      y += lh;
    }

    /* ── Render a list (recursive for nesting) ── */
    function renderList(items, ordered, depth) {
      var indent = mx + depth * 18;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var bullet = ordered ? (i + 1) + '. ' : '\u2022 ';
        needPage(lineH);
        setFont('normal');
        doc.text(bullet, indent, y);
        var bw = doc.getTextWidth(bullet);
        // Get inline text from item tokens
        var inlineTokens = [];
        var subLists = [];
        if (item.tokens) {
          for (var j = 0; j < item.tokens.length; j++) {
            var sub = item.tokens[j];
            if (sub.type === 'text' && sub.tokens) {
              inlineTokens = inlineTokens.concat(sub.tokens);
            } else if (sub.type === 'paragraph' && sub.tokens) {
              inlineTokens = inlineTokens.concat(sub.tokens);
            } else if (sub.type === 'list') {
              subLists.push(sub);
            }
          }
        }
        if (inlineTokens.length) {
          var startY = y;
          y = startY - lineH; // renderInline adds lineH at end
          renderInline(inlineTokens, indent + bw, mw - (indent - mx) - bw);
        } else {
          var raw = plainText(item.tokens);
          if (raw) {
            var wl = doc.splitTextToSize(raw, mw - (indent - mx) - bw);
            for (var k = 0; k < wl.length; k++) {
              needPage(lineH);
              doc.text(wl[k], indent + bw, y);
              if (k < wl.length - 1) y += lineH;
            }
          }
          y += lineH;
        }
        // Render nested lists
        for (var n = 0; n < subLists.length; n++) {
          renderList(subLists[n].items, subLists[n].ordered, depth + 1);
        }
      }
    }

    /* ── Walk top-level tokens ── */
    var tokens;
    try {
      tokens = m.lexer(md);
    } catch (e) {
      $('t-err').textContent = 'Markdown parse error: ' + e.message;
      $('t-err').style.display = 'block';
      return;
    }

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      /* ── Heading ── */
      if (token.type === 'heading') {
        var hSizes = [0, fontSize + 12, fontSize + 8, fontSize + 5, fontSize + 3, fontSize + 1, fontSize];
        var hs = hSizes[token.depth] || fontSize;
        var hlh = hs * 1.6;
        needPage(hlh + 6);
        y += 4;
        setFont('bold', hs);
        var hText = plainText(token.tokens);
        var hLines = doc.splitTextToSize(hText, mw);
        for (var hi = 0; hi < hLines.length; hi++) {
          needPage(hlh);
          doc.text(hLines[hi], mx, y);
          y += hlh;
        }
        // Underline for h1 and h2
        if (token.depth <= 2) {
          doc.setDrawColor(200);
          doc.setLineWidth(token.depth === 1 ? 1.5 : 0.5);
          doc.line(mx, y - hlh + 4, pw - mx, y - hlh + 4);
        }
        y += 2;
        setFont('normal');
        continue;
      }

      /* ── Paragraph ── */
      if (token.type === 'paragraph') {
        needPage(lineH);
        renderInline(token.tokens, mx, mw);
        y += 2;
        continue;
      }

      /* ── Code block ── */
      if (token.type === 'code') {
        var codeLines = (token.text || '').split('\n');
        var codeLH = (fontSize * 0.85) * 1.5;
        var blockH = codeLines.length * codeLH + 14;
        needPage(Math.min(blockH, ph - my * 2));
        // Background rect
        doc.setFillColor(246, 248, 250);
        doc.setDrawColor(220);
        doc.roundedRect(mx, y - 2, mw, blockH, 3, 3, 'FD');
        y += 8;
        setFont('code', fontSize * 0.85);
        for (var ci = 0; ci < codeLines.length; ci++) {
          needPage(codeLH);
          var cl = doc.splitTextToSize(codeLines[ci] || ' ', mw - 16);
          for (var cli = 0; cli < cl.length; cli++) {
            doc.text(cl[cli], mx + 8, y);
            y += codeLH;
          }
        }
        y += 6;
        setFont('normal');
        continue;
      }

      /* ── Blockquote ── */
      if (token.type === 'blockquote') {
        var bqText = plainText(token.tokens);
        var bqLines = doc.splitTextToSize(bqText, mw - 24);
        var bqH = bqLines.length * lineH + 4;
        needPage(bqH);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(mx, y - 4, mw, bqH + 4, 2, 2, 'F');
        doc.setFillColor(180, 180, 180);
        doc.rect(mx, y - 4, 3, bqH + 4, 'F');
        setFont('italic');
        doc.setTextColor(100);
        for (var bi = 0; bi < bqLines.length; bi++) {
          needPage(lineH);
          doc.text(bqLines[bi], mx + 14, y);
          y += lineH;
        }
        y += 4;
        doc.setTextColor(0);
        setFont('normal');
        continue;
      }

      /* ── List ── */
      if (token.type === 'list') {
        renderList(token.items, token.ordered, 0);
        y += 4;
        continue;
      }

      /* ── Horizontal rule ── */
      if (token.type === 'hr') {
        y += 6;
        needPage(4);
        doc.setDrawColor(200);
        doc.setLineWidth(1);
        doc.line(mx, y, pw - mx, y);
        y += 10;
        continue;
      }

      /* ── Table ── */
      if (token.type === 'table') {
        var cols = token.header.length;
        var colW = mw / cols;
        var tLH = fontSize * 1.3;
        // Header
        needPage(tLH + 8);
        doc.setFillColor(240, 242, 245);
        doc.rect(mx, y - tLH + 2, mw, tLH + 4, 'F');
        setFont('bold', fontSize * 0.9);
        for (var hi2 = 0; hi2 < cols; hi2++) {
          var ht = plainText(token.header[hi2].tokens);
          doc.text(ht, mx + hi2 * colW + 4, y, { maxWidth: colW - 8 });
        }
        y += tLH + 4;
        doc.setDrawColor(200);
        doc.line(mx, y - tLH, pw - mx, y - tLH);
        // Rows
        setFont('normal', fontSize * 0.9);
        for (var ri = 0; ri < token.rows.length; ri++) {
          needPage(tLH + 4);
          for (var ci2 = 0; ci2 < cols; ci2++) {
            var ct = plainText(token.rows[ri][ci2].tokens);
            doc.text(ct, mx + ci2 * colW + 4, y, { maxWidth: colW - 8 });
          }
          y += tLH + 2;
          doc.setDrawColor(230);
          doc.line(mx, y - tLH, pw - mx, y - tLH);
        }
        y += 6;
        continue;
      }

      /* ── Space ── */
      if (token.type === 'space') {
        y += fontSize * 0.5;
        continue;
      }
    }

    doc.save('cipherkit-export.pdf');
    $('t-result').innerHTML = '<span style="color:var(--green)">\u2713 PDF generated and downloaded as <code>cipherkit-export.pdf</code></span>';
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
    + '<li>Choose a <strong>font size</strong>.</li>'
    + '<li>Click <strong>Preview</strong> to see rendered HTML output.</li>'
    + '<li>Click <strong>Generate PDF</strong> or press <kbd>Ctrl+Enter</kbd>.</li></ol>'
    + '<p>Uses <strong>marked.js</strong> for full GitHub-Flavored Markdown parsing: '
    + 'headings (with underlines for h1/h2), <strong>bold</strong>, <em>italic</em>, '
    + '<code>inline code</code>, fenced code blocks (with grey background), '
    + 'blockquotes (with left border), tables, links, ordered &amp; unordered lists '
    + '(nested), horizontal rules, and paragraph wrapping.</p>'
    + '<p>PDF is rendered directly via jsPDF text commands \u2014 no server, no html2canvas, '
    + 'small file sizes (~50\u2013200 KB). All processing happens in your browser.</p>'
  );
})();
