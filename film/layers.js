/* ------------------------------------------------------------------
   The film's painted layers. Each is written as a standalone SVG into
   film/layers/ and then rasterised to PNG (see film/build.sh), so the
   film itself only has to move pictures around.
   Boards are drawn in a 960 × 540 space and rendered at 3840 × 2160.
------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(__dirname, 'layers');
global.window = {};
require(path.join(root, 'js', 'art.js'));
const Art = global.window.Art;
const { C, f, rng, pick, wash, ink, flower, leaf, blossoms, scallops, star, swan, poodle, blake, kat } = Art._;

/* The film is drawn in marker and crayon: a heavy black brush line, and colour
   scribbled on in streaks so the paper shows through. Same drawings as the
   site, different materials — so the shared filters are re-mixed here. */
C.ink = '#1F1C1B';
Art._.inkScale = 2.2;
const defs = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/<defs>([\s\S]*?)<\/defs>/)[1]
  .replace('baseFrequency="0.018" numOctaves="2" seed="21"', 'baseFrequency="0.016 0.42" numOctaves="2" seed="21"')
  .replace('baseFrequency="0.04" numOctaves="2" seed="14"', 'baseFrequency="0.04 0.9" numOctaves="2" seed="14"')
  .replace('baseFrequency="0.09" numOctaves="2" seed="9"', 'baseFrequency="0.09 1.6" numOctaves="2" seed="9"')
  .replace('-0.6 0 0 0 1.25', '-6 0 0 0 3.9').replace(/-0\.5 0 0 0 1\.22/g, '-6 0 0 0 3.9')
  .replace(/-2\.4 0 0 0 2\.1/g, '-1.2 0 0 0 1.8');
const inner = (svg) => svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const nest = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const at = (fig, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${fig}</g>`;
const list = [];
function save(name, box, pxW, body, extra = '') {
  const [, , w, h] = box.split(' ').map(Number);
  const pxH = Math.round((pxW * h) / w);
  fs.writeFileSync(path.join(out, name + '.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${pxW}" height="${pxH}"><defs>${defs}${extra}</defs>${body}</svg>\n`);
  list.push(`${name} ${pxW} ${pxH}`);
}
const BOARD = '0 0 960 540';
const board = (name, body, extra) => save(name, BOARD, 3840, body, extra);

function bouquet(r, x, y, cols) {
  let w = '', k = '';
  [[-16, 62, 12], [4, 84, 13], [22, 54, 11], [-4, 44, 10]].forEach(([dx, h, rad], i) => {
    const stem = `M${x} ${y} Q${x + dx * 0.3} ${y - h * 0.5} ${x + dx} ${y - h}`;
    const l = leaf(x + dx * 0.5, y - h * 0.5, 18, i % 2 ? -30 : -150, i % 2 ? C.leaf : C.forest);
    const fl = flower(x + dx, y - h, rad, cols[i % cols.length], r() * 72);
    w += `<path d="${stem}" fill="none" stroke="${C.leaf}" stroke-width="2.200"/>` + l.w + fl.w;
    k += `<path d="${stem}"/>` + l.k + fl.k;
  });
  return { w, k };
}

/* ---------- Act I · the writing desk ---------- */
{
  const r = rng(101);
  let stars = '';
  [[590, 120], [640, 220], [740, 250], [610, 290], [760, 110], [690, 80]].forEach(([x, y]) => { stars += star(x, y, 3 + r() * 3); });
  const W = `<rect x="-20" y="-20" width="1000" height="580" fill="#F2D98A"/><rect x="-20" y="318" width="1000" height="160" fill="#3E9B63"/>
    <path d="M560 340 V170 A110 110 0 0 1 780 170 V340Z" fill="#7F9CC4"/>
    <path d="M704 118 A26 26 0 1 0 734 150 A20 20 0 1 1 704 118Z" fill="${C.goldLight}"/><g fill="${C.goldLight}">${stars}</g>
    <path d="M536 50 C560 150 548 260 532 352 L566 352 C574 250 584 160 574 50Z M804 50 C780 150 792 260 808 352 L774 352 C766 250 756 160 766 50Z" fill="#D9A0A8"/>
    <rect x="-20" y="470" width="1000" height="90" fill="#CDB89C"/>`;
  const K = `<path d="M560 340 V170 A110 110 0 0 1 780 170 V340 M670 62 V340 M560 200 H780 M548 340 H792"/>
    <path d="M548 80 C562 170 556 260 546 346 M792 80 C778 170 784 260 794 346 M-20 470 H980 M-20 318 H530 M810 318 H980"/>`;
  board('desk-bg', wash(W) + ink(K, '', 1));

  const b = bouquet(r, 276, 320, [C.rose, C.pink, C.white, C.terracotta]);
  const F = `<path d="M90 372 H870 L890 394 H70Z" fill="#C98562"/><rect x="80" y="394" width="800" height="46" fill="#B5714F"/>
    <rect x="100" y="440" width="22" height="110" fill="#B5714F"/><rect x="838" y="440" width="22" height="110" fill="#B5714F"/>
    <ellipse cx="190" cy="370" rx="34" ry="8" fill="${C.gold}"/><rect x="186" y="290" width="8" height="80" fill="${C.gold}"/>
    <path d="M150 292 L230 292 L214 232 L166 232Z" fill="#F6E7C4"/>
    <path d="M262 372 C250 350 256 328 268 320 L286 320 C298 328 304 350 292 372Z" fill="${C.powder}"/>${b.w}
    <path d="M330 332 L360 332 L356 372 L334 372Z" fill="#DCEBF8"/>
    <path d="M420 356 L520 356 L536 378 L404 378Z" fill="#2A2529"/><path d="M428 359 L514 359 L526 375 L414 375Z" fill="#454B63"/>
    <path d="M566 350 L668 350 L682 380 L552 380Z" fill="${C.white}"/>
    <ellipse cx="772" cy="432" rx="60" ry="15" fill="#D9A0A8"/><path d="M730 440 L722 548 M814 440 L822 548" stroke="#B5714F" stroke-width="7" fill="none"/>`;
  const FK = `<path d="M90 372 H870 L890 394 H70Z M80 440 H880 M300 404 H660 M300 428 H660 M470 414 h20"/>
    <path d="M150 292 L230 292 L214 232 L166 232Z M190 292 V362"/><path d="M262 372 C250 350 256 328 268 320 L286 320 C298 328 304 350 292 372Z"/>${b.k}
    <path d="M330 332 L360 332 L356 372 L334 372Z M333 346 H358"/><path d="M420 356 L520 356 L536 378 L404 378Z"/>
    <path d="M566 350 L668 350 L682 380 L552 380Z M578 358 q20 -4 40 0 t36 0 M574 366 q22 -4 44 0 t30 0 M570 373 q16 -3 32 0"/><path d="M660 344 L706 366" stroke="${C.goldDeep}" stroke-width="2.600"/>
    <ellipse cx="772" cy="432" rx="60" ry="15"/>`;
  board('desk-fg', wash(F) + ink(FK, '', 1) + at(poodle(), 718, 288, 1));
}

/* ---------- Act I · the phone, close ---------- */
{
  const r = rng(202);
  const fl = [flower(150, 400, 44, C.rose, 10), flower(230, 470, 34, C.pink, 40), flower(90, 500, 30, C.white, 0), flower(250, 380, 22, C.terracotta, 20)];
  const lv = [leaf(190, 430, 90, -30, C.leaf), leaf(120, 440, 80, -160, C.forest), leaf(200, 500, 70, 20, C.leaf)];
  let wood = '';
  for (let y = 30; y < 540; y += 46) wood += `<path d="M-10 ${y} C200 ${y - 8 + r() * 16} 600 ${y + 8 - r() * 16} 970 ${y}"/>`;
  let stars = '';
  [[430, 150], [520, 120], [470, 330], [540, 400], [420, 420]].forEach(([x, y]) => { stars += star(x, y, 5); });
  const W = `<rect x="-20" y="-20" width="1000" height="580" fill="#C98562"/>
    <path d="M640 -20 L980 -20 L980 210 L668 236Z" fill="${C.white}"/>` + lv.map((l) => l.w).join('') + fl.map((x) => x.w).join('') +
    `<rect x="380" y="56" width="200" height="424" rx="28" fill="#2A2529"/><rect x="392" y="70" width="176" height="396" rx="17" fill="#F7E3DD"/>
     <ellipse cx="480" cy="330" rx="120" ry="90" fill="${C.powder}" opacity=".7"/><g fill="${C.gold}">${stars}</g>`;
  const K = `<rect x="381" y="55" width="200" height="424" rx="28"/><rect x="393" y="69" width="176" height="396" rx="17"/><path d="M462 80 h36"/>
    <path d="M640 -20 L668 236 L980 210 M690 40 q40 -8 80 0 t80 0 t70 0 M694 84 q40 -8 80 0 t80 0 t60 0 M700 128 q40 -8 80 0 t70 0 M704 172 q30 -6 60 0 t50 0"/>
    <path d="M700 300 L900 420" stroke="${C.goldDeep}" stroke-width="5"/>` + lv.map((l) => l.k).join('') + fl.map((x) => x.k).join('');
  board('phone-bg', wash(W) + ink(wood, '', 0.8, '#A9684A') + ink(K, '', 1.1) + at(poodle(), 668, 318, 1.7));
  save('notif', '0 0 170 60', 1020,
    wash(`<rect x="3" y="3" width="164" height="54" rx="14" fill="${C.white}"/><circle cx="30" cy="30" r="15" fill="${C.pink}"/><path d="M30 38 C21 31 22 24 26 24 C28 24 30 26 30 27.500 C30 26 32 24 34 24 C38 24 39 31 30 38Z" fill="${C.oxblood}"/>`, '-s') +
    ink(`<rect x="3.500" y="3" width="164" height="54" rx="14"/><path d="M56 22 h84 M56 34 h58"/>`, '-s', 1) +
    `<path d="M144 34 l10 6 l-10 6Z" fill="${C.forest}"/>`);
}

/* ---------- Act II · the messages ---------- */
{
  const r = rng(303);
  let stars = '';
  for (let i = 0; i < 26; i++) stars += star(40 + r() * 880, 30 + r() * 480, 2 + r() * 3);
  const pinks = [C.blush, C.pink, C.rose, '#FBE0E4'];
  board('sky-bg',
    wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#CFE0F3"/><ellipse cx="480" cy="560" rx="620" ry="260" fill="${C.blush}"/><g fill="${C.gold}">${stars}</g>` +
      blossoms(r, 40, 40, 150, 80, 70, pinks, 13) + blossoms(r, 920, 500, 150, 80, 70, pinks, 13)) +
    ink(`<path d="M-10 150 C40 110 90 80 150 60 M970 400 C920 430 880 460 830 480"/>` + scallops(r, 40, 40, 120, 60, 9) + scallops(r, 920, 500, 120, 60, 9), '', 1, C.oxblood));
  const symbols = {
    heart: `<path d="M60 54 C42 40 44 26 52 26 C56 26 60 30 60 33 C60 30 64 26 68 26 C76 26 78 40 60 54Z" fill="${C.oxblood}"/>`,
    star: `<g fill="${C.gold}">${star(60, 39, 15)}</g>`,
    play: `<circle cx="60" cy="39" r="17" fill="${C.white}"/><path d="M54 29 L72 39 L54 49Z" fill="${C.forest}"/>`,
    flower: wash(flower(60, 39, 15, C.rose, 12, C.goldLight).w, '-s'),
    dots: `<g fill="${C.forest}"><circle cx="42" cy="39" r="5"/><circle cx="60" cy="39" r="5"/><circle cx="78" cy="39" r="5"/></g>`,
    smile: `<circle cx="60" cy="39" r="18" fill="${C.goldLight}"/><g fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"><path d="M50 34 q4 -4 7 0 M63 34 q4 -4 7 0 M49 43 q11 10 22 0"/></g>`,
  };
  for (const [who, col, tail] of [['g', '#BFD8BE', 'M26 68 L14 90 L46 70Z'], ['p', '#F4C2C9', 'M94 68 L106 90 L74 70Z']]) {
    for (const [name, sym] of Object.entries(symbols)) {
      save(`bubble-${who}-${name}`, '0 0 120 96', 480,
        wash(`<rect x="6" y="6" width="108" height="66" rx="26" fill="${col}"/><path d="${tail}" fill="${col}"/>`, '-s') +
        ink(`<rect x="7" y="5" width="108" height="66" rx="26"/>`, '-s', 0.9) + sym);
    }
  }
}

/* ---------- Act III · the telephone ---------- */
{
  const r = rng(404);
  const b = bouquet(r, 300, 366, [C.pink, C.rose, C.white, C.magenta]);
  const W = `<rect x="-20" y="-20" width="1000" height="580" fill="#7CCFD6"/><rect x="-20" y="300" width="1000" height="260" fill="#3E9B63"/>
    <rect x="640" y="90" width="150" height="120" fill="${C.goldLight}"/><rect x="654" y="104" width="122" height="92" fill="${C.powder}"/>
    <ellipse cx="480" cy="420" rx="250" ry="36" fill="#C98562"/><path d="M450 440 L440 560 L520 560 L510 440Z" fill="#B5714F"/>
    <path d="M286 418 C274 396 280 374 292 366 L310 366 C322 374 328 396 316 418Z" fill="${C.powder}"/>${b.w}
    <path d="M610 392 L690 388 L700 420 L618 426Z" fill="${C.white}"/>`;
  const K = `<path d="M-20 300 H980"/><rect x="640" y="90" width="150" height="120"/><rect x="654" y="104" width="122" height="92"/>
    <ellipse cx="481" cy="420" rx="250" ry="36"/><path d="M286 418 C274 396 280 374 292 366 L310 366 C322 374 328 396 316 418Z"/>${b.k}
    <path d="M610 392 L690 388 L700 420 L618 426Z M624 402 q16 -4 32 0 t30 -1 M628 412 q14 -3 28 0"/>`;
  board('tel-bg', wash(W) + ink(K, '', 1) + `<g transform="translate(672 112) scale(.74)">${swan()}</g>`);
  let holes = '';
  for (let i = 0; i < 9; i++) { const a = (i * 34 - 60) * Math.PI / 180; holes += `<circle cx="${f(500 + Math.cos(a) * 19)}" cy="${f(362 + Math.sin(a) * 19)}" r="4" fill="${C.ivory}"/>`; }
  const P = `<path d="M400 408 C404 352 436 322 500 322 C564 322 596 352 600 408Z" fill="${C.forest}"/>
    <rect x="446" y="296" width="12" height="30" fill="${C.forest}"/><rect x="542" y="296" width="12" height="30" fill="${C.forest}"/>
    <circle cx="500" cy="362" r="30" fill="${C.goldLight}"/>${holes}<circle cx="500" cy="362" r="8" fill="${C.ivory}"/>
    <path d="M408 300 C412 262 588 262 592 300 L572 308 C566 288 434 288 428 308Z" fill="${C.forest}"/>
    <ellipse cx="420" cy="306" rx="24" ry="15" fill="${C.forest}"/><ellipse cx="580" cy="306" rx="24" ry="15" fill="${C.forest}"/>`;
  const PK = `<path d="M400 408 C404 352 436 322 500 322 C564 322 596 352 600 408Z"/><circle cx="501" cy="361" r="30"/>
    <path d="M408 300 C412 262 588 262 592 300 M428 308 C434 288 566 288 572 308"/><ellipse cx="421" cy="305" rx="24" ry="15"/><ellipse cx="581" cy="305" rx="24" ry="15"/>
    <path d="M404 400 C370 404 372 430 392 428 C410 426 404 444 384 446 C366 448 364 468 386 470" stroke="${C.forest}" stroke-width="3.500"/>`;
  board('tel-phone', wash(P) + ink(PK, '', 1.1));
}

/* ---------- Act III · two windows, one night ---------- */
{
  const r = rng(505);
  let stars = '';
  for (let i = 0; i < 34; i++) stars += star(20 + r() * 920, 14 + r() * 200, 2 + r() * 3.5);
  const house = (x) => `<rect x="${x}" y="226" width="240" height="330" fill="#F7AEB9"/><path d="M${x - 14} 228 L${x + 254} 228 L${x + 236} 196 L${x + 4} 196Z" fill="${C.terracotta}"/>
    <path d="M${x + 60} 424 V306 A60 60 0 0 1 ${x + 180} 306 V424Z" fill="${C.goldLight}"/>`;
  const houseK = (x) => `<path d="M${x} 228 V556 M${x + 240} 228 V556 M${x - 14} 228 H${x + 254} L${x + 236} 196 H${x + 4} L${x - 14} 228"/>
    <path d="M${x + 60} 424 V306 A60 60 0 0 1 ${x + 180} 306 V424 M${x + 48} 424 H${x + 192} M${x + 52} 434 H${x + 188}"/>`;
  const clip = (id, x) => `<clipPath id="${id}"><path d="M${x + 60} 424 V306 A60 60 0 0 1 ${x + 180} 306 V424Z"/></clipPath>`;
  const pinks = [C.blush, C.pink, C.rose, C.magenta];
  const palm = (seed, x, y, w) => nest(Art.palm({ seed }), x, y, w, w * 2);
  const W = `<rect x="-20" y="-20" width="1000" height="580" fill="#8FA9D2"/><ellipse cx="480" cy="330" rx="640" ry="130" fill="#C7B6D6" opacity=".8"/><g fill="${C.goldLight}">${stars}</g>
    <path d="M-20 372 C120 330 260 360 400 338 C560 314 760 360 980 326 V560 H-20Z" fill="#6E9C82"/>
    <ellipse cx="444" cy="330" rx="13" ry="60" fill="${C.forest}"/><ellipse cx="520" cy="344" rx="11" ry="48" fill="${C.forest}"/>` + house(130) + house(590);
  const K = houseK(130) + houseK(590);
  const front = wash(blossoms(r, 110, 250, 60, 40, 40, pinks, 9) + blossoms(r, 850, 250, 60, 40, 40, pinks, 9) +
    `<path d="M-20 500 C200 478 760 478 980 500 V560 H-20Z" fill="#5C8A6E"/>` + blossoms(r, 480, 520, 470, 16, 60, [C.pink, C.rose, C.white], 6));
  board('night-bg',
    wash(W) + palm(6, 6, 190, 120) + palm(19, 836, 206, 110) + ink(K, '', 1) +
    `<g clip-path="url(#wl)">${at(blake(), 190, 268, 0.6)}</g><g clip-path="url(#wr)">${at(kat(), 640, 268, 0.6)}${at(poodle(), 742, 352, 0.44)}</g>` + front,
    clip('wl', 130) + clip('wr', 590));
  save('moon', '0 0 80 80', 480, wash(`<path d="M44 8 A32 32 0 1 0 72 50 A25 25 0 1 1 44 8Z" fill="${C.goldLight}"/>`, '-s') + ink(`<path d="M46 7 A32 32 0 1 0 74 49"/>`, '-s', 1, C.goldDeep));
  let ticks = '';
  for (let i = 0; i < 12; i++) ticks += `<path d="M60 ${i % 3 ? 15 : 12} V${i % 3 ? 20 : 23}" transform="rotate(${i * 30} 60 60)"/>`;
  save('clock', '0 0 120 120', 600, wash(`<circle cx="60" cy="60" r="54" fill="${C.goldLight}"/><circle cx="60" cy="60" r="46" fill="${C.white}"/>`, '-s') + ink(`<circle cx="60.500" cy="59.500" r="54"/><circle cx="60.500" cy="59.500" r="46"/>${ticks}`, '-s', 1));
}

/* ---------- Act IV · Hotel Bel-Air, as painted ---------- */
{
  const garden = [...Art.garden().matchAll(/<svg[^>]*>([\s\S]*?)<\/svg>/g)].map((m) => m[1]).join('');
  save('garden', '0 0 600 720', 2880, garden);
  save('card-art', '0 0 600 720', 1500, `<g clip-path="url(#arch)">${garden}</g><path d="M3 717 V300 A297 297 0 0 1 597 300 V717Z" fill="none" stroke="#B8923C" stroke-width="4"/>`,
    `<clipPath id="arch"><path d="M3 717 V300 A297 297 0 0 1 597 300 V717Z"/></clipPath>`);
  save('terrace', '0 0 500 600', 1800, inner(Art.together({ variant: 'terrace' })));
  save('supper', '0 0 640 430', 3840, inner(Art.supper()));
}

board('wall-pink', wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#F4AEB8"/>`));
board('paper-blue', wash(`<rect x="-20" y="-20" width="1000" height="580" fill="#BBD6F5"/>`));

/* ---------- small things ---------- */
{
  const letter = Art.letter().replace('<svg ', '<svg x="41" y="61" width="38" height="28" ');
  save('courier', '4 -4 112 158', 900, `${poodle()}<g transform="rotate(-9 60 75)">${letter}</g>`);
  save('envelope', '-3 -3 76 56', 1520, inner(Art.letter()));
  save('swans', '0 0 240 96', 960, inner(Art.swans()));
  save('sprig-a', '-10 -10 320 320', 1000, inner(Art.sprig({ seed: 8 })));
  save('sprig-b', '-10 -10 320 320', 1000, inner(Art.sprig({ seed: 14 })));
  save('walker', '0 0 124 86', 496, `<g color="#33503F">${inner(Art.walker())}</g>`);
}

/* ---------- silhouettes, for the quiet animation behind the titles ---------- */
{
  const sil = (id, rgb) => `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  0 0 0 5 0"/></filter>`;
  const GREEN = [0.2, 0.314, 0.247], PINK = [0.95, 0.604, 0.682];
  save('sil-blake', '0 0 200 250', 640, `<g filter="url(#sg)">${blake()}</g>`, sil('sg', GREEN));
  save('sil-kat', '0 0 200 250', 640, `<g filter="url(#sg)">${kat()}</g>`, sil('sg', GREEN));
  save('sil-dog', '4 -4 112 158', 448, `<g filter="url(#sg)">${poodle()}</g>`, sil('sg', GREEN));
  save('sil-palm', '-10 0 280 560', 700, `<g filter="url(#sp)">${inner(Art.palm({ seed: 6 }))}</g>`, sil('sp', PINK));
  save('sil-palm-b', '-10 0 280 560', 700, `<g filter="url(#sp)">${inner(Art.palm({ seed: 19 }))}</g>`, sil('sp', PINK));
}

fs.writeFileSync(path.join(out, 'render-list.txt'), list.join('\n') + '\n');
console.log(list.length + ' layers written');
