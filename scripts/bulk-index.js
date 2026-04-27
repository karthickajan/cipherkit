/**
 * CipherKit — Bulk Google Indexing API Script
 *
 * Submits all pages to Google for fast indexing via the Indexing API.
 *
 * Setup (one-time):
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project (or use existing)
 *   3. Enable "Web Search Indexing API"
 *   4. Create a Service Account → Keys → Add Key → JSON → Download
 *   5. Save the JSON key as: scripts/google-service-account.json
 *   6. Copy the service account email (looks like: name@project.iam.gserviceaccount.com)
 *   7. Go to GSC → Settings → Users and permissions → Add user → paste email → set as "Owner"
 *
 * Usage:
 *   node scripts/bulk-index.js                  # Submit all URLs
 *   node scripts/bulk-index.js --status         # Check indexing status of all URLs
 *   node scripts/bulk-index.js --url <url>      # Submit a single URL
 *
 * Rate limits: 200 requests/day (Google quota)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── CONFIG ──────────────────────────────────────────────────────────────────
const DOMAIN = 'https://cipherkit.app';
const KEY_FILE = path.join(__dirname, 'google-service-account.json');
const TOOLS_JSON = path.join(__dirname, '..', 'tools.json');
const BATCH_DELAY_MS = 1000; // 1 second between requests to be safe
const LOG_FILE = path.join(__dirname, 'indexing-log.json');

// ── LOAD DATA ───────────────────────────────────────────────────────────────
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

// ── JWT CREATION (no external deps) ─────────────────────────────────────────
const crypto = require('crypto');

function base64url(buf) {
  return (typeof buf === 'string' ? Buffer.from(buf) : buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const segments = [base64url(JSON.stringify(header)), base64url(JSON.stringify(payload))];
  const signingInput = segments.join('.');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(serviceAccount.private_key);

  return signingInput + '.' + base64url(signature);
}

// ── HTTP HELPERS ────────────────────────────────────────────────────────────
function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── GET ACCESS TOKEN ────────────────────────────────────────────────────────
async function getAccessToken(serviceAccount) {
  const jwt = createJWT(serviceAccount);
  const res = await httpsPost('https://oauth2.googleapis.com/token', {}, {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  // Token endpoint expects form-encoded, let's do that
  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const parsed = new URL('https://oauth2.googleapis.com/token');
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error('No access token: ' + data));
        } catch { reject(new Error('Token parse error: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── SUBMIT URL FOR INDEXING ─────────────────────────────────────────────────
async function submitUrl(accessToken, url, type = 'URL_UPDATED') {
  return httpsPost(
    'https://indexing.googleapis.com/v3/urlNotifications:publish',
    { Authorization: `Bearer ${accessToken}` },
    { url, type }
  );
}

// ── CHECK INDEXING STATUS ───────────────────────────────────────────────────
async function checkStatus(accessToken, url) {
  const encoded = encodeURIComponent(url);
  return httpsGet(
    `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encoded}`,
    { Authorization: `Bearer ${accessToken}` }
  );
}

// ── SLEEP ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  // Check key file
  if (!fs.existsSync(KEY_FILE)) {
    console.error('\n❌ Missing service account key file!');
    console.error(`   Expected: ${KEY_FILE}\n`);
    console.error('Setup instructions:');
    console.error('  1. Go to https://console.cloud.google.com');
    console.error('  2. Enable "Web Search Indexing API"');
    console.error('  3. Create Service Account → Download JSON key');
    console.error('  4. Save as: scripts/google-service-account.json');
    console.error('  5. Add service account email as Owner in GSC\n');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  console.log(`\n🔑 Service account: ${serviceAccount.client_email}`);

  // Get access token
  console.log('🔐 Getting access token...');
  const token = await getAccessToken(serviceAccount);
  console.log('✅ Authenticated\n');

  const args = process.argv.slice(2);

  // ── MODE: Check status ────────────────────────────────────────────────
  if (args.includes('--status')) {
    const urls = getAllUrls();
    console.log(`📊 Checking indexing status for ${urls.length} URLs...\n`);

    const results = [];
    for (const url of urls) {
      const res = await checkStatus(token, url);
      const status = res.status === 200 ? '✅ Indexed' : '⏳ Pending';
      const lastNotify = res.body?.latestUpdate?.notifyTime || 'never';
      console.log(`  ${status}  ${url}  (last: ${lastNotify})`);
      results.push({ url, status: res.status, lastNotify });
      await sleep(200);
    }

    const indexed = results.filter(r => r.status === 200).length;
    console.log(`\n📈 ${indexed}/${urls.length} URLs have indexing data\n`);
    return;
  }

  // ── MODE: Single URL ──────────────────────────────────────────────────
  if (args.includes('--url')) {
    const urlIdx = args.indexOf('--url') + 1;
    const url = args[urlIdx];
    if (!url) { console.error('❌ Provide a URL: --url https://cipherkit.app/tools/...'); process.exit(1); }
    console.log(`📤 Submitting: ${url}`);
    const res = await submitUrl(token, url);
    console.log(`   ${res.status === 200 ? '✅' : '❌'} Status: ${res.status}`, res.body);
    return;
  }

  // ── MODE: Bulk submit ─────────────────────────────────────────────────
  const urls = getAllUrls();
  console.log(`📤 Submitting ${urls.length} URLs for indexing...\n`);
  console.log(`   ⚠️  Google quota: 200/day. You have ${urls.length} URLs.\n`);

  const log = { timestamp: new Date().toISOString(), results: [] };
  let success = 0, failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`  [${i + 1}/${urls.length}] ${url} ... `);

    try {
      const res = await submitUrl(token, url);
      if (res.status === 200) {
        console.log('✅');
        success++;
        log.results.push({ url, status: 'ok', time: res.body?.urlNotificationMetadata?.latestUpdate?.notifyTime });
      } else if (res.status === 429) {
        console.log('⚠️  Rate limited — stopping');
        log.results.push({ url, status: 'rate-limited' });
        console.log(`\n⏸️  Hit rate limit at URL #${i + 1}. Run again tomorrow for the rest.`);
        break;
      } else {
        console.log(`❌ ${res.status}`);
        failed++;
        log.results.push({ url, status: 'error', code: res.status, body: res.body });
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
      log.results.push({ url, status: 'error', message: err.message });
    }

    await sleep(BATCH_DELAY_MS);
  }

  // Save log
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));

  console.log(`\n📊 Results: ${success} submitted, ${failed} failed`);
  console.log(`📝 Log saved: ${LOG_FILE}`);
  console.log(`\n💡 Run with --status to check indexing progress\n`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
