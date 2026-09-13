import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join, normalize } from 'path';

const ROOT = '/home/claude/robot-academy';
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };

const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = join(ROOT, normalize(p));
  if (!existsSync(file)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(8099, r));

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox','--ignore-gpu-blocklist']
});
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('requestfailed', r => errs.push('FAILED: ' + r.url() + ' :: ' + (r.failure()?.errorText||'')));
p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ': ' + r.url()); });
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

// CDN is blocked in this sandbox — serve the whole three package from node_modules.
await p.route('https://cdn.jsdelivr.net/npm/three@0.186.0/**', route => {
  const rel = route.request().url().split('three@0.186.0/')[1].split('?')[0];
  const f = '/home/claude/node_modules/three/' + rel;
  if (!existsSync(f)) { route.fulfill({ status: 404, body: 'nf' }); return; }
  route.fulfill({ status: 200, contentType: 'text/javascript', body: readFileSync(f, 'utf8') });
});
await p.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

await p.goto('http://localhost:8099/', { waitUntil: 'load' });
await p.waitForTimeout(6000);

console.log(errs.length ? 'EARLY ERRORS:\n' + errs.join('\n') : 'no early errors');
const state = await p.evaluate(() => {
  if (!window.RA) return { ok: false, reason: 'RA missing' };
  return {
    ok: true,
    loadingGone: !document.getElementById('loading'),
    sceneChildren: window.RA.village.scene.children.length,
    interactables: window.RA.village.interactables.length,
    robots: window.RA.ROBOTS.length,
    playerY: window.RA.player.position.y,
    drawCalls: window.RA.engine.renderer.info.render.calls,
    triangles: window.RA.engine.renderer.info.render.triangles
  };
});
console.log('STATE:', JSON.stringify(state, null, 2));
await p.screenshot({ path: '/home/claude/shot-village.png' });

// walk toward a robot and open dialogue
await p.evaluate(() => {
  const it = window.RA.village.interactables.find(i => i.id === 'brief' && i.type === 'robot');
  window.RA.player.teleport(it.position.x + 1.5, it.position.z + 3.0, 0);
});
await p.waitForTimeout(900);
await p.screenshot({ path: '/home/claude/shot-robot.png' });

// open a lesson inside a house
await p.evaluate(() => {
  const door = window.RA.village.interactables.find(i => i.type === 'door' && i.id === 'evidence');
  window.RA.player.teleport(door.position.x, door.position.z, 0);
});
await p.waitForTimeout(500);
// project the door pad to screen coords so the click actually lands on it
const pt = await p.evaluate(() => {
  const THREE_V = window.RA.village.interactables.find(i => i.type === 'door' && i.id === 'evidence');
  const v = THREE_V.object.position.clone();
  v.project(window.RA.engine.camera);
  return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
});
await p.mouse.click(pt.x, pt.y);
await p.waitForTimeout(1200);
const inside = await p.evaluate(() => window.RA.engine.active === window.RA.engine.scenes.get('interiorLive'));
console.log('ENTERED INTERIOR:', inside);
await p.screenshot({ path: '/home/claude/shot-interior.png' });

// trigger the lesson dialogue
await p.evaluate(() => {
  const bot = window.RA.engine.active.children.find(o => o.userData && o.userData.id === 'evidence');
  if (bot) window.RA.player.teleport(bot.position.x, bot.position.z + 2.4, Math.PI);
});
await p.waitForTimeout(400);
const bp = await p.evaluate(() => {
  const bot = window.RA.engine.active.children.find(o => o.userData && o.userData.id === 'evidence');
  const v = bot.position.clone(); v.y = 1.2;
  v.project(window.RA.engine.camera);
  return { x: (v.x*0.5+0.5)*window.innerWidth, y: (-v.y*0.5+0.5)*window.innerHeight };
});
await p.mouse.move(bp.x, bp.y);
await p.waitForTimeout(250);
console.log('HOVER SAYS:', await p.evaluate(() => document.querySelector('.hud-label').textContent || '(nothing)'));
await p.mouse.click(bp.x, bp.y);
await p.waitForTimeout(2500);
console.log('DIALOGUE OPEN:', await p.evaluate(() => !document.getElementById('dialogue').hidden));
console.log('SPEAKER:', await p.evaluate(() => document.querySelector('.dlg-name')?.textContent || '-'));
await p.screenshot({ path: '/home/claude/shot-dialogue.png' });

console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no js errors');
await b.close();
server.close();
