(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    text:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  function randWord() { return WORDS[Math.floor(Math.random()*WORDS.length)]; }
  function sentence() {
    var len = 8 + Math.floor(Math.random()*12);
    var s = []; for(var i=0;i<len;i++) s.push(randWord());
    s[0] = s[0][0].toUpperCase()+s[0].substring(1);
    return s.join(' ') + '.';
  }
  function paragraph() { var n=3+Math.floor(Math.random()*4); var p=[]; for(var i=0;i<n;i++) p.push(sentence()); return p.join(' '); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.text + '</div><h2 id="t-heading">Lorem Ipsum Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Generate</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-type">Type</label><select id="t-type"><option value="paragraphs" selected>Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div><div class="sel-group"><label for="t-count">Count</label><input type="number" id="t-count" value="3" min="1" max="100" style="width:100%"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-gen" aria-label="Generate lorem ipsum">' + IC.refresh + ' <span>Generate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Lorem Ipsum</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body ph" id="t-result" style="white-space:pre-wrap;word-break:break-word" role="status" aria-live="polite">Click Generate\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('Click')===-1?t:''; });
  $('btn-gen').addEventListener('click', function () {
    var type = $('t-type').value;
    var count = parseInt($('t-count').value,10) || 3;
    var text;
    if (type === 'paragraphs') { var ps=[]; for(var i=0;i<count;i++) ps.push(paragraph()); text=ps.join('\n\n'); }
    else if (type === 'sentences') { var ss=[]; for(var j=0;j<count;j++) ss.push(sentence()); text=ss.join(' '); }
    else { var ws=[]; for(var k=0;k<count;k++) ws.push(randWord()); ws[0]=ws[0][0].toUpperCase()+ws[0].substring(1); text=ws.join(' ')+'.'; }
    $('t-result').className='out-body b'; $('t-result').textContent = text;
    CK.toast('Lorem ipsum generated');
  });
  $('btn-gen').click();
  CK.wireCtrlEnter('btn-gen');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'lorem-ipsum-generator-output.txt');
  CK.setUsageContent('<ol><li>Choose <strong>type</strong> (paragraphs, sentences, or words) and <strong>count</strong>.</li><li>Click <strong>Generate</strong>.</li></ol><p>Classic Lorem Ipsum placeholder text for mockups, design, and development. Copy with one click.</p>');
})();