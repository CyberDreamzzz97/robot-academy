// Procedural low-poly robots. No external assets — every robot is built from primitives
// so the whole cast lives in version control as code.
import * as THREE from 'three';
import { mat } from '../core/engine.js';

// Each build produces a visibly different silhouette you can identify from across the map.
const BUILDS = {
  boxy:   { height: 1.00, width: 1.15, headScale: 1.10, legLen: 0.34 },
  tall:   { height: 1.28, width: 0.72, headScale: 0.85, legLen: 0.56 },
  multi:  { height: 1.02, width: 1.05, headScale: 0.80, legLen: 0.38 },
  round:  { height: 0.92, width: 1.30, headScale: 1.00, legLen: 0.28 },
  large:  { height: 1.22, width: 1.45, headScale: 1.05, legLen: 0.42 },
  dented: { height: 0.98, width: 1.10, headScale: 0.95, legLen: 0.36 },
  player: { height: 1.00, width: 0.95, headScale: 1.00, legLen: 0.42 }
};

function addShadow(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }

export function buildRobot({ palette, build = 'boxy', scale = 1 }) {
  const B = BUILDS[build] || BUILDS.boxy;
  const g = new THREE.Group();
  const parts = {};

  const bodyMat = mat(palette.body);
  const trimMat = mat(palette.trim);
  const visorMat = new THREE.MeshLambertMaterial({ color: palette.visor, emissive: palette.visor, emissiveIntensity: 0.55, flatShading: true });
  const accentMat = mat(palette.accent);
  const darkMat = mat(0x2a2f36);

  const legLen = B.legLen;
  const hipY = legLen + 0.16;

  // ---- legs (pivot at hip so they can swing) ----
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.22 * B.width, hipY, 0);
    const leg = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.20, legLen, 0.22), darkMat));
    leg.position.y = -legLen / 2;
    hip.add(leg);
    const foot = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.34), trimMat));
    foot.position.set(0, -legLen - 0.04, 0.04);
    hip.add(foot);
    g.add(hip);
    parts[side < 0 ? 'legL' : 'legR'] = hip;
  }

  // ---- torso ----
  const torso = new THREE.Group();
  torso.position.y = hipY;
  g.add(torso);
  parts.torso = torso;

  let bodyMesh;
  if (build === 'round') {
    bodyMesh = addShadow(new THREE.Mesh(new THREE.SphereGeometry(0.52 * B.width, 10, 8), bodyMat));
    bodyMesh.position.y = 0.46;
    bodyMesh.scale.set(1, 0.92, 0.95);
  } else if (build === 'tall') {
    bodyMesh = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.26 * B.width, 0.32 * B.width, B.height, 7), bodyMat));
    bodyMesh.position.y = B.height / 2;
  } else {
    bodyMesh = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.66 * B.width, B.height, 0.46 * B.width), bodyMat));
    bodyMesh.position.y = B.height / 2;
  }
  torso.add(bodyMesh);

  // chest plate
  const plate = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.34 * B.width, 0.24, 0.08), accentMat));
  plate.position.set(0, B.height * 0.62, 0.26 * B.width);
  torso.add(plate);

  // ---- arms (pivot at shoulder) ----
  const shoulderY = B.height * 0.80;
  for (const side of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(side * 0.40 * B.width, shoulderY, 0);
    const upper = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.16), trimMat));
    upper.position.y = -0.23;
    sh.add(upper);
    const hand = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.20, 0.20), accentMat));
    hand.position.y = -0.54;
    sh.add(hand);
    torso.add(sh);
    parts[side < 0 ? 'armL' : 'armR'] = sh;
  }

  // ---- head(s) ----
  const neckY = B.height + 0.06;
  const headGroup = new THREE.Group();
  headGroup.position.y = neckY;
  torso.add(headGroup);
  parts.head = headGroup;

  const makeHead = (hs, offsetX = 0) => {
    const h = new THREE.Group();
    h.position.x = offsetX;
    const skull = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.46 * hs, 0.40 * hs, 0.42 * hs), bodyMat));
    skull.position.y = 0.20 * hs;
    h.add(skull);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34 * hs, 0.13 * hs, 0.04), visorMat);
    visor.position.set(0, 0.22 * hs, 0.215 * hs);
    h.add(visor);
    return h;
  };

  if (build === 'multi') {
    // three heads that argue with each other
    parts.heads = [];
    [-0.34, 0, 0.34].forEach((x, i) => {
      const h = makeHead(B.headScale * (i === 1 ? 1 : 0.88), x);
      h.position.y = i === 1 ? 0.06 : 0;
      headGroup.add(h);
      parts.heads.push(h);
    });
  } else {
    const h = makeHead(B.headScale);
    headGroup.add(h);
    parts.heads = [h];

    // antenna
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 5), darkMat);
    stalk.position.y = 0.42 * B.headScale + 0.14;
    h.add(stalk);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.062, 7, 5), visorMat);
    bulb.position.y = 0.42 * B.headScale + 0.32;
    h.add(bulb);
    parts.bulb = bulb;
  }

  // ---- per-build character props ----
  if (build === 'boxy') {
    // clipboard, held out in front
    const board = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.04), mat(0xf5efe0)));
    board.position.set(0, -0.50, 0.16);
    board.rotation.x = -0.5;
    parts.armL.add(board);
  }
  if (build === 'tall') {
    // magnifying lens for an eye
    const ring = addShadow(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 6, 12), accentMat));
    ring.position.set(0, 0.22 * B.headScale, 0.24);
    parts.heads[0].add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.17, 12), new THREE.MeshLambertMaterial({
      color: 0xd8f6fa, transparent: true, opacity: 0.55
    }));
    glass.position.set(0, 0.22 * B.headScale, 0.245);
    parts.heads[0].add(glass);
  }
  if (build === 'round') {
    // visibly overloaded: a teetering stack of crates
    const stack = new THREE.Group();
    stack.position.y = B.height + 0.30;
    [0.30, 0.25, 0.20].forEach((s, i) => {
      const box = addShadow(new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.8, s), mat(i % 2 ? 0xb98a4e : 0xd6a566)));
      box.position.set((i - 1) * 0.06, i * 0.26, (i % 2 ? 0.05 : -0.05));
      box.rotation.y = i * 0.4;
      box.rotation.z = (i - 1) * 0.09;
      stack.add(box);
    });
    torso.add(stack);
    parts.stack = stack;
  }
  if (build === 'large') {
    // shoulder pads, plus orbiting helper drones
    for (const side of [-1, 1]) {
      const pad = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.36), accentMat));
      pad.position.set(side * 0.44 * B.width, shoulderY + 0.12, 0);
      torso.add(pad);
    }
    parts.drones = [];
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Group();
      const shell = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), mat(palette.trim)));
      d.add(shell);
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.02), visorMat);
      eye.position.set(0, 0.01, 0.095);
      d.add(eye);
      d.userData.phase = (i / 3) * Math.PI * 2;
      g.add(d);
      parts.drones.push(d);
    }
  }
  if (build === 'dented') {
    // mismatched replacement arm and a scorch panel
    parts.armR.children.forEach(c => { c.material = mat(0x6d7580); });
    const patch = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.26, 0.05), mat(0x3a3a3a)));
    patch.position.set(0.18, B.height * 0.42, 0.24 * B.width);
    patch.rotation.z = 0.35;
    torso.add(patch);
    bodyMesh.rotation.z = 0.045;
    parts.heads[0].rotation.z = -0.10;
  }

  g.scale.setScalar(scale);
  g.userData.parts = parts;
  g.userData.build = build;
  g.userData.height = (hipY + B.height + 0.5) * scale;
  return g;
}

// Idle + walk animation driven by a single time value.
export function animateRobot(robot, t, speed = 0) {
  const p = robot.userData.parts;
  if (!p) return;
  const walking = speed > 0.05;
  const swing = walking ? Math.sin(t * 9) * 0.6 : Math.sin(t * 1.6) * 0.06;

  if (p.armL) p.armL.rotation.x = swing;
  if (p.armR) p.armR.rotation.x = -swing;
  if (p.legL) p.legL.rotation.x = -swing * (walking ? 1 : 0);
  if (p.legR) p.legR.rotation.x = swing * (walking ? 1 : 0);

  if (p.torso) {
    p.torso.rotation.z = walking ? Math.sin(t * 9) * 0.03 : 0;
  }
  if (p.head) {
    p.head.rotation.y = walking ? 0 : Math.sin(t * 0.7) * 0.22;
    p.head.position.y = (p.head.userData.baseY ??= p.head.position.y) + Math.sin(t * 2.1) * 0.012;
  }
  if (p.bulb) p.bulb.material.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.25;

  // the three heads bicker
  if (robot.userData.build === 'multi' && p.heads?.length === 3) {
    p.heads[0].rotation.y = Math.sin(t * 1.9) * 0.5 + 0.3;
    p.heads[1].rotation.y = Math.sin(t * 1.1 + 2) * 0.3;
    p.heads[2].rotation.y = Math.sin(t * 2.3 + 1) * 0.5 - 0.3;
  }
  // the stack teeters
  if (p.stack) {
    p.stack.rotation.z = Math.sin(t * 1.4) * 0.06;
    p.stack.rotation.x = Math.cos(t * 1.1) * 0.04;
  }
  // drones orbit
  if (p.drones) {
    p.drones.forEach((d) => {
      const a = t * 1.1 + d.userData.phase;
      d.position.set(Math.cos(a) * 1.5, 1.7 + Math.sin(a * 2) * 0.18, Math.sin(a) * 1.5);
      d.rotation.y = -a + Math.PI / 2;
    });
  }
}
