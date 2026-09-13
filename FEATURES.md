# Robot Academy — Feature Register

**Current version:** M1.1 · Playable Slice, audited
**Generated:** 12 September 2026
**Repository:** `robot-academy`

This is the living feature register. It is regenerated into `docs/FEATURES.pdf`
at every milestone, so the PDF always describes the current state of the build.
Status values: `SHIPPED`, `PARTIAL`, `PLANNED`.

---

## Milestone M1 — Playable Slice

### Engine and rendering

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| E-01 | WebGL renderer with soft shadow mapping and device-pixel-ratio clamping | SHIPPED | `src/core/engine.js` |
| E-02 | Orbiting follow camera — fixed pitch, yaw on right-drag, scroll to zoom | SHIPPED | `src/core/engine.js`, `src/core/input.js` |
| E-03 | Multi-scene manager — overworld and interiors are separate scenes, swapped on entry | SHIPPED | `src/core/engine.js`, `src/main.js` |
| E-04 | Shared lighting rig with separate indoor and outdoor profiles | SHIPPED | `src/core/engine.js` |
| E-05 | Flat-shaded material helper — the chunky low-poly look is enforced in one place | SHIPPED | `src/core/engine.js` |
| E-06 | Frame loop with delta clamping so tab-switching doesn't teleport the player | SHIPPED | `src/core/engine.js` |

### World

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| W-01 | Circular terrain with per-vertex colour variation (no flat green slab) | SHIPPED | `src/world/village.js` |
| W-02 | Central plaza with a six-slab monument, one colour per prompt slot | SHIPPED | `src/world/village.js` |
| W-03 | Seven buildings in a ring, each with pitched roof, door, windows, chimney | SHIPPED | `src/world/village.js` |
| W-04 | Radial paths from the plaza to every building | SHIPPED | `src/world/village.js` |
| W-05 | Canvas-texture hanging signboards — real text in 3D with no font loader | SHIPPED | `src/world/village.js` |
| W-06 | Deterministic prop scatter (trees, rocks) — identical village every load | SHIPPED | `src/world/village.js` |
| W-07 | Boundary tree ring so the world reads as enclosed | SHIPPED | `src/world/village.js` |
| W-08 | Glowing door pads marking every enterable building | SHIPPED | `src/world/village.js` |

### Characters

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| C-01 | Procedural robot builder — seven body archetypes, zero external assets | SHIPPED | `src/entities/robot.js` |
| C-02 | Per-robot character props: clipboard, magnifying lens, crate stack, drones, battle damage | SHIPPED | `src/entities/robot.js` |
| C-03 | Idle and walk animation — arm and leg swing, head sway, antenna pulse | SHIPPED | `src/entities/robot.js` |
| C-04 | Character-specific idle behaviour (three heads bicker, crates teeter, drones orbit) | SHIPPED | `src/entities/robot.js` |
| C-05 | Floating name tags that fade in by proximity | SHIPPED | `src/world/village.js`, `src/main.js` |
| C-06 | Player robot with distinct white-and-mint palette | SHIPPED | `src/entities/player.js` |

### Movement and interaction

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| M-01 | Click-to-move — raycast the ground, walk there, RuneScape style | SHIPPED | `src/core/input.js`, `src/entities/player.js` |
| M-02 | Steering obstacle avoidance — slide around houses instead of stopping dead | SHIPPED | `src/entities/player.js` |
| M-03 | Click a robot or door to walk over and act automatically on arrival | SHIPPED | `src/main.js` |
| M-04 | Smoothed turn-to-face-travel-direction | SHIPPED | `src/entities/player.js` |
| M-05 | Animated click marker ring | SHIPPED | `src/main.js` |
| M-06 | Hover highlighting with a contextual action prompt | SHIPPED | `src/main.js`, `src/ui/hud.js` |
| M-07 | World boundary clamping | SHIPPED | `src/entities/player.js` |
| M-08 | Drag-versus-click discrimination so camera orbit never triggers a move | SHIPPED | `src/core/input.js` |

### Interiors

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| I-01 | Enterable houses — walk onto the door pad and the interior scene loads | SHIPPED | `src/world/interior.js`, `src/main.js` |
| I-02 | Interiors built lazily and cached, so re-entry is instant | SHIPPED | `src/main.js` |
| I-03 | Room shell keyed to each robot's palette (rug, skirting, wall caps) | SHIPPED | `src/world/interior.js` |
| I-04 | Six themed furniture sets — no two rooms look alike | SHIPPED | `src/world/interior.js` |
| I-05 | Fixed dollhouse camera indoors, framing the whole room | SHIPPED | `src/main.js` |
| I-06 | Exit pad returns you to the doorway you came in through | SHIPPED | `src/main.js` |
| I-07 | Warm point-light lamp per room | SHIPPED | `src/world/interior.js` |

### Dialogue and curriculum

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| D-01 | Typewriter dialogue overlay, click or space to advance, click again to skip the reveal | SHIPPED | `src/systems/dialogue.js` |
| D-02 | Paged lessons with section headings and a page counter | SHIPPED | `src/systems/dialogue.js` |
| D-03 | Speaker accent colour drawn from the robot's own palette | SHIPPED | `src/systems/dialogue.js` |
| D-04 | Context-aware dialogue — outdoor greeting versus the full indoor lesson | SHIPPED | `src/main.js` |
| D-05 | Repeat visits open with different framing | SHIPPED | `src/main.js` |
| D-06 | Six full curricula, 36 lesson pages, adapted from The Prompting Field Manual | SHIPPED | `src/data/robots.js` |
| D-07 | Keyboard control — Space/Enter advance, Escape closes | SHIPPED | `src/systems/dialogue.js` |

### The Forge (prompt builder)

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| F-00 | The Forge is a real room you walk into — six lit pedestals, one per slot, and a terminal you operate | SHIPPED | `src/world/interior.js` |
| F-01 | Six-slot prompt builder matching the manual's anatomy | SHIPPED | `src/ui/forge.js` |
| F-02 | Live assembly — the brief rebuilds as you type | SHIPPED | `src/ui/forge.js` |
| F-03 | Per-slot hint text explaining what that slot is for | SHIPPED | `src/ui/forge.js` |
| F-04 | Worked placeholder examples in every field | SHIPPED | `src/ui/forge.js` |
| F-05 | Posture selector — interview me / plan first / act autonomously / give options | SHIPPED | `src/ui/forge.js` |
| F-06 | Completeness meter with diagnostic feedback naming the missing slot | SHIPPED | `src/ui/forge.js` |
| F-07 | Copy to clipboard with a `execCommand` fallback | SHIPPED | `src/ui/forge.js` |

### HUD and progression

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| H-01 | Lesson progress bar, 0–6 | SHIPPED | `src/ui/hud.js` |
| H-02 | Journal panel listing every robot, its subject, and what you earned | SHIPPED | `src/ui/hud.js` |
| H-03 | Progress persisted to `localStorage`, wrapped for private-browsing failure | SHIPPED | `src/ui/hud.js` |
| H-04 | Toast notifications for lessons learned and room entry | SHIPPED | `src/ui/hud.js` |
| H-05 | Persistent control hints | SHIPPED | `src/ui/hud.js` |
| H-06 | Completion message when all six lessons are done | SHIPPED | `src/main.js` |

### Build and delivery

| ID | Feature | Status | Files |
|----|---------|--------|-------|
| B-01 | No build step — ES modules with a CDN importmap, runs from any static server | SHIPPED | `index.html` |
| B-02 | One concern per module, so git diffs stay readable | SHIPPED | `src/**` |
| B-03 | Responsive UI down to phone width | SHIPPED | `styles/ui.css` |
| B-04 | `prefers-reduced-motion` respected | SHIPPED | `styles/ui.css` |
| B-05 | Headless WebGL test harness (render, enter house, open dialogue) | SHIPPED | `tools/test-game.mjs` |
| B-06 | Loading screen removed only once the scene is live | SHIPPED | `index.html`, `src/main.js` |
| B-07 | Full functional audit — 42 automated checks over every interaction path | SHIPPED | `tools/audit.mjs` |
| B-08 | Debug/automation seam (`window.RA.debug`) so tests drive the game directly | SHIPPED | `src/main.js` |
| B-09 | Inline SVG favicon — no 404 on load | SHIPPED | `index.html` |

---

## Audit — M1.1

`node tools/audit.mjs` boots the game headlessly and runs **42 checks** across boot,
content integrity, movement, all six robots, all six interiors, every lesson, the
Forge, progression, persistence, HUD, camera and responsive layout.

**Result: 42/42 passing, stable across three consecutive runs.**

Four defects were found and fixed during the audit:

| ID | Defect | Fix |
|----|--------|-----|
| A-01 | Clicking a robot standing near its own doorway entered the house instead of talking — the flat door pad sat nearer the camera along the view ray, so nearest-hit-wins picked the wrong thing | Intent-ranked picking: collect every ray hit and prefer robot over terminal over exit over door | 
| A-02 | Walking to a point inside a building ground against the obstacle forever, the player never stopping | `moveTo()` clamps any destination inside a blocker out to that building's edge, plus a stall timer as a safety net |
| A-03 | The Forge opened its panel without you ever entering the building, contradicting the brief | Built The Forge as a real interior — six lit pedestals and a terminal you walk up to and click |
| A-04 | A 404 on every page load (missing favicon) | Inline SVG favicon |

Dead code removed in the same pass: an unused `nearest()` helper, an unused `hovered`
variable, an unused `SKY` import, and an animation line reading properties that were
never set.

---

## Known limitations in M1.1

- **Collision is steering-based, not solid.** You slide around buildings rather than
  being hard-blocked. Walking into a wall at an angle can clip a corner.
- **No pathfinding.** The player walks in a straight line toward the click and pushes
  off obstacles. It cannot route around a building to reach a point behind it —
  you click twice instead.
- **Interior furniture is randomised per session**, not seeded like the village, so
  book and crate positions differ between reloads.
- **Draw calls are unbatched** (~660 in the overworld). Fine on desktop, worth merging
  static geometry before targeting low-end mobile.
- **Mobile is untested.** Touch produces pointer events so it should work, but the
  camera orbit has no touch gesture and the HUD is laid out for desktop.
- **No audio.**

---

## Planned — not yet built

| ID | Feature | Milestone |
|----|---------|-----------|
| P-01 | XP, levels and a skill panel (Prompting / Context / Agents) | M2 |
| P-02 | Quest log framing each robot as a completable quest | M2 |
| P-03 | Per-robot mini-game testing the lesson just taught | M3 |
| P-04 | Forge presets seeded by which robots you have learned from | M2 |
| P-05 | Save/load of forged prompts | M2 |
| P-06 | Audio — footsteps, ambient birds, dialogue blips | M3 |
| P-07 | Mobile touch controls and layout | M3 |
| P-08 | Geometry merging for draw-call reduction | M3 |
| P-09 | Day/night cycle | Backlog |
| P-10 | A seventh robot covering evals and measurement | Backlog |

---

## Decision log

Decisions taken with the project owner rather than assumed.

| Date | Decision | Chosen | Why |
|------|----------|--------|-----|
| 2026-09-12 | Version control route | Local folder + GitHub Desktop | Claude cannot run git on the owner's machine (September Windows update broke the workspace mount); GitHub Desktop supplies the git engine without a token passing through chat |
| 2026-09-12 | Project structure | Modular ES modules, no build step | File-per-feature git diffs, no `npm install`, deploys to GitHub Pages as-is |
| 2026-09-12 | Movement | Click-to-move | Faithful to the RuneScape reference, works on touch, keeps the camera simple |
| 2026-09-12 | M1 scope | World, robots, dialogue, interiors, Forge — no XP yet | Ship a tight vertical slice and expand, rather than half-build six systems |
| 2026-09-12 | Curriculum source | The Prompting Field Manual | Content already exists and is sourced; build time goes into the game |
| 2026-09-12 | Art direction | Chunky low-poly built in code | No external assets, fully version-controlled, distinctive rather than generic |
| 2026-09-12 | Hosting target | GitHub Pages, public, desktop-first | Free, shareable, straight from the repo |
| 2026-09-12 | Feature documentation | Living doc regenerated per milestone | Always current; markdown source stays diffable in git |
| 2026-09-12 | Verification approach | Automated audit harness over manual play-testing | 42 checks re-runnable on every change; caught four defects manual play would likely have missed |
