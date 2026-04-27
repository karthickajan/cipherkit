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
    +     '<div class="tc-title"><div class="tc-icon tc-icon-green">' + IC.shield + '</div><h2 id="t-heading">Password Strength Meter</h2></div>'
    +     '<span class="tc-badge tc-badge-green">Analyze</span>'
    +   '</div>'
    +   '<div class="tc-body" role="region" aria-labelledby="t-heading">'
    +     '<div class="field"><div class="field-hdr"><label for="t-input">Password</label><div class="field-btns"><button type="button" class="pill-btn" id="btn-clr" aria-label="Clear">' + IC.trash + ' <span>Clear</span></button></div></div><input type="text" id="t-input" placeholder="Enter a password to analyze\u2026" autocomplete="off"><div class="input-meta" id="t-input-meta"></div></div>'
    +     '<div class="kbar-wrap"><div class="kbar"><div class="kfill" id="t-fill"></div></div></div>'
    +     '<div class="out-box"><div class="out-head"><div class="out-label">' + IC.play + ' <span>Analysis</span></div><div class="out-btns"><button type="button" class="copy-btn" id="btn-cp" aria-label="Copy">' + IC.copy + ' <span>Copy</span></button><button type="button" class="dl-btn" id="btn-dl" aria-label="Download">' + IC.dl + ' <span>Download</span></button></div></div><div class="out-body mono ph" id="t-result" role="status" aria-live="polite">Type a password above\u2026</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  function analyze(pw) {
    if (!pw) { $('t-result').className = 'out-body mono ph'; $('t-result').textContent = 'Type a password above\u2026'; $('t-fill').style.width = '0%'; return; }
    var len = pw.length, score = 0, notes = [];
    if (len >= 8) score++; else notes.push('Too short (min 8 chars)');
    if (len >= 12) score++;
    if (len >= 16) score++;
    if (/[a-z]/.test(pw)) score++; else notes.push('Add lowercase letters');
    if (/[A-Z]/.test(pw)) score++; else notes.push('Add uppercase letters');
    if (/[0-9]/.test(pw)) score++; else notes.push('Add numbers');
    if (/[^A-Za-z0-9]/.test(pw)) { score++; score++; } else notes.push('Add special characters (!@#$%...)');
    if (/(.)\1{2,}/.test(pw)) { score--; notes.push('Avoid repeated characters'); }
    if (/^(123|abc|qwerty|password|letmein)/i.test(pw)) { score -= 2; notes.push('Common pattern detected'); }
    var entropy = Math.round(len * Math.log2(
      (/[a-z]/.test(pw) ? 26 : 0) + (/[A-Z]/.test(pw) ? 26 : 0) +
      (/[0-9]/.test(pw) ? 10 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 33 : 0) || 1
    ));
    score = Math.max(0, Math.min(score, 8));
    var levels = [
      { label: 'Very Weak', color: '#ff4444', pct: 12 },
      { label: 'Very Weak', color: '#ff4444', pct: 20 },
      { label: 'Weak',      color: '#ff6b6b', pct: 30 },
      { label: 'Fair',      color: '#e8a020', pct: 45 },
      { label: 'Fair',      color: '#e8a020', pct: 55 },
      { label: 'Good',      color: '#58a6ff', pct: 68 },
      { label: 'Strong',    color: '#3dd68c', pct: 80 },
      { label: 'Strong',    color: '#3dd68c', pct: 90 },
      { label: 'Very Strong', color: '#3dd68c', pct: 100 }
    ];
    var lv = levels[score];
    $('t-fill').style.width = lv.pct + '%';
    $('t-fill').style.background = lv.color;
    var out = 'Strength:  ' + lv.label + ' (' + lv.pct + '%)\n'
      + 'Length:    ' + len + ' characters\n'
      + 'Entropy:   ~' + entropy + ' bits\n'
      + 'Score:     ' + score + '/8\n';
    if (notes.length) out += '\nSuggestions:\n' + notes.map(function (n) { return '  \u2022 ' + n; }).join('\n');
    $('t-result').className = 'out-body mono b'; $('t-result').textContent = out;
  }
  $('t-input').addEventListener('input', function () { analyze(this.value); });
  $('btn-clr').addEventListener('click', function () { $('t-input').value = ''; analyze(''); });
  CK.wireCopy($('btn-cp'), function () { var t = $('t-result').textContent; return t.indexOf('Type') === -1 ? t : ''; });
  CK.wireDownload($('btn-dl'), function () { var t = $('t-result').textContent; return t.indexOf('Type') === -1 ? t : ''; }, 'password-strength-output.txt');
  CK.wireCharCounter($('t-input'), $('t-input-meta'));
  CK.setUsageContent('<ol><li>Type or paste a password into the field.</li><li>Strength score, entropy (bits), and estimated crack time are shown instantly.</li><li>Follow the suggestions to improve weak passwords.</li></ol><h3>What makes a strong password?</h3><ul><li><strong>Length</strong> — 16+ characters is significantly stronger than 8</li><li><strong>Character variety</strong> — mix uppercase, lowercase, numbers, and symbols</li><li><strong>Unpredictability</strong> — avoid dictionary words, names, or keyboard patterns</li><li><strong>Uniqueness</strong> — never reuse passwords across sites</li></ul><p><strong>Privacy note:</strong> Your password never leaves your browser. All analysis is done client-side with zero network requests.</p>');
  (function(){var inp=$('t-input');if(inp&&!inp.value){inp.value='P@ssw0rd!2024#Str0ng';inp.dispatchEvent(new Event('input'));}})();
})();