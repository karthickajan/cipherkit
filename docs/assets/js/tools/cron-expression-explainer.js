(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  var MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function explainField(val, unit, names) {
    if (val === '*') return 'every ' + unit;
    if (val.indexOf('*/') === 0) return 'every ' + val.substring(2) + ' ' + unit + 's';
    var parts = val.split(',').map(function (p) {
      if (p.indexOf('-') !== -1) {
        var r = p.split('-');
        var a = names ? (names[parseInt(r[0],10)]||r[0]) : r[0];
        var b = names ? (names[parseInt(r[1],10)]||r[1]) : r[1];
        return a + ' through ' + b;
      }
      return names ? (names[parseInt(p,10)]||p) : p;
    });
    return unit + ' ' + parts.join(', ');
  }
  function explain(cron) {
    var p = cron.trim().split(/\s+/);
    if (p.length < 5) return 'Invalid: need at least 5 fields (minute hour day month weekday)';
    if (p.length > 5) return 'Note: 6+ field cron (with seconds) detected. Showing standard 5-field analysis.';
    var desc = [];
    desc.push(explainField(p[0], 'minute', null));
    desc.push(explainField(p[1], 'hour', null));
    desc.push(explainField(p[2], 'day-of-month', null));
    desc.push(explainField(p[3], 'month', MONTHS));
    desc.push(explainField(p[4], 'weekday', DAYS));
    return desc.join('\n');
  }
  function nextRuns(cron, count) {
    var p = cron.trim().split(/\s+/);
    if (p.length < 5) return [];
    function matchField(val, current, max) {
      if (val === '*') return true;
      if (val.indexOf('*/') === 0) return current % parseInt(val.substring(2),10) === 0;
      return val.split(',').some(function(v) {
        if (v.indexOf('-') !== -1) { var r=v.split('-'); return current >= parseInt(r[0],10) && current <= parseInt(r[1],10); }
        return current === parseInt(v, 10);
      });
    }
    var runs = [];
    var d = new Date(); d.setSeconds(0,0); d.setMinutes(d.getMinutes()+1);
    for (var i = 0; i < 525960 && runs.length < count; i++) {
      if (matchField(p[0],d.getMinutes(),59) && matchField(p[1],d.getHours(),23) && matchField(p[2],d.getDate(),31) && matchField(p[3],d.getMonth()+1,12) && matchField(p[4],d.getDay(),6)) {
        runs.push(d.toISOString().replace('T',' ').substring(0,16));
      }
      d.setMinutes(d.getMinutes()+1);
    }
    return runs;
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.clock + '</div><h2 id="t-heading">Cron Explainer</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Explain</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Cron Expression</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><input type="text" id="t-input" placeholder="e.g. */5 * * * *" class="mono" value="0 9 * * 1-5"><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-exp" aria-label="Explain">' + IC.clock + ' <span>Explain</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Explanation</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status">Explanation will appear here\u2026</pre></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.clock + ' <span>Next 5 Runs</span></div></div><pre class="out-body mono ph" id="t-runs" role="status">Next runs will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Explanation will appear here\u2026'; $('t-runs').className='out-body mono ph'; $('t-runs').textContent='Next runs will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  $('btn-exp').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!input) { $('t-err').textContent='Enter a cron expression.'; $('t-err').style.display='block'; return; }
    $('t-result').className='out-body mono b'; $('t-result').textContent = explain(input);
    var runs = nextRuns(input, 5);
    $('t-runs').className='out-body mono b'; $('t-runs').textContent = runs.length ? runs.join('\n') : 'Could not compute next runs';
    CK.toast('Cron explained');
  });
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'cron-expression-explainer-output.txt');
  CK.setUsageContent('<ol><li><strong>Enter</strong> a cron expression (5 fields: minute hour day month weekday).</li><li>Click <strong>Explain</strong> to see a plain-English breakdown and the next 5 scheduled run times.</li></ol><p>Supports <code>*</code>, <code>*/N</code>, ranges (<code>1-5</code>), and lists (<code>1,3,5</code>).</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='0 9 * * 1-5';inp.dispatchEvent(new Event('input'));}})();
})();