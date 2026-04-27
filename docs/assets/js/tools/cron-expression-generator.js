(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.clock + '</div><h2 id="t-heading">Cron Generator</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Generate</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-min">Minute</label><input type="text" id="t-min" value="*" class="mono" style="width:100%"></div><div class="sel-group"><label for="t-hr">Hour</label><input type="text" id="t-hr" value="*" class="mono" style="width:100%"></div><div class="sel-group"><label for="t-dom">Day (month)</label><input type="text" id="t-dom" value="*" class="mono" style="width:100%"></div><div class="sel-group"><label for="t-mon">Month</label><input type="text" id="t-mon" value="*" class="mono" style="width:100%"></div><div class="sel-group"><label for="t-dow">Day (week)</label><input type="text" id="t-dow" value="*" class="mono" style="width:100%"></div></div>'
    +     '<div class="ctrl-row" style="gap:6px;flex-wrap:wrap">'
    +       '<button type="button" class="pill-btn" data-cron="* * * * *">Every minute</button>'
    +       '<button type="button" class="pill-btn" data-cron="0 * * * *">Every hour</button>'
    +       '<button type="button" class="pill-btn" data-cron="0 0 * * *">Daily midnight</button>'
    +       '<button type="button" class="pill-btn" data-cron="0 0 * * 0">Weekly (Sun)</button>'
    +       '<button type="button" class="pill-btn" data-cron="0 0 1 * *">Monthly 1st</button>'
    +       '<button type="button" class="pill-btn" data-cron="*/5 * * * *">Every 5 min</button>'
    +       '<button type="button" class="pill-btn" data-cron="0 9-17 * * 1-5">Business hrs</button>'
    +     '</div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Cron Expression</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono" id="t-result" style="font-size:18px;font-weight:700;color:var(--amber);text-align:center;padding:14px" role="status" aria-live="polite">* * * * *</div></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.clock + ' <span>Explanation</span></div></div><div class="out-body" id="t-explain" role="status">Every minute</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  var FIELDS = ['t-min','t-hr','t-dom','t-mon','t-dow'];
  var NAMES  = ['minute','hour','day(month)','month','day(week)'];
  function update() {
    var parts = FIELDS.map(function(id){ return $(id).value.trim() || '*'; });
    var cron = parts.join(' ');
    $('t-result').textContent = cron;
    $('t-explain').textContent = explain(parts);
  }
  function explain(p) {
    var desc = [];
    if (p[0]==='*'&&p[1]==='*'&&p[2]==='*'&&p[3]==='*'&&p[4]==='*') return 'Every minute';
    if (p[0].indexOf('*/')===0) desc.push('Every '+p[0].substring(2)+' minutes');
    else if (p[0]!=='*') desc.push('At minute '+p[0]);
    if (p[1].indexOf('*/')===0) desc.push('every '+p[1].substring(2)+' hours');
    else if (p[1]!=='*') desc.push('at hour '+p[1]);
    if (p[2]!=='*') desc.push('on day '+p[2]+' of the month');
    var MONTHS=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (p[3]!=='*') { var m=parseInt(p[3],10); desc.push('in '+(MONTHS[m]||p[3])); }
    var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    if (p[4]!=='*') {
      var dparts = p[4].split(',').map(function(d){
        if(d.indexOf('-')!==-1){ var r=d.split('-'); return (DAYS[r[0]]||r[0])+' to '+(DAYS[r[1]]||r[1]); }
        return DAYS[parseInt(d,10)]||d;
      });
      desc.push('on '+dparts.join(', '));
    }
    return desc.join(', ') || 'Custom schedule';
  }
  FIELDS.forEach(function(id){ $(id).addEventListener('input', update); });
  root.querySelectorAll('[data-cron]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var parts = btn.getAttribute('data-cron').split(' ');
      for(var i=0;i<5;i++) $(FIELDS[i]).value = parts[i];
      update();
    });
  });
  CK.wireCopy($('btn-cp'), function () { return $('t-result').textContent; });
  update();
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'cron-expression-generator-output.txt');
  CK.setUsageContent('<ol><li>Edit each <strong>field</strong> (minute, hour, day, month, weekday) or use a <strong>preset</strong>.</li><li>The cron expression and plain-English explanation update in real time.</li></ol><p>Standard 5-field cron syntax. Use <code>*</code> for any, <code>*/N</code> for intervals, <code>1,3,5</code> for lists, <code>1-5</code> for ranges.</p>');
})();