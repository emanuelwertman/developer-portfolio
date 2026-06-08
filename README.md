# Cartographer — Interactive Globe Portfolio

An immersive 3D developer portfolio built around a dot-matrix Earth. The globe
stays centre-stage the whole time; the camera flies between fixed "stations"
around it to reveal each section, and project markers pinned to real-world
coordinates open detail panels.

Built with **React + Three.js (React Three Fiber)**, in a refined
cartographic/observatory aesthetic — warm paper, deep ink, a single vermilion
accent, editorial serif type, and monospace instrument labels.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command            | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                                 |
| `npm run build`    | Type-check (`tsc -b`) and build to `dist/`                |
| `npm run preview`  | Serve the production build                                |
| `npm test`         | Run the Vitest suite                                      |
| `npm run gen:dots` | Regenerate the globe's land point-cloud (see below)       |

## Editing your content

Everything you'd normally change lives in one file:
[`src/data/content.ts`](src/data/content.ts) — your profile/bio, skills, social
links, and the project list. Each project has a `location` (`lat`/`lng`) that
places its marker on the globe, plus a two-colour `cover` gradient used on the
detail modal.

## How it works

- **The globe** ([`src/scene/Globe.tsx`](src/scene/Globe.tsx)) is a point cloud
  of ~3,300 land dots, an occluding body sphere, and a faint graticule. The dots
  are pre-computed from real Natural Earth land data by
  [`scripts/gen-dots.mjs`](scripts/gen-dots.mjs) into
  `src/data/globe-dots.json`. Re-run `npm run gen:dots` to change density
  (tweak `STEP` in that script).
- **Camera stations** ([`src/lib/stations.ts`](src/lib/stations.ts)) define the
  viewpoint for Home/About/Skills/Contact. The camera flies between them via
  drei's `CameraControls`; free orbit is only enabled on Home. Tune the
  `position` / `target` of any station to reframe a section.
- **Markers** ([`src/scene/Markers.tsx`](src/scene/Markers.tsx)) are placed by
  lat/lng, hide on the far side of the globe, and fly the camera in + open a
  modal when clicked.
- **State** ([`src/state/store.ts`](src/state/store.ts)) is a small zustand
  store; the DOM overlay ([`src/ui/`](src/ui/)) and the 3D scene communicate
  through it.

## Accessibility & resilience

- Respects `prefers-reduced-motion` (camera jumps instead of flying; animations
  are neutralised).
- Keyboard-operable nav and modal (Escape closes; close button is focused on
  open).
- If WebGL is unavailable, a fully static, accessible
  [`Fallback`](src/ui/Fallback.tsx) renders the same content as plain HTML.

## Tech

React 18 · TypeScript · Vite · @react-three/fiber · @react-three/drei · zustand
· Vitest + Testing Library.
