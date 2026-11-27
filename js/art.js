/* ------------------------------------------------------------------
   The atelier: every illustration on the site is drawn here, in code.

   The visual language is "loose watercolour wash + slightly
   misregistered ink line". Colour shapes go through the #f-wash
   filters (wobbly edge, mottled pigment); line work goes through the
   #f-ink filters (hand-drawn wobble). Filters live in index.html.
------------------------------------------------------------------- */
(function () {
  'use strict';

  const C = {
    blush: '#F9CDD3', pink: '#F4A9B8', rose: '#EC6F95', magenta: '#D43F7A',
    forest: '#1E5B3C', leaf: '#2F8F5B', palm: '#58B77D', sage: '#BFE3BE', lawn: '#93CF8E',
    ivory: '#FFFBF5', parchment: '#F3E3C3', stone: '#FBF3E4', white: '#FFFDF9',
    terracotta: '#E98659', vermilion: '#E04A32', oxblood: '#8E1F35',
    powder: '#BBD6F5', water: '#8FC5EA',
    gold: '#C9A24A', goldLight: '#F5D45E', goldDeep: '#8A6A1F',
    fur: '#C27A4E', furDark: '#8E4E2E', face: '#F8DFC4', bark: '#8A4B3A',
    ink: '#1F1C1B', // black brush marker
  };

  const f = (n) => (+n).toFixed(1);
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  const pick = (r, a) => a[Math.floor(r() * a.length)];

  /* size: '' for big scenes, '-s' for figures (~200 units), '-xs' for icons.
     Washes sit slightly off-register from the line, as if printed by hand. */
  const SHIFT = { '': '3 2', '-s': '1.6 1.1', '-xs': '.7 .5' };
  const wash = (s, size = '') => `<g filter="url(#f-wash${size})" transform="translate(${SHIFT[size]})">${s}</g>`;
  const ink = (s, size = '', w = 1.3, col = C.ink) =>
    `<g filter="url(#f-ink${size})" fill="none" stroke="${col}" stroke-width="${f(w * 1.3 * kit.inkScale)}" stroke-linecap="round" stroke-linejoin="round">${s}</g>`;

  /* ---------- small botanical building blocks ---------- */

  function flower(x, y, r, col, rot = 0, centre = C.gold) {
    let p = '';
    for (let i = 0; i < 5; i++) {
      p += `<ellipse cy="${f(-r * 0.6)}" rx="${f(r * 0.42)}" ry="${f(r * 0.6)}" transform="rotate(${i * 72})"/>`;
    }
    return {
      w: `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="${col}">${p}<circle r="${f(r * 0.24)}" fill="${centre}"/></g>`,
      k: `<g transform="translate(${f(x + r * 0.12)} ${f(y - r * 0.1)}) rotate(${f(rot + 9)})">${p}<circle r="${f(r * 0.2)}"/></g>`,
    };
  }

  function leaf(x, y, len, ang, col) {
    const l = len;
    const t = `transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"`;
    return {
      w: `<path ${t} fill="${col}" d="M0 0 C${f(l * 0.25)} ${f(-l * 0.32)} ${f(l * 0.75)} ${f(-l * 0.3)} ${f(l)} 0 C${f(l * 0.75)} ${f(l * 0.3)} ${f(l * 0.25)} ${f(l * 0.32)} 0 0Z"/>`,
      k: `<path ${t} d="M0 0 L${f(l * 0.92)} 0 M0 0 C${f(l * 0.25)} ${f(-l * 0.34)} ${f(l * 0.75)} ${f(-l * 0.32)} ${f(l)} 0"/>`,
    };
  }

  function blossoms(r, cx, cy, rx, ry, n, cols, size) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      s += `<circle cx="${f(cx + Math.cos(a) * rx * d)}" cy="${f(cy + Math.sin(a) * ry * d)}" r="${f(size * (0.55 + r() * 0.8))}" fill="${pick(r, cols)}" opacity="${f(0.6 + r() * 0.4)}"/>`;
    }
    return s;
  }

  function scallops(r, cx, cy, rx, ry, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.9;
      s += `<path d="M${f(cx + Math.cos(a) * rx * d)} ${f(cy + Math.sin(a) * ry * d)} q5 -7 10 0 q4 -5 8 1"/>`;
    }
    return s;
  }

  function star(x, y, s) {
    return `<path d="M${f(x)} ${f(y - s)} Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)} Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)}Z"/>`;
  }

  /* ---------- The Rooster (faces right; local box ≈ -10..172 × 20..212) ---------- */

  function rooster() {
    const tailD = [
      ['M70 142 C58 100 50 60 30 44 C16 34 4 44 6 62', C.forest, 10],
      ['M68 146 C48 112 34 84 14 80 C2 78 -4 92 2 104', C.powder, 9],
      ['M72 138 C68 96 68 60 56 34 C48 20 34 20 32 34', C.oxblood, 9],
      ['M66 150 C44 132 24 122 8 128 C0 132 0 144 6 150', C.gold, 8],
      ['M76 134 C80 98 84 66 78 40', C.leaf, 8],
    ];
    const tail =
      wash(`<g fill="none" stroke-linecap="round">${tailD.map(([d, c, w]) => `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`).join('')}</g>`, '-s') +
      ink(`<g transform="translate(1.6 -1.2)">${tailD.map(([d]) => `<path d="${d}"/>`).join('')}</g>`, '-s', 1.1);

    const legs =
      wash(`<g fill="none" stroke="#C99A3A" stroke-width="3.2" stroke-linecap="round"><path d="M96 172 L93 204 M93 204 L82 208 M93 204 L96 210 M93 204 L104 207"/><path d="M114 170 L116 204 M116 204 L105 208 M116 204 L119 210 M116 204 L128 207"/></g>`, '-s') +
      ink(`<path d="M97 174 L94 203 M115 172 L117 203"/>`, '-s', 0.9);

    const body =
      wash(
        `<path d="M104 112 C80 108 58 122 60 148 C62 172 92 180 116 172 C138 164 146 138 140 112 C130 118 116 118 104 112Z" fill="${C.forest}"/>
         <path d="M78 134 C92 124 116 128 122 142 C112 158 90 162 76 152 C72 146 74 138 78 134Z" fill="${C.terracotta}"/>
         <path d="M134 64 C122 80 108 100 102 122 C118 128 136 118 144 100 C150 88 154 76 152 68Z" fill="${C.gold}"/>`, '-s') +
      ink(
        `<path d="M106 110 C82 106 60 120 62 146 C64 170 94 178 118 170 C140 162 148 136 142 110"/>
         <path d="M80 138 C94 130 112 132 120 142 M84 147 C95 141 108 143 116 149"/>
         <path d="M136 70 C126 86 114 104 108 120 M142 76 C134 92 124 108 118 122 M148 82 C142 96 134 110 128 120"/>
`, '-s', 1.1);

    const head =
      wash(
        `<path d="M131 49 C127 36 137 33 138 44 C138 29 150 29 148 43 C152 33 161 38 155 49Z" fill="${C.vermilion}"/>
         <circle cx="143" cy="58" r="13" fill="${C.goldLight}"/>
         <circle cx="148" cy="59" r="5.5" fill="${C.vermilion}" opacity=".75"/>
         <path d="M154 54 L170 60 L154 65Z" fill="#C99A3A"/>
         <path d="M152 66 C159 72 157 86 151 84 C146 80 148 70 152 66Z" fill="${C.vermilion}"/>`, '-s') +
      ink(
        `<path d="M132 48 C128 35 138 32 139 43 C139 28 151 28 149 42 C153 32 162 37 156 48"/>
         <path d="M131 62 C129 50 140 43 150 47 M156 66 C154 70 150 72 146 72"/>
         <path d="M155 54 L171 60 L155 65 M155 60 L164 60"/>
         <path d="M153 67 C160 73 158 87 152 85"/>
         <circle cx="146.5" cy="55.5" r="1.7" fill="${C.ink}"/>`, '-s', 1.1);

    const bow =
      wash(`<path d="M146 93 L159 86 L158 101Z M146 93 L134 87 L135 101Z" fill="${C.powder}"/><circle cx="146" cy="93" r="3" fill="${C.powder}"/>`, '-s') +
      ink(`<path d="M147 92 L160 85 L159 100Z M147 92 L135 86 L136 100Z"/>`, '-s', 1);

    return `<g class="rooster"><g class="rooster__tail">${tail}</g>${legs}${body}<g class="rooster__head">${head}</g>${bow}</g>`;
  }

  /* ---------- The Monkey (seated, offering a flower to the left; local box ≈ 30..190 × 50..202) ---------- */

  function monkey() {
    const tail =
      wash(`<path d="M138 182 C170 188 188 162 174 140 C166 127 148 132 152 145 C154 153 165 153 167 146" fill="none" stroke="${C.fur}" stroke-width="6.5" stroke-linecap="round"/>`, '-s') +
      ink(`<path d="M140 180 C171 185 186 161 173 141 C166 130 151 134 154 145"/>`, '-s', 1);

    const body =
      wash(
        `<path d="M130 128 C142 144 140 160 128 170" fill="none" stroke="${C.furDark}" stroke-width="9" stroke-linecap="round"/>
         <path d="M110 108 C86 110 72 140 76 170 C80 198 132 202 142 174 C150 148 138 110 110 108Z" fill="${C.fur}"/>
         <ellipse cx="104" cy="160" rx="17" ry="24" fill="${C.face}" opacity=".85"/>
         <path d="M82 186 C66 186 58 198 72 201 L100 201 C104 194 96 186 82 186Z" fill="${C.furDark}"/>
         <path d="M120 188 C108 188 104 198 112 201 L140 201 C150 198 140 186 120 188Z" fill="${C.furDark}"/>`, '-s') +
      ink(
        `<path d="M82 126 C74 142 72 158 76 172 M140 124 C148 142 148 162 142 176"/>
         <path d="M70 200 C60 196 68 186 82 187 M112 200 C106 196 110 189 120 189 M141 200 C148 197 144 190 136 189"/>
         <path d="M98 150 q3 3 6 0 M100 166 q3 3 6 0"/>`, '-s', 1.1);

    const head =
      wash(
        `<circle cx="79" cy="82" r="9" fill="${C.fur}"/><circle cx="130" cy="80" r="9" fill="${C.fur}"/>
         <circle cx="79" cy="82" r="4.5" fill="${C.pink}"/><circle cx="130" cy="80" r="4.5" fill="${C.pink}"/>
         <circle cx="104" cy="80" r="26" fill="${C.fur}"/>
         <path d="M82 78 C82 64 97 62 100 73 C104 62 120 65 119 79 C119 91 113 97 109 100 C112 108 105 115 98 114 C90 114 84 107 88 99 C83 95 82 86 82 78Z" fill="${C.face}"/>
         <path d="M86 104 C96 113 112 113 123 102 L120 113 C110 121 97 120 89 113Z" fill="${C.powder}"/>`, '-s') +
      ink(
        `<path d="M80 70 C84 56 104 50 120 58 C130 64 133 78 128 92"/>
         <path d="M87 72 q5 -4 10 -1 M104 69 q6 -5 11 0"/>
         <circle cx="92" cy="80" r="1.8" fill="${C.ink}"/><circle cx="108" cy="79" r="1.8" fill="${C.ink}"/>
         <path d="M97.500 90.500 l.6 .4 M102 90.500 l.6 -.2"/>
         <path d="M91 99 Q100 107 110 97 q2.500 -1 2 -3.500"/>
         <path d="M88 105 C97 113 111 113 122 103"/>`, '-s', 1.1);

    const bloom = flower(39, 73, 8.5, C.rose, 12);
    const arm =
      wash(
        `<path d="M50 104 C48 96 44 88 40 80" fill="none" stroke="${C.leaf}" stroke-width="2"/>
         <path d="M46 94 C40 92 36 94 34 98 C39 99 43 98 46 94Z" fill="${C.leaf}"/>
         ${bloom.w}
         <path d="M92 126 C72 126 58 116 50 102" fill="none" stroke="${C.fur}" stroke-width="9" stroke-linecap="round"/>
         <circle cx="50" cy="102" r="5.500" fill="${C.furDark}"/>`, '-s') +
      ink(`<path d="M92 121 C74 121 62 112 54 100 M90 131 C72 132 58 124 49 108"/>${bloom.k}`, '-s', 1);

    return `<g class="monkey"><g class="monkey__tail">${tail}</g>${body}${head}<g class="monkey__arm">${arm}</g></g>`;
  }

  /* ---------- The Chaperone: a red toy poodle in a green cable knit (local box ≈ 12..110 × 4..150) ---------- */

  function poodle() {
    const r = rng(31);
    const furs = ['#A5603E', '#B46D47', '#96532F', '#C07E55'];
    const fluff = (cx, cy, rx, ry, n, s) => blossoms(r, cx, cy, rx, ry, n, furs, s).replace(/opacity="[\d.]+"/g, '');
    const curls = (cx, cy, rx, ry, n) => {
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = 0.35 + r() * 0.6;
        s += `<path d="M${f(cx + Math.cos(a) * rx * d)} ${f(cy + Math.sin(a) * ry * d)} q3 -4 6 -1 q1 3 -2 3"/>`;
      }
      return s;
    };
    const W =
      // haunches, tail pom, front legs and paws
      fluff(27, 132, 9, 9, 9, 6) + fluff(93, 132, 9, 9, 9, 6) + fluff(102, 110, 4, 4, 5, 5) +
      `<path d="M43 108 V138 M77 108 V138" fill="none" stroke="#A5603E" stroke-width="10" stroke-linecap="round"/>` +
      fluff(43, 142, 5, 3, 6, 5) + fluff(77, 142, 5, 3, 6, 5) +
      // the cable-knit
      `<path d="M38 80 C36 70 50 66 60 71 C70 66 84 70 82 80 L90 116 C76 125 44 125 30 116Z" fill="${C.forest}"/>
       <path d="M38 84 L28 108 L44 116 L50 94Z M82 84 L92 108 L76 116 L70 94Z" fill="#284A39"/>
       <path d="M46 72 L60 82 L74 72 L70 66 L60 74 L50 66Z" fill="#284A39"/>` +
      // ears, head, topknot
      `<ellipse cx="33" cy="64" rx="12" ry="22" fill="#96532F"/><ellipse cx="87" cy="64" rx="12" ry="22" fill="#96532F"/>` +
      blossoms(r, 33, 66, 11, 21, 10, ['#96532F', '#A5603E'], 5).replace(/opacity="[\d.]+"/g, '') +
      blossoms(r, 87, 66, 11, 21, 10, ['#96532F', '#A5603E'], 5).replace(/opacity="[\d.]+"/g, '') +
      `<ellipse cx="60" cy="50" rx="17" ry="16" fill="#B8714A"/><ellipse cx="60" cy="27" rx="20" ry="15" fill="#B8714A"/>` +
      blossoms(r, 60, 26, 19, 13, 16, ['#B8714A', '#C07E55', '#B46D47'], 6).replace(/opacity="[\d.]+"/g, '') +
      `<ellipse cx="60" cy="57.500" rx="9.500" ry="7.500" fill="#D7A27A"/><ellipse cx="60" cy="54" rx="3.600" ry="2.700" fill="#2A1A14"/>
       <path d="M58.500 96 h3 v5 h-3Z" fill="${C.terracotta}"/>`;
    const K =
      curls(33, 66, 10, 20, 4) + curls(87, 66, 10, 20, 4) + curls(60, 24, 18, 12, 6) + curls(27, 132, 9, 9, 3) + curls(93, 132, 9, 9, 3) +
      `<circle cx="52" cy="47" r="2.500" fill="#2A1A14" stroke="none"/><circle cx="68" cy="47" r="2.500" fill="#2A1A14" stroke="none"/>
       <path d="M42 30 C44 10 76 10 78 30 M22 60 C20 76 24 86 32 88 M98 60 C100 76 96 86 88 88"/>
       <path d="M60 57 V61 M55.500 61.500 q4.500 3.500 9 0"/>
       <path d="M39 80 L31 116 M83 80 L91 116 M38 138 V112 M48 138 V116 M72 138 V116 M82 138 V112"/>`;
    const knit =
      `<g fill="none" stroke="${C.sage}" stroke-width="1" stroke-linecap="round" opacity=".8" filter="url(#f-ink-s)">
         <path d="M48 86 q3 4 0 8 q-3 4 0 8 q3 4 0 8 M72 86 q-3 4 0 8 q3 4 0 8 q-3 4 0 8 M54 100 v14 M66 100 v14 M34 112 l8 4 M86 112 l-8 4"/>
       </g>
       <path d="M60 80 V96" stroke="${C.goldLight}" stroke-width="1.300" stroke-dasharray="1.500 1.200"/>`;
    return `<g class="poodle">${wash(W, '-s')}${knit}${ink(K, '-s', 0.85, '#5A2E1A')}</g>`;
  }

  /* ---------- Chicken Nugget, courier: the poodle with a letter in her mouth ---------- */

  function courier() {
    return `<svg viewBox="4 -4 112 158" aria-hidden="true">${poodle()}</svg>`;
  }

  /* the little envelope she carries — a miniature of the real one, green seal and all */
  function letter() {
    return `<svg viewBox="-3 -3 76 56" aria-hidden="true">
      <g filter="url(#f-wobble)"><rect width="70" height="50" rx="1.500" fill="#F7F0DF" stroke="${C.ink}" stroke-width="1.600"/></g>
      ${ink(`<path d="M1 1 L35 29 L69 1 M1 49 L26 22 M69 49 L44 22"/>`, '-s', 0.8)}
      <circle cx="35" cy="29" r="7" fill="${C.forest}"/><circle cx="35" cy="29" r="4.200" fill="none" stroke="${C.goldLight}" stroke-width=".8"/>
    </svg>`;
  }

  /* ---------- A swan (faces right; local box ≈ 8..118 × 8..78) ---------- */

  function swan() {
    return (
      `<ellipse cx="58" cy="74" rx="44" ry="5" fill="#fff" opacity=".4"/>` +
      wash(
        `<path d="M18 62 C8 54 8 44 16 40 C20 48 28 50 36 47 C44 32 66 30 80 42 C94 46 102 58 97 66 C80 73 40 73 18 62Z" fill="#FFFDF8"/>
         <path d="M88 56 C78 46 76 30 84 20 C90 12 100 10 102 16" fill="none" stroke="#FFFDF8" stroke-width="8.500" stroke-linecap="round"/>
         <ellipse cx="101" cy="16" rx="6.500" ry="5" fill="#FFFDF8"/>
         <path d="M105 12.500 L118 20 L105 21Z" fill="${C.terracotta}"/>
         <path d="M28 62 C50 68 76 68 95 63" stroke="${C.pink}" stroke-width="4" fill="none" opacity=".55"/>`, '-s') +
      ink(
        `<path d="M18 62 C8 54 8 44 16 40 C20 48 28 50 36 47 C44 32 66 30 80 42"/>
         <path d="M97 66 C80 73 40 73 18 62"/>
         <path d="M84 58 C73 47 71 30 80 18 C87 9 101 7 106 12.500 L118 20 L105 21.500 C100 23 95 21 92 25 C87 33 90 44 97 53"/>
         <path d="M42 53 C52 45 66 45 76 51 M47 60 C56 54 66 54 74 59"/>
         <circle cx="101" cy="15" r="1" fill="${C.ink}"/>`, '-s', 1)
    );
  }

  /* ---------- The fountain (local box 0..120 × 20..158) ---------- */

  function fountainParts() {
    const W =
      `<path d="M10 130 C10 120 110 120 110 130 L104 148 C80 157 40 157 16 148Z" fill="${C.stone}"/>
       <ellipse cx="60" cy="128" rx="48" ry="7" fill="${C.water}"/>
       <path d="M52 126 C54 110 50 96 46 88 L74 88 C70 96 66 110 68 126Z" fill="${C.stone}"/>
       <path d="M30 80 C36 93 84 93 90 80Z" fill="${C.parchment}"/>
       <ellipse cx="60" cy="80" rx="30" ry="5" fill="${C.water}"/>
       <path d="M56 78 L57 58 L63 58 L64 78Z" fill="${C.stone}"/>
       <ellipse cx="60" cy="57" rx="12" ry="3.500" fill="${C.parchment}"/>
       <circle cx="60" cy="49" r="4.500" fill="${C.goldLight}"/>`;
    const K =
      `<path d="M10 130 C10 120 110 120 110 130 L104 148 C80 157 40 157 16 148Z M12 131 C30 139 90 139 108 131"/>
       <path d="M52 126 C54 110 50 96 46 88 M68 126 C66 110 70 96 74 88"/>
       <path d="M30 80 C36 93 84 93 90 80 C80 74 40 74 30 80Z"/>
       <path d="M56 76 L57 59 M64 76 L63 59 M48 57 C52 53 68 53 72 57 C68 61 52 61 48 57Z"/>
       <circle cx="60.500" cy="48.500" r="4.500"/>
       <path d="M30 140 q6 4 12 0 M54 144 q6 4 12 0 M78 140 q6 4 12 0"/>`;
    const water =
      `<path d="M60 45 C50 28 40 50 38 78"/><path d="M60 45 C70 28 80 50 82 78"/>
       <path d="M34 84 C30 100 28 112 28 126"/><path d="M86 84 C90 100 92 112 92 126"/>
       <path d="M60 44 C59 34 61 30 60 24"/>`;
    return { W, K, water };
  }

  function fountain() {
    const p = fountainParts();
    const bl = [flower(14, 150, 7, C.rose, 10), flower(106, 151, 6.5, C.pink, 40), flower(24, 156, 5, C.blush, 0)];
    return `<div class="fountain">
      <svg viewBox="-6 14 132 150" aria-hidden="true">
        ${wash(p.W + bl.map((b) => b.w).join(''), '-s')}${ink(p.K + bl.map((b) => b.k).join(''), '-s', 1.1)}
      </svg>
      <svg class="fountain__water" viewBox="-6 14 132 150" aria-hidden="true">
        <g fill="none" stroke="#7FA9BB" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 7">${p.water}</g>
      </svg>
    </div>`;
  }

  /* ---------- The garden (the Save-the-Date painting) ---------- */

  function garden() {
    const r = rng(11);
    const VB = 'viewBox="0 0 600 720" preserveAspectRatio="xMidYMid slice"';
    const base = [];
    let W, K;

    // sky at dusk
    base.push(wash(`<rect x="-30" y="-30" width="660" height="430" fill="${C.powder}"/><ellipse cx="300" cy="350" rx="400" ry="120" fill="${C.blush}"/>`));

    // crescent moon and a few stars
    const stars = [[392, 78], [448, 176], [350, 140], [250, 70], [180, 120], [300, 40], [520, 190], [222, 184]];
    base.push(
      wash(`<path d="M432 70 A32 32 0 1 0 470 110 A25 25 0 1 1 432 70Z" fill="${C.goldLight}"/>`, '-s') +
      `<g fill="${C.gold}">${stars.map(([x, y]) => star(x, y, 3 + r() * 3)).join('')}</g>` +
      ink(`<path d="M434 68 A32 32 0 1 0 472 108"/>`, '-s', 1, C.goldDeep)
    );

    // far hills, cypresses, a pair of palms
    W = `<path d="M-10 318 C80 270 170 296 250 280 C340 262 430 292 610 262 L610 390 L-10 390Z" fill="${C.sage}"/>`;
    K = '';
    [[40, 268, 9, 42], [372, 256, 9, 44], [397, 268, 8, 34], [468, 262, 8, 38]].forEach(([x, y, rx, ry]) => {
      W += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.forest}"/>`;
      K += `<path d="M${x + 2} ${y - ry + 6} L${x + 2} ${y + ry}"/>`;
    });
    [[236, 160, 300], [330, 196, 300]].forEach(([x, y, b]) => {
      W += `<path d="M${x + 3} ${b} C${x - 3} ${b - 50} ${x + 5} ${y + 40} ${x} ${y}" fill="none" stroke="#8A6A55" stroke-width="4"/>`;
      for (let i = -3; i <= 3; i++) {
        const a = Math.abs(i);
        W += `<path d="M${x} ${y} Q${x + i * 9} ${y - 24 + a * 4} ${x + i * 17} ${y + 4 + a * 7}" fill="none" stroke="${C.leaf}" stroke-width="3.6" stroke-linecap="round"/>`;
      }
    });
    base.push(wash(W) + ink(K, '', 0.9, C.forest));

    // the pink house: stucco, terracotta roof, lamplit arches
    W = `<rect x="70" y="262" width="230" height="124" fill="#F7AEB9"/>
         <path d="M58 264 L312 264 L298 240 L74 240Z" fill="${C.terracotta}"/>
         <rect x="266" y="198" width="36" height="72" fill="#F7AEB9"/>
         <path d="M258 200 L310 200 L284 174Z" fill="${C.terracotta}"/>
         <path d="M277 234 V217 A7 7 0 0 1 291 217 V234Z" fill="${C.goldLight}"/>`;
    K = `<path d="M70 266 V384 M300 270 V384 M58 264 H266 M74 240 H264 M58 264 L74 240 M266 200 V262 M302 200 V268 M258 200 H310 L284 174Z M277 234 V217 A7 7 0 0 1 291 217 V234"/>`;
    [112, 185, 258].forEach((cx) => {
      W += `<path d="M${cx - 24} 386 V324 A24 24 0 0 1 ${cx + 24} 324 V386Z" fill="${C.goldLight}"/>`;
      K += `<path d="M${cx - 24} 384 V324 A24 24 0 0 1 ${cx + 24} 324 V384 M${cx - 27} 326 h6 M${cx + 21} 326 h6"/>`;
    });
    for (let x = 84; x < 262; x += 13) K += `<path d="M${x} 244 q3 8 -1 16"/>`;
    W += blossoms(r, 124, 250, 60, 18, 44, [C.magenta, C.rose, '#D9799B'], 5);
    base.push(wash(W) + ink(K, '', 1.1));

    // lawn and gravel path
    base.push(wash(
      `<path d="M-10 376 C150 362 450 362 610 378 L610 730 L-10 730Z" fill="${C.lawn}"/>
       <path d="M-10 480 C120 450 240 478 300 468 C400 452 520 478 610 458 L610 730 L-10 730Z" fill="#6DBB78" opacity=".75"/>
       <path d="M160 384 C190 424 222 448 240 482 L330 482 C306 444 250 412 212 384Z" fill="${C.parchment}"/>`));

    // fountain on the lawn
    const fp = fountainParts();
    base.push(`<g transform="translate(352 322) scale(.78)">${wash(fp.W, '-s')}${ink(fp.K, '-s', 1.2)}<g fill="none" stroke="#7FA9BB" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 6">${fp.water}</g></g>`);

    // flowering trees, left and right
    const pinks = [C.blush, C.pink, C.rose, '#F7DAD6', '#EBB9BE'];
    W = `<g fill="none" stroke="${C.bark}" stroke-width="7" stroke-linecap="round">
           <path d="M22 570 C30 480 40 420 62 340 M52 400 C40 370 30 350 14 330 M58 360 C76 340 92 330 110 318"/>
           <path d="M586 560 C582 470 568 392 548 322 M560 384 C574 352 584 338 598 322 M552 342 C536 322 520 312 500 302"/>
         </g>`;
    W += blossoms(r, 66, 292, 92, 66, 120, pinks, 12) + blossoms(r, 540, 268, 84, 62, 110, pinks, 12);
    K = `<path d="M26 568 C33 480 44 420 65 342 M590 558 C586 470 572 392 552 324"/>` +
        scallops(r, 66, 292, 80, 56, 12) + scallops(r, 540, 268, 72, 52, 11);
    base.push(wash(W) + ink(K, '', 1.1, C.oxblood));

    // the pond
    W = `<ellipse cx="300" cy="566" rx="238" ry="94" fill="${C.water}"/><ellipse cx="292" cy="556" rx="170" ry="50" fill="#C9E4F7" opacity=".85"/>`;
    [[150, 612], [178, 624], [432, 614], [332, 640], [246, 518], [384, 506]].forEach(([x, y], i) => {
      W += `<ellipse cx="${x}" cy="${y}" rx="12" ry="5" fill="${C.leaf}"/>`;
      if (i % 2 === 0) W += `<circle cx="${x + 3}" cy="${y - 3}" r="3.4" fill="${C.rose}"/>`;
    });
    K = `<path d="M150 592 q14 -5 28 0 M360 616 q16 -5 32 0 M250 634 q12 -4 24 0 M424 566 q10 -4 20 0 M118 552 q10 -4 20 0 M270 600 q10 -4 20 0"/>
         <path d="M66 556 C76 500 200 474 300 474 C420 476 526 508 536 560"/>`;
    for (let i = 0; i < 16; i++) {
      const x = 70 + r() * 460, y = 660 + r() * 14 - Math.sin(((x - 62) / 476) * Math.PI) * 4;
      K += `<path d="M${f(x)} ${f(y)} l-2 -7 M${f(x)} ${f(y)} l2 -8 M${f(x)} ${f(y)} l5 -5"/>`;
    }
    base.push(wash(W) + ink(K, '', 1, '#5E8C9E'));

    // the monkey's column
    base.push(
      wash(`<rect x="504" y="470" width="32" height="160" fill="${C.stone}"/><rect x="525" y="472" width="11" height="156" fill="${C.parchment}"/>
            <path d="M496 458 H544 V472 H496Z M494 628 H546 V642 H494Z" fill="${C.stone}"/>`) +
      ink(`<path d="M504 472 V628 M536 472 V628 M512 477 V624 M520 477 V624 M528 477 V624 M496 458 H544 V472 H496Z M494 628 H546 V642 H494Z"/>
           <path d="M496 466 q-7 -1 -5 -7 M544 466 q7 -1 5 -7"/>`, '', 1.1)
    );

    // swans, beak to beak
    const swans = `<g transform="translate(180 498)">${swan()}</g><g transform="translate(420 498) scale(-1 1)">${swan()}</g>`;

    // the two characters
    const cast = `<g transform="translate(11 486) scale(.8)">${rooster()}</g><g transform="translate(442 313) scale(.72)">${monkey()}</g><g transform="translate(180 598) scale(.66)">${poodle()}</g>`;

    // foreground flowers and the bougainvillea garland along the arch
    W = ''; K = '';
    const cols = [C.rose, C.pink, '#F6E6CC', C.terracotta, C.oxblood, C.powder, C.magenta];
    [14, 40, 70, 122, 152, 186, 216, 262, 300, 344, 396, 428, 462, 500, 560, 588].forEach((x) => {
      const middle = x > 165 && x < 392;
      const h = middle ? 26 + r() * 22 : 46 + r() * 52;
      const y = 724 - h, dx = (r() - 0.5) * 22;
      const stem = `M${x} 726 Q${f(x + dx * 0.2)} ${f(y + h / 2)} ${f(x + dx)} ${f(y)}`;
      W += `<path d="${stem}" fill="none" stroke="${C.leaf}" stroke-width="2.2"/>`;
      K += `<path d="${stem}" transform="translate(1.200 0)"/>`;
      const l1 = leaf(x + dx * 0.3, y + h * 0.62, 16 + r() * 8, -150 + r() * 30, C.leaf);
      const l2 = leaf(x + dx * 0.5, y + h * 0.42, 14 + r() * 8, -40 + r() * 30, C.forest);
      const fl = flower(x + dx, y, 7 + r() * 5.5, pick(r, cols), r() * 72);
      W += l1.w + l2.w + fl.w; K += l1.k + l2.k + fl.k;
    });
    const arc = [];
    for (let a = 196; a <= 258; a += 6.5) arc.push(a);
    for (let a = 282; a <= 344; a += 6.5) arc.push(a);
    arc.forEach((a) => {
      const rad = (a * Math.PI) / 180;
      const edge = Math.abs(a - 270) / 74;
      const cx = 300 + Math.cos(rad) * (276 + r() * 10), cy = 300 + Math.sin(rad) * (276 + r() * 10);
      const lf = leaf(cx, cy, 15 + r() * 8, r() * 360, r() > 0.5 ? C.leaf : C.forest);
      W += lf.w + blossoms(r, cx, cy + 6, 13, 10 + edge * 16, 7 + Math.round(edge * 6), [C.magenta, C.rose, '#D9799B', C.pink], 4.6);
      K += lf.k;
    });
    const flora = wash(W) + ink(K, '', 1);

    const label = 'A hand-painted garden at dusk: a pink house with lamplit arches, flowering trees, a fountain, and two swans on a pond beneath a crescent moon. A rooster stands among the flowers on the near bank; across the water, a monkey perched on a column offers him a flower. Between them, Chicken Nugget, a small red poodle in a green cable-knit jumper keeps watch.';
    return `<div class="garden">
      <svg ${VB} role="img" aria-label="${label}"><rect width="600" height="720" fill="${C.ivory}"/>${base.join('')}</svg>
      <svg class="garden__layer garden__swans" ${VB} aria-hidden="true">${swans}</svg>
      <svg class="garden__layer garden__cast" ${VB} aria-hidden="true">${cast}</svg>
      <svg class="garden__layer garden__flora" ${VB} aria-hidden="true">${flora}</svg>
    </div>`;
  }

  /* ---------- Portraits for "A Most Interesting Pairing" ---------- */

  function portrait(opts) {
    const who = opts.variant;
    const r = rng(who === 'rooster' ? 5 : 23);
    const pinks = [C.blush, C.pink, C.rose, '#FBE0E4'];
    let W, K, figure, label, flowers = [];

    if (who === 'rooster') {
      label = 'The Rooster: an elegant bird with sweeping plumage and a powder-blue bow, striking a pose before a yellow sun in a garden of bougainvillea.';
      W = `<rect x="-20" y="-20" width="340" height="420" fill="${C.blush}"/>
           <circle cx="150" cy="176" r="110" fill="${C.goldLight}"/>
           <path d="M-20 312 C80 296 220 296 320 314 L320 400 L-20 400Z" fill="${C.lawn}"/>`;
      W += blossoms(r, 252, 38, 78, 44, 46, pinks, 10) + blossoms(r, 28, 58, 46, 36, 22, pinks, 9);
      K = `<path d="M300 150 C280 110 262 80 236 60 M270 96 C286 84 296 78 310 70"/>` + scallops(r, 252, 38, 64, 34, 7);
      figure = `<g transform="translate(20 62) scale(1.24)">${rooster()}</g>`;
      flowers = [22, 58, 96, 214, 250, 282];
    } else if (who === 'poodle') {
      label = 'Chicken Nugget, the chaperone: a small red toy poodle with a magnificent topknot, wearing a forest-green cable-knit jumper, seated on a pink settee.';
      W = `<rect x="-20" y="-20" width="340" height="420" fill="#E3EEDD"/>
           <path d="M14 262 C14 176 286 176 286 262 L286 340 L14 340Z" fill="#F28FA2"/>
           <path d="M-10 312 C80 292 220 292 310 312 L310 400 L-10 400Z" fill="${C.pink}"/>`;
      K = `<path d="M16 262 C16 178 284 178 284 262 M-6 314 C80 294 220 294 306 314"/>`;
      figure = `<g transform="translate(36 44) scale(1.9)">${poodle()}</g>`;
    } else {
      label = 'The Monkey: perched on a classical column before a pink moon, beneath a flowering branch, holding out a single flower with a knowing look.';
      W = `<rect x="-20" y="-20" width="340" height="420" fill="${C.powder}"/>
           <circle cx="150" cy="176" r="110" fill="${C.pink}"/>
           <path d="M-20 326 C80 310 220 310 320 328 L320 400 L-20 400Z" fill="${C.lawn}"/>
           <rect x="130" y="264" width="62" height="140" fill="${C.stone}"/><rect x="172" y="266" width="20" height="138" fill="${C.parchment}"/>
           <path d="M116 246 H206 V266 H116Z" fill="${C.stone}"/>`;
      W += blossoms(r, 58, 42, 84, 44, 50, pinks, 10);
      K = `<path d="M130 266 V384 M192 266 V384 M146 272 V384 M161 272 V384 M176 272 V384 M116 246 H206 V266 H116Z"/>
           <path d="M116 258 q-10 -2 -8 -11 M206 258 q10 -2 8 -11"/>
           <path d="M-6 120 C20 96 44 78 76 62 M40 84 C30 70 22 62 8 54"/>` + scallops(r, 58, 42, 68, 32, 7);
      figure = `<g transform="translate(31 5) scale(1.2)">${monkey()}</g>`;
      flowers = [18, 50, 84, 232, 262, 288];
    }

    // a few flowers at the foot of the frame
    let FW = '', FK = '';
    const cols = [C.rose, C.pink, C.white, C.terracotta, C.magenta];
    flowers.forEach((x) => {
      const h = 34 + r() * 40, y = 384 - h, dx = (r() - 0.5) * 16;
      const stem = `M${x} 386 Q${f(x + dx * 0.2)} ${f(y + h / 2)} ${f(x + dx)} ${f(y)}`;
      const l1 = leaf(x + dx * 0.3, y + h * 0.6, 16, -150 + r() * 30, C.leaf);
      const l2 = leaf(x + dx * 0.5, y + h * 0.4, 14, -40 + r() * 30, C.forest);
      const fl = flower(x + dx, y, 8 + r() * 4, pick(r, cols), r() * 72);
      FW += `<path d="${stem}" fill="none" stroke="${C.leaf}" stroke-width="2.200"/>` + l1.w + l2.w + fl.w;
      FK += `<path d="${stem}"/>` + l1.k + l2.k + fl.k;
    });

    return `<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
      <rect width="300" height="380" fill="${C.ivory}"/>
      ${wash(W)}${ink(K, '', 1.1)}
      ${figure}
      ${wash(FW)}${ink(FK, '', 1)}
    </svg>`;
  }

  /* ---------- Bougainvillea sprig (corners and borders) ---------- */

  function sprig(opts) {
    const r = rng(+(opts.seed || 3));
    const P = [[8, 292], [70, 230], [110, 130], [270, 30]];
    const at = (t) => {
      const u = 1 - t;
      return [0, 1].map((i) => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]);
    };
    const ang = (t) => {
      const a = at(Math.max(0, t - 0.01)), b = at(Math.min(1, t + 0.01));
      return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    };
    const stem = `M8 292 C70 230 110 130 270 30`;
    let W = `<path d="${stem}" fill="none" stroke="${C.leaf}" stroke-width="2.600" stroke-linecap="round"/>`;
    let K = `<path d="${stem}" transform="translate(1.500 1)"/>`;
    let side = 1;
    for (let t = 0.1; t < 0.97; t += 0.075) {
      const [x, y] = at(t);
      const l = leaf(x, y, 26 + r() * 20, ang(t) + side * (48 + r() * 24), r() > 0.45 ? C.leaf : C.forest);
      W += l.w; K += l.k; side = -side;
    }
    const cols = [C.rose, C.pink, C.blush, C.magenta];
    [[0.3, 34], [0.52, -36], [0.74, 30], [1, 0]].forEach(([t, off]) => {
      const [x, y] = at(t);
      const a = ((ang(t) - 90) * Math.PI) / 180;
      const fx = x + Math.cos(a) * off, fy = y + Math.sin(a) * off;
      const fl = flower(fx, fy, 13 + r() * 6, pick(r, cols), r() * 72, C.goldLight);
      W += `<path d="M${f(x)} ${f(y)} L${f(fx)} ${f(fy)}" stroke="${C.leaf}" stroke-width="1.800"/>` + fl.w;
      K += fl.k;
    });
    [[0.42, 22], [0.63, -20], [0.86, -24], [0.9, 20]].forEach(([t, off]) => {
      const [x, y] = at(t);
      const a = ((ang(t) - 90) * Math.PI) / 180;
      const bx = x + Math.cos(a) * off, by = y + Math.sin(a) * off;
      W += `<path d="M${f(x)} ${f(y)} L${f(bx)} ${f(by)}" stroke="${C.leaf}" stroke-width="1.500"/><circle cx="${f(bx)}" cy="${f(by)}" r="${f(4 + r() * 2)}" fill="${pick(r, cols)}"/>`;
      K += `<circle cx="${f(bx + 1)}" cy="${f(by - 0.8)}" r="4.500"/>`;
    });
    return `<svg viewBox="-10 -10 320 320" aria-hidden="true">${wash(W, '-s')}${ink(K, '-s', 1)}</svg>`;
  }

  /* ---------- The pair of swans, as an emblem ---------- */

  function swans() {
    return `<svg viewBox="0 0 240 96" aria-hidden="true">
      ${wash(`<ellipse cx="120" cy="80" rx="108" ry="9" fill="${C.water}" opacity=".7"/>`, '-s')}
      <g transform="translate(2 4)">${swan()}</g><g transform="translate(238 4) scale(-1 1)">${swan()}</g>
      ${ink(`<path d="M20 88 q10 -4 20 0 M196 88 q10 -4 20 0 M106 90 q14 -5 28 0"/>`, '-s', 0.8, '#5E8C9E')}
    </svg>`;
  }

  /* ---------- Blake and Kat, as drawn figures (local box 200 × 250, head and shoulders) ---------- */

  function blake() {
    const skin = '#F0C7A4';
    const W = `<path d="M28 252 C32 198 62 174 86 166 L100 188 L114 166 C138 174 168 198 172 252Z" fill="${C.forest}"/>
           <path d="M86 166 L100 192 L114 166 L108 158 L92 158Z" fill="${C.white}"/>
           <path d="M86 136 L86 166 L100 180 L114 166 L114 136Z" fill="${skin}"/>
           <path d="M100 172 L88 165 L88 179Z M100 172 L112 165 L112 179Z" fill="#231F22"/>
           <ellipse cx="66" cy="100" rx="5" ry="9" fill="${skin}"/><ellipse cx="134" cy="100" rx="5" ry="9" fill="${skin}"/>
           <path d="M68 96 C66 64 82 50 100 50 C118 50 134 64 132 96 C131 122 118 142 100 144 C82 142 69 122 68 96Z" fill="${skin}"/>
           <circle cx="80" cy="112" r="8" fill="${C.pink}" opacity=".45"/><circle cx="120" cy="112" r="8" fill="${C.pink}" opacity=".45"/>
           <path d="M64 94 C54 60 72 34 98 33 C112 20 138 34 138 60 C142 72 139 86 135 95 C133 78 127 66 116 61 C104 68 86 64 75 71 C70 78 68 86 64 94Z" fill="#4A3426"/>`;
    const K = `<path d="M68 98 C68 122 82 142 100 144 C118 142 132 122 132 98"/>
           <path d="M72 70 C86 62 104 66 118 58 M78 50 C90 40 108 36 124 46 M100 33 C92 40 89 48 91 58"/>
           <path d="M77 87 q9 -5 18 -1 M105 86 q9 -4 18 1" stroke-width="2.400"/>
           <path d="M80 96 q7 -4 14 0 M106 96 q7 -4 14 0"/>
           <circle cx="87" cy="97" r="2.300" fill="${C.ink}" stroke="none"/><circle cx="113" cy="97" r="2.300" fill="${C.ink}" stroke="none"/>
           <path d="M100 97 C98 106 96 112 102 114 M90 125 q11 5 21 -1 q2 -1 2 -3"/>
           <path d="M86 166 L100 192 L114 166 M72 174 L96 234 M128 174 L104 234"/>`;
    return wash(W, '-s') + ink(K, '-s', 1.1);
  }

  function kat() {
    const skin = '#EDC4A6';
    const f1 = flower(54, 214, 15, '#4A4247', 10, C.goldLight), f2 = flower(78, 236, 12, '#4A4247', 40, C.goldLight), f3 = flower(150, 222, 14, '#4A4247', 25, C.goldLight);
    const W = `<path d="M56 252 C48 170 50 92 70 58 C82 34 118 34 130 58 C150 92 152 170 144 252Z" fill="#1E1A1C"/>
           <path d="M22 252 C26 202 58 178 84 170 L100 194 L116 170 C142 178 174 202 178 252Z" fill="#2A2529"/>
           <path d="M88 134 L88 172 L100 190 L112 172 L112 134Z" fill="${skin}"/>
           <path d="M72 98 C70 70 84 54 100 54 C116 54 130 70 128 98 C127 122 114 140 100 142 C86 140 73 122 72 98Z" fill="${skin}"/>
           <circle cx="83" cy="113" r="7" fill="${C.pink}" opacity=".5"/><circle cx="117" cy="113" r="7" fill="${C.pink}" opacity=".5"/>
           <path d="M90 124 C95 120 98 122 100 123 C102 122 105 120 110 124 C105 131 95 131 90 124Z" fill="#C4566A"/>
           <path d="M100 50 C82 50 68 70 68 104 C68 140 64 180 60 216 L80 208 C82 160 76 110 82 84 C86 68 94 58 100 50Z" fill="#1E1A1C"/>
           <path d="M100 50 C118 50 132 70 132 104 C132 140 136 180 140 216 L120 208 C118 160 124 110 118 84 C114 68 106 58 100 50Z" fill="#1E1A1C"/>` + f1.w + f2.w + f3.w;
    const K = `<path d="M76 108 C78 126 88 140 100 142 C112 140 122 126 124 108"/>
           <path d="M80 90 q8 -5 16 -1 M104 89 q8 -4 16 1"/>
           <path d="M80 100 q7 -6 15 -1 q-7 4 -15 1Z M105 99 q8 -5 15 1 q-8 3 -15 -1Z" fill="${C.ink}"/>
           <path d="M80 100 l-5 -3 M120 100 l5 -3"/>
           <path d="M100 100 C99 108 98 113 102 115 M91 124.500 q9 2 18 0"/>
           <path d="M84 172 L100 196 L116 172"/>`;
    return wash(W, '-s') + ink(K, '-s', 1.1);
  }

  function cameo(opts) {
    const isKat = opts.variant === 'kat';
    const label = isKat
      ? 'An illustrated portrait of Kat: long, sleek black hair with a centre parting, winged eyes and a composed expression, in a black coat trimmed with flowers.'
      : 'An illustrated portrait of Blake: tousled dark brown hair swept up from the brow, a level gaze and half a smile, in a green dinner jacket and black bow tie.';
    return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
      <rect width="200" height="250" fill="${C.ivory}"/>
      ${wash(`<rect x="-10" y="-10" width="220" height="270" fill="${isKat ? '#F7E3A8' : C.powder}"/>`, '-s')}
      ${isKat ? kat() : blake()}
    </svg>`;
  }

  /* ---------- Supper: the two of them and Chicken Nugget, mid-toast ---------- */

  function supper() {
    const r = rng(9);
    const pinks = [C.blush, C.pink, C.rose, '#FBE0E4'];
    const coupe = (cx) =>
      `<path d="M${cx - 15} 204 H${cx + 15} C${cx + 15} 217 ${cx + 8} 224 ${cx} 224 C${cx - 8} 224 ${cx - 15} 217 ${cx - 15} 204Z" fill="${C.pink}"/>`;
    const coupeK = (cx) =>
      `<path d="M${cx - 14} 203 H${cx + 16} C${cx + 16} 216 ${cx + 9} 223 ${cx + 1} 223 C${cx - 7} 223 ${cx - 14} 216 ${cx - 14} 203Z M${cx + 1} 223 V244"/>`;

    const back =
      wash(`<rect x="-20" y="-20" width="680" height="480" fill="${C.blush}"/><circle cx="320" cy="170" r="128" fill="${C.goldLight}"/>` +
        blossoms(r, 118, 84, 96, 52, 54, pinks, 11) + blossoms(r, 522, 84, 96, 52, 54, pinks, 11)) +
      ink(`<path d="M20 190 C50 150 84 120 124 100 M620 190 C590 150 556 120 516 100"/>` + scallops(r, 118, 84, 78, 40, 7) + scallops(r, 522, 84, 78, 40, 7), '', 1, C.oxblood);

    const company =
      `<g transform="translate(58 66)">${blake()}</g><g transform="translate(382 66)">${kat()}</g>` +
      `<g transform="translate(263 152) scale(.95)">${poodle()}</g>`;

    const toast = `<g transform="translate(0 -22)">` +
      wash(`<path d="M210 296 L262 242" fill="none" stroke="${C.forest}" stroke-width="17" stroke-linecap="round"/>
            <path d="M430 296 L378 242" fill="none" stroke="#2A2529" stroke-width="17" stroke-linecap="round"/>
            <circle cx="266" cy="238" r="8.500" fill="#F0C7A4"/><circle cx="374" cy="238" r="8.500" fill="#EDC4A6"/>` + coupe(268) + coupe(372), '-s') +
      ink(coupeK(268) + coupeK(372) + `<path d="M306 150 l-5 -9 M320 146 v-11 M334 150 l5 -9"/>`, '-s', 1) + `</g>`;

    const table =
      wash(`<path d="M70 300 C72 360 84 420 96 452 L544 452 C556 420 568 360 570 300Z" fill="#FFFFFF"/>
            <ellipse cx="320" cy="300" rx="250" ry="26" fill="#FFFFFF"/>
            <ellipse cx="212" cy="302" rx="36" ry="8.500" fill="${C.parchment}"/><ellipse cx="428" cy="302" rx="36" ry="8.500" fill="${C.parchment}"/>
            <ellipse cx="212" cy="299" rx="15" ry="4.500" fill="${C.rose}"/><ellipse cx="428" cy="299" rx="15" ry="4.500" fill="${C.leaf}"/>
            <ellipse cx="320" cy="312" rx="22" ry="5.500" fill="${C.powder}"/><ellipse cx="320" cy="309" rx="8" ry="3.500" fill="${C.fur}"/>
            <rect x="316" y="262" width="8" height="30" fill="${C.ivory}"/><ellipse cx="320" cy="294" rx="11" ry="3.500" fill="${C.gold}"/>
            <path d="M320 244 C326 252 325 260 320 261 C315 260 314 252 320 244Z" fill="${C.terracotta}"/>`) +
      ink(`<path d="M70 300 C72 272 568 272 570 300 C568 328 72 328 70 300Z"/>
           <path d="M128 324 C132 370 138 410 144 446 M320 328 V446 M512 324 C508 370 502 410 496 446"/>
           <ellipse cx="213" cy="302" rx="36" ry="8.500"/><ellipse cx="429" cy="302" rx="36" ry="8.500"/><ellipse cx="321" cy="312" rx="22" ry="5.500"/>
           <path d="M316 262 V292 M324 262 V292 M320 262 V256"/>
           <path d="M166 296 L160 308 M258 296 L264 308 M382 296 L376 308 M474 296 L480 308"/>`, '', 1);

    const label = 'Supper in the garden: Blake and Kat raise their glasses across a candlelit table beneath flowering branches, with Chicken Nugget the poodle seated between them and a small plate of their own.';
    return `<svg viewBox="0 0 640 430" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
      <rect width="640" height="430" fill="${C.ivory}"/>${back}${company}${toast}${table}
    </svg>`;
  }

  /* ---------- Keepsakes: Blake, Kat and Chicken Nugget together ---------- */

  function together(opts) {
    const v = opts.variant;
    const r = rng({ portrait: 3, drive: 17, lake: 29, terrace: 41 }[v] || 3);
    const pinks = [C.blush, C.pink, C.rose, '#FBE0E4'];
    const nest = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
    const at = (fig, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${fig}</g>`;
    const blooms = (list) => {
      let w = '', k = '';
      list.forEach(([x, y, h]) => {
        const dx = (r() - 0.5) * 14, top = y - h;
        const stem = `M${x} ${y} Q${f(x + dx * 0.2)} ${f(top + h / 2)} ${f(x + dx)} ${f(top)}`;
        const l1 = leaf(x + dx * 0.3, top + h * 0.6, 17, -150 + r() * 30, C.leaf), l2 = leaf(x + dx * 0.5, top + h * 0.4, 15, -40 + r() * 30, C.forest);
        const fl = flower(x + dx, top, 9 + r() * 5, pick(r, [C.rose, C.pink, C.white, C.terracotta, C.magenta]), r() * 72);
        w += `<path d="${stem}" fill="none" stroke="${C.leaf}" stroke-width="2.400"/>` + l1.w + l2.w + fl.w;
        k += `<path d="${stem}"/>` + l1.k + l2.k + fl.k;
      });
      return wash(w) + ink(k, '', 1);
    };
    let box, body, label;

    if (v === 'drive') {
      box = '0 0 640 430';
      label = 'Blake, Kat and Chicken Nugget out for a drive in a pink convertible beneath the palms, the poodle riding in the back.';
      const back =
        wash(`<rect x="-20" y="-20" width="680" height="480" fill="${C.powder}"/><circle cx="470" cy="120" r="74" fill="${C.goldLight}"/>
              <path d="M-20 300 C120 280 300 292 420 284 C520 278 600 290 660 282 L660 460 L-20 460Z" fill="${C.lawn}"/>
              <rect x="-20" y="352" width="680" height="100" fill="${C.parchment}"/>`) +
        nest(palm({ seed: 6 }), 10, 60, 130, 260) + nest(palm({ seed: 19 }), 520, 96, 110, 220) +
        ink(`<path d="M30 398 h56 M150 398 h56 M270 398 h56 M390 398 h56 M510 398 h56"/><path d="M18 318 h34 M4 300 h26 M24 336 h22"/>`, '', 1.2, C.goldDeep);
      const riders = at(poodle(), 92, 146, 0.86) + at(kat(), 176, 92, 0.82) + at(blake(), 306, 92, 0.82);
      const car =
        wash(`<path d="M406 262 L432 204 L446 204 L454 262Z" fill="#DCEBF8"/>
              <path d="M62 306 C66 272 104 262 150 260 L250 258 C320 255 420 256 474 262 C536 268 574 284 578 312 L578 344 L62 344Z" fill="#F28FA2"/>
              <path d="M62 318 H578 V330 H62Z" fill="${C.white}"/>
              <circle cx="168" cy="346" r="36" fill="#2A2529"/><circle cx="470" cy="346" r="36" fill="#2A2529"/>
              <circle cx="168" cy="346" r="15" fill="${C.ivory}"/><circle cx="470" cy="346" r="15" fill="${C.ivory}"/>
              <circle cx="570" cy="300" r="9" fill="${C.goldLight}"/>`) +
        ink(`<path d="M62 306 C66 272 104 262 150 260 L250 258 C320 255 420 256 474 262 C536 268 574 284 578 312 L578 344 M62 306 V344"/>
             <path d="M406 262 L432 204 L446 204 L454 262 M290 262 V318 M300 290 h18 M398 244 a14 14 0 1 0 1 .1"/>
             <circle cx="168" cy="346" r="36"/><circle cx="470" cy="346" r="36"/><circle cx="168" cy="346" r="15"/><circle cx="470" cy="346" r="15"/>
             <path d="M62 318 H578 M62 330 H578"/>`, '', 1.1);
      body = back + riders + car;
    } else if (v === 'lake') {
      box = '0 0 640 430';
      label = 'Blake, Kat and Chicken Nugget in a rowing boat on the swan lake, the poodle keeping lookout at the bow as two swans glide past.';
      const back =
        wash(`<rect x="-20" y="-20" width="680" height="300" fill="${C.blush}"/><circle cx="150" cy="120" r="70" fill="${C.goldLight}"/>
              <path d="M-20 232 C100 206 220 226 330 212 C450 198 560 222 660 206 L660 300 L-20 300Z" fill="${C.lawn}"/>
              <rect x="-20" y="262" width="680" height="200" fill="${C.water}"/><ellipse cx="320" cy="360" rx="250" ry="46" fill="#C9E4F7" opacity=".8"/>` +
          blossoms(r, 560, 70, 110, 60, 60, pinks, 12) + blossoms(r, 40, 30, 70, 36, 24, pinks, 10)) +
        ink(`<path d="M640 230 C610 180 580 140 540 100"/>` + scallops(r, 560, 70, 90, 46, 8), '', 1, C.oxblood) +
        ink(`<path d="M40 330 q14 -5 28 0 M560 396 q16 -5 32 0 M110 400 q12 -4 24 0 M590 320 q10 -4 20 0 M250 404 q12 -4 24 0 M420 410 q12 -4 24 0"/>`, '', 1, '#5E8C9E');
      const crew = at(blake(), 108, 70, 0.9) + at(kat(), 262, 70, 0.9) + at(poodle(), 452, 172, 0.82);
      const boat =
        wash(`<path d="M84 290 L556 290 C544 346 484 366 320 366 C156 366 96 346 84 290Z" fill="${C.ivory}"/>
              <path d="M88 304 L552 304 C550 312 548 318 544 324 L96 324 C92 318 90 312 88 304Z" fill="${C.forest}"/>
              <path d="M214 300 L120 392" fill="none" stroke="${C.bark}" stroke-width="6" stroke-linecap="round"/><ellipse cx="112" cy="398" rx="20" ry="8" fill="${C.bark}" transform="rotate(-44 112 398)"/>`) +
        ink(`<path d="M84 290 L556 290 C544 346 484 366 320 366 C156 366 96 346 84 290Z M88 304 H552 M96 324 H544"/><path d="M140 380 q20 8 40 0 M440 384 q20 8 40 0"/>`, '', 1.1);
      const birds = `<g transform="translate(556 322) scale(.62)">${swan()}</g><g transform="translate(30 344) scale(.5)">${swan()}</g>`;
      body = back + crew + boat + birds;
    } else if (v === 'terrace') {
      box = '0 0 500 600';
      label = 'Blake, Kat and Chicken Nugget on a moonlit terrace: the two of them framed by a pink archway and bougainvillea, the poodle seated on the balustrade between them.';
      let stars = '';
      [[150, 150], [250, 110], [200, 220], [330, 250], [120, 260], [390, 200]].forEach(([x, y]) => { stars += star(x, y, 4 + r() * 3); });
      const back =
        wash(`<rect x="-20" y="-20" width="540" height="640" fill="#F7AEB9"/>
              <path d="M66 620 V252 A184 184 0 0 1 434 252 V620Z" fill="${C.powder}"/>
              <path d="M330 118 A32 32 0 1 0 368 158 A25 25 0 1 1 330 118Z" fill="${C.goldLight}"/><g fill="${C.gold}">${stars}</g>`) +
        nest(palm({ seed: 8 }), 70, 196, 120, 240) +
        ink(`<path d="M66 600 V252 A184 184 0 0 1 434 252 V600 M52 600 V252 A198 198 0 0 1 448 252 V600"/>`, '', 1.1);
      const couple = at(blake(), 54, 196, 1.08) + at(kat(), 230, 196, 1.08);
      let bw = `<rect x="-20" y="446" width="540" height="18" fill="${C.stone}"/><rect x="-20" y="544" width="540" height="76" fill="${C.stone}"/>`, bk = `<path d="M-20 446 H520 M-20 464 H520 M-20 544 H520"/>`;
      for (let x = 14; x < 500; x += 40) {
        bw += `<path d="M${x} 464 C${x - 10} 484 ${x - 10} 516 ${x} 544 L${x + 12} 544 C${x + 22} 516 ${x + 22} 484 ${x + 12} 464Z" fill="${C.stone}"/>`;
        bk += `<path d="M${x} 464 C${x - 10} 484 ${x - 10} 516 ${x} 544 M${x + 12} 464 C${x + 22} 484 ${x + 22} 516 ${x + 12} 544"/>`;
      }
      const rail = wash(`<rect x="-20" y="464" width="540" height="80" fill="#EE94A4"/>` + bw) + ink(bk, '', 1);
      const vines =
        wash(blossoms(r, 70, 120, 70, 90, 60, [C.magenta, C.rose, '#D9799B', C.pink], 9) + blossoms(r, 440, 110, 60, 100, 60, [C.magenta, C.rose, '#D9799B', C.pink], 9)) +
        ink(scallops(r, 70, 120, 56, 74, 7) + scallops(r, 440, 110, 48, 82, 7), '', 1, C.oxblood);
      body = back + couple + rail + at(poodle(), 189, 300, 1) + vines;
    } else {
      box = '0 0 500 600';
      label = 'A portrait of all three: Blake and Kat side by side in a flowering garden, with Chicken Nugget the poodle seated in front of them.';
      const back =
        wash(`<rect x="-20" y="-20" width="540" height="640" fill="${C.blush}"/><circle cx="250" cy="250" r="186" fill="${C.goldLight}"/>` +
          blossoms(r, 70, 70, 110, 70, 60, pinks, 12) + blossoms(r, 430, 70, 110, 70, 60, pinks, 12)) +
        ink(scallops(r, 70, 70, 90, 54, 8) + scallops(r, 430, 70, 90, 54, 8), '', 1, C.oxblood);
      const couple = at(blake(), 34, 150, 1.22) + at(kat(), 222, 150, 1.22);
      const lawn = wash(`<path d="M-20 452 C120 432 380 432 520 454 L520 620 L-20 620Z" fill="${C.lawn}"/>`);
      body = back + couple + lawn + blooms([[40, 596, 70], [92, 600, 50], [140, 598, 84], [372, 598, 80], [420, 600, 52], [468, 596, 72]]) + at(poodle(), 158, 352, 1.5);
    }
    return `<svg viewBox="${box}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><rect width="100%" height="100%" fill="${C.ivory}"/>${body}</svg>`;
  }

  /* ---------- A tall, loose-limbed palm (local box 0..260 × 0..560) ---------- */

  function palm(opts) {
    const r = rng(+(opts.seed || 4));
    const cx = 132, cy = 150;
    const greens = [C.forest, C.leaf, C.palm];
    let W = `<path d="M108 560 C116 430 112 280 ${cx - 6} ${cy} L${cx + 6} ${cy} C128 280 134 430 130 560Z" fill="${C.bark}"/>`;
    let K = `<path d="M108 560 C116 430 112 280 ${cx - 6} ${cy} M130 560 C134 430 128 280 ${cx + 6} ${cy}"/>`;
    for (let y = 190; y < 550; y += 27) K += `<path d="M${f(113 + (y - 190) * -0.012)} ${y} q9 6 17 -1"/>`;
    let FW = '', FK = '';
    [-178, -150, -122, -96, -70, -44, -18, 6, 172].forEach((a, i) => {
      const rad = ((a + (r() - 0.5) * 10) * Math.PI) / 180;
      const L = 96 + r() * 34, droop = 30 + Math.abs(Math.cos(rad)) * 46;
      const mx = cx + Math.cos(rad) * L * 0.62, my = cy + Math.sin(rad) * L * 0.62 - 26;
      const ex = cx + Math.cos(rad) * L, ey = cy + Math.sin(rad) * L + droop;
      const d = `M${cx} ${cy} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
      FW += `<path d="${d}" stroke="${greens[i % 3]}" stroke-width="${f(11 + r() * 5)}"/>`;
      FK += `<path d="${d}" transform="translate(1.500 -2)"/>`;
      for (let t = 0.3; t < 0.95; t += 0.16) {
        const u = 1 - t;
        const px = u * u * cx + 2 * u * t * mx + t * t * ex, py = u * u * cy + 2 * u * t * my + t * t * ey;
        FK += `<path d="M${f(px)} ${f(py)} l${f(Math.cos(rad) * 5 - 3)} 9 M${f(px)} ${f(py)} l${f(Math.cos(rad) * 5 + 4)} -8"/>`;
      }
    });
    W += `<g fill="none" stroke-linecap="round">${FW}</g><circle cx="${cx - 7}" cy="${cy + 8}" r="6.500" fill="${C.terracotta}"/><circle cx="${cx + 6}" cy="${cy + 10}" r="6" fill="${C.terracotta}"/>`;
    return `<svg viewBox="-10 0 280 560" aria-hidden="true">${wash(W)}${ink(K + FK, '', 1)}</svg>`;
  }

  /* ---------- Chicken Nugget in silhouette, out for a walk (faces right) ---------- */

  function walker() {
    const leg = (x, cls) =>
      `<g class="walker__leg walker__leg--${cls}"><path d="M${x} 52 L${x} 73" stroke="currentColor" stroke-width="4.500" stroke-linecap="round"/><circle cx="${x}" cy="74" r="5.200"/><ellipse cx="${x + 2.5}" cy="80" rx="4.500" ry="2.400"/></g>`;
    return `<svg viewBox="0 0 124 86" aria-hidden="true" fill="currentColor">
      ${leg(42, 'b')}${leg(76, 'a')}
      <g class="walker__body">
        <path d="M36 44 L27 27" stroke="currentColor" stroke-width="3.400" stroke-linecap="round"/><circle cx="26" cy="23" r="6.500"/>
        <ellipse cx="58" cy="47" rx="25" ry="13"/>
        <path d="M70 44 C74 30 80 24 88 22 L94 36 C88 42 84 50 80 56Z"/>
        <ellipse cx="83" cy="29" rx="6.500" ry="12" transform="rotate(14 83 29)"/>
        <circle cx="91" cy="24" r="10.500"/><circle cx="89" cy="12" r="9.500"/><circle cx="95" cy="9" r="6"/><circle cx="82" cy="11" r="6"/>
        <rect x="94" y="22" width="17" height="9.500" rx="4.700"/>
      </g>
      ${leg(36, 'a')}${leg(70, 'b')}
    </svg>`;
  }

  /* ---------- Envelope seal, gold cartouche, divider, bird ---------- */

  function seal() {
    return `<svg viewBox="0 0 120 120" aria-hidden="true">
      <g filter="url(#f-wobble)"><circle cx="60" cy="60" r="50" fill="${C.forest}"/><circle cx="60" cy="60" r="50" fill="url(#g-wax)"/></g>
      <circle cx="60" cy="60" r="38" fill="rgba(0,0,0,.14)"/>
      <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1.200"/>
      <text x="60" y="72" text-anchor="middle" font-family="'Bodoni Moda', Didot, serif" font-style="italic" font-size="33" fill="url(#g-gold)">B<tspan font-size="20" dx="1" dy="-3">&amp;</tspan><tspan dx="1" dy="3">K</tspan></text>
    </svg>`;
  }

  function cartouche() {
    const corner = (x, y) => `<circle cx="${x}" cy="${y}" r="6.500" fill="url(#g-gold)"/><circle cx="${x}" cy="${y}" r="2.200" fill="#FBF6EA"/>`;
    return `<svg viewBox="0 0 160 104" aria-hidden="true">
      <path d="M58 18 C62 2 74 10 80 1 C86 10 98 2 102 18Z M58 86 C62 102 74 94 80 103 C86 94 98 102 102 86Z" fill="url(#g-gold)"/>
      <path d="M14 40 C2 44 2 60 14 64Z M146 40 C158 44 158 60 146 64Z" fill="url(#g-gold)"/>
      <rect x="14" y="18" width="132" height="68" rx="5" fill="#FBF6EA" stroke="url(#g-gold)" stroke-width="5"/>
      <rect x="22.500" y="26.500" width="115" height="51" rx="1.500" fill="none" stroke="${C.gold}" stroke-width=".9"/>
      ${corner(14, 18)}${corner(146, 18)}${corner(14, 86)}${corner(146, 86)}
      <text x="80" y="63" text-anchor="middle" font-family="'Bodoni Moda', Didot, serif" font-style="italic" font-size="31" fill="${C.goldDeep}">B<tspan font-size="19" dx="2" dy="-3">&amp;</tspan><tspan dx="2" dy="3">K</tspan></text>
    </svg>`;
  }

  function divider() {
    const fl = flower(80, 12, 7, C.rose, 0);
    return `<svg viewBox="0 0 160 24" aria-hidden="true">
      ${ink(`<path d="M6 12 H62 M98 12 H154"/><path d="M62 12 q4 -5 8 0 M90 12 q4 5 8 0"/>`, '-xs', 0.9, C.gold)}
      ${wash(fl.w, '-xs')}${ink(fl.k, '-xs', 0.7)}
    </svg>`;
  }

  function bird() {
    return `<svg viewBox="0 0 44 22" aria-hidden="true"><g class="bird__wings" fill="none" stroke="${C.ink}" stroke-width="1.600" stroke-linecap="round"><path d="M3 12 Q12 1 22 12 Q32 1 41 12"/><path d="M22 12 l3 3"/></g></svg>`;
  }

  /* ---------- Small stationery icons (64 × 64) ---------- */

  const ICONS = {
    date: () => [
      `<path d="M36 12 A20 20 0 1 0 52 44 A16 16 0 1 1 36 12Z" fill="${C.goldLight}"/><g fill="${C.gold}">${star(15, 16, 4)}${star(50, 22, 3)}${star(22, 50, 2.5)}</g>`,
      `<path d="M37 11 A20 20 0 1 0 53 43"/>`,
    ],
    time: () => [
      `<circle cx="32" cy="37" r="18" fill="${C.powder}"/><circle cx="32" cy="10" r="3.500" fill="${C.goldLight}"/>`,
      `<circle cx="32.800" cy="36.400" r="18"/><circle cx="32.800" cy="36.400" r="14.500"/><path d="M32 19 V14 M32 37 L32 26 M32 37 L40 41"/><circle cx="32" cy="10" r="3.500"/><path d="M32 23 v1.500 M32 49 v1.500 M19 37 h1.500 M44.500 37 h1.500"/>`,
    ],
    location: () => [
      `<path d="M16 54 V28 A16 16 0 0 1 48 28 V54Z" fill="${C.blush}"/><ellipse cx="32" cy="40" rx="4" ry="13" fill="${C.forest}"/><path d="M8 54 H56 V58 H8Z" fill="${C.lawn}"/><circle cx="12" cy="50" r="3.500" fill="${C.rose}"/><circle cx="52" cy="50" r="3.500" fill="${C.rose}"/>`,
      `<path d="M17 54 V28 A16 16 0 0 1 49 28 V54 M21 54 V29 A12 12 0 0 1 45 29 V54 M8 54 H57"/><path d="M33 8 l0 4 M31 10 h4"/>`,
    ],
    dress: () => [
      `<path d="M32 32 L11 21 V43Z M32 32 L53 21 V43Z" fill="${C.oxblood}"/><rect x="27.500" y="26.500" width="9" height="11" rx="2" fill="${C.vermilion}"/>`,
      `<path d="M33 32 L12 20 V42Z M33 32 L54 20 V42Z M18 27 q4 5 0 10 M48 27 q-4 5 0 10"/><rect x="28.500" y="26" width="9" height="11" rx="2"/>`,
    ],
    cocktails: () => [
      `<path d="M15 16 H49 C49 29 41 35 32 35 C23 35 15 29 15 16Z" fill="${C.blush}"/><circle cx="41" cy="14" r="4" fill="${C.vermilion}"/>`,
      `<path d="M16 15 H50 C50 28 42 34 33 34 C24 34 16 28 16 15Z M33 34 V52 M23 54 H43 M19 21 H47"/><path d="M41 14 L46 6"/><circle cx="26" cy="26" r="1"/><circle cx="34" cy="28" r="1"/>`,
    ],
    dinner: () => [
      `<path d="M12 44 A20 20 0 0 1 52 44Z" fill="${C.powder}"/><circle cx="32" cy="21" r="3" fill="${C.goldLight}"/><path d="M6 45 H58 V50 H6Z" fill="${C.goldLight}"/>`,
      `<path d="M13 44 A20 20 0 0 1 53 44 M6 45 H58 M10 50 H55"/><circle cx="32.500" cy="20.500" r="3"/><path d="M20 40 A13 13 0 0 1 30 28"/>`,
    ],
    adventure: () => [
      `<circle cx="32" cy="32" r="21" fill="${C.sage}"/><path d="M32 14 L38 32 L32 50 L26 32Z" fill="${C.terracotta}"/>`,
      `<circle cx="32.800" cy="31.500" r="21"/><path d="M33 14 L39 32 L33 50 L27 32Z M27 32 H39"/><path d="M32 7 v3 M32 54 v3 M7 32 h3 M54 32 h3"/>`,
    ],
    surprise: () => [
      `<rect x="15" y="30" width="34" height="24" fill="${C.goldLight}"/><rect x="12" y="23" width="40" height="8" fill="${C.pink}"/><path d="M29 23 H35 V54 H29Z" fill="${C.oxblood}"/><path d="M32 23 C22 10 14 18 32 23 C50 18 42 10 32 23Z" fill="${C.oxblood}"/>`,
      `<path d="M16 31 V54 H50 V31 M12 23 H53 V31 H12Z M29.500 23 V54 M35.500 23 V54"/><path d="M33 22 C23 9 15 17 33 22 C51 17 43 9 33 22Z"/>`,
    ],
  };

  Object.assign(ICONS, {
    scroll: () => [
      `<rect x="20" y="7" width="24" height="50" rx="5" fill="${C.powder}"/><path d="M32 40 C22 32 23 24 28 24 C30 24 32 26 32 28 C32 26 34 24 36 24 C41 24 42 32 32 40Z" fill="${C.rose}"/>`,
      `<rect x="21" y="6.500" width="24" height="50" rx="5"/><path d="M29 12 h8 M31 51 h4"/><path d="M33 39 C23 31 24 23 29 23 C31 23 33 25 33 27 C33 25 35 23 37 23 C42 23 43 31 33 39Z"/><path d="M50 14 l4 -4 M52 22 h5 M14 14 l-4 -4 M12 22 h-5"/>`,
    ],
    call: () => [
      `<path d="M10 30 C10 10 54 10 54 30 L45 33 C43 23 21 23 19 33Z" fill="${C.pink}"/><path d="M36 38 A11 11 0 1 0 46 52 A8.500 8.500 0 1 1 36 38Z" fill="${C.goldLight}"/><g fill="${C.gold}">${star(20, 44, 3.5)}${star(27, 54, 2.5)}</g>`,
      `<path d="M11 30 C11 10 55 10 55 30 L46 33 C44 23 22 23 20 33Z"/><path d="M37 37.500 A11 11 0 1 0 47 51.500"/>`,
    ],
    meet: () => [
      `<path d="M8 22 H28 C28 31 23 35 18 35 C13 35 8 31 8 22Z" fill="${C.blush}"/><path d="M36 22 H56 C56 31 51 35 46 35 C41 35 36 31 36 22Z" fill="${C.blush}"/><path d="M32 15 C26 10 27 5 30 5 C31 5 32 6 32 7.500 C32 6 33 5 34 5 C37 5 38 10 32 15Z" fill="${C.rose}"/>`,
      `<path d="M9 21.500 H29 C29 30.500 24 34.500 19 34.500 C14 34.500 9 30.500 9 21.500Z M19 34.500 V52 M12 54 H26"/><path d="M37 21.500 H57 C57 30.500 52 34.500 47 34.500 C42 34.500 37 30.500 37 21.500Z M47 34.500 V52 M40 54 H54"/><path d="M12 26 H26 M40 26 H54"/>`,
    ],
  });

  function icon(opts) {
    const [w, k] = (ICONS[opts.variant] || ICONS.date)();
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${wash(w, '-xs')}${ink(k, '-xs', 1)}</svg>`;
  }

  /* the drawing kit, for other tools (the film) that paint in the same hand */
  const kit = { inkScale: 1.7, C, f, rng, pick, wash, ink, flower, leaf, blossoms, scallops, star, swan, rooster, monkey, poodle, blake, kat };

  window.Art = { together, walker, palm, blake, kat, poodle, cameo, supper, courier, letter, garden, portrait, fountain, sprig, swans, seal, cartouche, divider, bird, icon, _: kit };
})();
