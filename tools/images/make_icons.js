// Generates the PWA icons (icons/*.png) from the OpenMind logo chosen by Ciprian (icons/source-openmind.png, 596 px: Morlet Red brain, chosen by Ciprian on 8 November 2026).
// Run from the repo root: NODE_PATH=tools/node_modules node tools/images/make_icons.js
// - "any" icons: the logo square cropped full-bleed, with rounded corners;
// - maskable: the logo scaled to 76% on the logo's background, so round launcher masks never cut the text;
// - apple-touch-icon: full-bleed square (iOS rounds it itself).
const sharp = require('sharp'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'icons'), SRC = path.join(OUT, 'source-openmind.png');
const BG = { r: 8, g: 3, b: 4, alpha: 1 };              // the logo's own background colour
const FULL = { left: 52, top: 40, width: 494, height: 494 };       // inside the rounded square of the source
const INNER = { left: 78, top: 66, width: 442, height: 442 };      // inside the glowing border, for the maskable icon
const rounded = (s, r) => Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}" fill="#fff"/></svg>`);
async function anyIcon(size, file) {
  const img = await sharp(SRC).extract(FULL).resize(size, size).png().toBuffer();
  await sharp(img).composite([{ input: rounded(size, Math.round(size * 0.22)), blend: 'dest-in' }]).png({ compressionLevel: 9 }).toFile(path.join(OUT, file));
}
async function maskable(size, file, scale) {
  const inner = Math.round(size * scale);
  // fade only the outer 6% of each edge, so the logo blends into the background without a square seam
  const lin = (x1, y1, x2, y2) => `<linearGradient id="${x2}${y2}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-opacity="0" stop-color="#fff"/><stop offset=".06" stop-opacity="1" stop-color="#fff"/><stop offset=".94" stop-opacity="1" stop-color="#fff"/><stop offset="1" stop-opacity="0" stop-color="#fff"/></linearGradient>`;
  const mask = g => Buffer.from(`<svg width="${inner}" height="${inner}"><defs>${g}</defs><rect width="${inner}" height="${inner}" fill="url(#${g.match(/id="([^"]+)"/)[1]})"/></svg>`);
  const logo = await sharp(await sharp(SRC).extract(INNER).resize(inner, inner).ensureAlpha().png().toBuffer())
    .composite([{ input: mask(lin(0, 0, 1, 0)), blend: 'dest-in' }]).png().toBuffer()
    .then(b => sharp(b).composite([{ input: mask(lin(0, 0, 0, 1)), blend: 'dest-in' }]).png().toBuffer());
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } }).composite([{ input: logo, gravity: 'centre' }]).png({ compressionLevel: 9 }).toFile(path.join(OUT, file));
}
(async () => {
  await anyIcon(192, 'icon-192.png');
  await anyIcon(512, 'icon-512.png');
  await maskable(512, 'icon-maskable-512.png', 0.76);
  await sharp(SRC).extract(FULL).resize(180, 180).flatten({ background: BG }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'apple-touch-icon.png'));
  console.log('icons: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png');
})();
