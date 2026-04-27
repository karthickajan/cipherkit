(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    text:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.text + '</div><h2 id="t-heading">Word Counter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Analyze</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Your Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Type or paste your text here\u2026" rows="10"></textarea></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Statistics</span></div></div><pre class="out-body mono" id="t-result" role="status" aria-live="polite" style="line-height:2">Type to see live stats\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; update(); });
  CK.initAutoGrow($('t-input'));
  function update() {
    var text = $('t-input').value;
    var chars = text.length;
    var charsNoSpace = text.replace(/\s/g,'').length;
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    var sentences = text.trim() ? (text.match(/[.!?]+/g)||[]).length || (words>0?1:0) : 0;
    var paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(function(p){return p.trim();}).length : 0;
    var lines = text ? text.split('\n').length : 0;
    var readTime = Math.max(1, Math.ceil(words / 200));
    var speakTime = Math.max(1, Math.ceil(words / 130));
    $('t-result').textContent =
      'Characters:       ' + chars +
      '\nChars (no space): ' + charsNoSpace +
      '\nWords:            ' + words +
      '\nSentences:        ' + sentences +
      '\nParagraphs:       ' + paragraphs +
      '\nLines:            ' + lines +
      '\nReading time:     ~' + readTime + ' min (' + (readTime*200) + ' wpm)' +
      '\nSpeaking time:    ~' + speakTime + ' min (' + (speakTime*130) + ' wpm)';
  }
  $('t-input').addEventListener('input', update);
  update();
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent('<ol><li><strong>Type or paste</strong> text in the editor.</li><li>Statistics update in <strong>real time</strong>.</li></ol><p>Counts characters, characters excluding spaces, words, sentences, paragraphs, and lines. Estimates reading time (200 wpm) and speaking time (130 wpm).</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.';inp.dispatchEvent(new Event('input'));}})();
})();