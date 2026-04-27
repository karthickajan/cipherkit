(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.shield + '</div><h2 id="t-heading">SSL Certificate Decoder</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Decode</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">PEM Certificate</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><textarea id="t-input" placeholder="Paste your PEM certificate here\u2026\n-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----" rows="8" class="mono"></textarea><div class="input-meta" id="t-input-meta"></div><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-green" id="btn-dec">' + IC.shield + ' <span>Decode Certificate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Certificate Details</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Certificate details will appear here\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function parseDER(bytes, offset) {
    if (offset >= bytes.length) return null;
    var tag = bytes[offset++];
    var len = bytes[offset++];
    if (len & 0x80) { var n = len & 0x7f; len = 0; for (var i = 0; i < n; i++) len = (len << 8) | bytes[offset++]; }
    return { tag: tag, data: bytes.slice(offset, offset + len), next: offset + len };
  }
  function readOID(data) {
    var oid = [Math.floor(data[0] / 40), data[0] % 40], val = 0;
    for (var i = 1; i < data.length; i++) { val = (val << 7) | (data[i] & 0x7f); if (!(data[i] & 0x80)) { oid.push(val); val = 0; } }
    return oid.join('.');
  }
  function readUTF8(data) { return new TextDecoder().decode(data); }
  function toHex(arr) { return Array.from(arr, function(b) { return b.toString(16).padStart(2, '0'); }).join(':'); }
  function decodePEM(pem) {
    var b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  var OID_MAP = {
    '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST',
    '2.5.4.10': 'O', '2.5.4.11': 'OU', '1.2.840.113549.1.1.11': 'SHA256withRSA',
    '1.2.840.113549.1.1.12': 'SHA384withRSA', '1.2.840.113549.1.1.13': 'SHA512withRSA',
    '1.2.840.113549.1.1.1': 'RSA', '1.2.840.10045.2.1': 'EC',
    '2.5.29.17': 'SAN', '2.5.29.19': 'Basic Constraints'
  };
  function extractDN(data) {
    var parts = [], offset = 0;
    while (offset < data.length) {
      var seq = parseDER(data, offset); if (!seq || seq.tag !== 0x31) break;
      var inner = parseDER(seq.data, 0); if (inner && inner.tag === 0x30) {
        var oid = parseDER(inner.data, 0);
        if (oid) { var val = parseDER(inner.data, oid.next); if (val) { var name = OID_MAP[readOID(oid.data)] || readOID(oid.data); parts.push(name + '=' + readUTF8(val.data)); } }
      }
      offset = seq.next;
    }
    return parts.join(', ');
  }
  $('btn-dec').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent = ''; $('t-err').style.display = 'none';
    if (!input) { $('t-err').textContent = 'Paste a PEM certificate.'; $('t-err').style.display = 'block'; return; }
    try {
      var bytes = decodePEM(input);
      var outer = parseDER(bytes, 0);
      if (!outer || outer.tag !== 0x30) throw new Error('Not a valid certificate');
      var tbs = parseDER(outer.data, 0);
      if (!tbs || tbs.tag !== 0x30) throw new Error('Cannot parse TBSCertificate');
      var d = tbs.data, off = 0, info = {};
      var v = parseDER(d, off);
      if (v && v.tag === 0xa0) { var vi = parseDER(v.data, 0); info.version = 'v' + ((vi ? vi.data[0] : 0) + 1); off = v.next; } else { info.version = 'v1'; }
      var ser = parseDER(d, off); if (ser) { info.serial = toHex(ser.data); off = ser.next; }
      var sigAlgo = parseDER(d, off); if (sigAlgo) { var oa = parseDER(sigAlgo.data, 0); info.sigAlgo = oa ? (OID_MAP[readOID(oa.data)] || readOID(oa.data)) : 'Unknown'; off = sigAlgo.next; }
      var issuer = parseDER(d, off); if (issuer) { info.issuer = extractDN(issuer.data); off = issuer.next; }
      var validity = parseDER(d, off);
      if (validity) {
        var nb = parseDER(validity.data, 0);
        var na = parseDER(validity.data, nb ? nb.next : 0);
        info.notBefore = nb ? readUTF8(nb.data) : '';
        info.notAfter = na ? readUTF8(na.data) : '';
        off = validity.next;
      }
      var subject = parseDER(d, off); if (subject) { info.subject = extractDN(subject.data); off = subject.next; }
      var out = 'Version:       ' + (info.version || '') + '\n'
        + 'Serial:        ' + (info.serial || '') + '\n'
        + 'Signature:     ' + (info.sigAlgo || '') + '\n'
        + 'Issuer:        ' + (info.issuer || '') + '\n'
        + 'Subject:       ' + (info.subject || '') + '\n'
        + 'Not Before:    ' + (info.notBefore || '') + '\n'
        + 'Not After:     ' + (info.notAfter || '') + '\n';
      $('t-result').className = 'out-body mono b'; $('t-result').textContent = out;
      CK.toast('Certificate decoded');
    } catch (e) { $('t-err').textContent = 'Error: ' + e.message; $('t-err').style.display = 'block'; }
  });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Certificate details will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; });
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'ssl-cert-output.txt');
  CK.wireCtrlEnter('btn-dec');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent('<ol><li><strong>Paste</strong> a PEM-encoded certificate (starts with -----BEGIN CERTIFICATE-----).</li><li>Click <strong>Decode Certificate</strong> to extract details.</li><li>View subject, issuer, validity dates, serial number, and more.</li></ol><p>Uses a lightweight client-side ASN.1 DER parser. No data sent to any server.</p>');
})();