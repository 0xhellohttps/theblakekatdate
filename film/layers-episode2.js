/* ------------------------------------------------------------------
   Painted layers for Episode Two, "Starting to Talk" — in the same
   marker-and-crayon hand as the film. Writes SVGs into film/layers/
   (names start with "e2-") and a render list; build-episode2.sh then
   rasterises them. Boards are drawn in a 960 × 540 space.
------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(__dirname, 'layers');
fs.mkdirSync(out, { recursive: true });
global.window = {};
require(path.join(root, 'js', 'art.js'));
const Art = global.window.Art;
const { C, f, rng, pick, wash, ink, flower, leaf, blossoms, scallops, star, swan, poodle, blake, kat } = Art._;
Art._.inkScale = 2.2;
const defs = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<defs>([\s\S]*?)<\/defs>/)[1];
const nest = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const at = (fig, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${fig}</g>`;
const list = [];
function save(name, box, pxW, body, extra = '') {
  const [, , w, h] = box.split(' ').map(Number);
  const pxH = Math.round((pxW * h) / w);
  fs.writeFileSync(path.join(out, name + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${pxW}" height="${pxH}"><defs>${defs}${extra}</defs>${body}</svg>\n`);
  list.push(`${name} ${pxW} ${pxH}`);
}
const board = (name, body, px = 3840, extra = '') => save(name, '0 0 960 540', px, body, extra);
const PINKS = [C.blush, C.pink, C.rose, C.magenta];
// Crayon lets the paper show through; things that stand in front of scenery get a sheet of paper behind them, so the scenery doesn't.
const BACK = `<filter id="back" x="-5%" y="-5%" width="110%" height="110%"><feColorMatrix type="matrix" values="0 0 0 0 .992  0 0 0 0 .98  0 0 0 0 .957  0 0 0 6 0"/></filter>`;
const backed = (body) => `<g filter="url(#back)">${body}</g>${body}`;


const palmAt = (seed, x, y, w) => nest(Art.palm({ seed }), x, y, w, w * 2);
const stars = (r, n, y1) => { let s = ''; for (let i = 0; i < n; i++) s += star(20 + r() * 920, 14 + r() * y1, 2 + r() * 3.5); return s; };
const bowl = (x, y) => ({
  w: `<path d="M${x - 40} ${y} H${x + 40} C${x + 40} ${y + 30} ${x + 20} ${y + 40} ${x} ${y + 40} C${x - 20} ${y + 40} ${x - 40} ${y + 30} ${x - 40} ${y}Z" fill="${C.powder}"/><ellipse cx="${x}" cy="${y}" rx="40" ry="10" fill="#FBF3E4"/><ellipse cx="${x - 10}" cy="${y - 3}" rx="14" ry="6" fill="#D9A066"/><ellipse cx="${x + 14}" cy="${y - 2}" rx="12" ry="5" fill="#C98562"/>`,
  k: `<path d="M${x - 40} ${y} C${x - 40} ${y + 30} ${x - 20} ${y + 40} ${x} ${y + 40} C${x + 20} ${y + 40} ${x + 40} ${y + 30} ${x + 40} ${y}"/><ellipse cx="${x}" cy="${y}" rx="40" ry="10"/><path d="M${x - 4} ${y - 16} q6 -10 0 -20 M${x + 12} ${y - 16} q6 -10 0 -20"/>`,
});

/* ---------- the cast ---------- */
{
  // Blake at the studio: green tee, headphones round his neck
  const kit =
    wash(`<path d="M28 252 C32 198 62 174 86 166 C92 176 108 176 114 166 C138 174 168 198 172 252Z" fill="#2FA866"/><path d="M86 166 C92 178 108 178 114 166 L114 150 L86 150Z" fill="#F0C7A4"/>
          <path d="M70 176 C76 204 124 204 130 176" fill="none" stroke="#2A2529" stroke-width="9"/><rect x="56" y="160" width="22" height="34" rx="9" fill="#2A2529"/><rect x="122" y="160" width="22" height="34" rx="9" fill="#2A2529"/>`, '-s') +
    ink(`<path d="M30 250 C34 200 62 176 86 167 M114 167 C138 176 166 200 170 250"/>`, '-s', 1.1);
  save('e2-blake', '0 0 200 250', 1000, backed(blake() + kit), BACK);
}

/* ---------- sunny Los Angeles: a tall building across the street from the country club ---------- */
{
  const r = rng(2101);
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#BBD6F5"/><circle cx="330" cy="130" r="74" fill="${C.goldLight}"/><ellipse cx="480" cy="330" rx="640" ry="90" fill="#F9CDD3"/>
    <path d="M-20 330 C120 250 240 300 360 270 C520 232 700 300 980 250 V400 H-20Z" fill="${C.sage}"/>
    <path d="M-20 392 C200 378 700 378 980 394 V560 H-20Z" fill="#CFC6B8"/><path d="M-20 430 C200 410 700 410 980 432 V560 H-20Z" fill="#6DBB78"/><path d="M-20 480 C200 462 700 470 980 484 V560 H-20Z" fill="${C.lawn}"/>
    <ellipse cx="250" cy="494" rx="96" ry="20" fill="${C.parchment}"/><ellipse cx="520" cy="470" rx="64" ry="12" fill="#BFE3BE"/><path d="M520 470 V398 L554 410 L520 422" fill="${C.vermilion}"/>`;
  let K = `<path d="M-20 392 C200 378 700 378 980 394 M-20 430 C200 410 700 410 980 432 M520 470 V398 L554 410 L520 422"/><ellipse cx="520" cy="470" rx="64" ry="12"/><ellipse cx="251" cy="493" rx="96" ry="20"/>`;
  for (let i = 0; i < 12; i++) { const x = 40 + r() * 560, y = 290 + r() * 46; W += `<rect x="${f(x)}" y="${f(y)}" width="16" height="12" fill="${pick(r, ['#F7AEB9', '#FFFDF9', C.terracotta])}"/>`; }
  const tower = (x, w, top, col) => {
    W += `<rect x="${x}" y="${top}" width="${w}" height="${396 - top}" fill="${col}"/><rect x="${x + 10}" y="${top - 16}" width="${w - 20}" height="18" fill="${col}"/>`;
    K += `<path d="M${x} ${top} V394 M${x + w} ${top} V394 M${x} ${top} H${x + w} M${x + 10} ${top} V${top - 16} H${x + w - 10} V${top}"/>`;
    for (let y = top + 16; y < 380; y += 26) { W += `<rect x="${x + 10}" y="${y}" width="${w - 20}" height="13" fill="${C.powder}"/>`; K += `<path d="M${x - 6} ${y + 17} H${x + w + 6}"/>`; }
  };
  tower(700, 120, 64, '#FFFDF9'); tower(848, 76, 150, '#F7AEB9'); tower(610, 64, 210, '#FBF3E4');
  W += blossoms(r, 690, 388, 24, 14, 20, PINKS, 7) + blossoms(r, 838, 388, 20, 12, 16, PINKS, 7);
  board('e2-la', wash(W) + ink(K, '', 1) + palmAt(6, 20, 150, 150) + palmAt(19, 400, 150, 130) + palmAt(33, 120, 230, 110) + palmAt(45, 930, 250, 90) + palmAt(8, 540, 250, 90));
}

/* ---------- Atlanta at dusk: fairways, old trees, porches, and one studio with the lights on ---------- */
{
  const r = rng(2202);
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#8FA9D2"/><ellipse cx="480" cy="300" rx="640" ry="120" fill="#C7B6D6"/><g fill="${C.goldLight}">${stars(r, 30, 190)}</g>
    <path d="M150 70 A30 30 0 1 0 186 108 A23 23 0 1 1 150 70Z" fill="${C.goldLight}"/>
    <path d="M-20 330 C140 290 280 320 420 300 C600 276 780 320 980 290 V560 H-20Z" fill="#6DBB78"/>
    <path d="M-20 400 C200 360 420 420 620 384 C760 360 880 392 980 380 V560 H-20Z" fill="${C.lawn}"/>
    <path d="M-20 470 C160 440 380 500 600 462 C760 436 900 470 980 460 V560 H-20Z" fill="#6DBB78"/>
    <ellipse cx="250" cy="452" rx="92" ry="22" fill="${C.parchment}"/><ellipse cx="720" cy="486" rx="110" ry="24" fill="${C.water}"/>
    <ellipse cx="520" cy="420" rx="70" ry="14" fill="#BFE3BE"/><path d="M520 420 V330 L560 344 L520 358" fill="${C.vermilion}"/>`;
  let K = `<path d="M520 420 V330 L560 344 L520 358"/><ellipse cx="520" cy="420" rx="70" ry="14"/><ellipse cx="251" cy="451" rx="92" ry="22"/><path d="M660 486 q14 -5 28 0 M730 494 q14 -5 28 0"/>`;
  const oak = (x, y, s) => { W += `<path d="M${x - 6 * s} ${y} V${y - 46 * s} H${x + 6 * s} V${y}Z" fill="${C.bark}"/>` + blossoms(r, x, y - 70 * s, 46 * s, 36 * s, 26, [C.forest, C.leaf, '#2F8F5B'], 13 * s); K += scallops(r, x, y - 70 * s, 40 * s, 30 * s, 4); };
  oak(70, 400, 1.2); oak(400, 352, 0.9); oak(880, 398, 1.25); oak(640, 340, 0.8);
  const porch = (x) => { W += `<rect x="${x}" y="286" width="120" height="74" fill="#FFFDF9"/><path d="M${x - 10} 288 L${x + 60} 250 L${x + 130} 288Z" fill="#7A8CA8"/><rect x="${x + 48}" y="324" width="24" height="36" fill="${C.oxblood}"/><rect x="${x + 14}" y="304" width="22" height="26" fill="${C.goldLight}"/><rect x="${x + 84}" y="304" width="22" height="26" fill="${C.goldLight}"/>`;
    K += `<path d="M${x} 288 V360 M${x + 120} 288 V360 M${x - 10} 288 L${x + 60} 250 L${x + 130} 288Z M${x - 6} 360 H${x + 126} M${x + 8} 288 V360 M${x + 112} 288 V360"/>`; };
  porch(150); porch(700);
  W += `<rect x="286" y="300" width="96" height="66" fill="#2A2529"/><rect x="304" y="316" width="60" height="30" fill="${C.goldLight}"/>`;
  K += `<rect x="286" y="300" width="96" height="66"/><path d="M326 338 v-16 l14 -4 v16 M326 338 a5 4 0 1 1 -1 -1 M340 334 a5 4 0 1 1 -1 -1" stroke-width="2.200"/>`;
  board('e2-atl', wash(W) + ink(K, '', 1));
}

/* ---------- Blake's studio ---------- */
{
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#3E6FA8"/><rect x="-20" y="330" width="1000" height="230" fill="#2B4F80"/>
    <rect x="660" y="70" width="190" height="150" fill="#27345A"/><path d="M700 96 A22 22 0 1 0 726 124 A17 17 0 1 1 700 96Z" fill="${C.goldLight}"/><path d="M790 220 V150 L820 160 L790 170" fill="${C.vermilion}"/>
    <path d="M150 90 C120 120 126 190 150 214 C174 190 180 120 150 90Z" fill="#C98562"/><rect x="146" y="20" width="8" height="80" fill="${C.bark}"/><circle cx="150" cy="150" r="13" fill="#2A2529"/>
    <rect x="70" y="250" width="90" height="130" fill="#2A2529"/><circle cx="115" cy="290" r="18" fill="#57504A"/><circle cx="115" cy="344" r="26" fill="#57504A"/>
    <rect x="800" y="250" width="90" height="130" fill="#2A2529"/><circle cx="845" cy="290" r="18" fill="#57504A"/><circle cx="845" cy="344" r="26" fill="#57504A"/>`;
  let K = `<rect x="660" y="70" width="190" height="150"/><path d="M755 70 V220 M660 145 H850 M150 90 C120 120 126 190 150 214 C174 190 180 120 150 90Z M150 20 V90"/><rect x="70" y="250" width="90" height="130"/><rect x="800" y="250" width="90" height="130"/>`;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = 250 + i * 90, y = 60 + j * 90; W += `<path d="M${x} ${y + 36} L${x + 36} ${y} L${x + 72} ${y + 36} L${x + 36} ${y + 72}Z" fill="${(i + j) % 2 ? '#F29AAE' : '#F5D45E'}"/>`; K += `<path d="M${x} ${y + 36} L${x + 36} ${y} L${x + 72} ${y + 36} L${x + 36} ${y + 72}Z"/>`; }
  board('e2-studio', wash(W) + ink(K, '', 1));
  const b = bowl(700, 392);
  let F = `<path d="M110 420 H850 L880 470 H80Z" fill="#57504A"/><rect x="80" y="470" width="800" height="90" fill="#3B3632"/><rect x="250" y="388" width="330" height="36" fill="${C.white}"/>` + b.w +
    `<path d="M200 330 L300 250" stroke="#2A2529" stroke-width="7" fill="none"/><rect x="286" y="226" width="34" height="56" rx="14" fill="#C9CFD8"/>`;
  let FK = `<path d="M110 420 H850 L880 470 H80Z M80 470 V560 M880 470 V560"/><rect x="250" y="388" width="330" height="36"/><rect x="286" y="226" width="34" height="56" rx="14"/><path d="M290 244 h26 M290 258 h26"/>` + b.k;
  for (let x = 262; x < 578; x += 22) FK += `<path d="M${x} 388 V${x % 44 < 22 ? 424 : 410}"/>`;
  for (let i = 0; i < 12; i++) { F += `<rect x="${f(140 + i * 54)}" y="${f(438 + (i * 7) % 16)}" width="14" height="9" fill="${C.goldLight}"/>`; FK += `<path d="M${147 + i * 54} 430 V464"/>`; }
  board('e2-studio-fg', backed(wash(F)) + ink(FK, '', 1), 3840, BACK);
}

/* ---------- Kat's place in Los Angeles ---------- */
{
  const r = rng(2303);
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#F9CDD3"/><rect x="-20" y="360" width="1000" height="200" fill="#EBA9B4"/>
    <rect x="40" y="70" width="270" height="270" fill="#BBD6F5"/><circle cx="250" cy="120" r="30" fill="${C.goldLight}"/><path d="M40 230 C110 200 200 226 310 206 V340 H40Z" fill="${C.sage}"/>
    <rect x="60" y="196" width="18" height="50" fill="#FFFDF9"/><rect x="88" y="176" width="22" height="70" fill="#F7AEB9"/><rect x="120" y="206" width="16" height="40" fill="#FBF3E4"/>
    <path d="M40 262 C120 248 220 256 310 250 V340 H40Z" fill="#6DBB78"/><ellipse cx="130" cy="300" rx="40" ry="8" fill="${C.parchment}"/><ellipse cx="236" cy="288" rx="30" ry="6" fill="#BFE3BE"/><path d="M236 288 V258 L252 264 L236 270" fill="${C.vermilion}"/>
    <rect x="700" y="90" width="150" height="110" fill="${C.white}"/><ellipse cx="900" cy="330" rx="34" ry="12" fill="${C.gold}"/><rect x="896" y="210" width="8" height="120" fill="${C.gold}"/><path d="M864 214 L936 214 L922 160 L878 160Z" fill="#F6E7C4"/>
    <path d="M300 300 C300 250 1090 250 880 300 L880 420 H300Z" fill="#E86F8E"/><rect x="270" y="330" width="640" height="110" rx="26" fill="#F28FA2"/><rect x="250" y="300" width="60" height="140" rx="24" fill="#E86F8E"/><rect x="870" y="300" width="60" height="140" rx="24" fill="#E86F8E"/>`;
  let K = `<rect x="40" y="70" width="270" height="270"/><path d="M130 70 V340 M220 70 V340 M40 262 C120 248 220 256 310 250 M236 288 V258 L252 264 L236 270"/><rect x="700" y="90" width="150" height="110"/><path d="M864 214 L936 214 L922 160 L878 160Z M900 214 V320"/>
    <path d="M300 300 C300 256 880 256 880 300"/><rect x="270" y="330" width="640" height="110" rx="26"/><rect x="250" y="300" width="60" height="140" rx="24"/><rect x="870" y="300" width="60" height="140" rx="24"/><path d="M590 334 V436"/>`;
  board('e2-room', wash(W) + ink(K, '', 1) + `<g transform="translate(716 106) scale(.8)">${swan()}</g>`);
  const b = bowl(420, 440);
  const F = `<ellipse cx="480" cy="486" rx="300" ry="34" fill="#FFFDF9"/><path d="M300 506 L290 560 M660 506 L670 560" stroke="${C.gold}" stroke-width="7" fill="none"/>` + b.w +
    `<rect x="540" y="462" width="34" height="58" rx="7" fill="#2A2529" transform="rotate(-70 557 491)"/><rect x="610" y="458" width="34" height="58" rx="7" fill="#F29AAE" transform="rotate(-100 627 487)"/>`;
  const FK = `<ellipse cx="481" cy="486" rx="300" ry="34"/>` + b.k + `<rect x="540" y="462" width="34" height="58" rx="7" transform="rotate(-70 557 491)"/><rect x="610" y="458" width="34" height="58" rx="7" transform="rotate(-100 627 487)"/>`;
  board('e2-room-fg', backed(wash(F)) + ink(FK, '', 1), 3840, BACK);
}

/* ---------- lights out: his very large bedroom, and hers, high above the city ---------- */
{
  const r = rng(2404);
  const bedW = `<path d="M190 400 V200 Q190 150 240 150 H720 Q770 150 770 200 V400Z" fill="#C98562"/><rect x="300" y="240" width="360" height="150" rx="40" fill="#FFFDF9"/>`;
  const bedK = `<path d="M190 400 V200 Q190 150 240 150 H720 Q770 150 770 200 V400"/><rect x="300" y="240" width="360" height="150" rx="40"/>`;
  const arch = (x) => `M${x} 330 V110 A50 50 0 0 1 ${x + 100} 110 V330Z`;
  // Blake's: tall arched windows over the fairway, a chandelier, lamps either side
  board('e2-bed-b', wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#4A5A8C"/><rect x="-20" y="430" width="1000" height="130" fill="#3B4A78"/>
      <path d="${arch(30)} ${arch(830)}" fill="#27345A"/><path d="M66 100 A20 20 0 1 0 90 124 A15 15 0 1 1 66 100Z" fill="${C.goldLight}"/><path d="M880 330 V250 L906 260 L880 270" fill="${C.vermilion}"/><path d="M830 300 C870 286 900 296 930 290 V330 H830Z" fill="#5C8A6E"/>
      <path d="M440 0 V40 M400 60 Q480 100 560 60" fill="none" stroke="${C.gold}" stroke-width="6"/><circle cx="400" cy="62" r="9" fill="${C.goldLight}"/><circle cx="480" cy="82" r="9" fill="${C.goldLight}"/><circle cx="560" cy="62" r="9" fill="${C.goldLight}"/>
      <rect x="130" y="330" width="50" height="70" fill="#C98562"/><path d="M134 330 L176 330 L166 290 L144 290Z" fill="#F6E7C4"/><rect x="780" y="330" width="50" height="70" fill="#C98562"/><path d="M784 330 L826 330 L816 290 L794 290Z" fill="#F6E7C4"/>` + bedW) +
    ink(`<path d="${arch(30)} ${arch(830)} M80 60 V330 M880 60 V330 M-20 430 H190 M770 430 H980"/><rect x="130" y="330" width="50" height="70"/><rect x="780" y="330" width="50" height="70"/>` + bedK, '', 1));
  // Kat's: one wide window, the city lit up below
  let city = `<rect x="560" y="50" width="330" height="200" fill="#27345A"/><path d="M620 80 A22 22 0 1 0 646 108 A17 17 0 1 1 620 80Z" fill="${C.goldLight}"/><path d="M560 214 C660 200 780 208 890 200 V250 H560Z" fill="#3E6B52"/>`;
  [[580, 150, 30], [620, 130, 26], [700, 160, 34], [744, 120, 28], [800, 150, 30], [846, 170, 26]].forEach(([x, y, w]) => { city += `<rect x="${x}" y="${y}" width="${w}" height="${214 - y}" fill="#3B4A78"/>`; for (let i = 0; i < 6; i++) city += `<rect x="${f(x + 4 + (i % 2) * (w / 2))}" y="${f(y + 8 + Math.floor(i / 2) * 16)}" width="6" height="7" fill="${C.goldLight}"/>`; });
  board('e2-bed-k', wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#4A5A8C"/>` + city + bedW) + ink(`<rect x="560" y="50" width="330" height="200"/><path d="M670 50 V250 M780 50 V250"/>` + bedK, '', 1));
  [['b', '#2FA866', '#1E5B3C'], ['k', '#F4A9B8', '#E86F8E']].forEach(([n, a, b2]) => {
    let W = `<path d="M150 420 C300 380 660 380 810 420 V560 H150Z" fill="${a}"/><path d="M150 420 C300 380 660 380 810 420 V450 C660 412 300 412 150 450Z" fill="#FFFDF9"/>`, K = `<path d="M150 420 C300 380 660 380 810 420 M150 450 C300 412 660 412 810 450 M150 420 V560 M810 420 V560"/>`;
    for (let i = 0; i < 16; i++) W += `<circle cx="${f(190 + r() * 580)}" cy="${f(470 + r() * 70)}" r="9" fill="${b2}"/>`;
    board('e2-bed-fg-' + n, backed(wash(W)) + ink(K, '', 1), 3840, BACK);
  });
}

/* ---------- Blake's house: very big, very spacious, lights on ---------- */
{
  const r = rng(2606);
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#8FA9D2"/><ellipse cx="480" cy="300" rx="640" ry="110" fill="#C7B6D6"/><g fill="${C.goldLight}">${stars(r, 26, 150)}</g><path d="M820 60 A28 28 0 1 0 852 96 A21 21 0 1 1 820 60Z" fill="${C.goldLight}"/>
    <path d="M-20 400 C200 384 760 384 980 402 V560 H-20Z" fill="#6DBB78"/><ellipse cx="480" cy="486" rx="250" ry="40" fill="${C.parchment}"/><ellipse cx="480" cy="480" rx="120" ry="18" fill="#6DBB78"/>
    <rect x="110" y="250" width="200" height="154" fill="#FBF3E4"/><rect x="650" y="250" width="200" height="154" fill="#FBF3E4"/><rect x="300" y="200" width="360" height="204" fill="#FFFDF9"/>
    <path d="M96 252 L324 252 L306 220 L114 220Z M636 252 L864 252 L846 220 L654 220Z" fill="#7A8CA8"/><path d="M360 204 L600 204 L480 130Z" fill="#FFFDF9"/><path d="M286 204 H674 L650 176 H310Z" fill="#7A8CA8"/>
    <rect x="452" y="318" width="56" height="86" fill="${C.oxblood}"/><rect x="350" y="390" width="260" height="14" fill="#FFFDF9"/><circle cx="480" cy="176" r="13" fill="${C.goldLight}"/>`;
  let K = `<path d="M110 252 V402 M310 252 V402 M650 252 V402 M850 252 V402 M300 204 V402 M660 204 V402 M96 252 H324 L306 220 H114Z M636 252 H864 L846 220 H654Z M360 204 L480 130 L600 204 M286 204 H674"/><rect x="452" y="318" width="56" height="86"/><path d="M480 318 V404 M350 390 H610"/><circle cx="480" cy="176" r="13"/><ellipse cx="480" cy="486" rx="250" ry="40"/><ellipse cx="480" cy="480" rx="120" ry="18"/>`;
  [372, 414, 532, 574].forEach((x) => { W += `<rect x="${x}" y="212" width="14" height="178" fill="#FFFFFF"/>`; K += `<path d="M${x} 212 V390 M${x + 14} 212 V390"/>`; });
  [[130, 270], [190, 270], [250, 270], [130, 336], [190, 336], [250, 336], [670, 270], [730, 270], [790, 270], [670, 336], [730, 336], [790, 336], [320, 226], [320, 300], [612, 226], [612, 300]].forEach(([x, y]) => { W += `<rect x="${x}" y="${y}" width="34" height="44" fill="${C.goldLight}"/>`; K += `<rect x="${x}" y="${y}" width="34" height="44"/><path d="M${x + 17} ${y} V${y + 44}"/>`; });
  W += `<path d="M476 476 V450 H484 V476Z" fill="${C.stone}"/><ellipse cx="480" cy="450" rx="16" ry="5" fill="${C.water}"/>
    <path d="M660 500 Q664 478 700 474 L724 458 H770 L792 474 L820 478 Q832 482 832 500Z" fill="#C9CFD8"/><circle cx="696" cy="502" r="12" fill="#2A2529"/><circle cx="800" cy="502" r="12" fill="#2A2529"/>`;
  K += `<path d="M660 500 Q664 478 700 474 L724 458 H770 L792 474 L820 478 Q832 482 832 500Z"/><circle cx="696" cy="502" r="12"/><circle cx="800" cy="502" r="12"/><path d="M480 444 q-10 -14 -18 4 M480 444 q10 -14 18 4"/>`;
  const oak = (x, y, s) => { W += `<path d="M${x - 6 * s} ${y} V${y - 46 * s} H${x + 6 * s} V${y}Z" fill="${C.bark}"/>` + blossoms(r, x, y - 70 * s, 46 * s, 36 * s, 26, [C.forest, C.leaf, '#2F8F5B'], 13 * s); };
  oak(50, 420, 1.5); oak(910, 424, 1.5);
  board('e2-house', wash(W) + ink(K, '', 1));
}

/* ---------- from Latvia to here ---------- */
{
  const r = rng(2505);
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#BBD6F5"/><path d="M-20 360 C60 320 150 350 250 330 V560 H-20Z" fill="${C.sage}"/><path d="M710 340 C800 310 880 340 980 320 V560 H710Z" fill="${C.lawn}"/>
    <rect x="-20" y="380" width="1000" height="200" fill="${C.water}"/><path d="M-20 362 C60 322 150 352 250 332 V420 H-20Z" fill="${C.sage}"/><path d="M710 342 C800 312 880 342 980 322 V420 H710Z" fill="${C.lawn}"/>
    <circle cx="820" cy="110" r="56" fill="${C.goldLight}"/>`;
  let K = '';
  [[40, 60, 110], [96, 44, 150], [150, 54, 96], [200, 40, 124]].forEach(([x, w, h]) => { W += `<rect x="${x}" y="${340 - h}" width="${w}" height="${h}" fill="${pick(r, ['#FFFDF9', '#F7AEB9', '#F5D45E'])}"/><path d="M${x - 4} ${340 - h} L${x + w / 2} ${340 - h - 54} L${x + w + 4} ${340 - h}Z" fill="${C.terracotta}"/>`; K += `<path d="M${x} ${340 - h} V340 M${x + w} ${340 - h} V340 M${x - 4} ${340 - h} L${x + w / 2} ${340 - h - 54} L${x + w + 4} ${340 - h}Z M${x + w / 2} ${340 - h - 54} v-16"/>`; });
  for (let i = 0; i < 9; i++) K += `<path d="M${300 + i * 46} ${440 + (i % 3) * 30} q12 -6 24 0"/>`;
  W += `<rect x="410" y="430" width="130" height="92" rx="10" fill="${C.oxblood}"/><rect x="452" y="412" width="46" height="22" rx="8" fill="none" stroke="${C.oxblood}" stroke-width="8"/>
    <path d="M440 150 L520 132 L512 122 L560 126 L590 112 L600 124 L572 140 L548 178 L536 176 L544 146 L470 164Z" fill="#FFFDF9"/>`;
  K += `<rect x="410" y="430" width="130" height="92" rx="10"/><path d="M440 430 V522 M510 430 V522"/><path d="M440 150 L520 132 L512 122 L560 126 L590 112 L600 124 L572 140 L548 178 L536 176 L544 146 L470 164Z"/>
    <path d="M250 300 C330 120 620 80 760 300" stroke="${C.vermilion}" stroke-width="5" stroke-dasharray="3 16"/>`;
  board('e2-journey', wash(W) + ink(K, '', 1) + palmAt(6, 760, 170, 110) + palmAt(33, 860, 200, 90));
}

/* ---------- every weekend: a street of front doors ---------- */
{
  let W = `<rect x="-20" y="-20" width="1000" height="580" fill="#F2D98A"/><rect x="-20" y="430" width="1000" height="130" fill="${C.parchment}"/><circle cx="130" cy="96" r="50" fill="${C.goldLight}"/>`, K = `<path d="M-20 430 H980"/>`;
  [['#F7AEB9', C.oxblood], ['#FFFDF9', C.forest], ['#BBD6F5', C.vermilion], ['#BFE3BE', '#2B4FA0'], ['#F9CDD3', C.gold]].forEach(([wall, door], i) => {
    const x = 30 + i * 190;
    W += `<rect x="${x}" y="150" width="170" height="280" fill="${wall}"/><path d="M${x - 8} 152 L${x + 85} 96 L${x + 178} 152Z" fill="${C.terracotta}"/><path d="M${x + 50} 430 V290 A35 35 0 0 1 ${x + 120} 290 V430Z" fill="${door}"/><circle cx="${x + 106}" cy="366" r="5" fill="${C.goldLight}"/><rect x="${x + 22}" y="190" width="40" height="46" fill="${C.goldLight}"/><rect x="${x + 108}" y="190" width="40" height="46" fill="${C.goldLight}"/><rect x="${x + 40}" y="430" width="90" height="12" fill="#FFFDF9"/>`;
    K += `<path d="M${x} 152 V430 M${x + 170} 152 V430 M${x - 8} 152 L${x + 85} 96 L${x + 178} 152Z M${x + 50} 430 V290 A35 35 0 0 1 ${x + 120} 290 V430"/><rect x="${x + 22}" y="190" width="40" height="46"/><rect x="${x + 108}" y="190" width="40" height="46"/>`;
  });
  // a small boy in a little suit, with a little bag
  const boy = `<circle cx="470" cy="352" r="20" fill="#F0C7A4"/><path d="M450 348 C448 326 492 326 490 348 C480 338 460 338 450 348Z" fill="#4A3426"/><path d="M446 440 V392 Q446 374 470 374 Q494 374 494 392 V440Z" fill="#2A2529"/><path d="M464 376 L470 400 L476 376Z" fill="#FFFDF9"/><rect x="494" y="402" width="30" height="24" rx="4" fill="#C98562"/>`;
  board('e2-doors', wash(W) + ink(K, '', 1) + backed(wash(boy, '-s')) + ink(`<circle cx="470" cy="352" r="20"/><path d="M446 440 V392 Q446 374 470 374 Q494 374 494 392 V440 M494 402 h30 v24 h-30Z M502 402 q7 -10 14 0"/>`, '-s', 1), 3840, BACK);
}

fs.writeFileSync(path.join(out, 'render-list-episode2.txt'), list.join('\n') + '\n');
console.log(list.length + ' episode-two layers written');
