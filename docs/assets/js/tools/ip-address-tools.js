(function () {
  'use strict';
  var root = document.getElementById('tool-root');
  if (!root) return;
  var IC = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>',
    play:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    dl:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  function ipToLong(ip) {
    var parts = ip.split('.').map(Number);
    return ((parts[0]<<24)|(parts[1]<<16)|(parts[2]<<8)|parts[3])>>>0;
  }
  function longToIp(n) {
    return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  }
  root.innerHTML =
    '<div class="tool-single-col">'
    + '<div class="tool-card-ui">'
    +   '<div class="tc-head">'
    +     '<div class="tc-title"><div class="tc-icon tc-icon-amber">' + IC.globe + '</div><h2 id="t-heading">IP Address Tools</h2></div>'
    +     '<span class="tc-badge tc-badge-amber">Analyze</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">IPv4 Address / CIDR</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><input type="text" id="t-input" placeholder="e.g. 192.168.1.0/24" class="mono" value="192.168.1.0/24"><div class="inline-error" id="t-err" role="alert"></div></div>'
    +     '<button type="button" class="act-btn act-amber" id="btn-calc" aria-label="Calculate">' + IC.globe + ' <span>Calculate</span></button>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Subnet Info</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><pre class="out-body mono ph" id="t-result" role="status" aria-live="polite">Subnet info will appear here\u2026</pre></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  $('btn-clr').addEventListener('click', function () { $('t-input').value=''; $('t-result').className='out-body mono ph'; $('t-result').textContent='Subnet info will appear here\u2026'; });
  CK.wireCopy($('btn-cp'), function () { var t=$('t-result').textContent; return t.indexOf('appear')===-1?t:''; });
  $('btn-calc').addEventListener('click', function () {
    var input = $('t-input').value.trim();
    $('t-err').textContent=''; $('t-err').style.display='none';
    if (!input) { $('t-err').textContent='Enter an IP address.'; $('t-err').style.display='block'; return; }
    var parts = input.split('/');
    var ip = parts[0];
    var cidr = parts[1] !== undefined ? parseInt(parts[1],10) : 32;
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) { $('t-err').textContent='Invalid IPv4 address format.'; $('t-err').style.display='block'; return; }
    var octets = ip.split('.').map(Number);
    for (var i=0;i<4;i++) { if(octets[i]<0||octets[i]>255){ $('t-err').textContent='Octet out of range (0-255).'; $('t-err').style.display='block'; return; } }
    if (cidr<0||cidr>32) { $('t-err').textContent='CIDR must be 0-32.'; $('t-err').style.display='block'; return; }
    var ipLong = ipToLong(ip);
    var mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
    var network = (ipLong & mask) >>> 0;
    var broadcast = (network | (~mask >>> 0)) >>> 0;
    var firstHost = cidr >= 31 ? network : network + 1;
    var lastHost = cidr >= 31 ? broadcast : broadcast - 1;
    var totalHosts = cidr >= 31 ? Math.pow(2, 32 - cidr) : Math.pow(2, 32 - cidr) - 2;
    var cls = octets[0] < 128 ? 'A' : octets[0] < 192 ? 'B' : octets[0] < 224 ? 'C' : octets[0] < 240 ? 'D' : 'E';
    var priv = (octets[0]===10) || (octets[0]===172&&octets[1]>=16&&octets[1]<=31) || (octets[0]===192&&octets[1]===168);
    var lines = [
      'IP Address:      ' + ip,
      'CIDR:            /' + cidr,
      'Subnet Mask:     ' + longToIp(mask),
      'Network:         ' + longToIp(network),
      'Broadcast:       ' + longToIp(broadcast),
      'First Host:      ' + longToIp(firstHost),
      'Last Host:       ' + longToIp(lastHost),
      'Total Hosts:     ' + totalHosts.toLocaleString(),
      'IP Class:        ' + cls,
      'Private:         ' + (priv ? 'Yes' : 'No'),
      'Binary:          ' + ipLong.toString(2).padStart(32,'0').replace(/(.{8})/g,'$1.').slice(0,-1)
    ];
    $('t-result').className='out-body mono b'; $('t-result').textContent = lines.join('\n');
    CK.toast('Subnet calculated');
  });
  CK.wireCtrlEnter('btn-calc');
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('appear') === -1 ? t : ''; }, 'ip-address-tools-output.txt');
  CK.setUsageContent('<ol><li>Enter an <strong>IPv4 address</strong> with optional <strong>CIDR notation</strong> (e.g. <code>192.168.1.0/24</code>).</li><li>Click <strong>Calculate</strong> for full subnet details.</li></ol><p>Shows network/broadcast addresses, host range, total hosts, IP class, private range detection, and binary representation.</p>');
})();