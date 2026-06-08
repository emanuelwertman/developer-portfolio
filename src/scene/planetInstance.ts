import { buildPlanet, type Planet } from '../lib/planet';

// One planet, built once per page load and shared by everything in the scene.
// The seed is randomised on each load so every visit gets a fresh world; it's
// still chosen once and cached, so the terrain, scenery, and marker anchors all
// read from the same seeded field and stay mutually aligned for that load.
export const PLANET_SEED = (Math.random() * 0x7fffffff) >>> 0;

let cached: Planet | null = null;

export function getPlanet(): Planet {
  if (!cached) {
    cached = buildPlanet({
      seed: PLANET_SEED,
      // IcosahedronGeometry subdivides linearly: tris = 20*(detail+1)^2. So
      // detail 90 ≈ 166k tris (edge ~0.012 on a radius-1 planet) — finely
      // faceted, ~0.7s to build once behind the loader.
      detail: 90,
      waterDetail: 48, // smooth, round sea horizon (cheap — no displacement)
      seaLevel: 0.0,
      landAmplitude: 0.3, // taller mountains / deeper valleys — dramatic relief
      scatter: { samples: 1800 }, // sparser scenery — fewer, more deliberate trees
    });
  }
  return cached;
}
