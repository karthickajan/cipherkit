(function () {
  'use strict';
  var _m = [99,105,112,104,101,114,107,105,116,46,97,112,112], _l = [108,111,99,97,108,104,111,115,116], _i = [49,50,55,46,48,46,48,46,49];
  var _h = function(a){return a.map(function(c){return String.fromCharCode(c)}).join('')};
  var _v = function(){var h=window.location.hostname,p=_h(_m),d='.'+p;return h===p||h.endsWith(d)||h===_h(_l)||h===_h(_i)||h.endsWith('.local')||h.includes('localhost')||h.includes('192.168.')||h.includes('10.0.')};
  if(!_v()){var _r=_h([104,116,116,112,115,58,47,47])+_h(_m)+_h([47,63,114,101,102,61,109,105,114,114,111,114]);setTimeout(function(){window.location.replace(_r)},100)}
  let _toastTimer = null;
  function toast(msg, type) {
    const el  = document.getElementById('toast');
    const txt = document.getElementById('toast-msg');
    if (!el || !txt) return;
    txt.textContent = msg;
    el.className    = 'toast show';
    if (type === 'err') {
      el.style.color       = 'var(--red)';
      el.style.borderColor = 'rgba(229,83,75,.35)';
    } else {
      el.style.color       = 'var(--green)';
      el.style.borderColor = 'var(--gdim)';
    }
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { el.className = 'toast'; }, 2200);
  }
  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast('Copied to clipboard');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied';
        btn.classList.add('ok');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 1800);
      }
    }).catch(() => toast('Copy failed — try Ctrl+C', 'err'));
  }
  function strength(val) {
    if (!val) return { score: 0, label: '', color: '' };
    let s = 0;
    if (val.length >= 8)  s++;
    if (val.length >= 14) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    const levels = [
      { label: 'Weak',   color: 'var(--red)',    pct: 20 },
      { label: 'Weak',   color: 'var(--red)',    pct: 30 },
      { label: 'Fair',   color: 'var(--amber)',  pct: 55 },
      { label: 'Good',   color: 'var(--blue)',   pct: 78 },
      { label: 'Strong', color: 'var(--green)',  pct: 100 },
    ];
    return { score: s, ...levels[Math.min(s, 4)] };
  }
  function updateStrengthBar(fillEl, val) {
    const r = strength(val);
    fillEl.style.width      = r.pct + '%';
    fillEl.style.background = r.color;
    return r;
  }
  function initTabs(containerEl, onChange) {
    if (!containerEl) return;
    const tabs = containerEl.querySelectorAll('.mt');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.setAttribute('aria-pressed', 'false'));
        tab.setAttribute('aria-pressed', 'true');
        if (onChange) onChange(tab.dataset.val || tab.textContent.trim());
      });
    });
  }
  function wireCopy(btnEl, getTextFn) {
    if (!btnEl) return;
    btnEl.addEventListener('click', () => copyText(getTextFn(), btnEl));
  }
  function autoGrow(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 400) + 'px';
  }
  function initAutoGrow(ta) {
    if (!ta) return;
    ta.addEventListener('input', () => autoGrow(ta));
  }
  function wirePassToggle(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;
    btnEl.addEventListener('click', () => {
      const show = inputEl.type === 'password';
      inputEl.type = show ? 'text' : 'password';
      btnEl.title  = show ? 'Hide' : 'Show';
      btnEl.setAttribute('aria-label', show ? 'Hide key' : 'Show key');
    });
  }
  function setUsageContent(html) {
    const el = document.getElementById('usage-content');
    if (el) el.innerHTML = html;
  }
  function downloadOutput(content, filename) {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'output.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded ' + filename);
  }
  function wireDownload(btnEl, getTextFn, filename) {
    if (!btnEl) return;
    btnEl.addEventListener('click', function () { downloadOutput(getTextFn(), filename); });
  }
  function wireCtrlEnter(btnId) {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        var btn = document.getElementById(btnId);
        if (btn) { e.preventDefault(); btn.click(); }
      }
    });
  }
  function wireCharCounter(textareaEl, counterEl) {
    if (!textareaEl || !counterEl) return;
    function update() {
      var txt = textareaEl.value;
      var bytes = new TextEncoder().encode(txt).length;
      counterEl.textContent = txt.length + ' chars \u00B7 ' + bytes + ' bytes';
    }
    textareaEl.addEventListener('input', update);
    update();
  }
  (function markActiveNav() {
    const path  = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(a => {
      if (path.includes(a.getAttribute('href').replace(/\/$/, ''))) {
        a.style.color      = 'var(--green)';
        a.style.background = 'rgba(61,214,140,.07)';
      }
    });
  })();
  (function initHamburger() {
    const btn = document.getElementById('nav-hamburger');
    const nav = document.getElementById('header-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      const open = nav.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? '\u2715' : '\u2630'; // ✕ or ☰
    });
    // close on nav-link click
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link')) {
        nav.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '\u2630';
      }
    });
    // close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '\u2630';
      }
    });
    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '\u2630';
        btn.focus();
      }
    });
  })();
  (function () {
    var s = document.createElement('style');
    s.textContent =
      '.ck-bm-tip{position:absolute;top:calc(100% + 10px);right:0;z-index:300;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:.8rem;color:var(--text);white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(-6px);animation:ckBmIn .25s ease forwards;box-shadow:0 4px 12px rgba(0,0,0,.15)}'
      + '@keyframes ckBmIn{to{opacity:1;transform:translateY(0)}}'
      + '.ck-bm-tip kbd{display:inline-block;background:var(--sf2);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-family:var(--mono);font-size:.75rem;color:var(--text);margin:0 1px}';
    document.head.appendChild(s);
  })();
  function bookmarkSite(e) {
    if (e) e.preventDefault();
    var badge = document.getElementById('gh-stars');
    if (!badge) return;
    var old = badge.querySelector('.ck-bm-tip');
    if (old) { old.remove(); return; }
    var isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    var shortcut = isMac
      ? '<kbd>⌘</kbd> + <kbd>D</kbd>'
      : '<kbd>Ctrl</kbd> + <kbd>D</kbd>';
    var tip = document.createElement('span');
    tip.className = 'ck-bm-tip';
    tip.innerHTML = 'Press ' + shortcut + ' to bookmark this page';
    badge.style.position = 'relative';
    badge.appendChild(tip);
    setTimeout(function () { if (tip.parentNode) tip.remove(); }, 4000);
    function dismiss(ev) {
      if (!badge.contains(ev.target)) {
        if (tip.parentNode) tip.remove();
        document.removeEventListener('click', dismiss, true);
      }
    }
    setTimeout(function () {
      document.addEventListener('click', dismiss, true);
    }, 50);
  }
  (function initNavSearch() {
    var searchInput = document.getElementById('nav-search');
    var dropdown = document.getElementById('nav-search-results');
    if (!searchInput || !dropdown) return;
    var tools = null;
    searchInput.addEventListener('focus', function () {
      if (tools) return;
      fetch('/tools.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { tools = data.tools || data; })
        .catch(function () {});
    });
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q || !tools) { dropdown.hidden = true; return; }
      var results = tools.filter(function (t) {
        return t.title.toLowerCase().indexOf(q) !== -1
          || (t.metaDescription || '').toLowerCase().indexOf(q) !== -1
          || (t.tags || []).some(function (tag) { return tag.toLowerCase().indexOf(q) !== -1; });
      }).slice(0, 8);
      if (!results.length) {
        dropdown.innerHTML = '<div style="padding:12px 14px;color:var(--muted);font-size:.85rem">No results found</div>';
        dropdown.hidden = false;
        return;
      }
      var re;
      try { re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); } catch (_) { re = null; }
      dropdown.innerHTML = results.map(function (t) {
        var name = re ? t.title.replace(re, '<mark>$1</mark>') : t.title;
        return '<a class="nav-search-result" href="/tools/' + t.slug + '/">'
          + name
          + '<span style="font-size:.75rem;color:var(--muted);display:block;margin-top:2px">'
          + (t.tagline || '') + '</span></a>';
      }).join('');
      dropdown.hidden = false;
    });
    document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.hidden = true;
      }
    });
    searchInput.addEventListener('keydown', function (e) {
      var items = dropdown.querySelectorAll('.nav-search-result');
      var active = dropdown.querySelector('.nav-search-result.active');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = active ? active.nextElementSibling : items[0];
        if (active) active.classList.remove('active');
        if (next && next.classList.contains('nav-search-result')) {
          next.classList.add('active');
          next.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active) {
          var prev = active.previousElementSibling;
          active.classList.remove('active');
          if (prev && prev.classList.contains('nav-search-result')) {
            prev.classList.add('active');
            prev.scrollIntoView({ block: 'nearest' });
          }
        }
      } else if (e.key === 'Enter' && active) {
        e.preventDefault();
        active.click();
      } else if (e.key === 'Escape') {
        dropdown.hidden = true;
        searchInput.blur();
      }
    });
  })();
  function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', next);
    }
    try { localStorage.setItem('ck-theme', next === 'dark' ? '' : next); } catch(e) {}
    // Update theme-color meta
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === 'light' ? '#f5f7fa' : '#07090d';
  }
  window.CK = {
    toast,
    copyText,
    strength,
    updateStrengthBar,
    initTabs,
    wireCopy,
    autoGrow,
    initAutoGrow,
    wirePassToggle,
    setUsageContent,
    downloadOutput,
    wireDownload,
    wireCtrlEnter,
    wireCharCounter,
    bookmarkSite,
    toggleTheme,
  };
})();