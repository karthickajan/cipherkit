/**
 * CipherKit — ck-state.js
 * Handles URL permalinks, recently-used tools, and per-tool history.
 * Loaded on every page (tool pages + homepage).
 *
 * localStorage keys:
 *   ck_recent  — last 5 tool slugs+names (≈300B)
 *   ck_hist    — last 20 history entries across all tools (≈4KB)
 *
 * No tool JS files need modification — this module is fully config-driven.
 */
(function () {
  'use strict';

  /* ── localStorage helpers ─────────────────────────────────────────────── */
  function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function lsSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* quota / private */ } }
  function lsGetJSON(key) { try { var v = lsGet(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsSetJSON(key, val) { lsSet(key, JSON.stringify(val)); }

  /* ── Slug from URL ────────────────────────────────────────────────────── */
  function getSlug() {
    var m = location.pathname.match(/\/tools\/([a-z0-9-]+)\/?$/);
    if (!m) return null;
    /* Exclude category hub slugs */
    var hubs = ['crypto','encoding','dev','converter','image','privacy-policy'];
    if (hubs.indexOf(m[1]) !== -1) return null;
    return m[1];
  }

  var SLUG = getSlug();
  var IS_TOOL_PAGE = !!SLUG;
  var IS_HOMEPAGE = /\/cipherkit\/?$/.test(location.pathname) || location.pathname === '/cipherkit/index.html';

  /* ── SVG Icons ────────────────────────────────────────────────────────── */
  var IC_LINK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  /* ════════════════════════════════════════════════════════════════════════
   *  TOOL CONFIG — maps slug → { inputs, selects, runBtn, outputEl, skip }
   *
   *  inputs:  array of {id, param} — text/textarea inputs to serialize
   *  selects: array of {id, param} — select dropdowns to serialize
   *  runBtn:  id of the button to click for auto-run
   *  outputEl: id of the output element (to read output preview for history)
   *  skip:    true → skip permalink & history (image/file/color tools)
   * ════════════════════════════════════════════════════════════════════════ */
  var TOOL_CFG = {
    /* ── Crypto ── */
    'aes-encryption':      { inputs: [{id:'enc-plain',param:'i'},{id:'enc-key',param:'k'}], selects: [{id:'enc-keysize',param:'s'},{id:'enc-mode',param:'m'},{id:'enc-output',param:'f'}], runBtn:'btn-enc', outputEl:'enc-result', sensitive:['k'] },
    'aes-decryption':      { inputs: [{id:'dec-cipher',param:'i'},{id:'dec-key',param:'k'},{id:'dec-iv',param:'v'}], selects: [{id:'dec-keysize',param:'s'},{id:'dec-mode',param:'m'},{id:'dec-fmt',param:'f'}], runBtn:'btn-dec', outputEl:'dec-result', sensitive:['k','v'] },
    'sha256-generator':    { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'sha512-generator':    { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'sha1-generator':      { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'sha3-generator':      { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-bits',param:'b'},{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'md5-generator':       { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'ripemd160-generator': { inputs: [{id:'h-input',param:'i'}], selects: [{id:'h-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'h-result' },
    'hmac-generator':      { inputs: [{id:'hm-msg',param:'i'},{id:'hm-key',param:'k'}], selects: [{id:'hm-algo',param:'a'},{id:'hm-fmt',param:'f'}], runBtn:'btn-gen', outputEl:'hm-result', sensitive:['k'] },
    'rsa-key-generator':   { inputs: [], selects: [{id:'r-bits',param:'b'},{id:'r-hash',param:'h'}], runBtn:'btn-gen', outputEl:'r-pub' },
    'hash-comparator':     { inputs: [{id:'hc-a',param:'i'},{id:'hc-b',param:'i2'}], selects: [{id:'hc-case',param:'c'}], runBtn:'btn-cmp', outputEl:'hc-result' },
    'checksum-generator':  { inputs: [{id:'cs-input',param:'i'}], selects: [], runBtn:'btn-gen', outputEl:'cs-results' },
    'bcrypt-generator':    { inputs: [{id:'b-pass',param:'i'}], selects: [{id:'b-rounds',param:'r'}], runBtn:'btn-hash', outputEl:'b-result', sensitive:['i'] },
    'rsa-encrypt-decrypt': { inputs: [{id:'enc-key',param:'k'},{id:'enc-input',param:'i'}], selects: [], runBtn:'btn-enc', outputEl:'enc-result', sensitive:['k'] },
    'password-strength':   { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:null, outputEl:'t-result', pwWarn:true },
    'totp-generator':      { inputs: [{id:'t-secret',param:'i'}], selects: [{id:'t-digits',param:'d'},{id:'t-period',param:'p'}], runBtn:'btn-gen', outputEl:'t-result', sensitive:['i'] },
    'ssl-cert-decoder':    { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'jwt-builder':         { inputs: [{id:'t-payload',param:'i'},{id:'t-secret',param:'k'}], selects: [{id:'t-alg',param:'a'}], runBtn:'btn-sign', outputEl:'t-output', sensitive:['k'] },

    /* ── Encoding ── */
    'base64-encode':       { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-mode',param:'m'},{id:'t-newline',param:'n'}], runBtn:'btn-enc', outputEl:'t-result' },
    'base64-decode':       { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'url-encode':          { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-enc', outputEl:'t-result' },
    'url-decode':          { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'html-encode':         { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-enc', outputEl:'t-result' },
    'html-decode':         { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'hex-encode':          { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-sep',param:'s'},{id:'t-case',param:'c'}], runBtn:'btn-enc', outputEl:'t-result' },
    'hex-decode':          { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'binary-encode':       { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-bits',param:'b'},{id:'t-sep',param:'s'}], runBtn:'btn-enc', outputEl:'t-result' },
    'binary-decode':       { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-result' },
    'json-formatter':      { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-indent',param:'n'}], runBtn:'btn-fmt', outputEl:'t-result' },
    'json-minifier':       { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-min', outputEl:'t-result' },
    'json-schema-validator':{ inputs: [{id:'t-schema',param:'i'},{id:'t-data',param:'i2'}], selects: [], runBtn:'btn-val', outputEl:'t-result' },

    /* ── Converter ── */
    'xml-json-converter':  { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-conv', outputEl:'t-result' },
    'json-xml-converter':  { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-root',param:'r'}], runBtn:'btn-conv', outputEl:'t-result' },
    'csv-json-converter':  { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-mode',param:'m'},{id:'t-delim',param:'d'}], runBtn:'btn-conv', outputEl:'t-result' },
    'yaml-json-converter': { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-mode',param:'m'}], runBtn:'btn-conv', outputEl:'t-result' },
    'json-to-csv':         { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-conv', outputEl:'t-result' },
    'json-to-yaml':        { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-conv', outputEl:'t-result' },
    'number-base-converter':{ inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-from',param:'f'}], runBtn:'btn-conv', outputEl:'t-result' },
    'decimal-to-hex':      { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-conv', outputEl:'t-result' },
    'hex-to-decimal':      { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-conv', outputEl:'t-result' },

    /* ── Dev ── */
    'jwt-decoder':         { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-dec', outputEl:'t-payload' },
    'jwt-encoder':         { inputs: [{id:'t-payload',param:'i'},{id:'t-secret',param:'k'}], selects: [{id:'t-algo',param:'a'}], runBtn:'btn-enc', outputEl:'t-result', sensitive:['k'] },
    'uuid-generator':      { inputs: [], selects: [{id:'t-count',param:'n'},{id:'t-case',param:'c'},{id:'t-braces',param:'b'}], runBtn:'btn-gen', outputEl:'t-result' },
    'random-password-generator': { inputs: [{id:'t-len',param:'l'}], selects: [], runBtn:'btn-gen', outputEl:'t-result' },
    'random-string-generator':   { inputs: [{id:'t-len',param:'l'},{id:'t-count',param:'n'}], selects: [{id:'t-preset',param:'p'}], runBtn:'btn-gen', outputEl:'t-result' },
    'unix-timestamp-converter':  { inputs: [{id:'t-ts',param:'i'}], selects: [], runBtn:'btn-t2d', outputEl:'t-date-result' },
    'epoch-converter':     { inputs: [{id:'t-epoch',param:'i'}], selects: [], runBtn:'btn-to-date', outputEl:'t-result' },
    'cron-expression-generator': { inputs: [{id:'t-min',param:'mn'},{id:'t-hr',param:'hr'},{id:'t-dom',param:'dm'},{id:'t-mon',param:'mo'},{id:'t-dow',param:'dw'}], selects: [], runBtn:null, outputEl:'t-result' },
    'cron-expression-explainer': { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-exp', outputEl:'t-result' },
    'http-header-parser':  { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-parse', outputEl:'t-result' },
    'regex-tester':        { inputs: [{id:'t-regex',param:'r'},{id:'regex-test-input',param:'i'}], selects: [], runBtn:null, outputEl:'t-result' },
    'lorem-ipsum-generator':{ inputs: [], selects: [{id:'t-type',param:'t'},{id:'t-count',param:'n'}], runBtn:'btn-gen', outputEl:'t-result' },
    'sql-formatter':       { inputs: [{id:'t-input',param:'i'}], selects: [{id:'t-indent',param:'n'}], runBtn:'btn-fmt', outputEl:'t-result' },
    'markdown-preview':    { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:null, outputEl:'t-result' },
    'diff-checker':        { inputs: [{id:'t-left',param:'i'},{id:'t-right',param:'i2'}], selects: [], runBtn:'btn-compare', outputEl:null },
    'word-counter':        { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:null, outputEl:'t-result' },
    'ip-address-tools':    { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-calc', outputEl:'t-result' },
    'dns-lookup':          { inputs: [{id:'t-domain',param:'i'}], selects: [{id:'t-type',param:'t'}], runBtn:'btn-lookup', outputEl:'t-result' },
    'gzip-tool':           { inputs: [{id:'t-input',param:'i'}], selects: [], runBtn:'btn-run', outputEl:'t-output' },
    'ascii-table':         { inputs: [{id:'t-search',param:'i'}], selects: [], runBtn:null, outputEl:null },
    'bit-calculator':      { inputs: [{id:'t-val',param:'i'}], selects: [{id:'t-unit',param:'u'}], runBtn:null, outputEl:'t-result' },

    /* ── Image / File / Color — SKIP ── */
    'color-converter':     { skip: true },
    'color-palette':       { skip: true },
    'qr-generator':        { skip: true },
    'svg-to-png':          { skip: true },
    'image-converter':     { skip: true },
    'image-resizer':       { skip: true },
    'image-enhancer':      { skip: true },
    'png-to-jpg':          { skip: true },
    'jpg-to-png':          { skip: true },
    'png-to-webp':         { skip: true },
    'jpg-to-webp':         { skip: true },
    'webp-to-png':         { skip: true },
    'webp-to-jpg':         { skip: true },
    'docx-to-html':        { skip: true },
    'csv-to-excel':        { skip: true },
    'markdown-to-pdf':     { skip: true },
  };

  /* ════════════════════════════════════════════════════════════════════════
   *  TASK 2 — RECENTLY USED TOOLS
   * ════════════════════════════════════════════════════════════════════════ */
  function recordRecent() {
    if (!IS_TOOL_PAGE || !SLUG) return;
    /* Derive name and hub from page DOM */
    var nameEl = document.querySelector('.tool-header h1');
    var hubEl  = document.querySelector('.breadcrumb a:nth-child(3)');
    var name   = nameEl ? nameEl.textContent.trim() : SLUG;
    var hub    = hubEl  ? hubEl.textContent.trim()   : '';

    var list = lsGetJSON('ck_recent') || [];
    /* Remove duplicate */
    list = list.filter(function (e) { return e.slug !== SLUG; });
    /* Prepend */
    list.unshift({ slug: SLUG, name: name, hub: hub });
    /* Max 5 */
    if (list.length > 5) list = list.slice(0, 5);
    lsSetJSON('ck_recent', list);
  }

  function renderRecentOnHomepage() {
    /* Homepage now renders recent tools via its own inline script.
       This function is kept as a no-op for compatibility. */
  }


  /* ════════════════════════════════════════════════════════════════════════
   *  TASK 3 — TOOL HISTORY
   * ════════════════════════════════════════════════════════════════════════ */
  function getHistory() { return lsGetJSON('ck_hist') || []; }

  function saveHistory(inputPreview, outputPreview) {
    if (!SLUG) return;
    var list = getHistory();
    /* FIFO: keep last 19, then push */
    if (list.length >= 20) list = list.slice(list.length - 19);
    list.push({
      t: SLUG,
      i: (inputPreview || '').substring(0, 80),
      o: (outputPreview || '').substring(0, 80),
      ts: Date.now()
    });
    lsSetJSON('ck_hist', list);
    /* Re-render if history section exists */
    renderHistory();
  }

  function timeAgo(ts) {
    var diff = (Date.now() - ts) / 1000;
    if (diff < 60)    return Math.floor(diff) + 's ago';
    if (diff < 3600)  return Math.floor(diff / 60) + 'min ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 172800) return 'yesterday';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function renderHistory() {
    if (!IS_TOOL_PAGE || !SLUG) return;
    var all = getHistory();
    var entries = all.filter(function (e) { return e.t === SLUG; }).slice(-5).reverse();

    var section = document.getElementById('ck-hist-section');

    if (!entries.length) {
      if (section) section.style.display = 'none';
      return;
    }

    if (!section) {
      /* Create history section below tool interface */
      section = document.createElement('div');
      section.id = 'ck-hist-section';
      section.className = 'ck-hist-section';
      var wrap = document.querySelector('.tool-interface-wrap');
      if (wrap) wrap.appendChild(section);
      else return;
    }

    section.style.display = '';
    section.innerHTML =
      '<button type="button" class="ck-hist-toggle" id="ck-hist-toggle">\u25B8 History (' + entries.length + ')</button>'
      + '<div class="ck-hist-list" id="ck-hist-list" style="display:none">'
      + entries.map(function (e, idx) {
          return '<div class="ck-hist-entry" data-idx="' + idx + '">'
            + '<span class="ck-hist-in" title="' + e.i.replace(/"/g, '&quot;') + '">' + (e.i || '\u2014') + '</span>'
            + '<span class="ck-hist-arrow">\u2192</span>'
            + '<span class="ck-hist-out" title="' + e.o.replace(/"/g, '&quot;') + '">' + (e.o || '\u2014') + '</span>'
            + '<span class="ck-hist-time">' + timeAgo(e.ts) + '</span>'
            + '</div>';
        }).join('')
      + '<button type="button" class="ck-hist-clear" id="ck-hist-clear">Clear history</button>'
      + '</div>';

    /* Toggle */
    document.getElementById('ck-hist-toggle').addEventListener('click', function () {
      var list = document.getElementById('ck-hist-list');
      var open = list.style.display !== 'none';
      list.style.display = open ? 'none' : '';
      this.textContent = (open ? '\u25B8' : '\u25BE') + ' History (' + entries.length + ')';
    });

    /* Click entry → fill input + rerun (skip for redacted/sensitive tools) */
    var cfg = TOOL_CFG[SLUG];
    var isRedacted = !!HIST_REDACT[SLUG];
    section.querySelectorAll('.ck-hist-entry').forEach(function (el) {
      if (isRedacted) {
        el.style.cursor = 'default';
        return; /* no click handler for sensitive tools */
      }
      el.addEventListener('click', function () {
        var idx = parseInt(el.dataset.idx, 10);
        var entry = entries[idx];
        if (!entry || !cfg || cfg.skip) return;
        /* Fill first input */
        if (cfg.inputs && cfg.inputs.length) {
          var inp = document.getElementById(cfg.inputs[0].id);
          if (inp) { inp.value = entry.i; inp.dispatchEvent(new Event('input')); }
        }
        /* Click run button */
        if (cfg.runBtn) {
          var btn = document.getElementById(cfg.runBtn);
          if (btn) btn.click();
        }
      });
    });

    /* Clear history */
    document.getElementById('ck-hist-clear').addEventListener('click', function () {
      var all2 = getHistory();
      var filtered = all2.filter(function (e) { return e.t !== SLUG; });
      lsSetJSON('ck_hist', filtered);
      renderHistory();
    });
  }


  /* ════════════════════════════════════════════════════════════════════════
   *  TASK 1 — URL STATE PERMALINKS
   * ════════════════════════════════════════════════════════════════════════ */
  var _urlTimer = null;
  var DEBOUNCE = 600;
  var MAX_PARAM = 500;

  function serializeToURL(cfg) {
    if (!cfg || cfg.skip) return;
    var params = new URLSearchParams();
    var hasVal = false;
    var blocked = cfg.sensitive || [];

    (cfg.inputs || []).forEach(function (inp) {
      if (blocked.indexOf(inp.param) !== -1) return; /* skip sensitive */
      var el = document.getElementById(inp.id);
      if (!el) return;
      var v = (el.value || '').substring(0, MAX_PARAM);
      if (v) { params.set(inp.param, v); hasVal = true; }
    });

    (cfg.selects || []).forEach(function (sel) {
      if (blocked.indexOf(sel.param) !== -1) return; /* skip sensitive */
      var el = document.getElementById(sel.id);
      if (!el) return;
      var v = el.value;
      /* Only set if not default (first option) */
      if (v && el.selectedIndex > 0) { params.set(sel.param, v); hasVal = true; }
    });

    var qs = hasVal ? '?' + params.toString() : location.pathname;
    try { history.replaceState(null, '', qs); } catch (e) { /* ignore */ }
  }

  function debounceSerialize(cfg) {
    clearTimeout(_urlTimer);
    _urlTimer = setTimeout(function () { serializeToURL(cfg); }, DEBOUNCE);
  }

  function restoreFromURL(cfg) {
    if (!cfg || cfg.skip) return false;
    var params = new URLSearchParams(location.search);
    if (!params.toString()) return false;
    var restored = false;
    var blocked = cfg.sensitive || [];
    var hadSensitive = false;

    (cfg.inputs || []).forEach(function (inp) {
      if (blocked.indexOf(inp.param) !== -1) {
        /* Silently ignore sensitive params from URL */
        if (params.has(inp.param)) hadSensitive = true;
        return;
      }
      var v = params.get(inp.param);
      if (v) {
        var el = document.getElementById(inp.id);
        if (el) { el.value = v; el.dispatchEvent(new Event('input')); restored = true; }
      }
    });

    (cfg.selects || []).forEach(function (sel) {
      if (blocked.indexOf(sel.param) !== -1) {
        if (params.has(sel.param)) hadSensitive = true;
        return;
      }
      var v = params.get(sel.param);
      if (v) {
        var el = document.getElementById(sel.id);
        if (el) {
          /* Find matching option */
          for (var j = 0; j < el.options.length; j++) {
            if (el.options[j].value === v) {
              el.selectedIndex = j;
              el.dispatchEvent(new Event('change'));
              restored = true;
              break;
            }
          }
        }
      }
    });

    /* Clean sensitive params from URL */
    if (hadSensitive) {
      blocked.forEach(function (p) { params.delete(p); });
      var clean = params.toString();
      try { history.replaceState(null, '', clean ? '?' + clean : location.pathname); } catch (e) {}
    }

    return restored;
  }

  function wirePermalinkListeners(cfg) {
    if (!cfg || cfg.skip) return;

    (cfg.inputs || []).forEach(function (inp) {
      var el = document.getElementById(inp.id);
      if (el) el.addEventListener('input', function () { debounceSerialize(cfg); });
    });

    (cfg.selects || []).forEach(function (sel) {
      var el = document.getElementById(sel.id);
      if (el) el.addEventListener('change', function () { debounceSerialize(cfg); });
    });
  }

  /* ── Copy Link Button ────────────────────────────────────────────────── */
  function addCopyLinkBtn() {
    if (!IS_TOOL_PAGE) return;
    var h1 = document.querySelector('.tool-header h1');
    if (!h1) return;

    var cfg = TOOL_CFG[SLUG] || {};
    var hasSensitive = cfg.sensitive && cfg.sensitive.length > 0;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ck-copy-link';
    btn.setAttribute('aria-label', 'Copy link to this tool');
    btn.title = hasSensitive
      ? 'Key and IV are not included in the shared link for security.'
      : 'Copy permalink';
    btn.innerHTML = IC_LINK;

    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(location.href).then(function () {
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.classList.add('ck-copied');
        setTimeout(function () {
          btn.innerHTML = IC_LINK;
          btn.classList.remove('ck-copied');
        }, 1500);
      }).catch(function () { /* ignore */ });
    });

    h1.appendChild(btn);
  }

  /* ── Password-strength URL warning ──────────────────────────────────── */
  function addPwWarn() {
    if (!IS_TOOL_PAGE || !SLUG) return;
    var cfg = TOOL_CFG[SLUG];
    if (!cfg || !cfg.pwWarn) return;
    var params = new URLSearchParams(location.search);
    if (!params.get('i')) return;
    /* Console warning */
    console.warn('[CipherKit] Password shared via URL - this may appear in browser history');
    /* Amber notice under input */
    var inp = document.getElementById('t-input');
    if (!inp) return;
    var notice = document.createElement('div');
    notice.style.cssText = 'font-size:12px;color:#fb923c;margin-top:4px;display:flex;align-items:center;gap:4px;';
    notice.innerHTML = '\u26A0 Sharing this link includes your input \u2014 avoid for real passwords.';
    inp.parentNode.insertBefore(notice, inp.nextSibling);
  }


  /* ════════════════════════════════════════════════════════════════════════
   *  HISTORY REDACTION — sensitive tools get redacted previews
   * ════════════════════════════════════════════════════════════════════════ */
  var HIST_REDACT = {
    'aes-encryption':      { i: function(v){ return '[plaintext \xB7 ' + v.length + ' chars]'; }, o: null },
    'aes-decryption':      { i: function(v){ return '[ciphertext \xB7 ' + v.length + ' chars]'; }, o: function(){ return '[decrypted]'; } },
    'bcrypt-generator':    { i: function(){ return '[password]'; }, o: null },
    'jwt-encoder':         { i: function(){ return '[payload]'; }, o: null },
    'jwt-builder':         { i: function(){ return '[payload]'; }, o: null },
    'hmac-generator':      { i: function(){ return '[message]'; }, o: null },
    'totp-generator':      { i: function(){ return '[secret]'; }, o: null },
    'rsa-encrypt-decrypt': { i: function(){ return '[input]'; }, o: function(){ return '[output]'; } },
  };


  /* ════════════════════════════════════════════════════════════════════════
   *  HISTORY HOOK — intercept CK.toast to detect successful runs
   * ════════════════════════════════════════════════════════════════════════ */
  function hookToastForHistory(cfg) {
    if (!cfg || cfg.skip || !IS_TOOL_PAGE) return;

    var origToast = window.CK && window.CK.toast;
    if (!origToast) return;

    window.CK.toast = function (msg, type) {
      /* Call original first */
      origToast.call(window.CK, msg, type);

      /* Only record on success (not error) */
      if (type === 'err') return;

      /* Get input preview from first input */
      var inpPreview = '';
      if (cfg.inputs && cfg.inputs.length) {
        var inpEl = document.getElementById(cfg.inputs[0].id);
        if (inpEl) inpPreview = inpEl.value || '';
      }

      /* Get output preview */
      var outPreview = '';
      if (cfg.outputEl) {
        var outEl = document.getElementById(cfg.outputEl);
        if (outEl) {
          outPreview = outEl.textContent || '';
          /* Skip placeholder text */
          if (outPreview.indexOf('appear') !== -1 || outPreview.indexOf('Click') !== -1) outPreview = '';
        }
      }

      /* Apply redaction for sensitive tools */
      var redact = HIST_REDACT[SLUG];
      if (redact) {
        if (redact.i) inpPreview = redact.i(inpPreview);
        if (redact.o) outPreview = redact.o(outPreview);
      }

      /* Only save if we have input or output */
      if (inpPreview || outPreview) {
        saveHistory(inpPreview, outPreview);
      }
    };
  }


  /* ════════════════════════════════════════════════════════════════════════
   *  INIT — run after DOM + tool JS have loaded
   * ════════════════════════════════════════════════════════════════════════ */
  function init() {
    /* Record recent tool visit */
    if (IS_TOOL_PAGE) recordRecent();

    /* Render recent tools on homepage */
    if (IS_HOMEPAGE) { renderRecentOnHomepage(); return; }

    /* Tool page logic */
    if (!IS_TOOL_PAGE || !SLUG) return;

    var cfg = TOOL_CFG[SLUG];
    if (!cfg || cfg.skip) {
      /* Even for skipped tools, add copy link button */
      addCopyLinkBtn();
      renderHistory();
      return;
    }

    /* Add copy link button */
    addCopyLinkBtn();

    /* Password-strength URL warning */
    addPwWarn();

    /* Restore URL params and auto-run */
    var restored = restoreFromURL(cfg);
    if (restored && cfg.runBtn) {
      /* Small delay to let tool JS initialize */
      setTimeout(function () {
        var btn = document.getElementById(cfg.runBtn);
        if (btn) btn.click();
      }, 100);
    }

    /* Wire permalink listeners */
    wirePermalinkListeners(cfg);

    /* Hook toast for history */
    hookToastForHistory(cfg);

    /* Render existing history */
    renderHistory();
  }

  /* Wait for DOMContentLoaded + slight delay to ensure tool JS has rendered */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 150); });
  } else {
    setTimeout(init, 150);
  }

})();
