# Robot Academy

A small 3D village where robot teachers explain how to prompt AI systems.
Walk up to a robot, step into its house, and it teaches you one part of the craft.
Then visit **The Forge** and build a real prompt from the six slots.

Built with [three.js](https://threejs.org). No build step, no bundler, no external assets —
every robot and building is generated from primitives in code.

![Status](https://img.shields.io/badge/milestone-M1%20playable%20slice-2f6fd0)

## Running it

The game uses ES modules, so it needs to be served over HTTP — opening
`index.html` directly from the file system will not work (browsers block module
imports on `file://`).

Pick whichever you have:

```bash
npx serve .            # Node
python -m http.server  # Python 3
```

Then open the address it prints (usually `http://localhost:3000` or `http://localhost:8000`).

In VS Code, the **Live Server** extension works too: right-click `index.html` → *Open with Live Server*.

### On GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / root. No build step required.

## Controls

| Action | Input |
|---|---|
| Walk | Left-click the ground |
| Talk / enter a building | Left-click a robot or a glowing door pad |
| Turn the camera | Right-click drag |
| Zoom | Scroll wheel |
| Advance dialogue | Click, Space or Enter |
| Close a panel | Escape |

## The cast

| Robot | Teaches |
|---|---|
| **BRIEF-1** | The six slots every prompt is made of |
| **EVIDENCE** | What the research actually supports — and what is folklore |
| **POLYGLOT** | Why Claude, ChatGPT, Gemini and Perplexity need different handling |
| **CONTEXT** | Context rot, session hygiene, external memory |
| **DELEGATE** | Briefing an agent: verification, specs, adversarial review |
| **PITFALL** | Every way this goes wrong, told as a story about how it broke |

Plus **The Forge** — a building with no robot, where you assemble a prompt from the
six slots and copy it out.

## Project layout

```
index.html              page shell and the three.js importmap
styles/ui.css           all UI styling (HUD, dialogue, Forge)
src/
  main.js               entry point — wires everything together
  core/engine.js        renderer, camera rig, lighting, frame loop
  core/input.js         click-to-move raycasting, camera orbit
  entities/robot.js     procedural robot builder and animation
  entities/player.js    player movement and steering
  world/village.js      terrain, buildings, props, signage
  world/interior.js     house interiors and themed furniture
  systems/dialogue.js   typewriter dialogue overlay
  ui/forge.js           the prompt builder
  ui/hud.js             progress, journal, toasts
  data/robots.js        all curriculum content — edit lessons here
tools/
  test-game.mjs         headless WebGL test harness
  build-features-pdf.py regenerates docs/FEATURES.pdf from FEATURES.md
docs/FEATURES.pdf       the feature register
FEATURES.md             source of truth for the register
```

## Editing the lessons

All teaching content lives in `src/data/robots.js`. Each robot has `greet`,
`lesson` (an array of `{ heading, body }` pages) and `outro`. Change the text
there and reload — no other file needs touching.

## Testing

```bash
npm i playwright
node tools/test-game.mjs
```

Boots the game headlessly, checks for runtime errors, enters a house and opens a
lesson. Screenshots land next to the script.

## Regenerating the feature PDF

```bash
pip install reportlab
python tools/build-features-pdf.py
```

## Credits

Curriculum adapted from *The Prompting Field Manual*, drawing on published guidance
from Anthropic, OpenAI, Google and Perplexity, and on the Wharton Generative AI Labs
*Prompting Science Report* series.
