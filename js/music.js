/* ------------------------------------------------------------------
   Optional ambient music — a slow, music-box waltz synthesised in the
   browser (no audio files). It never starts on its own: only the
   visible Music button calls Music.toggle().
------------------------------------------------------------------- */
window.Music = (function () {
  'use strict';

  const EIGHTH = 0.46; // seconds
  // [bass, chord tones] as MIDI notes: Dmaj7 · Bm7 · Gmaj7 · A6
  const BARS = [
    [50, [62, 66, 69, 73]],
    [47, [62, 66, 69, 74]],
    [43, [59, 62, 66, 71]],
    [45, [61, 64, 66, 69]],
  ];
  const SHAPE = [0, 1, 2, 3, 2, 1];

  let ctx = null, master = null, timer = null, step = 0, nextTime = 0, playing = false;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2400;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = EIGHTH * 1.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    master.connect(tone);
    tone.connect(ctx.destination);
    tone.connect(delay);
    delay.connect(feedback); feedback.connect(delay);
    delay.connect(wet); wet.connect(ctx.destination);
  }

  function pluck(midi, t, vel, len) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(master);
    [['sine', 1, 1], ['triangle', 2, 0.18]].forEach(([type, mult, amt]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = type; o.frequency.value = hz(midi) * mult; og.gain.value = amt;
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + len + 0.05);
    });
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.4) {
      const barIndex = Math.floor(step / 6) % BARS.length;
      const [bass, tones] = BARS[barIndex];
      const i = step % 6;
      if (i === 0) pluck(bass, nextTime, 0.5, 3.4);
      pluck(tones[SHAPE[i]], nextTime, i === 0 ? 0.34 : 0.24, 2.4);
      if (i === 3 && Math.floor(step / 6) % 2 === 1) {
        pluck(tones[(step / 3) % 4 | 0] + 12, nextTime + EIGHTH / 2, 0.12, 3);
      }
      nextTime += EIGHTH;
      step++;
    }
  }

  function start() {
    if (!ctx) build();
    ctx.resume();
    nextTime = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
    timer = setInterval(schedule, 100);
    schedule();
    playing = true;
  }

  function stop() {
    clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    playing = false;
  }

  return {
    supported: !!(window.AudioContext || window.webkitAudioContext),
    toggle() { playing ? stop() : start(); return playing; },
  };
})();
