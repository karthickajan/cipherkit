(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    mini:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var VOID_TAGS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
  function formatHTML(html, indent) {
    var pad = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent, 10));
    var tokens = [];
    var re = /(<\/?\w[^>]*\/?>|<!--[\s\S]*?-->)/g;
    var last = 0, m;
    while ((m = re.exec(html)) !== null) {
      if (m.index > last) {
        var txt = html.substring(last, m.index).trim();
        if (txt) tokens.push({ type: 'text', value: txt });
      }
      tokens.push({ type: 'tag', value: m[0] });
      last = re.lastIndex;
    }
    if (last < html.length) {
      var tail = html.substring(last).trim();
      if (tail) tokens.push({ type: 'text', value: tail });
    }
    var out = [];
    var depth = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      if (tk.type === 'text') {
        out.push(pad.repeat(depth) + tk.value);
        continue;
      }
      var tag = tk.value;
      if (/^<!--/.test(tag)) { out.push(pad.repeat(depth) + tag); continue; }
      if (/^<\//.test(tag)) { depth = Math.max(0, depth - 1); out.push(pad.repeat(depth) + tag); continue; }
      var tagName = (tag.match(/^<(\w+)/) || [])[1] || '';
      out.push(pad.repeat(depth) + tag);
      if (!(/\/>$/.test(tag)) && !VOID_TAGS.test(tagName)) { depth++; }
    }
    return out.join('\n');
  }
  function minifyHTML(html) {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')          /* strip comments */
      .replace(/>\s+</g, '><')                  /* collapse between tags */
      .replace(/\s{2,}/g, ' ')                  /* collapse runs */
      .trim();
  }
  var mode = 'format';
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">HTML Formatter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Format</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="mode-tabs" id="mode-tabs"><button type="button" class="mt" aria-pressed="true" data-val="format">' + IC.code + ' Format</button><button type="button" class="mt" aria-pressed="false" data-val="minify">' + IC.mini + ' Minify</button></div>'
    +       '<div class="sel-group"><label for="t-indent">Indent</label><select id="t-indent"><option value="2" selected>2 Spaces</option><option value="4">4 Spaces</option><option value="tab">Tab</option></select></div>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">HTML Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your HTML here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-fmt" aria-label="Format HTML">' + IC.code + ' <span>Format</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Formatted HTML will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.initTabs($('mode-tabs'), function (v) { mode = v; $('t-indent').disabled = (v === 'minify'); $('t-indent').closest('.sel-group').style.opacity = v === 'minify' ? '.35' : '1'; });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Formatted HTML will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-fmt').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var indent = $('t-indent').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Enter HTML to format.'; $('t-err').style.display = 'block'; return; }
    var result = mode === 'minify' ? minifyHTML(input) : formatHTML(input, indent);
    $('t-result').className = 'out-body mono b';
    $('t-result').textContent = result;
    CK.toast(mode === 'minify' ? 'HTML minified' : 'HTML formatted');
  });
  CK.wireCtrlEnter('btn-fmt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'html-formatter-output.html');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your HTML.</li><li>Choose <strong>Format</strong> or <strong>Minify</strong> mode.</li><li>Select indent style and click <strong>Format</strong>.</li></ol><p>Indents nested tags, handles self-closing and void elements, or minifies by stripping comments and whitespace.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='<div class="container"><header><h1>Hello World</h1><nav><a href="/">Home</a><a href="/about">About</a></nav></header><main><p>Welcome to the page.</p><ul><li>Item 1</li><li>Item 2</li></ul></main><footer><p>&copy; 2025</p></footer></div>';inp.dispatchEvent(new Event('input'));}})();
})();