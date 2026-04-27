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
  function formatCSS(css, indent) {
    var pad = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent, 10));
    var depth = 0;
    var out = '';
    var i = 0;
    var len = css.length;
    while (i < len) {
      var ch = css[i];
      if (ch === '/' && css[i + 1] === '*') {
        var end = css.indexOf('*/', i + 2);
        if (end === -1) end = len;
        var comment = css.substring(i, end + 2);
        out += '\n' + pad.repeat(depth) + comment + '\n';
        i = end + 2;
        continue;
      }
      if (ch === '{') {
        out = out.trimEnd() + ' {\n';
        depth++;
        i++;
        continue;
      }
      if (ch === '}') {
        depth = Math.max(0, depth - 1);
        out = out.trimEnd() + '\n' + pad.repeat(depth) + '}\n';
        i++;
        continue;
      }
      if (ch === ';') {
        out += ';\n';
        i++;
        while (i < len && /\s/.test(css[i])) i++;
        if (i < len && css[i] !== '}') out += pad.repeat(depth);
        continue;
      }
      if (/\s/.test(ch)) {
        i++;
        while (i < len && /\s/.test(css[i])) i++;
        /* Only add space if last char isn't newline or start */
        if (out.length && !/[\n ]$/.test(out)) out += ' ';
        /* If we're at start of a new line, add indent */
        if (/\n$/.test(out) && i < len && css[i] !== '}') out += pad.repeat(depth);
        continue;
      }
      if (/\n$/.test(out) || out === '') {
        out += pad.repeat(depth);
      }
      out += ch;
      i++;
    }
    return out.replace(/\n{3,}/g, '\n\n').trim();
  }
  function minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')     /* strip comments */
      .replace(/\s+/g, ' ')                 /* collapse whitespace */
      .replace(/\s*([{}:;,])\s*/g, '$1')    /* remove space around punctuation */
      .replace(/;}/g, '}')                  /* remove last semicolon in block */
      .trim();
  }
  var mode = 'format';
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.code + '</div><h2 id="t-heading">CSS Formatter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Format</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="mode-tabs" id="mode-tabs"><button type="button" class="mt" aria-pressed="true" data-val="format">' + IC.code + ' Format</button><button type="button" class="mt" aria-pressed="false" data-val="minify">' + IC.mini + ' Minify</button></div>'
    +       '<div class="sel-group"><label for="t-indent">Indent</label><select id="t-indent"><option value="2" selected>2 Spaces</option><option value="4">4 Spaces</option><option value="tab">Tab</option></select></div>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">CSS Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your CSS here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-fmt" aria-label="Format CSS">' + IC.code + ' <span>Format</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Formatted CSS will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.initTabs($('mode-tabs'), function (v) { mode = v; $('t-indent').disabled = (v === 'minify'); $('t-indent').closest('.sel-group').style.opacity = v === 'minify' ? '.35' : '1'; });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Formatted CSS will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-fmt').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var indent = $('t-indent').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Enter CSS to format.'; $('t-err').style.display = 'block'; return; }
    var result = mode === 'minify' ? minifyCSS(input) : formatCSS(input, indent);
    $('t-result').className = 'out-body mono b';
    $('t-result').textContent = result;
    CK.toast(mode === 'minify' ? 'CSS minified' : 'CSS formatted');
  });
  CK.wireCtrlEnter('btn-fmt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'css-formatter-output.css');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your CSS.</li><li>Choose <strong>Format</strong> or <strong>Minify</strong> mode.</li><li>Select indent style and click <strong>Format</strong>.</li></ol><p>Formats CSS with proper indentation and line breaks, or minifies by stripping comments and whitespace. Preserves @media and nested rules.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='body{margin:0;padding:0;font-family:Arial,sans-serif;background:#07090d;color:#dde4ed}.container{max-width:1280px;margin:0 auto;padding:0 24px}h1{font-size:2rem;font-weight:700;color:#fff}@media(max-width:768px){.container{padding:0 16px}h1{font-size:1.5rem}}';inp.dispatchEvent(new Event('input'));}})();
})();