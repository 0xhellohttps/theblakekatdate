/* ------------------------------------------------------------------
   Painted layers for Episode One, "The Point-Two" — in the same
   marker-and-crayon hand as the film. Writes SVGs into film/layers/
   (names start with "ep-") and a render list; build-episode.sh then
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

/* ---------- the cast ---------- */
{
  // Blake, dressed for the run: green tee and the patterned headband
  let spots = '';
  const r = rng(3);
  for (let i = 0; i < 16; i++) spots += `<circle cx="${f(70 + r() * 60)}" cy="${f(70 + r() * 9 + Math.abs(100 - (70 + r() * 60)) * 0.06)}" r="${f(1.2 + r() * 1.3)}" fill="#1F1C1B"/>`;
  const kit =
    wash(`<path d="M28 252 C32 198 62 174 86 166 C92 176 108 176 114 166 C138 174 168 198 172 252Z" fill="#2FA866"/>
          <path d="M86 166 C92 178 108 178 114 166 L114 150 L86 150Z" fill="#F0C7A4"/>
          <path d="M66 80 C78 67 122 67 134 80 L135 91 C122 80 78 80 65 91Z" fill="#DCE3EA"/>`, '-s') +
    spots +
    ink(`<path d="M30 250 C34 200 62 176 86 167 C92 178 108 178 114 167 C138 176 166 200 170 250"/><path d="M66 80 C78 67 122 67 134 80 M65 91 C78 80 122 80 135 91"/>`, '-s', 1.1);
  save('ep-blake', '0 0 200 250', 1000, backed(blake() + kit), BACK);
  save('ep-kat', '0 0 200 250', 1000, backed(kat()), BACK);
  save('ep-dog', '4 -4 112 158', 700, backed(poodle()), BACK);
}

/* ---------- the street: sky (still), houses and palms (a tile that scrolls), the hedge ---------- */
{
  const r = rng(808);
  board('ep-sky', wash(
    `<rect x="-20" y="-20" width="1000" height="580" fill="#BBD6F5"/><circle cx="770" cy="118" r="62" fill="${C.goldLight}"/>
     <ellipse cx="210" cy="96" rx="92" ry="22" fill="#FFFFFF"/><ellipse cx="270" cy="76" rx="56" ry="20" fill="#FFFFFF"/><ellipse cx="560" cy="150" rx="70" ry="16" fill="#FFFFFF"/>
     <path d="M-20 330 C110 284 240 312 380 296 C540 276 720 316 980 282 V560 H-20Z" fill="${C.sage}"/>
     <path d="M-20 372 C200 352 700 352 980 374 V560 H-20Z" fill="${C.lawn}"/>`), 1920);
  const house = (x, w) => `<rect x="${x}" y="226" width="${w}" height="180" fill="#F7AEB9"/><path d="M${x - 10} 228 L${x + w + 10} 228 L${x + w - 4} 202 L${x + 4} 202Z" fill="${C.terracotta}"/>
     <path d="M${x + w / 2 - 22} 406 V318 A22 22 0 0 1 ${x + w / 2 + 22} 318 V406Z" fill="${C.goldLight}"/>`;
  const houseK = (x, w) => `<path d="M${x} 228 V404 M${x + w} 228 V404 M${x - 10} 228 H${x + w + 10} L${x + w - 4} 202 H${x + 4}Z M${x + w / 2 - 22} 404 V318 A22 22 0 0 1 ${x + w / 2 + 22} 318 V404"/>`;
  const palm = (seed, x, y, w) => nest(Art.palm({ seed }), x, y, w, w * 2);
  board('ep-mid',
    wash(house(60, 170) + house(540, 150) + `<ellipse cx="300" cy="330" rx="12" ry="56" fill="${C.forest}"/><ellipse cx="462" cy="344" rx="10" ry="44" fill="${C.forest}"/>` +
      blossoms(r, 250, 300, 30, 26, 22, PINKS, 8) + blossoms(r, 710, 300, 26, 24, 20, PINKS, 8)) +
    ink(houseK(60, 170) + houseK(540, 150), '', 1) + palm(6, 340, 170, 110) + palm(19, 760, 150, 124) + palm(33, 868, 214, 86), 1920);

  let top = 'M-20 392';
  for (let x = -20; x < 980; x += 50) top += ` q25 -22 50 0`;
  let fl = { w: '', k: '' };
  for (let i = 0; i < 22; i++) {
    const b = flower(20 + i * 44 + r() * 20, 420 + r() * 96, 7 + r() * 5, pick(r, [C.rose, C.pink, C.white, C.magenta, C.goldLight]), r() * 72);
    fl.w += b.w; fl.k += b.k;
  }
  board('ep-hedge', backed(wash(`<path d="${top} V560 H-20Z" fill="#3E9B63"/>` + blossoms(r, 480, 470, 480, 60, 70, ['#2F8F5B', '#4BB274', C.forest], 12))) + ink(`<path d="${top}"/>`, '', 1.1), 1920, BACK);
  board('ep-hedge-fl', wash(fl.w) + ink(fl.k, '', 0.9), 1920);
}

/* ---------- the reward: ice cream and warm cookies ---------- */
{
  const r = rng(909);
  const lamp = (x) => `<path d="M${x} -10 V70" stroke="${C.goldDeep}" stroke-width="3" fill="none"/><path d="M${x - 34} 116 L${x + 34} 116 L${x + 20} 70 L${x - 20} 70Z" fill="${C.vermilion}"/>`;
  const lampK = (x) => `<path d="M${x - 34} 116 L${x + 34} 116 L${x + 20} 70 L${x - 20} 70Z M${x - 26} 96 H${x + 26}"/>`;
  board('ep-parlour',
    wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#F2D98A"/><rect x="-20" y="318" width="1000" height="250" fill="#3E9B63"/>
          <path d="M380 318 V150 A100 100 0 0 1 580 150 V318Z" fill="#F7B79A"/><circle cx="480" cy="250" r="48" fill="${C.goldLight}"/>
          <rect x="96" y="150" width="130" height="100" fill="${C.white}"/><rect x="734" y="150" width="130" height="100" fill="${C.white}"/>` + lamp(250) + lamp(710)) +
    ink(`<path d="M-20 318 H380 M580 318 H980 M380 318 V150 A100 100 0 0 1 580 150 V318 M480 52 V318 M380 200 H580"/><rect x="96" y="150" width="130" height="100"/><rect x="734" y="150" width="130" height="100"/>` + lampK(250) + lampK(710), '', 1) +
    `<g transform="translate(112 168) scale(.8)">${swan()}</g><g transform="translate(848 168) scale(-.8 .8)">${swan()}</g>`);

  const sundae = (x) => {
    const w = `<path d="M${x - 34} 372 H${x + 34} C${x + 34} 404 ${x + 18} 418 ${x} 418 C${x - 18} 418 ${x - 34} 404 ${x - 34} 372Z" fill="#DCEBF8"/>
      <path d="M${x - 3} 418 V444 M${x - 22} 448 H${x + 22}" stroke="#9FB9DA" stroke-width="5" fill="none"/>
      <circle cx="${x - 16}" cy="360" r="19" fill="${C.pink}"/><circle cx="${x + 16}" cy="360" r="19" fill="#FBF3E4"/><circle cx="${x}" cy="338" r="19" fill="#B8714A"/>
      <circle cx="${x + 4}" cy="316" r="7" fill="${C.vermilion}"/><path d="M${x + 22} 330 L${x + 44} 290" stroke="${C.gold}" stroke-width="4" fill="none"/>`;
    const k = `<path d="M${x - 34} 372 H${x + 34} C${x + 34} 404 ${x + 18} 418 ${x} 418 C${x - 18} 418 ${x - 34} 404 ${x - 34} 372Z M${x} 418 V446 M${x - 22} 448 H${x + 22}"/>
      <circle cx="${x - 15}" cy="359" r="19"/><circle cx="${x + 17}" cy="359" r="19"/><circle cx="${x + 1}" cy="337" r="19"/><path d="M${x + 4} 309 q6 -10 14 -8"/>`;
    return { w, k };
  };
  const s1 = sundae(236), s2 = sundae(724);
  let cookies = '', cookiesK = '', chips = '';
  [[440, 420], [478, 410], [518, 422], [458, 402], [500, 398]].forEach(([x, y]) => {
    cookies += `<ellipse cx="${x}" cy="${y}" rx="24" ry="13" fill="#D9A066"/>`;
    cookiesK += `<ellipse cx="${x + 1}" cy="${y - 1}" rx="24" ry="13"/>`;
    for (let i = 0; i < 4; i++) chips += `<circle cx="${f(x - 14 + r() * 28)}" cy="${f(y - 6 + r() * 11)}" r="2.600" fill="#5A2E1A"/>`;
  });
  board('ep-table', backed(
    wash(`<path d="M70 440 C74 500 84 540 90 560 H870 C876 540 886 500 890 440Z" fill="#F4AEB8"/><ellipse cx="480" cy="440" rx="410" ry="36" fill="#F9CDD3"/>
          <ellipse cx="480" cy="424" rx="92" ry="20" fill="${C.white}"/>` + cookies + s1.w + s2.w +
         `<path d="M586 398 H626 L620 430 H592Z" fill="${C.white}"/><circle cx="606" cy="390" r="15" fill="#FFFFFF"/><circle cx="606" cy="376" r="9" fill="#FFFFFF"/>`) +
    chips +
    ink(`<path d="M70 440 C72 396 888 396 890 440 C888 482 72 482 70 440Z M200 474 C204 506 208 528 212 548 M480 478 V548 M760 474 C756 506 752 528 748 548"/>
         <ellipse cx="481" cy="424" rx="92" ry="20"/><path d="M586 398 H626 L620 430 H592Z"/><path d="M592 392 q14 -30 28 0"/>` + cookiesK + s1.k + s2.k, '', 1)), 3840, BACK);
}

/* ---------- the nice houses: a villa, a columned mansion, a pink modern one ---------- */
{
  const r = rng(1212);
  const arch = (x, y, w, h) => `M${x} ${y} V${y - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y - h + w / 2} V${y}Z`;
  let W = `<path d="M-20 398 H980 V430 H-20Z" fill="${C.lawn}"/>`, K = '';
  // 1. the Spanish villa: white stucco, terracotta, a tower, a balcony dripping with bougainvillea
  W += `<rect x="50" y="262" width="230" height="140" fill="#FFFDF9"/><path d="M38 264 L292 264 L276 236 L54 236Z" fill="${C.terracotta}"/>
        <rect x="206" y="168" width="60" height="96" fill="#FFFDF9"/><path d="M196 170 L276 170 L236 132Z" fill="${C.terracotta}"/>
        <path d="${arch(224, 226, 24, 40)}" fill="${C.powder}"/>
        <path d="${arch(66, 402, 40, 78)} ${arch(120, 402, 40, 78)} ${arch(174, 402, 40, 78)}" fill="${C.goldLight}"/>
        <rect x="226" y="330" width="34" height="72" fill="${C.forest}"/><rect x="62" y="286" width="150" height="8" fill="${C.bark}"/>
        <ellipse cx="18" cy="330" rx="12" ry="70" fill="${C.forest}"/><ellipse cx="308" cy="340" rx="11" ry="60" fill="${C.forest}"/>`;
  K += `<path d="M50 264 V400 M280 264 V400 M38 264 H206 M54 236 H206 M38 264 L54 236 M206 168 V236 M266 168 V262 M196 170 H276 L236 132Z M62 286 H212 M62 300 H212"/>
        <path d="${arch(66, 402, 40, 78)} ${arch(120, 402, 40, 78)} ${arch(174, 402, 40, 78)} ${arch(224, 226, 24, 40)}"/><rect x="226" y="330" width="34" height="72"/>`;
  for (let x = 68; x < 212; x += 12) K += `<path d="M${x} 286 V300"/>`;
  for (let x = 62; x < 200; x += 13) K += `<path d="M${x} 240 q3 9 -1 18"/>`;
  W += blossoms(r, 70, 300, 38, 34, 46, [C.magenta, C.rose, '#D9799B'], 7) + blossoms(r, 250, 284, 26, 22, 26, [C.magenta, C.rose], 6);
  // 2. the columned mansion: a pediment, four columns, a fountain on the lawn
  W += `<rect x="370" y="232" width="250" height="170" fill="#FBF3E4"/><rect x="360" y="222" width="270" height="14" fill="#FFFDF9"/>
        <path d="M420 232 L570 232 L495 176Z" fill="#FFFDF9"/><circle cx="495" cy="212" r="11" fill="${C.powder}"/>
        <rect x="474" y="330" width="42" height="72" fill="${C.oxblood}"/><rect x="410" y="384" width="170" height="18" fill="#FFFDF9"/>`;
  [384, 588].forEach((x) => [256, 326].forEach((y) => { W += `<rect x="${x - 6}" y="${y}" width="30" height="46" fill="${C.powder}"/>`; K += `<rect x="${x - 6}" y="${y}" width="30" height="46"/><path d="M${x + 9} ${y} V${y + 46} M${x - 6} ${y + 23} H${x + 24}"/>`; }));
  [428, 462, 520, 554].forEach((x) => { W += `<rect x="${x}" y="240" width="13" height="146" fill="#FFFFFF"/>`; K += `<path d="M${x} 240 V386 M${x + 13} 240 V386 M${x - 3} 240 H${x + 16} M${x - 3} 386 H${x + 16}"/>`; });
  K += `<path d="M370 236 V400 M620 236 V400 M360 222 H630 V236 H360Z M420 232 L495 176 L570 232"/><circle cx="495" cy="212" r="11"/><rect x="474" y="330" width="42" height="72"/><path d="M410 384 H580"/>`;
  for (let x = 366; x < 628; x += 16) K += `<path d="M${x} 208 V222"/>`;
  K += `<path d="M362 208 H628"/>`;
  W += `<ellipse cx="672" cy="400" rx="30" ry="8" fill="${C.water}"/><path d="M668 398 V372 H676 V398Z" fill="${C.stone}"/><ellipse cx="672" cy="372" rx="14" ry="4" fill="${C.water}"/>`;
  K += `<ellipse cx="672" cy="400" rx="30" ry="8"/><path d="M672 366 q-10 -16 -18 4 M672 366 q10 -16 18 4"/>`;
  [350, 640, 706].forEach((x) => { W += `<circle cx="${x}" cy="378" r="20" fill="#2F8F5B"/>`; K += `<circle cx="${x + 1}" cy="377" r="20"/>`; });
  // 3. the pink modern one: stacked volumes, a great arched window, an awning, a roof terrace
  W += `<rect x="730" y="280" width="110" height="122" fill="#F7AEB9"/><rect x="820" y="206" width="120" height="196" fill="#F4A9B8"/>
        <path d="${arch(846, 402, 68, 150)}" fill="${C.powder}"/><rect x="748" y="330" width="60" height="72" fill="${C.goldLight}"/>
        <path d="M738 314 H816 L826 336 H730Z" fill="${C.white}"/><rect x="722" y="270" width="126" height="10" fill="#FFFDF9"/><rect x="812" y="196" width="136" height="10" fill="#FFFDF9"/>`;
  for (let i = 0; i < 4; i++) W += `<path d="M${738 + i * 20} 314 H${748 + i * 20} L${754 + i * 24} 336 H${742 + i * 24}Z" fill="${C.forest}"/>`;
  K += `<path d="M730 280 V400 M840 280 V206 M820 206 V280 M940 206 V400 M722 270 H848 V280 H722Z M812 196 H948 V206 H812Z M738 314 H816 L826 336 H730Z"/>
        <path d="${arch(846, 402, 68, 150)} M880 256 V402 M846 330 H914"/><rect x="748" y="330" width="60" height="72"/><path d="M778 330 V402"/>`;
  for (let x = 736; x < 842; x += 14) K += `<path d="M${x} 252 V270"/>`;
  K += `<path d="M730 252 H842"/>`;
  W += blossoms(r, 936, 250, 22, 50, 34, [C.magenta, C.rose, C.pink], 6);
  const palm = (seed, x, y, w) => nest(Art.palm({ seed }), x, y, w, w * 2);
  board('ep-mansions', backed(wash(W)) + ink(K, '', 0.9) + palm(8, 296, 190, 104) + palm(45, 676, 150, 122), 1920, BACK);
}

/* ---------- two cars, seen from the side, with open windows to sit characters behind ---------- */
{
  const wheel = (x) => `<circle cx="${x}" cy="236" r="42" fill="#2A2529"/><circle cx="${x}" cy="236" r="18" fill="${C.stone}"/>`;
  const wheelK = (x) => `<circle cx="${x}" cy="236" r="42"/><circle cx="${x}" cy="236" r="18"/>`;
  // Kat's: tall, black and boxy, a spare on the back, and one back window held together with tape
  const suv = `M40 232 V112 Q40 98 54 98 H66 L84 44 Q88 32 102 32 H468 Q484 32 487 48 L494 98 H540 Q560 98 560 118 V232Z
               M306 46 H400 Q406 46 407 52 L412 108 H306Z M196 46 H294 V108 H196Z`;
  save('ep-suv', '0 0 600 300', 1800,
    backed(wash(`<path d="${suv}" fill="#2A2529" fill-rule="evenodd"/><rect x="18" y="120" width="24" height="84" rx="8" fill="#2A2529"/>
      <rect x="106" y="46" width="78" height="62" fill="#C9A26B"/><path d="M100 60 L190 96 M100 96 L190 58" stroke="#DCE3EA" stroke-width="9"/>
      <rect x="548" y="124" width="12" height="20" fill="${C.goldLight}"/><rect x="40" y="124" width="10" height="20" fill="${C.vermilion}"/><rect x="60" y="210" width="480" height="10" fill="#4A4247"/>` + wheel(140) + wheel(456), '-s')) +
    ink(`<path d="${suv}"/><path d="M300 108 V226 M190 108 V226 M320 150 h22 M210 150 h22 M106 46 H184 V108 H106Z M120 54 l14 20 l-10 8 l18 18 M150 50 l-6 16 M96 28 H470"/>` + wheelK(140) + wheelK(456), '-s', 1.2), BACK);
  // Blake's: the new Mercedes — long, low and silver, with a sweeping roofline and big alloys
  const benz = `M22 232 V178 Q22 154 58 148 L168 134 Q232 66 304 58 H384 Q446 62 506 134 L550 142 Q580 150 580 178 V232Z M252 76 Q292 68 374 70 Q424 78 464 130 H198 Q222 94 252 76Z`;
  const alloy = (x) => `<circle cx="${x}" cy="236" r="44" fill="#2A2529"/><circle cx="${x}" cy="236" r="29" fill="#E4E8EE"/>`;
  const alloyK = (x) => { let s = `<circle cx="${x}" cy="236" r="44"/><circle cx="${x}" cy="236" r="29"/><circle cx="${x}" cy="236" r="6"/>`; for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; s += `<path d="M${x} 236 L${f(x + Math.cos(a) * 28)} ${f(236 + Math.sin(a) * 28)}"/>`; } return s; };
  save('ep-coupe', '0 0 600 300', 1800,
    backed(wash(`<path d="${benz}" fill="#C9CFD8" fill-rule="evenodd"/><path d="M22 200 H580 V232 H22Z" fill="#9AA3B0"/>
      <path d="M548 150 L578 160 L578 170 L544 164Z" fill="#FFFDF9"/><path d="M24 156 L60 152 L60 164 L24 170Z" fill="${C.vermilion}"/>
      <path d="M60 188 H544" stroke="#FFFDF9" stroke-width="5" fill="none"/>` + alloy(134) + alloy(468), '-s')) +
    ink(`<path d="${benz}"/><path d="M330 72 V130 M318 134 V226 M196 134 Q204 180 196 226 M338 162 h26 M452 150 h18"/>
      <circle cx="560" cy="186" r="9"/><path d="M560 177 V186 L552 191 M560 186 L568 191" stroke-width="2"/>` + alloyK(134) + alloyK(468), '-s', 1.2), BACK);
}

fs.writeFileSync(path.join(out, 'render-list-episode.txt'), list.join('\n') + '\n');
console.log(list.length + ' episode layers written');
