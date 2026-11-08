// Swatch sheet of the Morlet Red scale (design/out/paleta.png). Run: NODE_PATH=tools/node_modules node tools/design/palette.js
const sharp = require('sharp'), path = require('path');
const S = [['50', '#FBF4F5'], ['100', '#F7E9EA'], ['200', '#EED0D3'], ['300', '#DCA3A9'], ['400', '#C4707A'], ['500', '#A84B54'], ['600', '#8A3840'], ['700', '#6E2A30'], ['800 · bază', '#562025'], ['900', '#3E171B'], ['950', '#2A0F12']];
const w = 150, h = 190, light = c => parseInt(c.slice(1, 3), 16) > 200;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S.length * w}" height="${h + 60}"><rect width="100%" height="100%" fill="#fff"/>
<text x="16" y="38" font-family="Helvetica, Arial" font-size="26" font-weight="700" fill="#111">Morlet Red - scala de nuanțe</text>
${S.map(([n, c], i) => `<rect x="${i * w}" y="60" width="${w}" height="${h}" fill="${c}"/><text x="${i * w + 12}" y="${60 + h - 44}" font-family="Helvetica, Arial" font-size="20" font-weight="700" fill="${light(c) ? '#3E171B' : '#fff'}">${n}</text><text x="${i * w + 12}" y="${60 + h - 18}" font-family="Menlo, monospace" font-size="17" fill="${light(c) ? '#3E171B' : '#fff'}">${c}</text>`).join('')}</svg>`;
sharp(Buffer.from(svg)).png().toFile(path.resolve(__dirname, '..', '..', 'design', 'out', 'paleta.png')).then(() => console.log('paleta ok'));
