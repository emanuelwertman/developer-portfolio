# 3JS Globe Portfolio — Design

**Date:** 2026-06-02
**Status:** Approved

## Overview

An immersive, single-page 3D developer portfolio. The centerpiece is a stylized
Earth globe rendered with Three.js (via React Three Fiber). The globe is always
present; the camera flies between predefined "stations" around it to reveal each
section. Project markers pinned to real-world coordinates open detail panels.

## Goals

- A genuinely unique, memorable portfolio anchored by an interactive globe.
- Immersive feel (camera orbits the live globe) without sacrificing readability,
  accessibility, or mobile support.
- Content lives in a single editable config file so real content can be swapped in.

## Stack

- React 18 + Vite + TypeScript
- @react-three/fiber, @react-three/drei, @react-three/postprocessing
- zustand for global UI state
- Vitest + React Testing Library for the testable/pure parts

## Architecture

One persistent `<Canvas>` mounted for the whole session. A DOM overlay layer is
absolutely positioned on top of the canvas and holds all readable content
(nav, section panels, project modal, loader). 3D scene and DOM communicate
through the zustand store.

### Scene (inside Canvas)
- **Globe** — sphere with a clean, soft daytime/monochrome texture; faint
  atmosphere rim glow; gentle idle auto-rotation.
- **Markers** — 3–4 project hotspots at real lat/lng, converted to 3D positions.
  Subtle pulsing dots with hover labels (drei `Html`).
- **CameraRig** — reads the active station from state, smoothly animates camera
  position + look-at target with eased tweening.
- **Lighting + Background** — soft key light, neutral gradient backdrop, minimal
  negative space (no busy starfield).

### Camera Stations
Four predefined viewpoints around the globe:
- **Home** — pulled back, globe centered, free orbit-drag + auto-rotate.
- **About** — camera swings to one side; About overlay fades in.
- **Skills** — camera angles to another face; Skills overlay fades in.
- **Contact** — final viewpoint; Contact overlay fades in.

Clicking a project marker is a special transition: camera flies toward the
marker, then the project detail modal opens. Closing returns to the prior station.

### DOM Overlay Layer
- **Nav** — minimal edge menu: Home · About · Skills · Contact + social icons.
- **Section panels** — About (bio, photo), Skills (tech showcase),
  Contact (links + email); crossfade in/out as stations change.
- **ProjectModal** — title, description, screenshot, live/repo links, close.
- **Loader** — clean progress indicator while textures load.

## Data Flow & State

`zustand` store holds `activeStation` and `activeProject`.
- Nav click → `setStation()` → CameraRig animates + matching overlay crossfades.
- Marker click → `setActiveProject()` → camera flies to marker + modal opens.
- Close modal → returns to previous station.

## Project Structure

```
src/
  main.tsx, App.tsx
  scene/    Globe, Markers, CameraRig, Lighting, Background
  ui/       Nav, AboutPanel, SkillsPanel, ContactPanel, ProjectModal, Loader
  state/    store.ts
  data/     content.ts        ← editable content
  lib/      geo.ts (lat/lng→Vector3), stations.ts (camera viewpoints)
  styles/
```

## Aesthetic

Clean & minimal. Light/neutral background, soft gradients, refined typography,
generous negative space. Earth is the hero.

## Quality Concerns

- **Accessibility / reduced-motion** — respect `prefers-reduced-motion`
  (shorten/skip camera tweens), keyboard-navigable nav & modal, semantic HTML.
- **Responsive/mobile** — overlays reflow; touch drag for globe; camera pulled
  back on small screens.
- **WebGL fallback** — graceful static fallback with the same content if WebGL
  is unavailable.
- **Performance** — clamp `dpr`, reasonably sized textures, lazy-load images.
- **Testing** — Vitest + RTL on `geo.ts` math, station definitions, store
  transitions, and overlays rendering from `content.ts`.

## Content (placeholders)

All in `src/data/content.ts`: profile (name, role, bio, photo), socials
(GitHub, LinkedIn, email), skills list, and 3–4 projects
({ id, name, blurb, description, location {lat,lng}, image, links }).
