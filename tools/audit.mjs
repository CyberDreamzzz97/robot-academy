/**
 * Full functional audit. Boots the game headlessly and exercises every
 * interaction path, not just the happy one. Reports PASS/FAIL per check.
 *
 *   node tools/audit.mjs
 *
 * Requires: playwright, and (in a sandbox with no CDN access) a local copy of
 * three in node_modules, which it will route the CDN URL to automatically.
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join, normalize, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PORT = 8137;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf' };

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = join(ROOT, normalize(p));
  if (!existsSync(f) || !f.startsWith(ROOT)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: [
    '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
    // headless Chromium otherwise spends the whole run retrying Google endpoints
    '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--no-first-run', '--no-default-browser-check',
    '--disable-features=Translate,OptimizationHints,MediaRouter'
  ]
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon/i.test(m.text())) errors.push('CONSOLE: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

// The sandbox blocks the CDN; serve three from node_modules when present.
const localThree = join(ROOT, '..', 'node_modules', 'three');
if (existsSync(localThree)) {
  await page.route('https://cdn.jsdelivr.net/npm/three@0.186.0/**', route => {
    const rel = route.request().url().split('three@0.186.0/')[1].split('?')[0];
    const f = join(localThree, rel);
    if (!existsSync(f)) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, contentType: 'text/javascript', body: readFileSync(f, 'utf8') });
  });
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
}

// ---------------------------------------------------------------- helpers

const screenOf = (sel) => page.evaluate((s) => {
  const RA = window.RA;
  const v = s.kind === 'pos'
    ? new RA.THREE.Vector3(s.x, s.y ?? 0, s.z)
    : null;
  return null;
}, sel);

/** Project a world point to viewport pixels. */
async function project(x, y, z) {
  return page.evaluate(([x, y, z]) => {
    const cam = window.RA.engine.camera;
    const v = new window.RA.THREE.Vector3(x, y, z).project(cam);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight, z: v.z };
  }, [x, y, z]);
}

async function clickWorld(x, y, z) {
  const p = await project(x, y, z);
  if (p.z > 1 || p.x < 0 || p.y < 0 || p.x > 1280 || p.y > 800) return false;
  await page.mouse.move(p.x, p.y);
  await page.waitForTimeout(120);
  await page.mouse.click(p.x, p.y);
  return true;
}

const state = () => page.evaluate(() => ({
  location: window.RA.debug.location(),
  dialogueOpen: !document.getElementById('dialogue').hidden,
  forgeOpen: !document.getElementById('forge').hidden,
  speaker: document.querySelector('.dlg-name')?.textContent || null,
  page: document.querySelector('.dlg-page')?.textContent || null,
  taught: window.RA.hud.taught.size,
  playerPos: [+window.RA.player.position.x.toFixed(2), +window.RA.player.position.z.toFixed(2)]
}));

// ---------------------------------------------------------------- boot

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
await page.waitForTimeout(4500);

check('Game boots with no runtime errors', errors.length === 0, errors.join(' ~ ').slice(0, 400));
check('Loading screen removed', await page.evaluate(() => !document.getElementById('loading')));
check('Debug API exposed', await page.evaluate(() => !!(window.RA && window.RA.debug)));

const boot = await page.evaluate(() => ({
  robots: window.RA.ROBOTS.length,
  interactables: window.RA.village.interactables.length,
  doors: window.RA.village.interactables.filter(i => i.type === 'door').length,
  robotSpots: window.RA.village.interactables.filter(i => i.type === 'robot').length,
  tris: window.RA.engine.renderer.info.render.triangles,
  calls: window.RA.engine.renderer.info.render.calls
}));
check('Six teacher robots defined', boot.robots === 6, `got ${boot.robots}`);
check('Seven enterable doors (6 houses + Forge)', boot.doors === 7, `got ${boot.doors}`);
check('Six robots placed in the world', boot.robotSpots === 6, `got ${boot.robotSpots}`);
check('Scene renders geometry', boot.tris > 5000, `${boot.tris} triangles, ${boot.calls} draw calls`);

// ---------------------------------------------------------------- content integrity

const content = await page.evaluate(() => window.RA.ROBOTS.map(r => ({
  id: r.id, name: r.name,
  greet: r.greet.length, lesson: r.lesson.length,
  hasOutro: !!r.outro, hasReward: !!r.reward,
  emptyBodies: r.lesson.filter(l => !l.body || !l.heading).length,
  palette: Object.keys(r.palette).length,
  sign: r.house?.sign
})));
check('Every robot has a full lesson (6 pages)', content.every(c => c.lesson === 6),
  content.map(c => `${c.id}:${c.lesson}`).join(' '));
check('Every lesson page has a heading and body', content.every(c => c.emptyBodies === 0));
check('Every robot has greeting, outro and reward', content.every(c => c.greet >= 2 && c.hasOutro && c.hasReward));
check('Every robot has a full palette', content.every(c => c.palette === 4));
check('Every house has a unique sign', new Set(content.map(c => c.sign)).size === 6);

// ---------------------------------------------------------------- movement

await page.evaluate(() => window.RA.debug.teleport(0, 4));
const before = (await state()).playerPos;
await clickWorld(6, 0.05, 6);
await page.waitForTimeout(1400);
const after = (await state()).playerPos;
check('Click-to-move walks the player', Math.hypot(after[0] - before[0], after[1] - before[1]) > 2,
  `${before} -> ${after}`);

// boundary clamp
await page.evaluate(() => { window.RA.player.teleport(0, 0); window.RA.player.moveTo({ x: 500, z: 500 }); });
await page.waitForTimeout(3000);
const far = await page.evaluate(() => Math.hypot(window.RA.player.position.x, window.RA.player.position.z));
check('World boundary clamps the player', far <= 45, `radius ${far.toFixed(1)}`);

// unreachable destination: the middle of a building
const stuck = await page.evaluate(async () => {
  const b = window.RA.village.blockers.find(b => b.r >= 5);   // a house footprint
  window.RA.player.teleport(b.x * 0.6, b.z * 0.6);
  window.RA.player.moveTo({ x: b.x, z: b.z });                // dead centre of the house
  const clamped = Math.hypot(window.RA.player.target.x - b.x, window.RA.player.target.z - b.z);
  await new Promise(r => setTimeout(r, 5000));
  return {
    moving: !!window.RA.player.target,
    clamped: +clamped.toFixed(2),
    insideHouse: Math.hypot(window.RA.player.position.x - b.x, window.RA.player.position.z - b.z) < b.r - 1
  };
});
check('Unreachable destination is clamped outside the building', stuck.clamped > 4,
  `target pulled ${stuck.clamped} from centre`);
check('Player does not get permanently stuck on a blocker', stuck.moving === false,
  stuck.moving ? 'still walking after 5s' : 'arrived and stopped');
check('Player never ends up inside a building', !stuck.insideHouse);

// ---------------------------------------------------------------- every robot, every interior

let allRobotsOk = true, allInteriorsOk = true, allLessonsOk = true;
const robotDetail = [];
const robotIds = await page.evaluate(() => window.RA.ROBOTS.map(r => r.id));

for (const id of robotIds) {
  // talk outdoors
  await page.evaluate((id) => window.RA.debug.standBy('robot', id), id);
  await page.waitForTimeout(700);
  const pos = await page.evaluate((id) => {
    const it = window.RA.village.interactables.find(i => i.type === 'robot' && i.id === id);
    return [it.position.x, 1.0, it.position.z];
  }, id);
  const pr = await project(...pos);
  await page.mouse.move(pr.x, pr.y);
  await page.waitForTimeout(200);
  const hoverLabel = await page.evaluate(() => document.querySelector('.hud-prompt').hidden
    ? '(no prompt)' : document.querySelector('.hud-label').textContent);
  const clicked = await clickWorld(...pos);
  await page.waitForTimeout(900);
  let s = await state();
  const outdoorOk = clicked && s.dialogueOpen && s.speaker === content.find(c => c.id === id).name;
  if (!outdoorOk) { allRobotsOk = false; robotDetail.push(`${id}[hover:${hoverLabel}|open:${s.dialogueOpen}|loc:${s.location.kind}]`); }
  await page.evaluate(() => window.RA.debug.closeDialogue());
  await page.waitForTimeout(300);

  // enter the house
  await page.evaluate((id) => window.RA.debug.enter(id), id);
  await page.waitForTimeout(700);
  s = await state();
  const insideOk = s.location.kind === 'interior' && s.location.id === id;
  if (!insideOk) allInteriorsOk = false;

  // run the whole lesson through to the end
  const lessonOk = await page.evaluate(async (id) => {
    window.RA.debug.talk(id);
    await new Promise(r => setTimeout(r, 200));
    let guard = 0;
    while (!document.getElementById('dialogue').hidden && guard++ < 60) {
      window.RA.debug.advance();
      await new Promise(r => setTimeout(r, 30));
    }
    return guard < 60;
  }, id);
  await page.waitForTimeout(300);
  s = await state();
  if (!lessonOk || !s.taught) allLessonsOk = false;

  await page.evaluate(() => window.RA.debug.leave());
  await page.waitForTimeout(500);
}

check('All six robots greet you outdoors', allRobotsOk, robotDetail.join(' '));
check('All six interiors load and are enterable', allInteriorsOk);
check('All six lessons page through to completion', allLessonsOk);

const finalTaught = (await state()).taught;
check('Progress records all six lessons', finalTaught === 6, `taught ${finalTaught}/6`);

// ---------------------------------------------------------------- persistence

const persisted = await page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('robot-academy-progress-v1') || '[]').length; }
  catch (e) { return -1; }
});
check('Progress persists to localStorage', persisted === 6, `stored ${persisted}`);

await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(3500);
const afterReload = await page.evaluate(() => window.RA.hud.taught.size);
check('Progress survives a reload', afterReload === 6, `restored ${afterReload}`);

// ---------------------------------------------------------------- HUD

const hudState = await page.evaluate(() => {
  const btn = document.querySelector('.hud-journal-btn');
  const before = document.querySelector('.hud-journal').hidden;
  btn.click();
  const after = document.querySelector('.hud-journal').hidden;
  btn.click();
  return {
    toggles: before !== after,
    items: document.querySelectorAll('.hud-list li').length,
    done: document.querySelectorAll('.hud-list li.is-done').length,
    bar: document.querySelector('.hud-track i').style.width
  };
});
check('Journal panel toggles', hudState.toggles);
check('Journal lists all six robots', hudState.items === 6, `${hudState.items} rows`);
check('Journal marks completed lessons', hudState.done === 6, `${hudState.done} done`);
check('Progress bar reaches 100%', hudState.bar === '100%', hudState.bar);

// ---------------------------------------------------------------- The Forge

await page.evaluate(() => window.RA.debug.enter('forge'));
await page.waitForTimeout(800);
let s = await state();
check('The Forge is enterable', s.location.kind === 'interior' && s.location.id === 'forge',
  JSON.stringify(s.location));

await page.evaluate(() => window.RA.debug.openForge());
await page.waitForTimeout(500);
check('Forge builder opens', (await state()).forgeOpen);

const forgeSlots = await page.evaluate(() => document.querySelectorAll('.forge-slot textarea').length);
check('Forge exposes six slots', forgeSlots === 6, `${forgeSlots} slots`);

await page.evaluate(() => {
  const set = (id, v) => {
    const el = document.getElementById(id);
    el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  set('forge-role', 'a brand strategist');
  set('forge-task', 'write five positioning statements');
  set('forge-context', 'luxury client, rejected two decks');
  set('forge-constraints', 'under 25 words, because it sits under the logo');
  set('forge-format', 'a markdown table');
  set('forge-done', 'each fails the swap test');
  const sel = document.getElementById('forge-posture');
  sel.value = 'options'; sel.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(300);
const assembled = await page.evaluate(() => document.querySelector('.forge-output').textContent);
check('Forge assembles the brief live',
  /You're a brand strategist\. Write five positioning statements\./.test(assembled)
  && assembled.includes('CONTEXT') && assembled.includes('CONSTRAINTS')
  && assembled.includes('FORMAT') && assembled.includes('DONE WHEN')
  && assembled.includes('three genuinely divergent options'),
  assembled.slice(0, 60).replace(/\n/g, ' '));

const meter = await page.evaluate(() => ({
  width: document.querySelector('.forge-meter i').style.width,
  note: document.querySelector('.forge-score').textContent
}));
check('Completeness meter reaches full', meter.width === '100%', meter.width);
check('Meter reports a complete brief', /All six slots filled/.test(meter.note), meter.note.slice(0, 70));

// diagnostic when context is missing
await page.evaluate(() => {
  const el = document.getElementById('forge-context');
  el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(200);
const diag = await page.evaluate(() => document.querySelector('.forge-score').textContent);
check('Meter names the missing slot', /Context is empty/.test(diag), diag.slice(0, 80));

await page.evaluate(() => document.querySelector('.forge-close').click());
await page.waitForTimeout(400);
check('Forge closes and returns control', !(await state()).forgeOpen);

await page.evaluate(() => window.RA.debug.leave());
await page.waitForTimeout(500);
check('Leaving The Forge returns to the village', (await state()).location.kind === 'village');

// ---------------------------------------------------------------- camera + input

const cam = await page.evaluate(async () => {
  const e = window.RA.engine;
  const d0 = e.camDist, y0 = e.camYaw;
  window.dispatchEvent(new Event('resize'));
  const canvas = document.getElementById('game');
  canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 240, bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 60));
  return { zoomed: e.camDist !== d0, dist: e.camDist, yaw: y0 };
});
check('Scroll wheel zooms the camera', cam.zoomed, `dist ${cam.dist}`);

await page.mouse.move(640, 400);
await page.mouse.down({ button: 'right' });
await page.mouse.move(820, 400, { steps: 6 });
await page.mouse.up({ button: 'right' });
await page.waitForTimeout(200);
const yawChanged = await page.evaluate(() => window.RA.engine.camYaw);
check('Right-drag orbits the camera', Math.abs(yawChanged - cam.yaw) > 0.05,
  `yaw ${cam.yaw.toFixed(2)} -> ${yawChanged.toFixed(2)}`);

const posBefore = (await state()).playerPos;
await page.waitForTimeout(400);
const posAfter = (await state()).playerPos;
check('Camera drag does not trigger a move',
  Math.hypot(posAfter[0] - posBefore[0], posAfter[1] - posBefore[1]) < 0.5,
  `${posBefore} -> ${posAfter}`);

// ---------------------------------------------------------------- responsive

for (const vp of [{ width: 390, height: 780, label: 'phone' }, { width: 820, height: 1100, label: 'tablet' }]) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => ({
    hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
    canvasW: document.getElementById('game').width
  }));
  check(`No horizontal overflow at ${vp.label} width`, !r.hScroll, `canvas ${r.canvasW}px`);
}
await page.setViewportSize({ width: 1280, height: 800 });

// ---------------------------------------------------------------- final error sweep

await page.waitForTimeout(600);
check('No runtime errors across the whole audit', errors.length === 0,
  errors.slice(0, 4).join(' | ').slice(0, 400));

// ---------------------------------------------------------------- report

const failed = results.filter(r => !r.ok);
console.log('\n' + '='.repeat(64));
console.log(`AUDIT: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('\nFAILURES:');
  failed.forEach(f => console.log(`  · ${f.name}${f.detail ? ' — ' + f.detail : ''}`));
}
console.log('='.repeat(64));

await page.screenshot({ path: join(ROOT, '..', 'audit-final.png') });
await browser.close();
server.close();
process.exit(failed.length ? 1 : 0);
