#!/usr/bin/env node
/**
 * CipherKit — Tool JS Patcher
 * Adds sample data, debounced live output, and swap buttons to tool JS files.
 * Run: node patch-tools.js
 * Modifies files in src/assets/js/tools/
 */
'use strict';
const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, 'src', 'assets', 'js', 'tools');

function readTool(name) {
  return fs.readFileSync(path.join(TOOLS_DIR, name), 'utf8');
}
function writeTool(name, content) {
  fs.writeFileSync(path.join(TOOLS_DIR, name), content, 'utf8');
  console.log(`  ✓ ${name}`);
}

// ── SAMPLE DATA ──────────────────────────────────────────────────────────────
const samples = {
  'sha256-generator.js':   { id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'sha512-generator.js':   { id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'sha1-generator.js':     { id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'sha3-generator.js':     { id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'md5-generator.js':      { id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'ripemd160-generator.js':{ id: 'h-input', sample: 'Hello, World!', run: 'btn-gen' },
  'hmac-generator.js':     { id: 'h-input', sample: 'Hello, World!' },
  'base64-encode.js':      { id: 't-input', sample: 'Hello, World!', run: 'btn-enc' },
  'base64-decode.js':      { id: 't-input', sample: 'SGVsbG8sIFdvcmxkIQ==', run: 'btn-dec' },
  'url-encode.js':         { id: 't-input', sample: 'https://example.com/search?q=hello world&lang=en', run: 'btn-enc' },
  'url-decode.js':         { id: 't-input', sample: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world', run: 'btn-dec' },
  'html-encode.js':        { id: 't-input', sample: '<h1>Hello & "World"</h1>', run: 'btn-enc' },
  'html-decode.js':        { id: 't-input', sample: '&lt;h1&gt;Hello &amp; &quot;World&quot;&lt;/h1&gt;', run: 'btn-dec' },
  'hex-encode.js':         { id: 't-input', sample: 'Hello, World!', run: 'btn-enc' },
  'hex-decode.js':         { id: 't-input', sample: '48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21', run: 'btn-dec' },
  'binary-encode.js':      { id: 't-input', sample: 'Hi', run: 'btn-enc' },
  'binary-decode.js':      { id: 't-input', sample: '01001000 01101001', run: 'btn-dec' },
  'json-formatter.js':     { id: 't-input', sample: '{"name":"John","age":30,"city":"New York","hobbies":["reading","coding"]}', run: 'btn-fmt' },
  'json-minifier.js':      { id: 't-input', sample: '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}', run: 'btn-min' },
  'jwt-decoder.js':        { id: 'j-input', sample: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
  'regex-tester.js':       { id: 't-input', sample: 'The quick brown fox jumps over the lazy dog' },
  'cron-expression-explainer.js': { id: 't-input', sample: '0 9 * * 1-5' },
  'sql-formatter.js':      { id: 't-input', sample: 'SELECT u.id,u.name,o.total FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 ORDER BY o.total DESC' },
  'word-counter.js':       { id: 't-input', sample: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.' },
  'csv-json-converter.js': { id: 't-input', sample: 'name,age,city\nAlice,30,New York\nBob,25,London\nCarol,35,Tokyo' },
  'xml-json-converter.js': { id: 't-input', sample: '<person><name>John</name><age>30</age><city>New York</city></person>' },
  'yaml-json-converter.js':{ id: 't-input', sample: 'name: John\nage: 30\ncity: New York\nhobbies:\n  - reading\n  - coding' },
  'json-xml-converter.js': { id: 't-input', sample: '{"person":{"name":"John","age":30,"city":"New York"}}' },
  'json-to-csv.js':        { id: 't-input', sample: '[{"name":"Alice","age":30,"city":"New York"},{"name":"Bob","age":25,"city":"London"}]' },
  'number-base-converter.js': { id: 't-input', sample: '255' },
  'markdown-preview.js':   { id: 't-input', sample: '# Hello World\\n\\n## Introduction\\n\\nThis is a **sample** document with:\\n\\n- Lists\\n- **Bold** and *italic*\\n- `inline code`\\n\\n## Code Block\\n\\n```json\\n{"key": "value"}\\n```' },
  'markdown-to-pdf.js':    { id: 'markdown-input', sample: '# Hello World\\n\\n## Introduction\\n\\nThis is a **sample** document with:\\n\\n- Lists\\n- **Bold** and *italic*\\n- `inline code`\\n\\n## Code Block\\n\\n```json\\n{"key": "value"}\\n```' },
  'diff-checker.js':       null, // special — two inputs
  'checksum-generator.js': null, // file input
  'hash-comparator.js':    null, // two inputs
  'decimal-to-hex.js':     null, // shared with number-base-converter.js
  'hex-to-decimal.js':     null, // shared
  'json-schema-validator.js': null, // two inputs
  'password-strength.js':  { id: 't-input', sample: 'P@ssw0rd!2024#Str0ng' },
};

// ── LIVE OUTPUT TOOLS ─────────────────────────────────────────────────────────
// Tools that should auto-run on input (debounced 150ms)
const liveTools = {
  'sha256-generator.js':   { inputId: 'h-input', btnId: 'btn-gen' },
  'sha512-generator.js':   { inputId: 'h-input', btnId: 'btn-gen' },
  'sha1-generator.js':     { inputId: 'h-input', btnId: 'btn-gen' },
  'sha3-generator.js':     { inputId: 'h-input', btnId: 'btn-gen' },
  'md5-generator.js':      { inputId: 'h-input', btnId: 'btn-gen' },
  'ripemd160-generator.js':{ inputId: 'h-input', btnId: 'btn-gen' },
  'base64-encode.js':      { inputId: 't-input', btnId: 'btn-enc' },
  'base64-decode.js':      { inputId: 't-input', btnId: 'btn-dec' },
  'url-encode.js':         { inputId: 't-input', btnId: 'btn-enc' },
  'url-decode.js':         { inputId: 't-input', btnId: 'btn-dec' },
  'html-encode.js':        { inputId: 't-input', btnId: 'btn-enc' },
  'html-decode.js':        { inputId: 't-input', btnId: 'btn-dec' },
  'hex-encode.js':         { inputId: 't-input', btnId: 'btn-enc' },
  'hex-decode.js':         { inputId: 't-input', btnId: 'btn-dec' },
  'binary-encode.js':      { inputId: 't-input', btnId: 'btn-enc' },
  'binary-decode.js':      { inputId: 't-input', btnId: 'btn-dec' },
  'word-counter.js':       null, // already has live input
  'number-base-converter.js': { inputId: 't-input', btnId: 'btn-conv' },
};

// ── SWAP TOOLS ───────────────────────────────────────────────────────────────
const swapTools = {
  'base64-encode.js':  { inputId: 't-input', outputId: 't-result' },
  'base64-decode.js':  { inputId: 't-input', outputId: 't-result' },
  'url-encode.js':     { inputId: 't-input', outputId: 't-result' },
  'url-decode.js':     { inputId: 't-input', outputId: 't-result' },
  'html-encode.js':    { inputId: 't-input', outputId: 't-result' },
  'html-decode.js':    { inputId: 't-input', outputId: 't-result' },
  'hex-encode.js':     { inputId: 't-input', outputId: 't-result' },
  'hex-decode.js':     { inputId: 't-input', outputId: 't-result' },
  'binary-encode.js':  { inputId: 't-input', outputId: 't-result' },
  'binary-decode.js':  { inputId: 't-input', outputId: 't-result' },
};

// ── APPLY PATCHES ────────────────────────────────────────────────────────────
console.log('\n🔧 Patching tool JS files...\n');

for (const file of fs.readdirSync(TOOLS_DIR).sort()) {
  if (!file.endsWith('.js')) continue;
  let code = readTool(file);
  let modified = false;

  // Skip if already patched
  if (code.includes('/* CK-PATCHED */')) {
    console.log(`  ⏭  ${file} (already patched)`);
    continue;
  }

  // === SAMPLE DATA ===
  const sampleInfo = samples[file];
  if (sampleInfo && sampleInfo.id && sampleInfo.sample) {
    // Insert sample data assignment before the closing })();
    const sampleEscaped = sampleInfo.sample.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    let sampleCode = `\n  /* CK-PATCHED — sample data */\n`;
    sampleCode += `  (function(){var inp=$('${sampleInfo.id}');if(inp&&!inp.value){inp.value='${sampleEscaped}';inp.dispatchEvent(new Event('input'));`;
    if (sampleInfo.run) {
      sampleCode += `var b=$('${sampleInfo.run}');if(b)b.click();`;
    }
    sampleCode += `}})();\n`;

    // Insert before the last })();
    const lastIIFE = code.lastIndexOf('})();');
    if (lastIIFE !== -1) {
      code = code.slice(0, lastIIFE) + sampleCode + code.slice(lastIIFE);
      modified = true;
    }
  }

  // === DEBOUNCED LIVE OUTPUT ===
  const liveInfo = liveTools[file];
  if (liveInfo && liveInfo !== null) {
    // Check we haven't already added live input for this specific input
    if (!code.includes('CK-PATCHED — live') && !code.includes(`addEventListener('input', function`)) {
      // Actually some files already have input listeners (word-counter, markdown-to-pdf).
      // Only add if the btnId click handler exists and no input listener for the same input.
      const hasExistingInputListener = code.includes(`$('${liveInfo.inputId}').addEventListener('input'`);
      if (!hasExistingInputListener) {
        let liveCode = `\n  /* CK-PATCHED — live output */\n`;
        liveCode += `  (function(){var _dt;var _inp=$('${liveInfo.inputId}');var _btn=$('${liveInfo.btnId}');`;
        liveCode += `if(_inp&&_btn){_inp.addEventListener('input',function(){clearTimeout(_dt);_dt=setTimeout(function(){_btn.click()},150)})}})();\n`;

        const lastIIFE2 = code.lastIndexOf('})();');
        if (lastIIFE2 !== -1) {
          code = code.slice(0, lastIIFE2) + liveCode + code.slice(lastIIFE2);
          modified = true;
        }
      }
    }
  }

  // === SWAP BUTTON ===
  const swapInfo = swapTools[file];
  if (swapInfo) {
    if (!code.includes('btn-swap')) {
      // Add swap button to the out-btns section
      const outBtnsMarker = `</div></div><div class="out-body`;
      if (code.includes(outBtnsMarker)) {
        code = code.replace(
          outBtnsMarker,
          `<button type="button" class="pill-btn" id="btn-swap" aria-label="Use output as input">\u21c4 <span>Use as Input</span></button></div></div><div class="out-body`
        );
      }

      // Add swap event listener before the closing })();
      let swapCode = `\n  /* CK-PATCHED — swap button */\n`;
      swapCode += `  (function(){var sb=$('btn-swap');if(sb){sb.addEventListener('click',function(){`;
      swapCode += `var oe=$('${swapInfo.outputId}');var ie=$('${swapInfo.inputId}');`;
      swapCode += `var ov=oe?oe.value||oe.textContent:'';`;
      swapCode += `if(!ov||ov.indexOf('appear')!==-1)return;`;
      swapCode += `ie.value=ov;ie.dispatchEvent(new Event('input'));`;
      swapCode += `ie.scrollIntoView({behavior:'smooth',block:'start'});`;
      swapCode += `CK.toast('Output moved to input')`;
      swapCode += `})}})();\n`;

      const lastIIFE3 = code.lastIndexOf('})();');
      if (lastIIFE3 !== -1) {
        code = code.slice(0, lastIIFE3) + swapCode + code.slice(lastIIFE3);
        modified = true;
      }
    }
  }

  if (modified) {
    writeTool(file, code);
  } else {
    console.log(`  ─  ${file} (no changes needed)`);
  }
}

console.log('\n✅ Patching complete!\n');
