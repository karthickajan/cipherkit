/**
 * CipherKit — ui.js
 * Shared UI utilities loaded on every page.
 * Tools call these via window.CK.*
 */

(function () {
  'use strict';

  /* ── TOAST ────────────────────────────────────────────────────────────── */
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

  /* ── CLIPBOARD ────────────────────────────────────────────────────────── */
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

  /* ── PASSWORD STRENGTH ────────────────────────────────────────────────── */
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

  /* ── MODE TABS ────────────────────────────────────────────────────────── */
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

  /* ── COPY BUTTON WIRING ───────────────────────────────────────────────── */
  function wireCopy(btnEl, getTextFn) {
    if (!btnEl) return;
    btnEl.addEventListener('click', () => copyText(getTextFn(), btnEl));
  }

  /* ── TEXTAREA AUTO-GROW ───────────────────────────────────────────────── */
  function autoGrow(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 400) + 'px';
  }

  function initAutoGrow(ta) {
    if (!ta) return;
    ta.addEventListener('input', () => autoGrow(ta));
  }

  /* ── PASSWORD TOGGLE ──────────────────────────────────────────────────── */
  function wirePassToggle(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;
    btnEl.addEventListener('click', () => {
      const show = inputEl.type === 'password';
      inputEl.type = show ? 'text' : 'password';
      btnEl.title  = show ? 'Hide' : 'Show';
      btnEl.setAttribute('aria-label', show ? 'Hide key' : 'Show key');
    });
  }

  /* ── SET USAGE CONTENT ────────────────────────────────────────────────── */
  function setUsageContent(html) {
    const el = document.getElementById('usage-content');
    if (el) el.innerHTML = html;
  }

  /* ── DOWNLOAD OUTPUT ──────────────────────────────────────────────────── */
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

  /* ── CTRL+ENTER SHORTCUT ──────────────────────────────────────────────── */
  function wireCtrlEnter(btnId) {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        var btn = document.getElementById(btnId);
        if (btn) { e.preventDefault(); btn.click(); }
      }
    });
  }

  /* ── CHAR / BYTE COUNTER ──────────────────────────────────────────────── */
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

  /* ── ACTIVE NAV LINK ──────────────────────────────────────────────────── */
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

  /* ── MOBILE HAMBURGER MENU ────────────────────────────────────────────── */
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

  /* ── STAR PROMPT (GitHub star ask after first copy) ─────────────────── */
  (function () {
    var s = document.createElement('style');
    s.textContent =
      '.ck-star-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);z-index:9999;background:#111;border:1px solid rgba(0,255,136,.27);border-radius:8px;padding:12px 20px;display:flex;align-items:center;gap:12px;font-size:.875rem;color:#ccc;opacity:0;pointer-events:none;transition:transform .4s cubic-bezier(.4,0,.2,1),opacity .4s ease;white-space:nowrap;max-width:calc(100vw - 48px)}'
      + '.ck-star-toast.show{transform:translateX(-50%) translateY(0);opacity:1;pointer-events:auto}'
      + '.ck-star-toast.hide{transform:translateX(-50%) translateY(80px);opacity:0;pointer-events:none}'
      + '.ck-star-toast a{color:#00ff88;font-weight:600;text-decoration:none}'
      + '.ck-star-toast a:hover{text-decoration:underline}'
      + '.ck-star-toast button{background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:0 0 0 4px;line-height:1}'
      + '.ck-star-toast button:hover{color:#ccc}';
    document.head.appendChild(s);
  })();

  function starPrompt(toolSlug) {
    /* Gate 1: already shown for this tool in this session */
    var sessionKey = 'ck_asked_star_' + toolSlug;
    if (sessionStorage.getItem(sessionKey)) return;

    /* Gate 2: already shown for ANY tool today */
    var dateKey = 'ck_star_asked_date';
    var today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(dateKey) === today) return;

    /* Mark flags immediately so duplicate calls are ignored */
    sessionStorage.setItem(sessionKey, '1');
    localStorage.setItem(dateKey, today);

    setTimeout(function () {
      var el = document.createElement('div');
      el.className = 'ck-star-toast';
      el.innerHTML = '\u2728 Glad it helped! &nbsp;<a href="https://github.com/karthickajan/cipherkit" target="_blank" rel="noopener">\u2b50 Star CipherKit on GitHub</a><button type="button" aria-label="Close">\u2715</button>';
      document.body.appendChild(el);

      /* slide up */
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); }); });

      function dismiss() {
        el.classList.remove('show');
        el.classList.add('hide');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
      }

      el.querySelector('button').addEventListener('click', dismiss);

      /* auto-dismiss after 8 s */
      setTimeout(dismiss, 8000);
    }, 1500);
  }

  /* ── NAV SEARCH ────────────────────────────────────────────────────────── */
  (function initNavSearch() {
    var searchInput = document.getElementById('nav-search');
    var dropdown = document.getElementById('nav-search-results');
    if (!searchInput || !dropdown) return;

    var tools = null;

    /* Lazy-load tools.json on first interaction */
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
        dropdown.innerHTML = '<div style="padding:12px 14px;color:#666;font-size:.85rem">No results found</div>';
        dropdown.hidden = false;
        return;
      }

      var re;
      try { re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); } catch (_) { re = null; }

      dropdown.innerHTML = results.map(function (t) {
        var name = re ? t.title.replace(re, '<mark>$1</mark>') : t.title;
        return '<a class="nav-search-result" href="/tools/' + t.slug + '/">'
          + name
          + '<span style="font-size:.75rem;color:#666;display:block;margin-top:2px">'
          + (t.tagline || '') + '</span></a>';
      }).join('');
      dropdown.hidden = false;
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.hidden = true;
      }
    });

    /* Keyboard navigation */
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

  /* ── GITHUB STAR COUNT ────────────────────────────────────────────────── */
  (function fetchStarCount() {
    var el = document.getElementById('gh-star-count');
    if (!el) return;
    fetch('https://api.github.com/repos/karthickajan/cipherkit')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.stargazers_count > 0) {
          el.textContent = 'Bookmark (' + data.stargazers_count + ' ★)';
        }
      })
      .catch(function () {});
  })();

  /* ── PUBLIC API ───────────────────────────────────────────────────────── */
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
    starPrompt,
  };

})();
