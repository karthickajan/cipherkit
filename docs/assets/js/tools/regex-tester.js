(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    code:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var sty = document.createElement('style');
  sty.textContent =
    '.rx-flags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}'
    + '.rx-flag{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-family:var(--mono);color:var(--muted);background:#1a1a1a;border:1px solid var(--border);border-radius:4px;padding:4px 10px;cursor:pointer;transition:all .15s;user-select:none}'
    + '.rx-flag:hover{border-color:var(--green);color:var(--text)}'
    + '.rx-flag.active{background:rgba(0,255,136,.08);border-color:#00ff88;color:#00ff88}'
    + '.rx-flag input{display:none}'
    + '.regex-highlight-container{position:relative;display:block;margin-bottom:0}'
    + '#regex-backdrop,#regex-test-input{font-family:var(--mono);font-size:13px;line-height:1.7;padding:12px;border:1px solid var(--border);border-radius:var(--r);white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;width:100%;box-sizing:border-box}'
    + '#regex-backdrop{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;color:transparent;background:#0a0a0a;border-color:transparent;z-index:0}'
    + '#regex-test-input{position:relative;z-index:1;background:transparent;color:var(--text);resize:vertical;caret-color:#00ff88;min-height:120px;outline:none}'
    + '#regex-test-input:focus{border-color:rgba(61,214,140,.3)}'
    + '#regex-highlights mark{background:#00ff8855;border-radius:2px;color:transparent}'
    + '.rx-match-count{font-size:12px;margin-top:8px;font-family:var(--mono)}'
    + '.rx-match-count.zero{color:#ff4444}'
    + '.rx-match-count.found{color:var(--green)}'
    + '.rx-err{font-size:12px;color:#ff4444;margin-top:4px;display:none}';
  document.head.appendChild(sty);
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.code + '</div><h2 id="t-heading">Regex Tester</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Test</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-regex">Regular Expression</label></div><input type="text" id="t-regex" placeholder="e.g. \\d{3}-\\d{3}-\\d{4}" class="mono"></div>'
    +     '<div class="rx-err" id="t-regex-err" role="alert"></div>'
    +     '<div class="rx-flags" id="flag-row">'
    +       '<label class="rx-flag active" data-f="g"><input type="checkbox" checked> g <span style="color:var(--muted);font-size:10px">global</span></label>'
    +       '<label class="rx-flag" data-f="i"><input type="checkbox"> i <span style="color:var(--muted);font-size:10px">insensitive</span></label>'
    +       '<label class="rx-flag" data-f="m"><input type="checkbox"> m <span style="color:var(--muted);font-size:10px">multiline</span></label>'
    +       '<label class="rx-flag" data-f="s"><input type="checkbox"> s <span style="color:var(--muted);font-size:10px">dotall</span></label>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="regex-test-input">Test String</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div>'
    +       '<div class="regex-highlight-container">'
    +         '<div id="regex-backdrop"><div id="regex-highlights"></div></div>'
    +         '<textarea id="regex-test-input" spellcheck="false" rows="6" placeholder="Enter test string here\u2026"></textarea>'
    +       '</div>'
    +     '</div>'
    +     '<div class="rx-match-count" id="match-count"></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Match Details</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Matches will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.querySelectorAll('.rx-flag').forEach(function (lbl) {
    var cb = lbl.querySelector('input');
    cb.addEventListener('change', function () {
      lbl.classList.toggle('active', cb.checked);
      test();
    });
  });
  function getFlags() {
    var f = '';
    document.querySelectorAll('.rx-flag').forEach(function (lbl) {
      if (lbl.querySelector('input').checked) f += lbl.dataset.f;
    });
    return f;
  }
  $('btn-clr').addEventListener('click', function () {
    $('t-regex').value = ''; $('regex-test-input').value = '';
    $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Matches will appear here\u2026';
    $('regex-highlights').innerHTML = ''; $('match-count').textContent = '';
    $('t-regex-err').style.display = 'none';
  });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  var textarea = $('regex-test-input');
  var backdrop = $('regex-backdrop');
  textarea.addEventListener('scroll', function () { backdrop.scrollTop = textarea.scrollTop; });
  function test() {
    var pattern = $('t-regex').value;
    var text = textarea.value;
    var highlights = $('regex-highlights');
    var errEl = $('t-regex-err');
    var countEl = $('match-count');
    errEl.style.display = 'none'; errEl.textContent = '';
    if (!pattern || !text) {
      highlights.innerHTML = esc(text) + '\n';
      $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Matches will appear here\u2026';
      countEl.textContent = ''; countEl.className = 'rx-match-count';
      return;
    }
    var flags = getFlags();
    var re;
    try { re = new RegExp(pattern, flags); } catch (e) {
      errEl.textContent = 'Invalid regex: ' + e.message; errEl.style.display = 'block';
      highlights.innerHTML = esc(text) + '\n';
      $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Matches will appear here\u2026';
      countEl.textContent = ''; countEl.className = 'rx-match-count';
      return;
    }
    var escaped = esc(text);
    var matchCount = 0;
    var markedText;
    if (flags.indexOf('g') !== -1) {
      /* Use a separate RegExp on escaped text? No — offsets differ.
         Instead: run regex on raw text, then map offsets to escaped. */
      var parts = [];
      var lastIdx = 0;
      var m;
      var safeRe = new RegExp(pattern, flags);
      while ((m = safeRe.exec(text)) !== null) {
        if (m.index > lastIdx) parts.push(esc(text.slice(lastIdx, m.index)));
        parts.push('<mark>' + esc(m[0]) + '</mark>');
        matchCount++;
        lastIdx = m.index + m[0].length;
        if (!m[0]) { safeRe.lastIndex++; lastIdx = safeRe.lastIndex; }
        if (matchCount > 10000) break; /* safety limit */
      }
      if (lastIdx < text.length) parts.push(esc(text.slice(lastIdx)));
      markedText = parts.join('');
    } else {
      var m2 = re.exec(text);
      if (m2) {
        markedText = esc(text.slice(0, m2.index)) + '<mark>' + esc(m2[0]) + '</mark>' + esc(text.slice(m2.index + m2[0].length));
        matchCount = 1;
      } else {
        markedText = escaped;
      }
    }
    highlights.innerHTML = markedText + '\n';
    if (matchCount === 0) {
      countEl.className = 'rx-match-count zero'; countEl.textContent = '0 matches found';
    } else {
      countEl.className = 'rx-match-count found'; countEl.textContent = matchCount + ' match' + (matchCount !== 1 ? 'es' : '') + ' found';
    }
    var details = [];
    var detailRe = new RegExp(pattern, flags);
    var dm;
    if (flags.indexOf('g') !== -1) {
      while ((dm = detailRe.exec(text)) !== null) {
        var entry = 'Match ' + (details.length + 1) + ': "' + dm[0] + '" at index ' + dm.index;
        if (dm.length > 1) { for (var gi = 1; gi < dm.length; gi++) entry += '\n  Group ' + gi + ': "' + (dm[gi] || '') + '"'; }
        details.push(entry);
        if (!dm[0]) detailRe.lastIndex++;
        if (details.length > 10000) break;
      }
    } else {
      dm = detailRe.exec(text);
      if (dm) {
        var entry2 = 'Match: "' + dm[0] + '" at index ' + dm.index;
        if (dm.length > 1) { for (var gj = 1; gj < dm.length; gj++) entry2 += '\n  Group ' + gj + ': "' + (dm[gj] || '') + '"'; }
        details.push(entry2);
      }
    }
    if (!details.length) {
      $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'No matches found.';
    } else {
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = details.join('\n\n') + '\n\n\u2014 Total: ' + details.length + ' match' + (details.length !== 1 ? 'es' : '');
    }
  }
  $('t-regex').addEventListener('input', test);
  textarea.addEventListener('input', test);
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'regex-tester-output.txt');
  CK.setUsageContent('<ol><li>Enter your regular expression in the pattern field.</li><li>Paste test text in the input area.</li><li>Matches are highlighted in real-time as you type.</li><li>Toggle flags: g (global), i (case-insensitive), m (multiline), s (dotall).</li></ol><h3>Quick regex reference</h3><ul><li><code>\\d</code> \u2014 digit (0-9)</li><li><code>\\w</code> \u2014 word character (a-z, A-Z, 0-9, _)</li><li><code>\\s</code> \u2014 whitespace</li><li><code>+</code> \u2014 one or more</li><li><code>*</code> \u2014 zero or more</li><li><code>?</code> \u2014 zero or one</li><li><code>^</code> \u2014 start of line</li><li><code>$</code> \u2014 end of line</li><li><code>[abc]</code> \u2014 character class</li><li><code>(group)</code> \u2014 capture group</li></ul>');
  (function () {
    $('t-regex').value = '\\b\\w{4,}\\b';
    textarea.value = 'The quick brown fox jumps over the lazy dog';
    test();
  })();
})();