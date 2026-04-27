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
    upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function fmtSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(2) + ' MB'; }
  var sty = document.createElement('style');
  sty.textContent =
    '.b64-drop{border:2px dashed var(--border);border-radius:8px;padding:16px;text-align:center;color:var(--muted);font-size:12px;cursor:pointer;transition:all .2s;margin-bottom:12px}'
    + '.b64-drop:hover,.b64-drop.drag-over{border-color:var(--green);color:var(--green);background:rgba(61,214,140,.04)}'
    + '.b64-drop input[type=file]{display:none}'
    + '.b64-drop svg{width:20px;height:20px;vertical-align:middle;margin-right:6px}'
    + '.b64-file-info{font-size:12px;color:var(--green);margin-bottom:8px;display:none}'
    + '.b64-send{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#00ff88;background:transparent;border:1px solid #00ff88;border-radius:6px;padding:6px 14px;cursor:pointer;font-family:var(--mono);transition:all .15s;margin-top:10px}'
    + '.b64-send:hover{background:rgba(0,255,136,.08)}'
    + '.b64-send svg{width:14px;height:14px}';
  document.head.appendChild(sty);
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.code + '</div><h2 id="t-heading">Base64 Encoder</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Encode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="ctrl-row" style="gap:12px;flex-wrap:wrap">'
    +       '<div class="sel-group"><label for="t-mode">Variant</label><select id="t-mode"><option value="std">Standard Base64</option><option value="url">URL-safe Base64</option></select></div>'
    +       '<div class="sel-group"><label for="t-newline">Line endings</label><select id="t-newline"><option value="none">No change</option><option value="lf">Unix LF (\\n)</option><option value="crlf">Windows CRLF (\\r\\n)</option></select></div>'
    +     '</div>'
  +     '<div class="b64-drop" id="drop-zone">' + IC.upload + ' Drop a file here or <strong id="browse-btn" style="cursor:pointer;text-decoration:underline">Browse</strong><input type="file" id="file-input"></div>'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Plain Text</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear input">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Enter text to encode\u2026" rows="5"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-enc" aria-label="Encode to Base64">' + IC.code + ' <span>Encode</span></button>'
    +     '<div class="b64-file-info" id="file-info"></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Base64 Output</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy result">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button><button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">\u21C4 <span>Use as Input</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Encoded output will appear here\u2026</div></div>'
    +     '<button type="button" class="b64-send" id="btn-send">' + IC.send + ' <span>Send to Decoder</span></button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function isPlaceholder() { return $('t-result').textContent.indexOf('appear') !== -1; }
  $('btn-clr').addEventListener('click', function () {
    $('t-input').value = '';
    $('t-result').className = 'out-body mono ph';
    $('t-result').textContent = 'Encoded output will appear here\u2026';
    $('file-info').style.display = 'none';
  });
  CK.wireCopy($('btn-cp'), function () { return isPlaceholder() ? '' : $('t-result').textContent; });
  CK.initAutoGrow($('t-input'));
  function doEncode() {
    var input = $('t-input').value;
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Please enter text to encode.'; $('t-err').style.display = 'block'; return; }
    var nlMode = $('t-newline').value;
    if (nlMode === 'lf') input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    else if (nlMode === 'crlf') input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
    try {
      var encoded = btoa(unescape(encodeURIComponent(input)));
      if ($('t-mode').value === 'url') encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = encoded;
      $('file-info').style.display = 'none';
      CK.toast('Base64 encoded');
    } catch (e) { $('t-result').className = 'out-body err'; $('t-result').textContent = 'Error: ' + e.message; window.CKFeedback && window.CKFeedback.reportError(e.message, {"Input": ($('t-input').value || '').substring(0, 2000), "Variant": $('t-mode').value, "Line Endings": $('t-newline').value}); }
  }
  $('btn-enc').addEventListener('click', doEncode);
  function handleFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var b64 = (reader.result || '').split(',')[1] || '';
      if ($('t-mode').value === 'url') b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = b64;
      $('file-info').textContent = '\uD83D\uDCC4 ' + file.name + ' \u2014 ' + fmtSize(file.size);
      $('file-info').style.display = 'block';
      CK.toast('File encoded to Base64');
    };
    reader.readAsDataURL(file);
  }
  // Remove accept attribute if present (accept all file types)
  $('file-input').removeAttribute('accept');
  // Browse button triggers file input
  $('browse-btn').addEventListener('click', function(e) {
    e.preventDefault();
    $('file-input').click();
  });
  // File input change
  $('file-input').addEventListener('change', function (e) {
    var file = this.files[0];
    if (file) handleFile(file);
    this.value = '';
  });
  // Drop zone click triggers file input
  var dz = $('drop-zone');
  dz.addEventListener('click', function (e) {
    if (e.target.id === 'browse-btn') return;
    $('file-input').click();
  });
  dz.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  dz.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  dz.addEventListener('drop', function (e) { e.preventDefault(); this.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  // Drag and drop on input textarea
  var inputEl = $('t-input');
  inputEl.addEventListener('dragover', function (e) {
    e.preventDefault();
    inputEl.style.borderColor = '#00ff88';
  });
  inputEl.addEventListener('dragleave', function () {
    inputEl.style.borderColor = '';
  });
  inputEl.addEventListener('drop', function (e) {
    e.preventDefault();
    inputEl.style.borderColor = '';
    var file = e.dataTransfer.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      var result = evt.target.result;
      var base64 = result.split(',')[1];
      $('t-result').className = 'out-body mono b';
      $('t-result').textContent = base64;
      // Show file info
      var size = file.size < 1024 ? file.size + ' B' : file.size < 1048576 ? (file.size/1024).toFixed(1) + ' KB' : (file.size/1048576).toFixed(1) + ' MB';
      var info = $('file-info');
      info.textContent = '\uD83D\uDCC4 ' + file.name + ' (' + size + ')';
      info.style.display = 'block';
      CK.toast('File encoded to Base64');
    };
    reader.readAsDataURL(file);
  });
  $('btn-send').addEventListener('click', function () {
    var output = isPlaceholder() ? '' : $('t-result').textContent;
    if (!output) { CK.toast('Nothing to send'); return; }
    try { sessionStorage.setItem('ck_b64_transfer', output); } catch (_) {}
    window.location.href = '/tools/base64-decode/';
  });
  $('btn-swap').addEventListener('click', function () {
    var ov = isPlaceholder() ? '' : $('t-result').textContent;
    if (!ov) return;
    $('t-input').value = ov; $('t-input').dispatchEvent(new Event('input'));
    $('t-input').scrollIntoView({ behavior: 'smooth', block: 'start' });
    CK.toast('Output moved to input');
  });
  $('t-mode').addEventListener('change', function () { if ($('t-input').value) doEncode(); });
  $('t-newline').addEventListener('change', function () { if ($('t-input').value) doEncode(); });
  CK.wireCtrlEnter('btn-enc');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.wireDownload($('btn-dl'), function () { return isPlaceholder() ? '' : $('t-result').textContent; }, 'base64-encode-output.txt');
  CK.setUsageContent('<ol><li>Paste text or drag-drop a file into the input.</li><li>The Base64-encoded output appears instantly.</li><li>Toggle <strong>URL-safe</strong> mode to replace + and / with - and _ (safe for URLs and filenames).</li><li>Copy or download the result.</li></ol><h3>What is Base64?</h3><p>Base64 is an encoding scheme that converts binary data into ASCII text using 64 printable characters (A-Z, a-z, 0-9, +, /). It is not encryption \u2014 it is purely an encoding format.</p><h3>Common uses</h3><ul><li><strong>Email attachments</strong> \u2014 MIME encoding for binary files in email</li><li><strong>Data URIs</strong> \u2014 embed images directly in HTML/CSS as base64 strings</li><li><strong>API payloads</strong> \u2014 safely transmit binary data in JSON</li><li><strong>JWT tokens</strong> \u2014 the header and payload sections are Base64URL encoded</li><li><strong>Basic Auth</strong> \u2014 HTTP Basic Authentication encodes credentials as Base64</li></ul><p><strong>Note:</strong> Base64 increases data size by ~33%. It is not suitable for large files.</p>');
  (function () { var inp = $('t-input'); if (inp && !inp.value) { inp.value = 'Hello, World!'; doEncode(); } })();
  (function () { var dt; $('t-input').addEventListener('input', function () { clearTimeout(dt); dt = setTimeout(doEncode, 150); }); })();
})();