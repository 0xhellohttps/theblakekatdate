/* ------------------------------------------------------------------
   Renders the film frame by frame.

   Opens film.html in headless Chrome, scrubs it to each frame's time
   (frame / 24 s) and saves a JPEG. Several Chrome workers share the
   frames between them. No dependencies: it speaks the DevTools
   protocol over Node's built-in WebSocket.

     node render.js <outDir> [--page episode.html --dur 300] [--vertical] [--scale 2] [--frames 0,24,48 | --from A --to B] [--workers N]
------------------------------------------------------------------- */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf('--' + name); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const outDir = path.resolve(args[0]);
const vertical = !!flag('vertical');
const FPS = 24, DUR = +(flag('dur') || 85);      // seconds
const PAGE = flag('page') || 'film.html';
const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
const SCALE = +(flag('scale') || 1);          // --scale 2 renders the same layout at twice the pixels (4K)
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL_ = `${process.env.FILM_URL || 'http://127.0.0.1:4173/film/'}${PAGE}?render${vertical ? '&v' : ''}`;
fs.mkdirSync(outDir, { recursive: true });

let frames;
if (flag('frames')) frames = String(flag('frames')).split(',').map(Number);
else { const a = +(flag('from') || 0), b = +(flag('to') || FPS * DUR); frames = Array.from({ length: b - a }, (_, i) => a + i); }
const workers = Math.min(+(flag('workers') || 4), frames.length);

const BASE_PORT = 9400 + Math.floor(Math.random() * 400) * 10;   // a fresh range each run, so a stale Chrome can't block it
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function worker(id, list) {
  const port = BASE_PORT + id;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'film-chrome-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`, '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' });
  try {
    let target;
    for (let i = 0; i < 80 && !target; i++) {
      await sleep(250);
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch (e) { /* not up yet */ }
    }
    if (!target) throw new Error('Chrome did not start');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0; const pending = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); } };
    const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
    await send('Page.enable');
    await send('Page.navigate', { url: URL_ });
    for (let i = 0; i < 120; i++) { await sleep(250); if (await evaluate('typeof window.ready').catch(() => '') === 'object') break; }
    await evaluate('window.ready');
    for (const fr of list) {
      await evaluate(`window.seek(${(fr / FPS).toFixed(6)})`);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 93 });
      fs.writeFileSync(path.join(outDir, `f${String(fr).padStart(5, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
      done++;
    }
    ws.close();
  } finally {
    const gone = new Promise((r) => chrome.once('exit', r));
    chrome.kill();
    await Promise.race([gone, sleep(3000)]);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch (e) { /* temp folder; the OS clears it */ }
  }
}

let done = 0;
(async () => {
  const t0 = Date.now();
  const tick = setInterval(() => process.stdout.write(`\r${done}/${frames.length} frames`), 2000);
  // interleave so every worker gets the same mix of heavy and light scenes
  const lists = Array.from({ length: workers }, (_, w) => frames.filter((_, i) => i % workers === w));
  await Promise.all(lists.map((l, w) => worker(w, l)));
  clearInterval(tick);
  console.log(`\r${done}/${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${outDir}`);
})().catch((e) => { console.error('\n' + e.stack); process.exit(1); });
