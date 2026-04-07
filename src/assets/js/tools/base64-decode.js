/**
 * CipherKit — Base64 Decoder
 */
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
    upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
  };

  function $(id) { return document.getElementById(id); }

  var sty = document.createElement('style');
  sty.textContent =
    '.b64-drop{border:2px dashed var(--border);border-radius:8px;padding:16px;text-align:center;color:var(--muted);font-size:12px;cursor:pointer;transition:all .2s;margin-bottom:12px}'
    + '.b64-drop:hover,.b64-drop.drag-over{border-color:var(--blue);color:var(--blue);background:rgba(88,166,255,.04)}'
    + '.b64-drop input[type=file]{display:none}'
    + '.b64-drop svg{width:20px;height:20px;vertical-align:middle;margin-right:6px}'
    + '.b64-bin-warn{background:rgba(232,160,32,.08);border:1px solid rgba(232,160,32,.25);border-radius:var(--r);padding:10px 14px;margin-top:10px;font-size:12px;color:#e8a020;display:none}'
    + '.b64-bin-dl{display:none;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--blue);background:transparent;border:1px solid var(--blue);border-radius:6px;padding:6px 14px;cursor:pointer;font-family:var(--mono);transition:all .15s}'
    + '.b64-bin-dl:hover{background:rgba(88,166,255,.08)}'
    + '.b64-bin-dl svg{width:14px;height:14px}';
  document.head.appendChild(sty);

  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-blue">' + IC.code + '</div><h2 id="t-heading">Base64 Decoder</h2></div>'
    +     '<span class="tc-badge tc-badge-blue">Decode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="b64-drop" id="drop-zone">' + IC.upload + ' Drop a Base64 file here or <strong>Browse</strong><input type="file" id="file-input" accept=".txt,.b64,.pem,.crt,.key"></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Base64 Input</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear input">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste Base64 string to decode\u2026" rows="5" spellcheck="false"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-blue" id="btn-dec" aria-label="Decode Base64">' + IC.code + ' <span>Decode</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Decoded Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy result">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">\u21C4 <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Decoded output will appear here\u2026</div></div>'
    +     '<div class="b64-bin-warn" id="bin-warn">\u26A0\uFE0F This is binary data (image, PDF, etc.) and cannot be displayed as readable text. Use the download button to recover the original file.</div>'
    +     '<button type="button" class="b64-bin-dl" id="btn-bin-dl">' + IC.dl + ' <span>Download decoded file</span></button>'
    +   '</div>'
    + '</div>'
    + '</div>';

  function isPlaceholder() { return $('t-result').textContent.indexOf('appear') !== -1; }

  var _lastRaw = null; /* stores raw atob output for binary download */

  function resetOutput() {
    $('t-result').className = 'out-body mono ph';
    $('t-result').textContent = 'Decoded output will appear here\u2026';
    $('t-result').style.color = '';
    $('bin-warn').style.display = 'none';
    $('btn-bin-dl').style.display = 'none';
    _lastRaw = null;
  }

  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    resetOutput();
  });
  CK.wireCopy($('btn-cp'), function () { return isPlaceholder() ? '' : $('t-result').textContent; });
  CK.initAutoGrow($('t-input'));

  /* ── Robust decode — handles text AND binary ── */
  function decodeBase64(input) {
    var cleaned = input.trim();

    /* Strip data URI prefix if user pasted the full data URL */
    if (cleaned.indexOf('data:') === 0) {
      cleaned = cleaned.split(',')[1] || cleaned;
    }

    /* Remove all whitespace and newlines */
    cleaned = cleaned.replace(/\s/g, '');

    /* Convert URL-safe Base64 to standard */
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');

    /* Add padding if missing */
    var pad = cleaned.length % 4;
    if (pad === 2) cleaned += '==';
    else if (pad === 3) cleaned += '=';

    /* Decode */
    var raw;
    try { raw = atob(cleaned); } catch (e) {
      throw new Error('Invalid Base64 \u2014 could not decode. Check your input.');
    }

    /* Try UTF-8 text decode first */
    try {
      var pct = '';
      for (var i = 0; i < raw.length; i++) {
        pct += '%' + ('00' + raw.charCodeAt(i).toString(16)).slice(-2);
      }
      var decoded = decodeURIComponent(pct);
      return { type: 'text', value: decoded, raw: raw };
    } catch (e) {
      /* Binary data — cannot display as text */
      return {
        type: 'binary',
        value: '[Binary data \u2014 this appears to be a file (image, PDF, etc.), not text.\nBinary files cannot be displayed as readable text.]',
        raw: raw
      };
    }
  }

  function doDecode() {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    $('bin-warn').style.display = 'none';
    $('btn-bin-dl').style.display = 'none';
    _lastRaw = null;

    if (!input) {
      $('t-err').textContent = 'Please enter Base64 to decode.';
      $('t-err').style.display = 'block';
      return;
    }

    try {
      var result = decodeBase64(input);
      _lastRaw = result.raw;

      if (result.type === 'text') {
        $('t-result').className = 'out-body mono b';
        $('t-result').style.color = '';
        $('t-result').textContent = result.value;
        CK.toast('Base64 decoded');
      } else {
        /* Binary */
        $('t-result').className = 'out-body mono';
        $('t-result').style.color = '#e8a020';
        $('t-result').textContent = result.value;
        $('bin-warn').style.display = 'block';
        $('btn-bin-dl').style.display = 'inline-flex';
        CK.toast('Binary data detected');
      }
    } catch (e) {
      $('t-result').className = 'out-body err';
      $('t-result').textContent = e.message;
      $('t-result').style.color = '';
    }
  }
  $('btn-dec').addEventListener('click', doDecode);

  /* Binary download */
  $('btn-bin-dl').addEventListener('click', function () {
    if (!_lastRaw) return;
    var bytes = new Uint8Array(_lastRaw.length);
    for (var i = 0; i < _lastRaw.length; i++) {
      bytes[i] = _lastRaw.charCodeAt(i);
    }
    var blob = new Blob([bytes]);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'decoded-file';
    a.click();
    URL.revokeObjectURL(url);
    CK.toast('File downloaded');
  });

  /* File upload (read as text → paste into input) */
  function handleFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      $('t-input').value = reader.result || '';
      $('t-input').dispatchEvent(new Event('input'));
      CK.toast('File loaded');
    };
    reader.readAsText(file);
  }
  $('file-input').addEventListener('change', function () { if (this.files[0]) handleFile(this.files[0]); });
  var dz = $('drop-zone');
  dz.addEventListener('click', function () { $('file-input').click(); });
  dz.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  dz.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  dz.addEventListener('drop', function (e) { e.preventDefault(); this.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

  /* Swap */
  $('btn-swap').addEventListener('click', function () {
    var ov = isPlaceholder() ? '' : $('t-result').textContent;
    if (!ov) return;
    $('t-input').value = ov; $('t-input').dispatchEvent(new Event('input'));
    $('t-input').scrollIntoView({ behavior: 'smooth', block: 'start' });
    CK.toast('Output moved to input');
  });

  CK.wireCtrlEnter('btn-dec');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () {
    if (isPlaceholder()) return '';
    /* For text results, return the text; for binary, return empty (user should use binary download button) */
    var txt = $('t-result').textContent;
    return (txt.indexOf('Binary data') === 0 || txt.indexOf('[Binary') === 0) ? '' : txt;
  }, 'base64-decode-output.txt');


  CK.setUsageContent('<ol><li><strong>Paste a Base64 string</strong> into the input field.</li><li>Click <strong>Decode</strong> to convert back to plain text.</li></ol><p>Supports both standard and URL-safe Base64 input. The decoder automatically handles missing padding and URL-safe character substitutions.</p>');

  /* sessionStorage transfer from encoder */
  (function () {
    try {
      var transferred = sessionStorage.getItem('ck_b64_transfer');
      if (transferred) {
        sessionStorage.removeItem('ck_b64_transfer');
        $('t-input').value = transferred;
        doDecode();
        return;
      }
    } catch (_) {}
    /* Default sample */
    var inp = $('t-input');
    if (inp && !inp.value) { inp.value = 'SGVsbG8sIFdvcmxkIQ=='; doDecode(); }
  })();

  /* Live decode */
  (function () { var dt; $('t-input').addEventListener('input', function () { clearTimeout(dt); dt = setTimeout(doDecode, 150); }); })();
})();
