(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    swap:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/><polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.clock + '</div><h2 id="t-heading">Unix Timestamp Converter</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Convert</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.clock + ' <span>Current Timestamp</span></div></div><div class="out-body mono" id="t-now" style="font-size:18px;font-weight:700;color:var(--amber);text-align:center;padding:14px"></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-ts">Unix Timestamp</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-now" aria-label="Now">' + IC.clock + ' <span>Now</span></button></div></div><input type="text" id="t-ts" placeholder="e.g. 1609459200" class="mono"><div class="inline-error" id="t-err1" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-t2d" aria-label="Convert to date">' + IC.swap + ' <span>Timestamp → Date</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Date Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp1" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl1" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-date-result" role="status">Date will appear here\u2026</pre></div>'
    +     '<hr style="border:none;border-top:1px solid var(--border);margin:6px 0">'
    +     '<div class="field"><div class="field-hdr"><label>Date &amp; Time</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-use-now">' + IC.clock + ' <span>Now</span></button></div></div><div class="dt-split-row"><input type="date" id="t-dt-date" aria-label="Date"><input type="time" id="t-dt-time" step="1" aria-label="Time"></div><div class="inline-error" id="t-err2" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-d2t" aria-label="Convert to timestamp">' + IC.swap + ' <span>Date → Timestamp</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Timestamp Result</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp2" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl2" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-ts-result" role="status">Timestamp will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function tick() { $('t-now').textContent = Math.floor(Date.now()/1000); }
  tick(); setInterval(tick, 1000);
  $('btn-now').addEventListener('click', function () { $('t-ts').value = Math.floor(Date.now()/1000); });
  CK.wireCopy($('btn-cp1'), function () { var t=$('t-date-result').textContent; return t.indexOf('appear')===-1?t:''; });
  CK.wireCopy($('btn-cp2'), function () { var t=$('t-ts-result').textContent; return t.indexOf('appear')===-1?t:''; });
  $('btn-t2d').addEventListener('click', function () {
    var val = $('t-ts').value.trim();
    $('t-err1').textContent=''; $('t-err1').style.display='none';
    if (!val) { $('t-err1').textContent='Enter a timestamp.'; $('t-err1').style.display='block'; return; }
    var ts = Number(val);
    if (isNaN(ts)) { $('t-err1').textContent='Invalid number.'; $('t-err1').style.display='block'; return; }
    if (ts > 1e12) ts = ts / 1000;
    var d = new Date(ts * 1000);
    var lines = 'UTC:   ' + d.toUTCString() + '\nISO:   ' + d.toISOString() + '\nLocal: ' + d.toLocaleString();
    $('t-date-result').className='out-body mono b'; $('t-date-result').textContent = lines;
    CK.toast('Converted');
  });
  $('btn-d2t').addEventListener('click', function () {
    var dp=$('t-dt-date').value,tp=$('t-dt-time').value;
    $('t-err2').textContent=''; $('t-err2').style.display='none';
    if (!dp) { $('t-err2').textContent='Select a date.'; $('t-err2').style.display='block'; return; }
    var combined=dp+'T'+(tp||'00:00:00');
    var d = new Date(combined);
    var ts = Math.floor(d.getTime()/1000);
    $('t-ts-result').className='out-body mono b'; $('t-ts-result').textContent = ts + '\n(milliseconds: ' + d.getTime() + ')';
    CK.toast('Converted');
  });
  var _autoT2=null;
  function autoD2T(){clearTimeout(_autoT2);_autoT2=setTimeout(function(){if($('t-dt-date').value)$('btn-d2t').click();},300);}
  $('t-dt-date').addEventListener('change',autoD2T);
  $('t-dt-time').addEventListener('change',autoD2T);
  /* "Now" fills both date and time */
  $('btn-use-now').addEventListener('click',function(){
    var n=new Date();
    function p(v){return v<10?'0'+v:''+v;}
    $('t-dt-date').value=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate());
    $('t-dt-time').value=p(n.getHours())+':'+p(n.getMinutes())+':'+p(n.getSeconds());
    $('btn-d2t').click();
  });
  CK.setUsageContent('<ol><li>Enter a <strong>Unix timestamp</strong> (seconds or milliseconds) and convert to a readable date.</li><li>Or pick a <strong>date/time</strong> and convert to a Unix timestamp.</li></ol><p>Auto-detects seconds vs milliseconds. Shows UTC, ISO 8601, and local time.</p>');
})();