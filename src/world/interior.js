// House interiors. Each is a small room generated from the robot's own palette,
// with themed furniture so the rooms don't feel copy-pasted.
import * as THREE from 'three';
import { mat, addLighting } from '../core/engine.js';
import { buildRobot } from '../entities/robot.js';
import { makeNameTag } from './village.js';

// Walls are deliberately low: the interior camera looks down into the room,
// so tall walls would just wall off the view.
const ROOM_W = 16, ROOM_D = 14, ROOM_H = 3.4;

function shell(palette) {
  const g = new THREE.Group();

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), mat(0x8a6a47));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'ground';
  g.add(floor);

  // rug in the robot's colour
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 24), mat(palette.accent));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, -1.5);
  rug.receiveShadow = true;
  rug.name = 'ground';
  g.add(rug);

  const wallMat = mat(0xe8dcc6);
  const mk = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  mk(ROOM_W, ROOM_H, 0.4, 0, ROOM_H / 2, -ROOM_D / 2);       // back
  mk(0.4, ROOM_H, ROOM_D, -ROOM_W / 2, ROOM_H / 2, 0);       // left
  mk(0.4, ROOM_H, ROOM_D, ROOM_W / 2, ROOM_H / 2, 0);        // right
  // front wall, split around the doorway
  mk(6.0, ROOM_H, 0.4, -5.0, ROOM_H / 2, ROOM_D / 2);
  mk(6.0, ROOM_H, 0.4, 5.0, ROOM_H / 2, ROOM_D / 2);
  mk(4.0, 0.9, 0.4, 0, ROOM_H - 0.45, ROOM_D / 2);

  // wall cap rail — gives the walls a finished top edge from the overhead view
  // (no ceiling beams: from this camera they would slice bars across the screen)
  const capMat = mat(0x6b4f33);
  const cap = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), capMat);
    m.position.set(x, ROOM_H + 0.09, z);
    m.castShadow = true;
    g.add(m);
  };
  cap(ROOM_W + 0.4, 0.6, 0, -ROOM_D / 2);
  cap(0.6, ROOM_D + 0.4, -ROOM_W / 2, 0);
  cap(0.6, ROOM_D + 0.4, ROOM_W / 2, 0);
  cap(6.4, 0.6, -5.0, ROOM_D / 2);
  cap(6.4, 0.6, 5.0, ROOM_D / 2);

  // skirting boards in the robot's colour — four thin strips along the walls,
  // NOT a slab across the floor
  const skirtMat = mat(palette.body);
  const strip = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), skirtMat);
    m.position.set(x, 0.175, z);
    m.receiveShadow = true;
    g.add(m);
  };
  strip(ROOM_W, 0.25, 0, -ROOM_D / 2 + 0.3);
  strip(0.25, ROOM_D, -ROOM_W / 2 + 0.3, 0);
  strip(0.25, ROOM_D, ROOM_W / 2 - 0.3, 0);
  strip(6.0, 0.25, -5.0, ROOM_D / 2 - 0.3);
  strip(6.0, 0.25, 5.0, ROOM_D / 2 - 0.3);

  return g;
}

function makeExitPad() {
  const pad = new THREE.Mesh(new THREE.CircleGeometry(1.4, 20),
    new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.55 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.03, ROOM_D / 2 - 1.3);
  return pad;
}

// --- themed furniture, one set per robot ---
function furniture(id, palette) {
  const g = new THREE.Group();
  const wood = mat(0x7a5836);
  const dark = mat(0x4a3a2a);

  const shelfWall = (x, rot) => {
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.18, 0.9), wood);
      s.position.set(x, 0.9 + i * 0.95, -ROOM_D / 2 + 0.9);
      s.rotation.y = rot;
      s.castShadow = true; s.receiveShadow = true;
      g.add(s);
      for (let j = 0; j < 7; j++) {
        const bk = new THREE.Mesh(
          new THREE.BoxGeometry(0.18 + Math.random() * 0.1, 0.5 + Math.random() * 0.3, 0.6),
          mat([0xa33b3b, 0x2f6fd0, 0xf0b429, 0x3f7d36, 0x8d7bd6][j % 5])
        );
        bk.position.set(x - 2.2 + j * 0.62, 0.9 + i * 0.95 + 0.33, -ROOM_D / 2 + 0.9);
        bk.castShadow = true;
        g.add(bk);
      }
    }
  };

  const deskAt = (x, z, w = 3.0) => {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, 1.5), wood);
    top.position.set(x, 1.0, z);
    top.castShadow = true; top.receiveShadow = true;
    g.add(top);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.0, 0.15), dark);
      leg.position.set(x + sx * (w / 2 - 0.2), 0.5, z + sz * 0.6);
      leg.castShadow = true;
      g.add(leg);
    }
    return top;
  };

  switch (id) {
    case 'brief': {
      // six pedestals, one per slot — the teaching aid
      const cols = [0xf0b429, 0x2cb1bc, 0xda4a91, 0xf3752b, 0x2f6fd0, 0xb4553a];
      cols.forEach((c, i) => {
        const a = (i / 6) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1.1, 6), mat(0xbfb096));
        p.position.set(Math.sin(a) * 4.2, 0.55, Math.cos(a) * 3.4 - 1.5);
        p.castShadow = true;
        g.add(p);
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(c));
        cube.position.set(p.position.x, 1.4, p.position.z);
        cube.castShadow = true;
        cube.userData.spin = 0.4 + i * 0.1;
        g.add(cube);
      });
      deskAt(-5.2, -3.5, 3.4);
      break;
    }
    case 'evidence': {
      shelfWall(0, 0);
      deskAt(0, 1.2, 3.6);
      // stacks of paper
      for (let i = 0; i < 5; i++) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4 + Math.random() * 0.5, 0.9), mat(0xf2ead7));
        st.position.set(-5.6 + i * 0.1, 0.25, -1 + i * 1.4);
        st.rotation.y = Math.random() * 0.4;
        st.castShadow = true;
        g.add(st);
      }
      break;
    }
    case 'polyglot': {
      // three mismatched desks that don't agree on a style
      [[-4.6, -2.0, 0x2f6fd0], [0, -3.4, 0x1fae6a], [4.6, -2.0, 0xda4a91]].forEach(([x, z, c]) => {
        const t = deskAt(x, z, 3.0);
        t.material = mat(c);
        const scr = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.1), mat(0x1b2530, { emissive: 0x1b3a4a }));
        scr.position.set(x, 1.6, z - 0.4);
        scr.castShadow = true;
        g.add(scr);
      });
      break;
    }
    case 'context': {
      // crates everywhere, obviously too many
      for (let i = 0; i < 22; i++) {
        const s = 0.5 + Math.random() * 0.5;
        const c = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.8, s), mat(Math.random() > 0.5 ? 0xb98a4e : 0xd6a566));
        const a = Math.random() * Math.PI * 2, d = 3.5 + Math.random() * 3.2;
        c.position.set(Math.sin(a) * d, s * 0.4 + (Math.random() > 0.7 ? s * 0.8 : 0), Math.cos(a) * d - 1);
        c.rotation.y = Math.random() * Math.PI;
        c.castShadow = true; c.receiveShadow = true;
        g.add(c);
      }
      deskAt(0, -4.2, 3.0);
      break;
    }
    case 'delegate': {
      // a dispatch table with task tokens
      const table = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.25, 12), wood);
      table.position.set(0, 1.05, -2.0);
      table.castShadow = true; table.receiveShadow = true;
      g.add(table);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.0, 8), dark);
      col.position.set(0, 0.5, -2.0);
      g.add(col);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tok = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8), mat(i % 2 ? 0x2f6fd0 : 0xe8eef4));
        tok.position.set(Math.sin(a) * 1.8, 1.22, Math.cos(a) * 1.8 - 2.0);
        tok.castShadow = true;
        g.add(tok);
      }
      shelfWall(0, 0);
      break;
    }
    case 'pitfall': {
      // wreckage, a workbench, and scorch marks
      deskAt(-4.4, -2.6, 3.6);
      for (let i = 0; i < 14; i++) {
        const s = 0.25 + Math.random() * 0.45;
        const part = new THREE.Mesh(
          Math.random() > 0.5 ? new THREE.BoxGeometry(s, s, s) : new THREE.CylinderGeometry(s * 0.5, s * 0.5, s * 1.4, 6),
          mat([0x6d7580, 0xb4553a, 0x3a3a3a, 0x8a8f96][i % 4])
        );
        const a = Math.random() * Math.PI * 2, d = 2.5 + Math.random() * 4;
        part.position.set(Math.sin(a) * d, s * 0.5, Math.cos(a) * d - 1.5);
        part.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        part.castShadow = true;
        g.add(part);
      }
      const scorch = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16),
        new THREE.MeshBasicMaterial({ color: 0x2a2118, transparent: true, opacity: 0.5 }));
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.set(3.4, 0.02, -3.0);
      g.add(scorch);
      break;
    }
  }
  return g;
}

export function buildInterior(entry) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20242b);
  addLighting(scene, { indoor: true });

  scene.add(shell(entry.palette));
  scene.add(furniture(entry.id, entry.palette));

  // warm lamp over the rug
  const lamp = new THREE.PointLight(0xffd9a0, 1.1, 18, 2);
  lamp.position.set(0, ROOM_H - 0.5, -1.5);
  scene.add(lamp);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffe9c0 }));
  bulb.position.copy(lamp.position);
  scene.add(bulb);

  // the teacher, waiting on the rug
  const bot = buildRobot({ palette: entry.palette, build: entry.build, scale: 1.2 });
  bot.position.set(0, 0, -3.4);
  bot.rotation.y = 0;
  bot.userData.id = entry.id;
  bot.userData.animate = true;
  scene.add(bot);

  const tag = makeNameTag(entry.name, entry.palette.body);
  tag.position.set(0, bot.userData.height + 0.55, -3.4);
  scene.add(tag);

  const exitPad = makeExitPad();
  scene.add(exitPad);

  const interactables = [
    { type: 'robot', id: entry.id, position: bot.position.clone(), radius: 2.8, object: bot, label: `Talk to ${entry.name}` },
    { type: 'exit', id: 'exit', position: exitPad.position.clone(), radius: 1.8, object: exitPad, label: 'Leave' }
  ];

  const blockers = [{ x: 0, z: -3.4, r: 1.0 }];

  return {
    scene, interactables, blockers, robot: bot,
    spawn: { x: 0, z: ROOM_D / 2 - 2.6, facing: Math.PI },
    bounds: { w: ROOM_W / 2 - 1.0, d: ROOM_D / 2 - 1.0 }
  };
}

export const INTERIOR_DIMS = { ROOM_W, ROOM_D, ROOM_H };

// --- The Forge: no teacher, six pedestals and a terminal you operate yourself ---
export function buildForgeInterior(entry) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x191428);
  addLighting(scene, { indoor: true });

  scene.add(shell(entry.palette));

  // six pedestals in an arc, one per prompt slot, each with a floating cube
  const pedestals = [];
  entry.slots.forEach((slot, i) => {
    // wide arc, so the two front pedestals clear the terminal and their labels
    // do not sit on top of the screen
    const a = -Math.PI * 0.75 + (i / (entry.slots.length - 1)) * Math.PI * 1.5;
    const x = Math.sin(a) * 6.0;
    const z = Math.cos(a) * 4.6 - 1.4;

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.2, 6), mat(0x4a4266));
    base.position.set(x, 0.6, z);
    base.castShadow = true; base.receiveShadow = true;
    scene.add(base);

    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), mat(slot.colour));
    cube.position.set(x, 1.65, z);
    cube.castShadow = true;
    cube.userData.spin = 0.35 + i * 0.07;
    cube.userData.bob = i * 0.9;
    scene.add(cube);

    const glow = new THREE.PointLight(slot.colour, 0.45, 5, 2);
    glow.position.set(x, 1.65, z);
    scene.add(glow);

    const plate = makeSlotPlate(slot.label, slot.colour);
    plate.position.set(x, 2.5, z);
    scene.add(plate);

    pedestals.push(cube);
  });

  // the terminal you click to open the builder
  const terminal = new THREE.Group();
  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 1.4), mat(0x3a3352));
  desk.position.y = 0.45;
  desk.castShadow = true; desk.receiveShadow = true;
  terminal.add(desk);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x9ae6d0, emissive: 0x2f8f74, flatShading: true }));
  screen.position.set(0, 1.6, -0.2);
  screen.rotation.x = -0.22;
  screen.castShadow = true;
  terminal.add(screen);
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), mat(0x2a2440));
    leg.position.set(sx * 1.2, 1.05, -0.2);
    terminal.add(leg);
  }
  terminal.position.set(0, 0, 1.6);
  scene.add(terminal);

  const termLight = new THREE.PointLight(0x9ae6d0, 0.8, 7, 2);
  termLight.position.set(0, 2.0, 1.2);
  scene.add(termLight);

  const pad = new THREE.Mesh(new THREE.CircleGeometry(1.6, 22),
    new THREE.MeshBasicMaterial({ color: 0x9ae6d0, transparent: true, opacity: 0.35 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.03, 2.9);
  scene.add(pad);

  const exitPad = makeExitPad();
  scene.add(exitPad);

  const interactables = [
    { type: 'forge', id: 'forge', position: new THREE.Vector3(0, 0, 2.9), radius: 2.2, object: terminal, label: 'Use the terminal' },
    { type: 'exit', id: 'exit', position: exitPad.position.clone(), radius: 1.8, object: exitPad, label: 'Leave' }
  ];

  return {
    scene, interactables,
    blockers: [{ x: 0, z: 1.6, r: 1.6 }],
    pedestals,
    spawn: { x: 0, z: ROOM_D / 2 - 2.6, facing: Math.PI },
    bounds: { w: ROOM_W / 2 - 1.0, d: ROOM_D / 2 - 1.0 }
  };
}

// Small floating label above each pedestal.
function makeSlotPlate(text, colour) {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 80;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 320, 80);
  ctx.fillStyle = 'rgba(12,10,22,0.85)';
  ctx.fillRect(10, 18, 300, 44);
  ctx.strokeStyle = '#' + new THREE.Color(colour).getHexString();
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 18, 300, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 160, 41);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  spr.scale.set(2.2, 0.55, 1);
  spr.renderOrder = 990;
  return spr;
}
