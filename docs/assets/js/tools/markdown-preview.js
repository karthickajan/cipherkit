(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    eye:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function md(s) {
    s = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    s = s.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    s = s.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    s = s.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    s = s.replace(/^---+$/gm, '<hr>');
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%">');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    s = s.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    s = s.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    s = s.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    s = s.replace(/\n\n/g, '</p><p>');
    s = '<p>' + s + '</p>';
    s = s.replace(/<p>\s*<(h[1-6]|ul|ol|pre|hr|blockquote)/g, '<$1');
    s = s.replace(/<\/(h[1-6]|ul|ol|pre|hr|blockquote)>\s*<\/p>/g, '</$1>');
    s = s.replace(/<p>\s*<\/p>/g, '');
    return s;
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.eye + '</div><h2 id="t-heading">Markdown Preview</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Preview</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Markdown</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="# Hello World\n\nType markdown here\u2026" rows="10" class="mono"></textarea></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.eye + ' <span>Preview</span></div><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy HTML">' + IC.copy + ' <span>Copy HTML</span></button></div><div class="out-body" id="t-result" style="min-height:80px;line-height:1.7;font-size:13px" role="status"><p style="color:var(--muted);font-style:italic">Preview will appear here\u2026</p></div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').innerHTML='<p style="color:var(--muted);font-style:italic">Preview will appear here\u2026</p>'; });
  CK.wireCopy($('btn-cp'), function () { return $('t-result').innerHTML; });
  CK.initAutoGrow($('t-input'));
  $('t-input').addEventListener('input', function () {
    var val = this.value;
    if (!val.trim()) { $('t-result').innerHTML = '<p style="color:var(--muted);font-style:italic">Preview will appear here\u2026</p>'; return; }
    $('t-result').innerHTML = md(val);
  });
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent('<ol><li>Type or paste <strong>Markdown</strong> in the editor.</li><li>The preview updates in <strong>real time</strong>.</li><li>Click <strong>Copy HTML</strong> to copy the rendered HTML.</li></ol><p>Supports headings, bold, italic, strikethrough, code blocks, links, images, lists, blockquotes, and horizontal rules.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='# Hello World\\n\\n## Introduction\\n\\nThis is a **sample** document with:\\n\\n- Lists\\n- **Bold** and *italic*\\n- `inline code`\\n\\n## Code Block\\n\\n```json\\n{"key": "value"}\\n```';inp.dispatchEvent(new Event('input'));}})();
})();