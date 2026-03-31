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
  };

})();
