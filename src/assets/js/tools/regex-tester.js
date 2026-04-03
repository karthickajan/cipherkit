/**
 * CipherKit — Regex Tester
 */
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

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.code + '</div><h2 id="t-heading">Regex Tester</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Test</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-regex">Regular Expression</label></div><input type="text" id="t-regex" placeholder="e.g. \\d{3}-\\d{3}-\\d{4}" class="mono"></div>'
    +     '<div class="ctrl-row" style="gap:14px;flex-wrap:wrap">'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-g" checked> Global (g)</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-i"> Case-insensitive (i)</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-m"> Multiline (m)</label>'
    +       '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);cursor:pointer"><input type="checkbox" id="t-s"> Dotall (s)</label>'
    +     '</div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Test String</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter test string here\u2026" rows="6"></textarea></div>'
    +     '<div class="inline-error" id="t-err" role="alert"></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Matches</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Matches will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  $('btn-clr').addEventListener('click', function () { $('t-regex').value=''; $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Matches will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  CK.initAutoGrow($('t-input'));

  function test() {
    var pattern = $('t-regex').value;
    var text = $('t-input').value;
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!pattern || !text) { $('t-result').className='out-body mono ph'; $('t-result').textContent='Matches will appear here\u2026'; return; }
    var flags = '';
    if ($('t-g').checked) flags += 'g';
    if ($('t-i').checked) flags += 'i';
    if ($('t-m').checked) flags += 'm';
    if ($('t-s').checked) flags += 's';
    try {
      var re = new RegExp(pattern, flags);
      var matches = [];
      var m;
      if (flags.indexOf('g') !== -1) {
        while ((m = re.exec(text)) !== null) {
          var entry = 'Match ' + (matches.length + 1) + ': "' + m[0] + '" at index ' + m.index;
          if (m.length > 1) {
            for (var i = 1; i < m.length; i++) entry += '\n  Group ' + i + ': "' + (m[i]||'') + '"';
          }
          matches.push(entry);
          if (!m[0]) re.lastIndex++;
        }
      } else {
        m = re.exec(text);
        if (m) {
          var entry2 = 'Match: "' + m[0] + '" at index ' + m.index;
          if (m.length > 1) { for (var j=1;j<m.length;j++) entry2 += '\n  Group ' + j + ': "' + (m[j]||'') + '"'; }
          matches.push(entry2);
        }
      }
      if (!matches.length) {
        $('t-result').className='out-body mono ph'; $('t-result').textContent='No matches found.';
      } else {
        $('t-result').className='out-body mono b'; $('t-result').textContent = matches.join('\n\n') + '\n\n— Total: ' + matches.length + ' match' + (matches.length!==1?'es':'');
      }
    } catch (e) {
      $('t-err').textContent = 'Invalid regex: ' + e.message; $('t-err').style.display = 'block';
    }
  }

  $('t-regex').addEventListener('input', test);
  $('t-input').addEventListener('input', test);
  ['t-g','t-i','t-m','t-s'].forEach(function(id){ $(id).addEventListener('change', test); });

  
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'regex-tester-output.txt');

  CK.setUsageContent('<ol><li>Enter your regular expression in the pattern field.</li><li>Paste test text in the input area.</li><li>Matches are highlighted in real-time as you type.</li><li>Add flags: g (global), i (case-insensitive), m (multiline).</li></ol><h3>Quick regex reference</h3><ul><li><code>\\d</code> — digit (0-9)</li><li><code>\\w</code> — word character (a-z, A-Z, 0-9, _)</li><li><code>\\s</code> — whitespace</li><li><code>+</code> — one or more</li><li><code>*</code> — zero or more</li><li><code>?</code> — zero or one</li><li><code>^</code> — start of line</li><li><code>$</code> — end of line</li><li><code>[abc]</code> — character class</li><li><code>(group)</code> — capture group</li></ul>');

  /* CK-PATCHED — sample data */
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='The quick brown fox jumps over the lazy dog';inp.dispatchEvent(new Event('input'));}})();
})();
