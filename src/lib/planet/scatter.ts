import * as THREE from 'three';
import type { TerrainField } from './field';
import { mulberry32 } from './rng';

// Decides where the scenery goes. We walk a Fibonacci sphere of candidate
// points (evenly spread), keep the ones that land on suitable ground, and emit
// an instance matrix per kept point. Deterministic for a given seed.

export interface ScatterResult {
  pines: THREE.Matrix4[];
  trees: THREE.Matrix4[];
  rocks: THREE.Matrix4[];
}

export interface ScatterOptions {
  seed?: number;
  /** Number of candidate points to test across the whole sphere. */
  samples?: number;
  /** Reject ground steeper than this (0 flat … 1 vertical). */
  maxSlope?: number;
  /** Land height below which nothing grows (keeps scenery off the beach). */
  minLandHeight?: number;
  /** Land height above which only rock appears (bare/snowy summits). */
  treelineHeight?: number;
}

const Y_UP = new THREE.Vector3(0, 1, 0);
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function scatterScenery(field: TerrainField, opts: ScatterOptions = {}): ScatterResult {
  const seed = opts.seed ?? 24601;
  const samples = opts.samples ?? 2400;
  const maxSlope = opts.maxSlope ?? 0.6;
  const minLandHeight = opts.minLandHeight ?? 0.06;
  const treeline = opts.treelineHeight ?? 0.78;

  const rng = mulberry32(seed);
  const result: ScatterResult = { pines: [], trees: [], rocks: [] };

  const dir = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const yaw = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const up = new THREE.Vector3();

  for (let i = 0; i < samples; i++) {
    // Evenly distributed point on the unit sphere, with a little seeded jitter.
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i + rng() * 0.6;
    dir.set(Math.cos(theta) * r, y + (rng() - 0.5) * 0.02, Math.sin(theta) * r).normalize();

    const { landHeight, radius } = field.heightAt(dir);
    if (landHeight < minLandHeight) continue; // underwater or beach
    const slope = field.slopeAt(dir);
    if (slope > maxSlope) continue; // too steep to plant on

    // Seat the model on the surface, standing straight up along the radial
    // (gravity) direction, then spin it around that vertical axis for variety.
    // The spin must be PRE-multiplied so it's applied after the up-alignment —
    // otherwise it tilts the trunk off-vertical on sloped ground.
    up.copy(dir);
    pos.copy(dir).multiplyScalar(radius);
    quat.setFromUnitVectors(Y_UP, up);
    yaw.setFromAxisAngle(up, rng() * Math.PI * 2);
    quat.premultiply(yaw);

    const m = new THREE.Matrix4();

    if (landHeight > treeline || slope > maxSlope * 0.7) {
      // High or steepish ground: rocks only.
      if (rng() > 0.45) continue; // thin them out
      scale.setScalar(0.7 + rng() * 1.1);
      result.rocks.push(m.compose(pos, quat, scale));
      continue;
    }

    const roll = rng();
    scale.setScalar(0.7 + rng() * 0.8);
    if (roll < 0.12) {
      result.rocks.push(m.compose(pos, quat, scale));
    } else if (landHeight > 0.4 || roll < 0.62) {
      // Higher, cooler ground favours conifers.
      result.pines.push(m.compose(pos, quat, scale));
    } else {
      result.trees.push(m.compose(pos, quat, scale));
    }
  }

  return result;
}
