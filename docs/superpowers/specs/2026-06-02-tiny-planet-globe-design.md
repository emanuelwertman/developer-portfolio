# Tiny-Planet Globe — Design

**Date:** 2026-06-02
**Status:** Approved, implementing

## Goal

Replace the dot-matrix Earth globe with a stylised "tiny planet" in the spirit of
[flo-bit/tiny-planets](https://github.com/flo-bit/tiny-planets): a faceted
low-poly sphere with noise-driven terrain, mixed-earthlike biomes (sea → sand →
grass → rock → snow), stylised water, and scattered low-poly trees/rocks. Keep
the existing camera stations, project markers, overlay UI, accessibility, and
WebGL fallback working.

## Decisions

- **Scope:** Replace the Earth entirely. The tiny-planet becomes THE globe.
- **Palette:** Mixed earthlike — full biome range by altitude.
- **Theme reach:** Planet + scene backdrop (retune lighting, add sky/space
  backdrop). UI chrome (nav, panels, serif/mono type, paper theme) stays.
- **Markers:** Curated land anchors, decoupled from lat/lng. Implemented as a
  deterministic `getLandAnchors(n)` helper that returns well-separated land
  directions for the fixed seed; markers seat on the terrain surface there.
  `lat/lng/city/country` stay in content for modal text.
- **Technique:** Approach A — runtime generation with a fixed seed. No baked
  binary assets. Deterministic so anchors and scenery are identical each load.

## Architecture

A pure `src/lib/planet/` data module, consumed by the R3F scene.

- `planet/noise.ts` — seeded 3D simplex noise + fBm. Self-contained, no deps.
- `planet/biome.ts` — elevation/slope/latitude → vertex color (mixed earthlike).
- `planet/field.ts` — the shared **terrain field**: one seeded object exposing
  `heightAt(dir) → { radius, elevationNorm }` and `colorAt(dir)`. Geometry,
  scatter, markers, and anchors all read from this one source so they align.
- `planet/geometry.ts` — subdivided icosphere → non-indexed → vertices displaced
  by the field → per-vertex colors → `computeVertexNormals` (flat facets).
- `planet/models.ts` — low-poly builders: pine, leafy tree, rock (+ reused
  mountain). Returns geometry + flat-shaded materials.
- `planet/scatter.ts` — seeded surface sampling; emits instance transforms only
  on land between the sand line and snow line, avoiding steep slopes.
- `planet/index.ts` — `buildPlanet(opts)` entry → `{ terrainGeometry,
  waterGeometry, waterRadius, scatter, sampleSurfaceRadius(dir), getLandAnchors(n) }`.

## Terrain field

- Base radius = `GLOBE_RADIUS` (1). Water shell at `waterRadius`.
- `elevationNorm = fbm(dir)` in ~[-1, 1]; `seaLevel` threshold separates
  land/sea.
- Below sea level: gentle negative displacement (sea floor sits under the shell).
- Above sea level: `t = (elevationNorm - seaLevel) / (1 - seaLevel)`, radius rises
  with a shaped profile; a higher-frequency ridge term lifts peaks for snow.

## Biome coloring

| Band | Color | Where |
|------|-------|-------|
| Seabed | dark teal/blue | below sea level (mostly hidden by water) |
| Sand | `#d8c89a` | just above sea level |
| Grass | `#3f7a3a → #2f5d2c` | low–mid land |
| Rock | `#6b5d4a` | steep slope / mid-high |
| Snow | `#f4f1ea` | high altitude or high latitude |

## Water

Separate translucent icosphere shell at `waterRadius`, colored from the sea
gradient. Gentle bob via a time uniform / vertex offset; static under
`prefers-reduced-motion`. No heavy caustics in v1.

## Vegetation

Reuse/extend the existing `makePine`/`makeMountain` patterns from
`Decorations.tsx` into `planet/models.ts`; add a rounded leafy tree and a rock.
One `InstancedMesh` per model type (same pattern as today). Seeded counts tuned
for charm + perf (a few hundred each). `Decorations.tsx` logic folds into the
planet scatter system.

## Markers

`getLandAnchors(projects.length)` returns deterministic, spread-out land
directions. `Markers.tsx` keeps all behavior (ping, far-side hiding, labels,
click-to-focus) but positions each marker at `anchorDir * (sampleSurfaceRadius +
offset)` instead of `latLngToVector3`. An optional `anchor?: [x,y,z]` on a
project can override the auto-anchor.

## Scene backdrop & lighting

`Scene.tsx`: retune key/fill/ambient to flatter saturated color and facets; add
a soft gradient sky/space backdrop sphere behind the planet so it reads against
a backdrop rather than floating on paper. UI panels keep the paper theme.
`theme.ts` gains a `planet` sub-palette; vermilion accent stays for markers.

## Performance & resilience

Generated once, memoized. Instanced vegetation. Non-indexed geometry at ~20–80k
tris is fine. Idle auto-rotate, reduced motion, WebGL fallback, and camera
stations are untouched.

## Testing

Vitest unit tests for the pure modules: noise determinism (same seed → same
value), biome thresholds, geometry validity (array lengths, radii bounds),
scatter validity (no instances below sea level), and anchor validity (anchors are
on land). Existing `geo`/`stations`/`store` tests stay green.

## Files

- **New:** `src/lib/planet/{noise,biome,field,geometry,models,scatter,index}.ts` + tests.
- **Rewritten:** `src/scene/Globe.tsx`, `src/scene/Scene.tsx`.
- **Edited:** `src/scene/Markers.tsx`, `src/data/content.ts`, `src/lib/theme.ts`.
- **Retired from Globe:** dot-cloud, graticule, `globe-dots.json` usage.
  `globe-dots.json` and the `gen:dots` script are left in place but unused.
- **Folded in:** `Decorations.tsx` logic moves into the planet scatter system.
