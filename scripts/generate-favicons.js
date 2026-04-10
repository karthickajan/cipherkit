const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="#3dd68c"/>
  <rect x="9" y="15" width="14" height="10" rx="2" fill="#02150a"/>
  <path d="M12 15v-3a4 4 0 0 1 8 0v3" stroke="#02150a" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="16" cy="20" r="1.5" fill="#3dd68c"/>
</svg>`);

const sizes = [16, 32, 48, 180, 192, 512];
const outDir = path.join(__dirname, '../static');

async function generate() {
  for (const size of sizes) {
    const filename =
      size === 180 ? 'apple-touch-icon.png' :
      size === 192 ? 'android-chrome-192x192.png' :
      size === 512 ? 'android-chrome-512x512.png' :
      `favicon-${size}x${size}.png`;
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(outDir, filename));
    console.log(`Generated ${filename}`);
  }

  // favicon.ico = 32x32 PNG renamed (browsers accept PNG as .ico)
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(outDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // site.webmanifest
  const manifest = {
    name: 'CipherKit',
    short_name: 'CipherKit',
    icons: [
      { src: '/cipherkit/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/cipherkit/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: '#0a0a0a',
    background_color: '#0a0a0a',
    display: 'standalone',
    start_url: '/cipherkit/'
  };
  fs.writeFileSync(path.join(outDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Generated site.webmanifest');
}

generate().catch(console.error);
