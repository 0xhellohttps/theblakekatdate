/* ------------------------------------------------------------------
   Behaviour: paint the illustrations, fill in the details, open the
   envelope, and handle the card, chapters, parallax, music and RSVP.
------------------------------------------------------------------- */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const cfg = window.INVITATION || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORE = 'blake-and-kat:reply';

  /* ---------- 1. Illustrations ---------- */
  $$('[data-art]').forEach((el) => {
    const draw = window.Art[el.dataset.art];
    if (draw) el.innerHTML = draw(el.dataset);
  });

  /* a flock of birds drifting across the page, at different heights and speeds */
  if (!reduceMotion) {
    const flock = document.createElement('div');
    flock.className = 'flock';
    flock.setAttribute('aria-hidden', 'true');
    // [height vh, size px, crossing time s, delay s] — the first three fly as a little trio
    [[12, 34, 34, -12], [16, 22, 34, -10.8], [14.5, 19, 34, -9.9], [30, 28, 46, 2], [8, 24, 52, 8],
     [38, 19, 41, -20], [22, 30, 58, 14], [25, 18, 58, 15.3], [46, 22, 49, 22], [5, 16, 64, -30]].forEach(([y, w, t, d], i) => {
      const b = document.createElement('div');
      b.className = 'bird' + (i % 2 ? ' bird--dip' : '');
      b.style.cssText = `--y:${y}vh;--w:${w}px;--t:${t}s;--delay:${d}s`;
      b.innerHTML = window.Art.bird();
      flock.appendChild(b);
    });
    document.body.appendChild(flock);
  }

  /* ---------- 2. Details from config.js ---------- */
  const isBlank = (v) => !v || /^\s*\[.*\]\s*$/.test(v);
  const read = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), cfg);
  $$('[data-field]').forEach((el) => {
    const key = el.dataset.field;
    if (key === 'card-date') {
      el.textContent = isBlank(cfg.date) ? 'Date to follow' : cfg.date;
      return;
    }
    const value = read(key);
    const span = document.createElement('span');
    span.textContent = value || '[INSERT]';
    if (isBlank(value)) span.className = 'is-placeholder';
    el.replaceChildren(span);
  });

  /* ---------- Splash: Chicken Nugget delivers the envelope ---------- */
  const splash = $('#splash');
  const endSplash = () => {
    if (!splash || splash.dataset.done) return;
    splash.dataset.done = '1';
    splash.classList.add('is-gone');
    setTimeout(() => splash.remove(), 1000);
  };
  if (reduceMotion) endSplash();
  else { setTimeout(endSplash, 5200); splash.addEventListener('click', endSplash); }

  /* the dinner menu link, if one is set in config.js */
  const dinnerMenu = cfg.evening && cfg.evening.dinnerMenu;
  if (dinnerMenu && dinnerMenu.url) {
    const box = $('#dinner-menu');
    const link = $('a', box);
    link.href = dinnerMenu.url;
    link.textContent = dinnerMenu.label || 'Peruse the menu';
    $('span', box).textContent = dinnerMenu.venue || '';
    box.hidden = false;
  }

  /* ---------- 3. The envelope ---------- */
  const gate = $('#envelope');
  const openBtn = $('#open');
  const sealed = [$('#main'), $('#masthead'), $('#chapters')];
  let opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;
    openBtn.disabled = true;
    gate.classList.add('is-opening');
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.classList.remove('is-sealed');
      document.body.classList.add('is-open');
      sealed.forEach((el) => { el.inert = false; });
      gate.classList.add('is-gone');
      startReveals();
      $('#invitation-title').focus({ preventScroll: true });
      setTimeout(() => gate.remove(), 1300);
    }, reduceMotion ? 0 : 2500);
  }
  openBtn.addEventListener('click', openInvitation);
  $('#env').addEventListener('click', openInvitation);

  /* ---------- 4. Scene reveals & chapter marks ---------- */
  function startReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach((el) => io.observe(el));
  }

  const links = $$('#chapters a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => {
        const on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('is-current', on);
        on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => spy.observe(s));

  /* ---------- 5. Subtle parallax on the botanicals ---------- */
  const drifters = $$('[data-parallax]');
  if (!reduceMotion && drifters.length) {
    let ticking = false;
    const drift = () => {
      const vh = window.innerHeight;
      drifters.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  /* ---------- 6. The Save-the-Date card: tilt and turn ---------- */
  const card = $('#card');
  const hint = $('#card-hint');
  function flip() {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', flipped
      ? 'Back of the card: The First Chapter. Painted by hand, in an edition of one. For Kat, to keep. Press to turn the card back.'
      : 'Save the Date card: Blake and Kat. A rather lovely first occasion. Press to turn the card over.');
    hint.textContent = flipped ? 'Turn it back' : 'Turn the card over';
  }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }

  /* portraits respond to a tap as well as a hover */
  $$('.portrait__frame').forEach((frame) => {
    const liven = () => {
      frame.classList.add('is-lively');
      clearTimeout(frame._t);
      frame._t = setTimeout(() => frame.classList.remove('is-lively'), 1800);
    };
    frame.addEventListener('click', liven);
    frame.addEventListener('focus', liven);
  });

  /* ---------- 7. Music (never autoplays) ---------- */
  const musicBtn = $('#music');
  if (!window.Music.supported) {
    musicBtn.hidden = true;
  } else {
    musicBtn.addEventListener('click', () => {
      const on = window.Music.toggle();
      musicBtn.setAttribute('aria-pressed', String(on));
      $('.music__label', musicBtn).textContent = on ? 'Music on' : 'Music';
    });
  }

  /* the film has its own soundtrack: quiet the page's music while it plays,
     and give phones held upright the vertical cut's poster */
  const filmVideo = $('#film-video');
  if (filmVideo) {
    if (window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches) filmVideo.poster = 'film/web/poster-9x16.jpg';
    filmVideo.addEventListener('play', () => {
      if (musicBtn.getAttribute('aria-pressed') === 'true') musicBtn.click();
    });
  }

  /* ---------- 8. The RSVP ---------- */
  const reply = $('#reply');
  const ask = $('.reply__ask', reply);
  const done = $('.reply__done', reply);
  const HEADLINES = { 'With Pleasure': 'With pleasure, then.', "I'd Love To": 'Then it’s settled.' };

  function petals() {
    if (reduceMotion) return;
    const box = $('.reply__petals', reply);
    const colours = ['#E6AEB0', '#F1CFCA', '#CF6F8E', '#E2C98C', '#F7E3DD'];
    const h = reply.offsetHeight;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.cssText =
        `--x:${(Math.random() * 100).toFixed(1)}%;--s:${(8 + Math.random() * 8).toFixed(1)}px;` +
        `--c:${colours[i % colours.length]};--t:${(3.2 + Math.random() * 2.6).toFixed(2)}s;` +
        `--w:${(Math.random() * 1.6).toFixed(2)}s;--dx:${(Math.random() * 90 - 45).toFixed(0)}px;` +
        `--fall:${h + 40}px;--r:${(Math.random() * 540 - 270).toFixed(0)}deg`;
      box.appendChild(p);
    }
    setTimeout(() => box.replaceChildren(), 7500);
  }

  function confirm(answer, fresh) {
    $('#reply-title').textContent = HEADLINES[answer] || 'With pleasure, then.';
    const link = $('#reply-link');
    const rsvp = cfg.rsvp || {};
    if (rsvp.replyLink) {
      link.href = rsvp.replyLink;
      link.textContent = rsvp.replyLinkLabel || 'Send word';
      link.hidden = false;
    }
    const show = () => {
      ask.hidden = true;
      done.hidden = false;
      if (fresh) { petals(); $('#reply-title').focus({ preventScroll: true }); }
    };
    if (fresh && !reduceMotion) { reply.classList.add('is-leaving'); setTimeout(show, 650); } else show();
  }

  $$('[data-reply]', reply).forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.dataset.reply;
      const record = { reply: answer, at: new Date().toISOString() };
      try { localStorage.setItem(STORE, JSON.stringify(record)); } catch (e) { /* private mode: fine */ }
      const endpoint = cfg.rsvp && cfg.rsvp.endpoint;
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(record),
        }).catch(() => { /* the on-page confirmation still stands */ });
      }
      confirm(answer, true);
    });
  });

  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved && saved.reply) confirm(saved.reply, false);
  } catch (e) { /* nothing saved */ }
})();
