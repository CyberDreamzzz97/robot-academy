// Robot Academy — entry point. Wires the world, the player, interaction and the UI together.
import * as THREE from 'three';
import { Engine } from './core/engine.js';
import { Input } from './core/input.js';
import { buildVillage, WORLD_RADIUS } from './world/village.js';
import { buildInterior, buildForgeInterior } from './world/interior.js';
import { Player } from './entities/player.js';
import { animateRobot } from './entities/robot.js';
import { Dialogue } from './systems/dialogue.js';
import { Forge } from './ui/forge.js';
import { HUD } from './ui/hud.js';
import { ROBOTS, FORGE } from './data/robots.js';

const canvas = document.getElementById('game');
const engine = new Engine(canvas);
const input = new Input(engine, canvas);

const hud = new HUD(document.getElementById('hud'));
const dialogue = new Dialogue(document.getElementById('dialogue'));
const forge = new Forge(document.getElementById('forge'));

const player = new Player();

// ---- world state ----
const village = buildVillage();
engine.register('village', village.scene);

const interiors = new Map();   // built lazily, then cached
let location = { kind: 'village', id: null };
let current = village;          // { scene, interactables, blockers }

village.scene.add(player.object);
// open in the plaza so the monument and the far side of the village are both in frame
player.teleport(0, 4.5, Math.PI);
engine.camDist = 27;
player.setBlockers(village.blockers);
player.setBounds(WORLD_RADIUS - 2);
engine.setActive('village');

const byId = id => ROBOTS.find(r => r.id === id);

// Camera focus point used while inside a house.
const INTERIOR_FOCUS = new THREE.Vector3(0, 0, -0.8);

// ---------------------------------------------------------------- interaction

// Walk to a target, then fire its action on arrival.
let pendingAction = null;

function approach(it) {
  const p = player.position;
  const dx = it.position.x - p.x, dz = it.position.z - p.z;
  const d = Math.hypot(dx, dz);
  if (d <= it.radius) {
    trigger(it);
    return;
  }
  // stop just short of the target
  const stand = Math.max(it.radius - 0.6, 0.8);
  player.moveTo({
    x: it.position.x - (dx / d) * stand,
    z: it.position.z - (dz / d) * stand
  });
  pendingAction = it;
}

function trigger(it) {
  pendingAction = null;
  player.stop();
  faceTowards(it.position);
  // the hover prompt describes the thing we just acted on — it would otherwise
  // stay on screen showing "Enter…" while you are already inside
  hud.hidePrompt();

  if (it.type === 'robot') return talkTo(it.id);
  if (it.type === 'exit') return leaveInterior();
  if (it.type === 'forge') return openForge();
  if (it.type === 'door') return enterHouse(it.id);
}

function faceTowards(pos) {
  const dx = pos.x - player.position.x;
  const dz = pos.z - player.position.z;
  if (Math.hypot(dx, dz) > 0.01) player.object.rotation.y = Math.atan2(dx, dz);
}

// ---------------------------------------------------------------- dialogue

function talkTo(id) {
  const r = byId(id);
  if (!r) return;
  const accent = '#' + r.palette.body.toString(16).padStart(6, '0');
  const inside = location.kind === 'interior' && location.id === id;
  const firstTime = !hud.taught.has(id);

  let pages;
  if (!inside) {
    // outdoors: a greeting plus a nudge toward the house
    pages = r.greet.map(body => ({ body }));
    pages.push({ body: `My lesson is inside. ${r.house.sign} — the door is right there.` });
  } else if (firstTime) {
    pages = [...r.greet.map(body => ({ body })), ...r.lesson, { heading: 'Before you go', body: r.outro }];
  } else {
    pages = [
      { body: `Back again. Good.` },
      ...r.lesson,
      { heading: 'Before you go', body: r.outro }
    ];
  }

  input.enabled = false;
  hud.hidePrompt();
  dialogue.start({
    name: r.name,
    title: r.title,
    accent,
    pages,
    onClose: () => {
      input.enabled = true;
      if (inside && hud.markTaught(id)) {
        hud.toast(`Lesson learned — ${r.reward}`);
        if (hud.taught.size === ROBOTS.length) {
          setTimeout(() => hud.toast('All six lessons learned. Go and forge something.', 4200), 2800);
        }
      }
    }
  });
}

// ---------------------------------------------------------------- scene moves

function enterHouse(id) {
  const isForge = id === FORGE.id;
  const r = isForge ? FORGE : byId(id);
  if (!r) return;

  if (!interiors.has(id)) {
    interiors.set(id, isForge ? buildForgeInterior(FORGE) : buildInterior(r));
  }
  const room = interiors.get(id);

  village.scene.remove(player.object);
  room.scene.add(player.object);

  current = room;
  location = { kind: 'interior', id };
  player.teleport(room.spawn.x, room.spawn.z, room.spawn.facing);
  player.setBlockers(room.blockers);
  player.setBounds(999);
  // frame the whole room from the doorway side, looking down past the beams
  engine.camDist = 18;
  engine.camPitch = 1.02;
  engine.camYaw = 0;
  engine.scenes.set('interiorLive', room.scene);
  engine.setActive('interiorLive');
  hud.toast(isForge ? 'The Forge — use the terminal to build a prompt' : r.house.sign);
}

function leaveInterior() {
  const id = location.id;
  const room = interiors.get(id);
  if (room) room.scene.remove(player.object);
  village.scene.add(player.object);

  current = village;
  location = { kind: 'village', id: null };

  // step back out onto the door pad
  const door = village.interactables.find(i => i.type === 'door' && i.id === id);
  const pos = door ? door.position : new THREE.Vector3(0, 0, 10);
  const outward = new THREE.Vector3(pos.x, 0, pos.z).normalize().multiplyScalar(1.8);
  player.teleport(pos.x - outward.x, pos.z - outward.z, Math.atan2(-pos.x, -pos.z));
  player.setBlockers(village.blockers);
  player.setBounds(WORLD_RADIUS - 2);
  engine.camDist = 24;
  engine.camPitch = 0.86;
  engine.setActive('village');
}

function openForge() {
  input.enabled = false;
  hud.hidePrompt();
  player.stop();
  forge.show(() => { input.enabled = true; });
}

// ---------------------------------------------------------------- input wiring

input.onGroundClick = (ndc) => {
  if (dialogue.open || forge.open) return;

  // 1. did we click something interactive?
  const it = pickInteractable(ndc);
  if (it) { approach(it); return; }

  // 2. otherwise walk to the ground point
  const groundHit = input.pick(ndc, [current.scene], true);
  if (groundHit) {
    const p = groundHit.point;
    if (location.kind === 'interior') {
      const b = current.bounds;
      p.x = THREE.MathUtils.clamp(p.x, -b.w, b.w);
      p.z = THREE.MathUtils.clamp(p.z, -b.d, b.d);
    }
    player.moveTo(p);
    pendingAction = null;
    pingMarker(p);
  }
};

input.onHover = (ndc) => {
  if (dialogue.open || forge.open) { hud.hidePrompt(); return; }
  const it = pickInteractable(ndc);
  if (it) { hud.showPrompt(it.label); canvas.style.cursor = 'pointer'; }
  else { hud.hidePrompt(); canvas.style.cursor = 'default'; }
};

// A robot standing near its own doorway sits behind the flat door pad along the
// view ray, so nearest-hit-wins would enter the house when you meant to talk.
// Collect every hit and rank by what the player most likely intended.
const PRIORITY = { robot: 0, forge: 1, exit: 2, door: 3 };

function pickInteractable(ndc) {
  const targets = current.interactables.map(i => i.object).filter(Boolean);
  if (!targets.length) return null;
  input.ray.setFromCamera(ndc, engine.camera);
  const hits = input.ray.intersectObjects(targets, true);
  if (!hits.length) return null;

  let best = null, bestRank = Infinity, bestDist = Infinity;
  for (const h of hits) {
    const it = current.interactables.find(i => i.object === h.object || isDescendant(h.object, i.object));
    if (!it) continue;
    const rank = PRIORITY[it.type] ?? 9;
    if (rank < bestRank || (rank === bestRank && h.distance < bestDist)) {
      best = it; bestRank = rank; bestDist = h.distance;
    }
  }
  return best;
}

function isDescendant(node, root) {
  let n = node;
  while (n) { if (n === root) return true; n = n.parent; }
  return false;
}

// ---------------------------------------------------------------- click marker

const marker = new THREE.Mesh(
  new THREE.RingGeometry(0.32, 0.46, 20),
  new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, side: THREE.DoubleSide })
);
marker.rotation.x = -Math.PI / 2;
village.scene.add(marker);
let markerLife = 0;

function pingMarker(p) {
  if (marker.parent !== current.scene) {
    marker.parent?.remove(marker);
    current.scene.add(marker);
  }
  marker.position.set(p.x, 0.06, p.z);
  markerLife = 0.7;
}

// ---------------------------------------------------------------- frame loop

engine.onUpdate((dt, t) => {
  if (!dialogue.open && !forge.open) player.update(dt, t);
  else animateRobot(player.object, t, 0);

  // animate every robot in the active scene
  current.scene.traverse(o => {
    if (o.userData && o.userData.animate) animateRobot(o, t, 0);
    if (o.userData && o.userData.spin) {
      o.rotation.y = t * o.userData.spin;
      if (o.userData.bob !== undefined) o.position.y = 1.65 + Math.sin(t * 1.6 + o.userData.bob) * 0.14;
    }
  });

  // arrival triggers the queued action
  if (pendingAction && !player.target) trigger(pendingAction);

  // door glow pulse, and fade name tags in as you get close so the map isn't
  // covered in labels showing through walls
  if (location.kind === 'village') {
    const pulse = 0.18 + Math.sin(t * 2.2) * 0.08;
    for (const it of village.interactables) {
      if (it.type === 'door' && it.object) it.object.material.opacity = pulse + 0.3;
      if (it.type === 'robot' && it.object?.userData.tag) {
        const d = Math.hypot(it.position.x - player.position.x, it.position.z - player.position.z);
        const target = d > 22 ? 0 : d < 13 ? 1 : (22 - d) / 9;
        const m = it.object.userData.tag.material;
        m.opacity += (target - m.opacity) * Math.min(1, dt * 6);
        it.object.userData.tag.visible = m.opacity > 0.02;
      }
    }
  }

  // click marker fade
  if (markerLife > 0) {
    markerLife -= dt;
    marker.material.opacity = Math.max(0, markerLife / 0.7) * 0.9;
    marker.scale.setScalar(1 + (0.7 - markerLife) * 0.8);
  } else {
    marker.material.opacity = 0;
  }

  // Outdoors the camera follows you. Indoors the room is small enough that a fixed
  // framing of the whole room reads far better than a follow cam.
  engine.updateCamera(location.kind === 'interior' ? INTERIOR_FOCUS : player.position, dt);
});

engine.start();

// ---------------------------------------------------------------- boot

document.getElementById('loading')?.remove();
hud.toast('Click the ground to walk. Talk to a robot, then step inside its house.', 5200);

// Debug/automation seam. The audit harness in tools/audit.mjs drives the game
// through this rather than guessing at screen coordinates.
window.RA = {
  THREE, engine, player, village, hud, forge, dialogue, ROBOTS, FORGE,
  debug: {
    location: () => ({ ...location }),
    teleport: (x, z, facing = 0) => player.teleport(x, z, facing),
    /** Stand just outside an interactable, as if you had walked there. */
    standBy: (type, id) => {
      const it = current.interactables.find(i => i.type === type && i.id === id);
      if (!it) return false;
      const dir = new THREE.Vector3(it.position.x, 0, it.position.z).normalize();
      player.teleport(it.position.x - dir.x * 1.6, it.position.z - dir.z * 1.6);
      return true;
    },
    enter: (id) => enterHouse(id),
    leave: () => leaveInterior(),
    talk: (id) => talkTo(id),
    openForge: () => openForge(),
    advance: () => dialogue.advance(),
    closeDialogue: () => dialogue.close(),
    interactables: () => current.interactables.map(i => ({ type: i.type, id: i.id, label: i.label }))
  }
};
