/**
 * CipherKit — IndexNow Bulk Submit (Bing + Yandex)
 *
 * FREE — No payment, no API key setup, no service accounts.
 * Just a key file on your site + this script.
 *
 * Usage:  node scripts/indexnow-submit.js
 *
 * Submits all 92+ URLs to Bing & Yandex instantly.
 * Key file must be deployed at: https://cipherkit.app/8b854e76d43347e693bc0077d4cb3a24.txt
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const DOMAIN = 'https://cipherkit.app';
const HOST = 'cipherkit.app';
const KEY = '8b854e76d43347e693bc0077d4cb3a24';
const TOOLS_JSON = path.join(__dirname, '..', 'tools.json');

function getAllUrls() {
  const data = JSON.parse(fs.readFileSync(TOOLS_JSON, 'utf8'));
  const urls = [
    `${DOMAIN}/`,
    `${DOMAIN}/tools/crypto/`,
    `${DOMAIN}/tools/encoding/`,
    `${DOMAIN}/tools/converter/`,
    `${DOMAIN}/tools/dev/`,
    `${DOMAIN}/tools/image/`,
    `${DOMAIN}/tools/privacy-policy/`,
  ];
  for (const tool of data.tools) {
    urls.push(`${DOMAIN}/tools/${tool.slug}/`);
  }
  return urls;
}

function submitToEngine(engine, hostname, urlList) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${DOMAIN}/${KEY}.txt`,
      urlList,
    });

    const req = https.request({
      hostname,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ engine, status: res.statusCode, body: data });
      });
    });
    req.on('error', err => resolve({ engine, status: 'error', body: err.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  const urls = getAllUrls();
  console.log(`\n🚀 IndexNow — Submitting ${urls.length} URLs\n`);
  console.log(`   Key: ${KEY}`);
  console.log(`   Key file: ${DOMAIN}/${KEY}.txt\n`);

  // IndexNow accepts up to 10,000 URLs per request
  const engines = [
    { name: 'Bing', host: 'www.bing.com' },
    { name: 'Yandex', host: 'yandex.com' },
    { name: 'IndexNow.org', host: 'api.indexnow.org' },
  ];

  for (const engine of engines) {
    process.stdout.write(`  📤 ${engine.name}... `);
    const result = await submitToEngine(engine.name, engine.host, urls);

    if (result.status === 200 || result.status === 202) {
      console.log(`✅ ${result.status} (accepted)`);
    } else if (result.status === 422) {
      console.log(`⚠️  422 — Key file not yet accessible. Deploy first, then retry.`);
    } else {
      console.log(`❌ ${result.status}: ${result.body}`);
    }
  }

  console.log(`\n📊 Submitted ${urls.length} URLs to ${engines.length} search engines`);
  console.log(`\n💡 Status codes:`);
  console.log(`   200/202 = Accepted`);
  console.log(`   422 = Key file not found (deploy the key file first)`);
  console.log(`   429 = Too many requests (try again later)\n`);
}

main();
