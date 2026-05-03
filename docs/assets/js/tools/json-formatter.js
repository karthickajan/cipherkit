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
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var sty = document.createElement('style');
  sty.textContent =
    '.jt-wrap{font-family:var(--mono);font-size:12px;line-height:1.7;background:#0a0a0a;overflow:auto;height:60vh;min-height:200px;resize:vertical;padding:0}'
    + '.jt-line{display:flex;padding:0 12px;white-space:pre}'
    + '.jt-line:hover{background:rgba(61,214,140,.04)}'
    + '.jt-ln{display:inline-block;min-width:36px;text-align:right;padding-right:12px;color:#444;user-select:none;flex-shrink:0}'
    + '.jt-ct{flex:1}'
    + '.jt-key{color:#e0e0e0}'
    + '.jt-str{color:#3dd68c}'
    + '.jt-num{color:#58a6ff}'
    + '.jt-bool,.jt-null{color:#ff6b6b}'
    + '.jt-brk{color:#666}'
    + '.jt-tog{cursor:pointer;user-select:none;display:inline-block;width:14px;text-align:center;color:#666;font-size:11px}'
    + '.jt-tog:hover{color:#3dd68c}'
    + '.jt-cnt{color:#666;font-style:italic;font-size:11px}'
    + '.jt-hid{display:none}'
    + '.jt-hl{background:rgba(61,214,140,.15);border-radius:2px}'
    + '.jt-path{position:absolute;top:0;right:8px;background:var(--sf2);border:1px solid var(--border);border-radius:4px;padding:1px 8px;font-size:10px;color:var(--green);pointer-events:auto;z-index:10;white-space:nowrap;cursor:pointer;transform:translateY(-2px)}'
    + '.jt-tb{display:flex;gap:6px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--sf2);flex-wrap:wrap}'
    + '.jt-si{flex:1;min-width:120px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:12px;padding:4px 8px;outline:none}'
    + '.jt-si:focus{border-color:rgba(61,214,140,.3)}'
    + '.jt-tb-btn{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:4px;padding:3px 8px;cursor:pointer;font-family:var(--mono);transition:all .15s}'
    + '.jt-tb-btn:hover{color:var(--green);border-color:var(--gdim)}'
    + '.jt-tb-btn svg{width:10px;height:10px}'
    + '.jt-cs-btn{font-size:12px;font-weight:700;min-width:28px;text-align:center;padding:3px 5px}'
    + '.jt-cs-btn.active{color:var(--green);border-color:var(--green)}'
    + '.jt-match-info{font-size:11px;color:var(--muted);white-space:nowrap;font-family:var(--mono);min-width:50px;text-align:center}'
    + '.jt-match-info.no-match{color:#555}'
    + '.sh-mark{background:rgba(0,255,136,0.2);color:inherit;border-radius:2px}'
    + '.sh-mark-active{background:rgba(0,255,136,0.5);color:#0a0a0a}';
  document.head.appendChild(sty);
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-purple">' + IC.code + '</div><h2 id="t-heading">JSON Formatter</h2></div>'
    +     '<span class="tc-badge tc-badge-purple">Format</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row"><div class="sel-group"><label for="t-indent">Indent</label><select id="t-indent"><option value="2" selected>2 Spaces</option><option value="4">4 Spaces</option><option value="tab">Tab</option></select></div></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">JSON Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your JSON here\u2026" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-purple" id="btn-fmt" aria-label="Format JSON">' + IC.code + ' <span>Format</span></button>'
    +     '<div class="out-box" id="out-wrap">'
    +       '<div class="out-head"><div class="out-label">' + IC.play + ' <span>Formatted JSON</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div>'
    +       '<div id="jt-tb" class="jt-tb" style="display:none">'
    +         '<input type="text" class="jt-si" id="jt-si" placeholder="Search\u2026" aria-label="Search keys">'
    +         '<button type="button" class="jt-tb-btn jt-cs-btn" id="btn-cs" title="Case Sensitive">Aa</button>'
    +         '<span class="jt-match-info" id="jt-match-count"></span>'
    +         '<button type="button" class="jt-tb-btn" id="btn-prev" title="Previous match (Shift+Enter)">\u25B2</button>'
    +         '<button type="button" class="jt-tb-btn" id="btn-next" title="Next match (Enter)">\u25BC</button>'
    +         '<button type="button" class="jt-tb-btn" id="btn-exp">' + IC.plus + ' Expand</button>'
    +         '<button type="button" class="jt-tb-btn" id="btn-col">' + IC.minus + ' Collapse</button>'
    +       '</div>'
    +       '<div class="out-body mono ph" id="t-result" role="status" aria-live="polite" style="padding:0;max-height:none;resize:none">Formatted JSON will appear here\u2026</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  var _raw = '';
  var _nid = 0;
  var _groupParent = {};   /* groupId → parentGroupId */
  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    var r = $('t-result');
    r.className = 'out-body mono ph'; r.style.padding = ''; r.style.maxHeight = ''; r.style.resize = '';
    r.innerHTML = 'Formatted JSON will appear here\u2026';
    $('jt-tb').style.display = 'none'; _raw = ''; _groupParent = {};
  });
  CK.wireCopy($('btn-cp'), function () { return _raw; });
  CK.initAutoGrow($('t-input'));
  function renderVal(v, depth, path, last, parentGroup) {
    if (v === null)             return [{ h: '<span class="jt-null">null</span>'   + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    if (typeof v === 'boolean') return [{ h: '<span class="jt-bool">' + v + '</span>' + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    if (typeof v === 'number')  return [{ h: '<span class="jt-num">' + v + '</span>'  + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    if (typeof v === 'string')  return [{ h: '<span class="jt-str">"' + esc(v) + '"</span>' + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    if (Array.isArray(v)) return renderArr(v, depth, path, last, '', parentGroup);
    return renderObj(v, depth, path, last, '', parentGroup);
  }
  function inlineVal(v) {
    if (v === null) return '<span class="jt-null">null</span>';
    if (typeof v === 'boolean') return '<span class="jt-bool">' + v + '</span>';
    if (typeof v === 'number')  return '<span class="jt-num">' + v + '</span>';
    if (typeof v === 'string')  return '<span class="jt-str">"' + esc(v) + '"</span>';
    return esc(JSON.stringify(v));
  }
  function renderObj(obj, depth, path, last, prefix, parentGroup) {
    var keys = Object.keys(obj);
    if (!keys.length) return [{ h: prefix + '<span class="jt-brk">{}</span>' + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    var id = 'jn' + (_nid++), out = [];
    if (parentGroup) _groupParent[id] = parentGroup;
    out.push({ h: prefix + '<span class="jt-tog" data-n="' + id + '" data-c="' + keys.length + ' keys">\u25BE</span><span class="jt-brk">{</span>', p: path, d: depth, g: parentGroup, nOpen: id });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], cp = path + '.' + k, il = i === keys.length - 1, v = obj[k];
      var kh = '<span class="jt-key">"' + esc(k) + '"</span>: ';
      if (v !== null && typeof v === 'object') {
        var sub = Array.isArray(v) ? renderArr(v, depth + 1, cp, il, kh, id) : renderObj(v, depth + 1, cp, il, kh, id);
        for (var si = 0; si < sub.length; si++) out.push(sub[si]);
      } else {
        out.push({ h: kh + inlineVal(v) + (il ? '' : ','), p: cp, d: depth + 1, g: id });
      }
    }
    out.push({ h: '<span class="jt-brk">}</span>' + (last ? '' : ','), p: path, d: depth, g: id, nClose: id });
    return out;
  }
  function renderArr(arr, depth, path, last, prefix, parentGroup) {
    if (!arr.length) return [{ h: prefix + '<span class="jt-brk">[]</span>' + (last ? '' : ','), p: path, d: depth, g: parentGroup }];
    var id = 'jn' + (_nid++), out = [];
    if (parentGroup) _groupParent[id] = parentGroup;
    out.push({ h: prefix + '<span class="jt-tog" data-n="' + id + '" data-c="' + arr.length + ' items">\u25BE</span><span class="jt-brk">[</span>', p: path, d: depth, g: parentGroup, nOpen: id });
    for (var i = 0; i < arr.length; i++) {
      var cp = path + '[' + i + ']', il = i === arr.length - 1, v = arr[i];
      if (v !== null && typeof v === 'object') {
        var sub = Array.isArray(v) ? renderArr(v, depth + 1, cp, il, '', id) : renderObj(v, depth + 1, cp, il, '', id);
        for (var si = 0; si < sub.length; si++) out.push(sub[si]);
      } else {
        out.push({ h: inlineVal(v) + (il ? '' : ','), p: cp, d: depth + 1, g: id });
      }
    }
    out.push({ h: '<span class="jt-brk">]</span>' + (last ? '' : ','), p: path, d: depth, g: id, nClose: id });
    return out;
  }
  function buildHTML(lines) {
    var s = '<div class="jt-wrap">';
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i], pad = '';
      for (var d = 0; d < l.d; d++) pad += '  ';
      var attrs = ' data-i="' + i + '" data-p="' + esc(l.p) + '"';
      if (l.g) attrs += ' data-g="' + l.g + '"';
      if (l.nClose) attrs += ' data-nc="' + l.nClose + '"';
      if (l.nOpen) attrs += ' data-no="' + l.nOpen + '"';
      s += '<div class="jt-line"' + attrs + '><span class="jt-ln">' + (i + 1) + '</span><span class="jt-ct">' + pad + l.h + '</span></div>';
    }
    return s + '</div>';
  }
  function getDescendantGroups(gid) {
    var result = [], queue = [gid];
    while (queue.length) {
      var cur = queue.shift();
      for (var childId in _groupParent) {
        if (_groupParent[childId] === cur) {
          result.push(childId);
          queue.push(childId);
        }
      }
    }
    return result;
  }
  document.addEventListener('click', function (e) {
    var tog = e.target.closest('.jt-tog');
    if (!tog) return;
    var n = tog.dataset.n, wrap = $('t-result');
    var isCollapsed = tog.textContent === '\u25B8';
    if (isCollapsed) {
      wrap.querySelectorAll('[data-g="' + n + '"]').forEach(function (el) {
        el.classList.remove('jt-hid');
      });
      tog.textContent = '\u25BE';
    } else {
      var allGroups = [n].concat(getDescendantGroups(n));
      for (var i = 0; i < allGroups.length; i++) {
        var gid = allGroups[i];
        wrap.querySelectorAll('[data-g="' + gid + '"]').forEach(function (el) {
          el.classList.add('jt-hid');
        });
        if (gid !== n) {
          var openLine = wrap.querySelector('[data-no="' + gid + '"]');
          if (openLine) {
            var childTog = openLine.querySelector('.jt-tog');
            if (childTog) childTog.textContent = '\u25B8';
          }
        }
      }
      tog.textContent = '\u25B8';
    }
  });
  $('btn-exp').addEventListener('click', function () {
    var w = $('t-result');
    w.querySelectorAll('.jt-hid').forEach(function (el) { el.classList.remove('jt-hid'); });
    w.querySelectorAll('.jt-tog').forEach(function (t) { t.textContent = '\u25BE'; });
  });
  $('btn-col').addEventListener('click', function () {
    var w = $('t-result');
    w.querySelectorAll('.jt-tog').forEach(function (t) {
      var n = t.dataset.n;
      if (!n) return;
      t.textContent = '\u25B8';
      w.querySelectorAll('[data-g="' + n + '"]').forEach(function (el) { el.classList.add('jt-hid'); });
    });
  });
  var _searchMarks = [];
  var _curMatch = -1;
  var _caseSensitive = false;
  function clearSearch() {
    var w = $('t-result');
    for (var mi = 0; mi < _searchMarks.length; mi++) {
      var mk = _searchMarks[mi];
      if (mk.parentNode) mk.parentNode.replaceChild(document.createTextNode(mk.textContent), mk);
    }
    _searchMarks = [];
    _curMatch = -1;
    w.normalize();
    w.querySelectorAll('.jt-hl').forEach(function (el) { el.classList.remove('jt-hl'); });
    var badge = $('jt-match-count');
    if (badge) { badge.textContent = ''; badge.className = 'jt-match-info'; }
  }
  function setActiveMatch(idx) {
    if (!_searchMarks.length) return;
    for (var i = 0; i < _searchMarks.length; i++) {
      _searchMarks[i].className = 'sh-mark';
    }
    if (idx < 0) idx = _searchMarks.length - 1;
    if (idx >= _searchMarks.length) idx = 0;
    _curMatch = idx;
    _searchMarks[_curMatch].className = 'sh-mark sh-mark-active';
    _searchMarks[_curMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
    var badge = $('jt-match-count');
    if (badge) { badge.textContent = (_curMatch + 1) + ' / ' + _searchMarks.length; badge.className = 'jt-match-info'; }
  }
  function runSearch() {
    var q = $('jt-si').value, w = $('t-result');
    clearSearch();
    if (!q) return;
    var jtWrap = w.querySelector('.jt-wrap');
    if (!jtWrap) return;
    var qSearch = _caseSensitive ? q : q.toLowerCase();
    var walker = document.createTreeWalker(jtWrap, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);
    for (var ti = 0; ti < textNodes.length; ti++) {
      var tn = textNodes[ti];
      var text = tn.textContent;
      var textCmp = _caseSensitive ? text : text.toLowerCase();
      var idx = textCmp.indexOf(qSearch);
      if (idx === -1) continue;
      var parent = tn.parentNode;
      var frag = document.createDocumentFragment();
      var lastIdx = 0;
      while (idx !== -1) {
        if (idx > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
        var mark = document.createElement('mark');
        mark.className = 'sh-mark';
        mark.textContent = text.slice(idx, idx + q.length);
        frag.appendChild(mark);
        _searchMarks.push(mark);
        lastIdx = idx + q.length;
        idx = textCmp.indexOf(qSearch, lastIdx);
      }
      if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      parent.replaceChild(frag, tn);
      var line = parent.closest('.jt-line');
      if (line) {
        line.classList.remove('jt-hid');
        var gid = line.dataset.g;
        while (gid) {
          w.querySelectorAll('[data-g="' + gid + '"]').forEach(function (el) { el.classList.remove('jt-hid'); });
          var openLine = w.querySelector('[data-no="' + gid + '"]');
          if (openLine) {
            openLine.classList.remove('jt-hid');
            var t = openLine.querySelector('.jt-tog');
            if (t) t.textContent = '\u25BE';
          }
          gid = _groupParent[gid] || null;
        }
      }
    }
    var badge = $('jt-match-count');
    if (_searchMarks.length) {
      setActiveMatch(0);
    } else {
      if (badge) { badge.textContent = 'No matches'; badge.className = 'jt-match-info no-match'; }
    }
  }
  $('jt-si').addEventListener('input', runSearch);
  $('btn-cs').addEventListener('click', function () {
    _caseSensitive = !_caseSensitive;
    this.classList.toggle('active', _caseSensitive);
    runSearch();
  });
  $('btn-next').addEventListener('click', function () { if (_searchMarks.length) setActiveMatch(_curMatch + 1); });
  $('btn-prev').addEventListener('click', function () { if (_searchMarks.length) setActiveMatch(_curMatch - 1); });
  $('jt-si').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) { if (_searchMarks.length) setActiveMatch(_curMatch - 1); }
      else { if (_searchMarks.length) setActiveMatch(_curMatch + 1); }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.value = '';
      clearSearch();
    }
  });
  var _tip = null;
  $('t-result').addEventListener('mouseover', function (e) {
    var line = e.target.closest('.jt-line');
    if (!line || !line.dataset.p || line.dataset.p === '$') { rmTip(); return; }
    if (_tip) rmTip();
    _tip = document.createElement('span');
    _tip.className = 'jt-path';
    _tip.textContent = line.dataset.p;
    _tip.addEventListener('click', function () { CK.copyText(line.dataset.p); });
    line.style.position = 'relative';
    line.appendChild(_tip);
  });
  $('t-result').addEventListener('mouseout', function (e) {
    var line = e.target.closest('.jt-line');
    if (line && e.relatedTarget && line.contains(e.relatedTarget)) return;
    rmTip();
  });
  function rmTip() { if (_tip && _tip.parentNode) _tip.parentNode.removeChild(_tip); _tip = null; }
  $('btn-fmt').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter JSON to format.'; $('t-err').style.display = 'block'; return; }
    try {
      var obj = JSON.parse(input);
      var iv = $('t-indent').value;
      var indent = iv === 'tab' ? '\t' : parseInt(iv, 10);
      _raw = JSON.stringify(obj, null, indent);
      _nid = 0;
      _groupParent = {};
      var lines = renderVal(obj, 0, '$', true, null);
      var r = $('t-result');
      r.className = 'out-body mono';
      r.style.padding = '0'; r.style.maxHeight = 'none'; r.style.resize = 'none'; r.style.overflow = 'hidden';
      r.innerHTML = buildHTML(lines);
      $('jt-tb').style.display = 'flex';
      CK.toast('JSON formatted');
    } catch (e) {
      $('t-err').textContent = 'Invalid JSON: ' + e.message; $('t-err').style.display = 'block';
      var r2 = $('t-result');
      r2.className = 'out-body mono err'; r2.style.padding = ''; r2.style.maxHeight = ''; r2.style.resize = '';
      r2.textContent = 'Error: ' + e.message;
      $('jt-tb').style.display = 'none'; _raw = '';
      window.CKFeedback && window.CKFeedback.reportError(e.message, {"Input": ($('t-input').value || '').substring(0, 2000), "Indent": $('t-indent').value});
    }
  });
  CK.wireCtrlEnter('btn-fmt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { return _raw; }, 'json-formatter-output.json');
  CK.setUsageContent('<ol><li>Paste raw or minified JSON into the input field.</li><li>Click <strong>Format</strong> to beautify with syntax highlighting.</li><li>Use the <strong>tree view</strong> to collapse and expand individual nodes.</li><li>Click any key to copy its JSON path.</li><li>Use <strong>Search</strong> to find keys in large JSON objects.</li></ol><h3>What does this tool do?</h3><p>The JSON Formatter validates your JSON for syntax errors and displays it in a readable, indented format with colour-coded keys, strings, numbers, and booleans. The collapsible tree view lets you navigate large JSON structures without scrolling through thousands of lines.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='{"name":"John","age":30,"city":"New York","hobbies":["reading","coding"]}';inp.dispatchEvent(new Event('input'));var b=$('btn-fmt');if(b)b.click();}})();
})();