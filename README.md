# Project ELOT · Avantia Consulting

React port of the "Project ELOT" cinematic 3D consulting demo.
Vite + React 19 + TypeScript, rendered with three.js through react-three-fiber.

## Getting started

### Prerequisites

- **Node.js 22 LTS** (Vite 8 needs Node 20.19+ or 22.12+) and **npm 10**. Check with `node -v && npm -v`.
- **Git**, and access to the private repository `IORD1/balraj` (be logged in as IORD1 or be added as a collaborator).

### 1. Clone the repository

```bash
git clone https://github.com/IORD1/balraj.git
cd balraj
```

Alternatives:

```bash
gh repo clone IORD1/balraj            # GitHub CLI (run `gh auth login` first)
git clone git@github.com:IORD1/balraj.git   # SSH, if you have a key on your GitHub account
```

The repository is private, so an HTTPS clone prompts for credentials. Use your GitHub
username and a personal access token (not your password), or authenticate once with
`gh auth login` and let it handle git credentials.

### 2. Install dependencies

```bash
npm install
```

This installs React 19, three.js, react-three-fiber, drei, zustand, Vite and TypeScript
from `package-lock.json`.

### 3. Run on localhost

```bash
npm run dev
```

Open <http://localhost:5173> in your browser. Vite hot-reloads on every save. If port
5173 is already taken it picks the next free one and prints it in the terminal.
To reach the dev server from another device on your network:

```bash
npm run dev -- --host
```

### Other scripts

| Command             | What it does                                                   |
|---------------------|----------------------------------------------------------------|
| `npm run build`     | type-check + production build into `dist/`                     |
| `npm run preview`   | serve the production build at <http://localhost:4173>          |
| `npm run typecheck` | type-check only, no build                                      |

The original standalone page is kept alongside as a reference:
`Project ELOT - Avantia Consulting (Standalone) (1).html`.

## How it is organised

```
src/
  config/     theme (palette, fonts), layout (world coordinates), timing (camera keyframes,
              choreography), content (copy + mock agent output), assets (3D asset registry)
  state/      zustand store: intro phase, doors, screens, agent run, HUD visibility
  services/   agent.ts — the backend swap point (currently a mock)
  scene/      react-three-fiber scene
    Experience.tsx   <Canvas>, colour/fog/tone-mapping
    World.tsx        scene composition; every shell element is an asset <Slot>
    CameraRig.tsx    intro flight along the keyframed path (auto-play or scroll-scrubbed),
                     orbit during a run, position-based intro events
                     (open the page with ?cam=x,y,z&look=x,y,z to park the camera anywhere)
    EntrancePortal.tsx  pilasters/lintel/sill around the door and the wall behind the glazing
    Lighting.tsx     all lights (kept out of the shells so models can be swapped freely)
    Doors / FrameworkPanels / AgentScreens / AgentForm / Particles — animated, content-driven parts
    procedural/      placeholder geometry for each slot (sky, ground, city, hero building,
                     corridor, agent room)
  lib/        canvas texture drawing (panels, screens, sign), camera path, geometry helpers
  hud/        DOM overlay: intro card, flight controls (auto mode / skip / scroll hint /
              progress line), flash, corridor label, main HUD, summary, modal
  styles/     app.css (ported 1:1) and fonts.css (fonts extracted from the bundle)
public/
  fonts/      Fraunces, Inter, JetBrains Mono (woff2)
  models/     put .glb files here
```

## Moving through the flight

The intro flight can be driven two ways, switchable at any time with the **Auto mode**
button at the top right:

- **Auto mode** (the default) plays the flight on the clock, as the original demo did.
- **Scroll** — the mouse wheel, a finger drag or the arrow / page keys move a target along
  the camera path and the camera eases towards it, so the flight can be walked back and
  forth by hand. The first scroll switches auto mode off; pressing the button resumes it
  from wherever the camera is. A thin amber line along the bottom edge shows the position.

Everything the flight triggers — the title card, the doors, the entry flash, the corridor
labels, arrival in the agent room — is derived from the position on the path, so scrolling
back closes the doors and brings the title card back, and scrolling out of the agent room
flies back down the corridor (the agent HUD returns when you reach the room again). Input
is ignored while an agent run is in progress and while the output modal is open. Tuning
lives in `SCROLL` in `src/config/timing.ts`.

The five wall screens in the agent room show a standby picture (stage name, "Awaiting
brief") until a run fills them one by one; each keeps a single material for its whole life
and only the texture is swapped. In development, `__elot()` in the browser console returns
the current experience state.

## Adding your 3D assets

1. Save the model under `public/models/` (glTF-Binary `.glb` is easiest; Draco/meshopt
   compression is supported).
2. Open `src/config/assets.ts` and fill the matching slot:

   ```ts
   corridor: {
     url: '/models/commercial-building-hallway.glb',
     position: [0, 0, -44.5],                       // centre of the corridor run
     rotation: [0, Math.PI / 2, 0],                 // if the hallway runs along X in the file
     fit: { axis: 'longest', size: 45 },            // scale so its long side is 45 units
   },
   ```

   `fit` scales the model uniformly so one bounding-box dimension matches `size`, then rests
   it on the floor and centres it on `position`. Use `scale` / `rotation` for fine-tuning.
3. That's it. While the file loads (or if it fails to load) the procedural placeholder shows,
   so the experience never breaks.

World coordinates the models need to respect are listed at the top of `assets.ts` and in
`src/config/layout.ts`. Content-driven pieces — the corridor framework panels, the five room
screens, the door leaves, the agent core and all lighting — stay as React components and
keep working whichever shell models you swap in. For animated doors, name the leaves
`DoorL` and `DoorR` inside the model.

Slots currently filled from `3d-assests/` (converted with `tools/convert/`, see
`public/models/README.md`):

| Slot           | File                          | Replaces                        |
|----------------|-------------------------------|---------------------------------|
| `heroBuilding` | `public/models/building.glb`  | the procedural tower            |
| `doors`        | `public/models/door.glb`      | the two sliding slabs (swings)  |
| `corridor`     | `public/models/corridor.glb`  | the procedural corridor shell   |
| `agentForm`    | `public/models/ai-head.glb`   | the orb in the agent room — **file still missing**, see below |

`fit.anchor` is the easiest way to place a model whose origin is not where the scene
needs it: give the model-space point (e.g. its entrance floor centre) and it lands on the
slot `position`. The building and corridor use it with their origins baked at the entrance.

The door is tied into whatever building model is in use by `EntrancePortal` (sized from
`DOOR` and `ENTRANCE` in `src/config/layout.ts`): a portal on the façade around the door
frame, and a wall just inside the glazing that closes the corridor mouth so the door sits in
a wall when seen from the corridor. To inspect how a model sits, open the page with
`?cam=x,y,z&look=x,y,z` (e.g. `?cam=0,2,-32&look=0,2,-21.75` looks back at the entrance).

The agent-room head ("AI Head – Demystifying Artificial Intelligence" by Brandon Baldwin)
is a view-only Sketchfab listing with no download and no licence, so it has to be obtained
from the author; any head/bust glTF saved as `public/models/ai-head.glb` is picked up
automatically. The Sketchfab hallway that was considered earlier was a paid store item and
has been replaced by the corridor FBX.

## Wiring a real agent backend

`src/services/agent.ts` is the only place that knows the output is mocked. Replace the body
with a `fetch('/api/agent/run', …)` call that returns `AgentRunResult`; the summary panel and
the output modal already render from that result. The wall-screen artwork is still drawn in
`src/lib/textures/screens.ts` until the server supplies it.

## Notes on the port

- The original ran on three r128. Two things changed in three since then and were compensated
  for so the look matches: hex colours are now treated as sRGB (see `lc()` in
  `config/theme.ts`) and lights use physical units (see `LIGHTS` in `scene/Lighting.tsx`).
- The city and window lighting used `Math.random()`; they are now seeded so the skyline is
  stable across re-renders and replays.
- Building windows are instanced (two draw calls per building instead of hundreds of meshes).
