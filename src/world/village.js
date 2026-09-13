// The overworld: terrain, the plaza, seven buildings in a ring, and scatter props.
import * as THREE from 'three';
import { mat, addLighting, SKY } from '../core/engine.js';
import { ROBOTS, FORGE } from '../data/robots.js';
import { buildRobot } from '../entities/robot.js';

export const WORLD_RADIUS = 46;
export const HOUSE_RING = 27;

const GRASS = 0x6aa84f;
const GRASS_DARK = 0x5b9142;
const PATH = 0xcbb994;

function rand(seed) {
  // deterministic pseudo-random so the village is identical every load
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeGround() {
  const g = new THREE.Group();

  const geo = new THREE.CircleGeometry(WORLD_RADIUS, 64);
  geo.rotateX(-Math.PI / 2);
  // gentle vertex colour variation so the ground isn't a flat slab
  const colors = [];
  const pos = geo.attributes.position;
  const c1 = new THREE.Color(GRASS), c2 = new THREE.Color(GRASS_DARK), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = (Math.sin(x * 0.21) + Math.cos(z * 0.17)) * 0.5 + 0.5;
    tmp.copy(c1).lerp(c2, n * 0.8);
    colors.push(tmp.r, tmp.g, tmp.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  ground.receiveShadow = true;
  ground.name = 'ground';
  g.add(ground);

  // plaza disc
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(7.5, 32), mat(PATH));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  plaza.name = 'ground';
  g.add(plaza);

  // radial paths to each building.
  // The geometry is pre-rotated flat so direction is a single unambiguous Y rotation —
  // combining rotation.x and rotation.z on a plane gives the wrong axis.
  const all = [...ROBOTS, FORGE];
  all.forEach((r) => {
    const a = THREE.MathUtils.degToRad(r.angle);
    const len = HOUSE_RING - 3;
    const pg = new THREE.PlaneGeometry(3.0, len);
    pg.rotateX(-Math.PI / 2);
    const path = new THREE.Mesh(pg, mat(PATH));
    path.rotation.y = a;
    const mid = len / 2 + 1.5;
    path.position.set(Math.sin(a) * mid, 0.015, Math.cos(a) * mid);
    path.receiveShadow = true;
    path.name = 'ground';
    g.add(path);
  });

  return g;
}

function makeHouse({ colour, roof, sign }, label) {
  const h = new THREE.Group();
  const W = 7, D = 6.4, H = 3.6;

  const walls = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mat(colour));
  walls.position.y = H / 2;
  walls.castShadow = true; walls.receiveShadow = true;
  h.add(walls);

  // pitched roof
  const roofGeo = new THREE.ConeGeometry(W * 0.82, 2.6, 4);
  const roofMesh = new THREE.Mesh(roofGeo, mat(roof));
  roofMesh.position.y = H + 1.3;
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  h.add(roofMesh);

  // door (front face, +Z)
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.5, 0.2), mat(0x4a3220));
  door.position.set(0, 1.25, D / 2 + 0.02);
  h.add(door);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.9, 0.12), mat(roof));
  frame.position.set(0, 1.45, D / 2 - 0.01);
  h.add(frame);
  h.userData.door = door;

  // glowing doorway hint
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2),
    new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.22 }));
  glow.position.set(0, 1.2, D / 2 + 0.14);
  h.add(glow);
  h.userData.glow = glow;

  // windows
  for (const x of [-2.2, 2.2]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 0.14), mat(0xbfe8f2, { emissive: 0x2a3a44 }));
    w.position.set(x, 2.2, D / 2 + 0.02);
    h.add(w);
  }

  // chimney
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), mat(roof));
  ch.position.set(W * 0.28, H + 1.4, -D * 0.22);
  ch.castShadow = true;
  h.add(ch);

  // hanging sign
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.2, 0.16), mat(0x5a4630));
  post.position.set(-W / 2 - 0.9, 1.6, D / 2 + 0.6);
  post.castShadow = true;
  h.add(post);
  const board = makeSign(sign);
  board.position.set(-W / 2 - 0.9, 2.7, D / 2 + 0.62);
  h.add(board);

  h.userData.signText = sign;
  h.userData.label = label;
  return h;
}

// Canvas-texture signboard — keeps text in the 3D world without a font loader.
function makeSign(text) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#f3e6c8';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#5a4630'; ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 118);
  ctx.fillStyle = '#3a2a18';
  ctx.font = 'bold 44px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.85, 0.1),
    new THREE.MeshLambertMaterial({ map: tex }));
  board.castShadow = true;
  g.add(board);
  return g;
}

function makeTree(rng) {
  const t = new THREE.Group();
  const h = 1.8 + rng() * 1.4;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 6), mat(0x6b4a2a));
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  t.add(trunk);
  const tone = [0x3f7d36, 0x4c8f3e, 0x357030][Math.floor(rng() * 3)];
  for (let i = 0; i < 3; i++) {
    const r = 1.5 - i * 0.35;
    const blob = new THREE.Mesh(new THREE.ConeGeometry(r, 1.5, 6), mat(tone));
    blob.position.y = h + i * 0.7;
    blob.rotation.y = rng() * Math.PI;
    blob.castShadow = true;
    t.add(blob);
  }
  return t;
}

function makeRock(rng) {
  const r = 0.4 + rng() * 0.5;
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat(0x8a8f96));
  m.position.y = r * 0.6;
  m.rotation.set(rng() * 3, rng() * 3, rng() * 3);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function makePlazaMonument() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.5, 8), mat(0xb9a98a));
  base.position.y = 0.25; base.receiveShadow = true; base.castShadow = true;
  g.add(base);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 1.5), mat(0xa89878));
  plinth.position.y = 1.4; plinth.castShadow = true;
  g.add(plinth);
  // a stylised "prompt" obelisk: six stacked slabs, one per slot
  const cols = [0xf0b429, 0x2cb1bc, 0xda4a91, 0xf3752b, 0x2f6fd0, 0xb4553a];
  cols.forEach((c, i) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.1 - i * 0.08, 0.34, 1.1 - i * 0.08), mat(c));
    slab.position.y = 2.5 + i * 0.36;
    slab.rotation.y = i * 0.16;
    slab.castShadow = true;
    g.add(slab);
  });
  return g;
}

export function buildVillage() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 38, 88);
  addLighting(scene);

  scene.add(makeGround());
  scene.add(makePlazaMonument());

  const interactables = [];  // { type, id, position, radius, object }
  const blockers = [];       // { x, z, r } for collision

  // --- buildings ---
  const all = [...ROBOTS.map(r => ({ ...r, kind: 'robot' })), { ...FORGE, kind: 'forge' }];
  const houses = new Map();

  all.forEach((entry) => {
    const a = THREE.MathUtils.degToRad(entry.angle);
    const hx = Math.sin(a) * HOUSE_RING;
    const hz = Math.cos(a) * HOUSE_RING;

    const house = makeHouse(entry.house, entry.name);
    house.position.set(hx, 0, hz);
    house.rotation.y = a + Math.PI; // front door faces the plaza
    scene.add(house);
    houses.set(entry.id, house);

    // the door pad you walk onto to enter
    const doorLocal = new THREE.Vector3(0, 0, 6.4 / 2 + 1.2);
    const doorWorld = doorLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), house.rotation.y).add(house.position);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.5 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.copy(doorWorld).setY(0.04);
    scene.add(pad);

    interactables.push({
      type: 'door', id: entry.id, kind: entry.kind,
      position: doorWorld.clone(), radius: 2.2, object: pad,
      label: entry.kind === 'forge' ? 'Enter The Forge' : `Enter ${entry.house.sign}`
    });

    blockers.push({ x: hx, z: hz, r: 5.0 });

    // --- the robot, standing outside its own house ---
    if (entry.kind === 'robot') {
      const bot = buildRobot({ palette: entry.palette, build: entry.build, scale: 1.15 });
      const outward = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      // stand beside the path, not in the doorway
      const spot = new THREE.Vector3(hx, 0, hz)
        .sub(outward.clone().multiplyScalar(5.6))
        .add(tangent.clone().multiplyScalar(3.4));
      bot.position.copy(spot);
      bot.lookAt(0, bot.position.y, 0);
      bot.userData.id = entry.id;
      bot.userData.animate = true;
      scene.add(bot);

      const tag = makeNameTag(entry.name, entry.palette.body);
      tag.position.set(spot.x, bot.userData.height + 0.55, spot.z);
      scene.add(tag);
      bot.userData.tag = tag;

      interactables.push({
        type: 'robot', id: entry.id, position: spot.clone(),
        radius: 2.6, object: bot, label: `Talk to ${entry.name}`
      });
      blockers.push({ x: spot.x, z: spot.z, r: 0.9 });
    }
  });

  // --- scatter props ---
  const rng = rand(20260912);
  const props = new THREE.Group();
  for (let i = 0; i < 90; i++) {
    const a = rng() * Math.PI * 2;
    const d = 9 + rng() * (WORLD_RADIUS - 11);
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    // keep props off the paths and away from buildings
    let tooClose = blockers.some(b => Math.hypot(b.x - x, b.z - z) < b.r + 2.5);
    if (!tooClose) {
      const onPath = all.some(e => {
        const ea = THREE.MathUtils.degToRad(e.angle);
        return Math.abs(((a - ea + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.12;
      });
      tooClose = onPath;
    }
    if (tooClose) continue;
    const p = rng() > 0.28 ? makeTree(rng) : makeRock(rng);
    p.position.set(x, 0, z);
    props.add(p);
    blockers.push({ x, z, r: 1.0 });
  }
  scene.add(props);

  // boundary ring of trees so the world reads as enclosed
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const t = makeTree(rng);
    t.position.set(Math.sin(a) * (WORLD_RADIUS - 1.5), 0, Math.cos(a) * (WORLD_RADIUS - 1.5));
    t.scale.setScalar(1.1 + rng() * 0.4);
    scene.add(t);
  }

  return { scene, interactables, blockers, houses };
}

// Floating name label above each robot.
export function makeNameTag(text, colour) {
  const cv = document.createElement('canvas');
  cv.width = 384; cv.height = 96;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 384, 96);
  ctx.fillStyle = 'rgba(16,22,30,0.82)';
  roundRect(ctx, 8, 18, 368, 60, 14);
  ctx.fill();
  ctx.strokeStyle = '#' + new THREE.Color(colour).getHexString();
  ctx.lineWidth = 4;
  roundRect(ctx, 8, 18, 368, 60, 14);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 192, 49);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(3.0, 0.75, 1);
  spr.renderOrder = 999;
  return spr;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
