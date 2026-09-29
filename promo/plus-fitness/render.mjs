// Renders index.html frame-by-frame with headless Chromium and encodes an MP4.
//
//   node render.mjs                         -> plus-fitness-promo.mp4 (full 30s)
//   node render.mjs --stills 1,5.2,20       -> stills/frame-XX.png (quick look)
//
// Needs: playwright (npm i -D playwright) and ffmpeg (on PATH, or FFMPEG=/path/to/ffmpeg).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  const globalRoot = process.env.NODE_GLOBAL_ROOT || path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules');
  return require(path.join(globalRoot, 'playwright'));
}

const MIME = { '.html': 'text/html', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html?render`;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(url);
await page.evaluate(() => window.ready);

const grab = t => page.evaluate(t => {
  window.render(t);
  return document.getElementById('c').toDataURL('image/png').split(',')[1];
}, t);

const stillsArg = process.argv.indexOf('--stills');
if (stillsArg > -1) {
  const times = process.argv[stillsArg + 1].split(',').map(Number);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) {
    const out = path.join(dir, 'stills', `frame-${t.toFixed(2)}.png`);
    fs.writeFileSync(out, Buffer.from(await grab(t), 'base64'));
    console.log('wrote', out);
  }
} else {
  const { DURATION, FPS } = await page.evaluate(() => ({ DURATION: window.DURATION, FPS: window.FPS }));
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const audio = path.join(dir, 'soundtrack.wav');
  const out = path.join(dir, 'plus-fitness-promo.mp4');
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
  if (fs.existsSync(audio)) args.push('-i', audio);
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(FPS), '-movflags', '+faststart');
  if (fs.existsSync(audio)) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push(out);
  const ff = spawn(ffmpeg, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(DURATION * FPS);
  for (let f = 0; f < total; f++) {
    const png = Buffer.from(await grab(f / FPS), 'base64');
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) process.stdout.write(`\rframe ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))));
  console.log('\nwrote', out);
}
await browser.close();
server.close();
