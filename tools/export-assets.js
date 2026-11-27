/* ------------------------------------------------------------------
   Exports the keepsake illustrations as standalone files:

     assets/characters/<name>.svg   the artwork itself (scalable)
     assets/wallpapers/<name>.svg   the artwork composed as an iPhone
                                    wallpaper, 1290 × 2796

   Run:  node tools/export-assets.js
   PNGs are then rendered from these SVGs with headless Chrome
   (see tools/render-pngs.sh).
------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const artDir = path.join(root, 'assets', 'characters');
const wallDir = path.join(root, 'assets', 'wallpapers');
fs.mkdirSync(artDir, { recursive: true });
fs.mkdirSync(wallDir, { recursive: true });

global.window = {};
require(path.join(root, 'js', 'art.js'));
const Art = global.window.Art;

// the shared watercolour / ink filters, lifted from the page so each file stands alone
const defs = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<defs>([\s\S]*?)<\/defs>/)[1];
const inner = (svg) => svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const svgFile = (viewBox, w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">\n<defs>${defs}${extra}</defs>\n${body}\n</svg>\n`;

// an oval, gold-rimmed medallion around a rectangular painting
function medallion(w, h, body) {
  const cx = w / 2, cy = h / 2;
  return {
    defs: `<clipPath id="oval"><ellipse cx="${cx}" cy="${cy}" rx="${cx - 8}" ry="${cy - 8}"/></clipPath>`,
    body: `<ellipse cx="${cx}" cy="${cy}" rx="${cx - 1}" ry="${cy - 1}" fill="#FFFEFB" stroke="#B8923C" stroke-width="1"/>
<g clip-path="url(#oval)">${body}</g>
<ellipse cx="${cx}" cy="${cy}" rx="${cx - 8}" ry="${cy - 8}" fill="none" stroke="#B8923C" stroke-width="1.5"/>`,
  };
}

/* ---------- the keepsakes ----------
   wall: how the piece sits on a wallpaper —
     'oval'   a medallion, placed as it is
     'framed' a painting, given a white mount and a gold hairline
     'arch'   a cut-out figure, stood inside a garden arch          */
const cameo = (who) => medallion(200, 250, inner(Art.cameo({ variant: who })));
const dogBox = '4 -4 112 158';
const letter = Art.letter().replace('<svg ', '<svg x="41" y="61" width="38" height="28" ');
const nugget = medallion(300, 380, inner(Art.portrait({ variant: 'poodle' })));
const trio = medallion(500, 600, inner(Art.together({ variant: 'portrait' })));
const scene = (v) => inner(Art.together({ variant: v }));

const keepsakes = [
  { name: 'blake-cameo', box: '0 0 200 250', width: 1200, ...cameo('blake'), wall: 'oval' },
  { name: 'blake-figure', box: '0 0 200 250', width: 1200, body: Art.blake(), wall: 'arch', foot: 0 },
  { name: 'kat-cameo', box: '0 0 200 250', width: 1200, ...cameo('kat'), wall: 'oval' },
  { name: 'kat-figure', box: '0 0 200 250', width: 1200, body: Art.kat(), wall: 'arch', foot: 0 },
  { name: 'chicken-nugget-cameo', box: '0 0 300 380', width: 1200, ...nugget, wall: 'oval' },
  { name: 'chicken-nugget-figure', box: dogBox, width: 1200, body: Art.poodle(), wall: 'arch', foot: 120 },
  { name: 'chicken-nugget-with-invitation', box: dogBox, width: 1200, body: `${Art.poodle()}<g transform="rotate(-9 60 75)">${letter}</g>`, wall: 'arch', foot: 120 },
  { name: 'together-portrait', box: '0 0 500 600', width: 1500, ...trio, wall: 'oval' },
  { name: 'together-at-supper', box: '0 0 640 430', width: 1920, body: inner(Art.supper()), wall: 'framed' },
  { name: 'together-on-a-drive', box: '0 0 640 430', width: 1920, body: scene('drive'), wall: 'framed' },
  { name: 'together-on-the-lake', box: '0 0 640 430', width: 1920, body: scene('lake'), wall: 'framed' },
  { name: 'together-on-the-terrace', box: '0 0 500 600', width: 1500, body: scene('terrace'), wall: 'framed' },
];

/* ---------- iPhone wallpaper: 1290 × 2796 ----------
   The top third is left quiet for the lock-screen clock, and the foot
   for the torch and camera buttons; the artwork sits between them. */
const W = 1290, H = 2796;
const ZONE = { top: 900, bottom: 2300 };

function wallpaper(k) {
  const [bx, by, bw, bh] = k.box.split(' ').map(Number);
  const nested = (x, y, w, h) => `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${k.box}">${k.body}</svg>`;
  const zoneH = ZONE.bottom - ZONE.top;
  let art, extra = k.defs || '';

  if (k.wall === 'arch') {
    const pw = 900, ph = 1320, px = (W - pw) / 2, py = ZONE.top + (zoneH - ph) / 2;
    const arch = `M${px} ${py + ph} V${py + pw / 2} A${pw / 2} ${pw / 2} 0 0 1 ${px + pw} ${py + pw / 2} V${py + ph} Z`;
    const s = Math.min(760 / bw, 1060 / bh), w = bw * s, h = bh * s;
    extra += `<clipPath id="arch"><path d="${arch}"/></clipPath>`;
    art = `<path d="${arch}" fill="#FFFEFB"/>
<g clip-path="url(#arch)">${nested((W - w) / 2, py + ph - h - (k.foot || 0), w, h)}</g>
<path d="${arch}" fill="none" stroke="#B8923C" stroke-width="3"/>
<path d="M${px - 16} ${py + ph + 16} V${py + pw / 2} A${pw / 2 + 16} ${pw / 2 + 16} 0 0 1 ${px + pw + 16} ${py + pw / 2} V${py + ph + 16} Z" fill="none" stroke="#B8923C" stroke-width="1.5" opacity=".7"/>`;
  } else {
    const s = Math.min(1040 / bw, 1320 / bh), w = bw * s, h = bh * s;
    const x = (W - w) / 2, y = ZONE.top + (zoneH - h) / 2;
    const mount = k.wall === 'framed'
      ? `<rect x="${x - 26}" y="${y - 26}" width="${w + 52}" height="${h + 52}" fill="#FFFEFB"/>
<rect x="${x - 26}" y="${y - 26}" width="${w + 52}" height="${h + 52}" fill="none" stroke="#B8923C" stroke-width="2.5"/>` : '';
    const edge = k.wall === 'framed' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#B8923C" stroke-width="1.5" opacity=".8"/>` : '';
    art = mount + nested(x, y, w, h) + edge;
  }

  const sprig = (seed) => Art.sprig({ seed }).replace('<svg ', '<svg width="560" height="560" ');
  const body = `<rect width="${W}" height="${H}" fill="#F2D3CC"/>
<g transform="translate(${W + 36} 524) scale(-1 -1)">${sprig(8)}</g>
<g transform="translate(-76 ${H - 474})">${sprig(14)}</g>
${art}
<text x="${W / 2}" y="2452" text-anchor="middle" font-family="Didot, 'Bodoni 72', 'Times New Roman', serif" font-size="62" letter-spacing="14" fill="#7C5D1F">B &amp; K</text>`;
  return svgFile(`0 0 ${W} ${H}`, W, H, body, extra);
}

const manifest = [];
for (const k of keepsakes) {
  const [, , bw, bh] = k.box.split(' ').map(Number);
  const height = Math.round((k.width * bh) / bw);
  fs.writeFileSync(path.join(artDir, k.name + '.svg'), svgFile(k.box, k.width, height, k.body, k.defs || ''));
  fs.writeFileSync(path.join(wallDir, k.name + '.svg'), wallpaper(k));
  manifest.push(`characters/${k.name} ${k.width} ${height}`, `wallpapers/${k.name} ${W} ${H}`);
}
fs.writeFileSync(path.join(root, 'assets', 'render-list.txt'), manifest.join('\n') + '\n');
console.log(`${keepsakes.length} keepsakes written as artwork and as ${W}×${H} wallpapers.`);
