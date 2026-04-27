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
  function minifyJS(src) {
    var out = '';
    var i = 0;
    var len = src.length;
    var prev = '';
    while (i < len) {
      var ch = src[i];
      if (ch === '/' && src[i + 1] === '/') {
        var nl = src.indexOf('\n', i);
        if (nl === -1) break;
        i = nl + 1;
        if (out.length && !/[\n\s;{(,]$/.test(out)) out += '\n';
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        var end = src.indexOf('*/', i + 2);
        if (end === -1) break;
        /* Keep license comments starting with /*! */
        if (src[i + 2] === '!') {
          out += src.substring(i, end + 2);
        }
        i = end + 2;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        var q = ch;
        out += ch; i++;
        while (i < len) {
          if (src[i] === '\\') { out += src[i++]; if (i < len) out += src[i++]; continue; }
          out += src[i];
          if (src[i] === q) { i++; break; }
          i++;
        }
        continue;
      }
      if (ch === '/' && i > 0) {
        var lastSig = out.replace(/\s+$/, '');
        var lc = lastSig[lastSig.length - 1];
        if (lc && /[=(:,;!&|?{}\[\n]/.test(lc)) {
          out += ch; i++;
          while (i < len && src[i] !== '/' && src[i] !== '\n') {
            if (src[i] === '\\') { out += src[i++]; }
            if (i < len) out += src[i++];
          }
          if (i < len && src[i] === '/') { out += src[i++]; }
          while (i < len && /[gimsuy]/.test(src[i])) out += src[i++];
          continue;
        }
      }
      if (/\s/.test(ch)) {
        i++;
        while (i < len && /\s/.test(src[i])) i++;
        var before = out[out.length - 1] || '';
        var after = src[i] || '';
        if (/[\w$]/.test(before) && /[\w$]/.test(after)) {
          out += ' ';
        } else if (/[\w$)}]/.test(before) && /[/{([]/.test(after)) {
          if (/\b(return|throw|new|delete|typeof|void|in|of|instanceof|case|else|yield|await)\s*$/.test(out)) {
            out += ' ';
          }
        }
        continue;
      }
      out += ch;
      i++;
    }
    return out.trim();
  }
  function formatJS(src, indent) {
    var pad = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent, 10));
    var lines = src.split('\n');
    var depth = 0;
    var out = [];
    for (var l = 0; l < lines.length; l++) {
      var line = lines[l].trim();
      if (!line) continue;
      if (/^[}\])]/.test(line)) depth = Math.max(0, depth - 1);
      out.push(pad.repeat(depth) + line);
      var opens = (line.match(/[{(\[]/g) || []).length;
      var closes = (line.match(/[})\]]/g) || []).length;
      depth = Math.max(0, depth + opens - closes);
    }
    return out.join('\n');
  }
  var mode = 'minify';
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.code + '</div><h2 id="t-heading">JavaScript Minifier</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Minify</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row">'
    +       '<div class="mode-tabs" id="mode-tabs"><button type="button" class="mt" aria-pressed="false" data-val="format">' + IC.code + ' Format</button><button type="button" class="mt" aria-pressed="true" data-val="minify">' + IC.mini + ' Minify</button></div>'
    +       '<div class="sel-group"><label for="t-indent">Indent</label><select id="t-indent"><option value="2" selected>2 Spaces</option><option value="4">4 Spaces</option><option value="tab">Tab</option></select></div>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">JavaScript Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your JavaScript here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-fmt" aria-label="Minify JavaScript">' + IC.mini + ' <span>Minify</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Minified JavaScript will appear here\u2026</pre></div>'
    +     '<div class="out-box" style="margin-top:12px"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Stats</span></div></div><pre class="out-body mono ph" id="t-stats" role="status">Size comparison will appear after minification\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.initTabs($('mode-tabs'), function (v) { mode = v; $('t-indent').disabled = (v === 'minify'); $('t-indent').closest('.sel-group').style.opacity = v === 'minify' ? '.35' : '1'; });
  $('t-indent').disabled = true; $('t-indent').closest('.sel-group').style.opacity = '.35';
  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Minified JavaScript will appear here\u2026';
    $('t-stats').className = 'out-body mono ph'; $('t-stats').textContent = 'Size comparison will appear after minification\u2026';
  });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.initAutoGrow($('t-input'));
  $('btn-fmt').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    var indent = $('t-indent').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Enter JavaScript to process.'; $('t-err').style.display = 'block'; return; }
    var result;
    if (mode === 'minify') {
      result = minifyJS(input);
    } else {
      result = formatJS(input, indent);
    }
    $('t-result').className = 'out-body mono b';
    $('t-result').textContent = result;
    var origSize = new TextEncoder().encode(input).length;
    var newSize = new TextEncoder().encode(result).length;
    var pct = origSize > 0 ? ((1 - newSize / origSize) * 100).toFixed(1) : 0;
    if (mode === 'minify') {
      $('t-stats').className = 'out-body mono b';
      $('t-stats').textContent = 'Original: ' + origSize + ' bytes  \u2192  Minified: ' + newSize + ' bytes  (' + pct + '% reduction)';
    } else {
      $('t-stats').className = 'out-body mono b';
      $('t-stats').textContent = 'Original: ' + origSize + ' bytes  \u2192  Formatted: ' + newSize + ' bytes';
    }
    CK.toast(mode === 'minify' ? 'JavaScript minified' : 'JavaScript formatted');
  });
  CK.wireCtrlEnter('btn-fmt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'js-minifier-output.js');
  CK.setUsageContent('<ol><li><strong>Paste</strong> your JavaScript.</li><li>Choose <strong>Minify</strong> or <strong>Format</strong> mode.</li><li>Click the action button.</li></ol><p>Minifies JavaScript by stripping comments and collapsing whitespace. Preserves license comments (<code>/*!</code>). For production, consider Terser or esbuild.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='// Simple utility functions\nfunction greet(name) {\n  // Build greeting message\n  const message = "Hello, " + name + "!";\n  console.log(message);\n  return message;\n}\n\n/* Calculate sum of array */\nfunction sum(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}\n\nconst result = sum([1, 2, 3, 4, 5]);\ngreet("World");';inp.dispatchEvent(new Event('input'));}})();
})();