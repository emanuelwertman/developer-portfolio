import * as THREE from 'three';
import { TerrainField, type TerrainFieldOptions } from './field';
import { buildTerrainGeometry, buildWaterGeometry } from './geometry';
import { scatterScenery, type ScatterResult, type ScatterOptions } from './scatter';
import { makeLeafyTree, makePine, makeRock, type PlanetModel } from './models';

export { TerrainField } from './field';
export type { ScatterResult } from './scatter';
export type { PlanetModel } from './models';

export interface BuildPlanetOptions extends TerrainFieldOptions {
  /** Icosphere subdivision for the terrain (higher = more facets). */
  detail?: number;
  /** Icosphere subdivision for the water shell. */
  waterDetail?: number;
  scatter?: ScatterOptions;
}

export interface Planet {
  field: TerrainField;
  terrainGeometry: THREE.BufferGeometry;
  waterGeometry: THREE.BufferGeometry;
  waterRadius: number;
  scatter: ScatterResult;
  models: { pine: PlanetModel; tree: PlanetModel; rock: PlanetModel };
  /**
   * n unit directions on the tallest peaks, kept at least `minSeparation`
   * radians apart, for marker anchoring.
   */
  getPeakAnchors: (n: number, minSeparation?: number) => THREE.Vector3[];
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Build everything needed to render and populate the planet from a single
 * seed. Pure data + geometry — no scene graph — so it stays testable and the
 * Globe component can simply consume the result.
 */
export function buildPlanet(opts: BuildPlanetOptions = {}): Planet {
  const field = new TerrainField(opts);
  const terrainGeometry = buildTerrainGeometry(field, opts.detail ?? 6);
  const waterGeometry = buildWaterGeometry(field.waterRadius, opts.waterDetail ?? 4);
  const scatter = scatterScenery(field, { seed: opts.seed, ...opts.scatter });
  const models = { pine: makePine(), tree: makeLeafyTree(), rock: makeRock() };

  const getPeakAnchors = (n: number, minSeparation?: number) =>
    pickPeakAnchors(field, n, minSeparation);

  return { field, terrainGeometry, waterGeometry, waterRadius: field.waterRadius, scatter, models, getPeakAnchors };
}

/**
 * Pick `n` directions sitting on the planet's tallest peaks, kept at least
 * `minSeparation` radians apart so markers don't pile onto one summit. We sample
 * the whole sphere, keep land points, sort them tallest-first, then greedily
 * take peaks that clear the separation gate. If the gate is too strict to yield
 * `n` peaks we relax it and retry, so the call always returns `n` anchors.
 */
function pickPeakAnchors(field: TerrainField, n: number, minSeparation = 0.6): THREE.Vector3[] {
  const dir = new THREE.Vector3();
  const samples = 6000;
  const candidates: { dir: THREE.Vector3; height: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    dir.set(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
    const { landHeight } = field.heightAt(dir);
    if (landHeight <= 0) continue; // must be on land, not under the sea
    candidates.push({ dir: dir.clone(), height: landHeight });
  }

  if (candidates.length === 0) {
    // Degenerate (essentially no land): fall back to evenly spaced points.
    return Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;
      return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize();
    });
  }

  // Tallest first — so the greedy pass always prefers higher ground.
  candidates.sort((a, b) => b.height - a.height);

  // Greedily take the tallest peaks that stay ≥ minSep radians from every peak
  // already chosen (dot ≤ cos(minSep), since both are unit vectors).
  const pickWithSeparation = (minSep: number): THREE.Vector3[] => {
    const cosThreshold = Math.cos(minSep);
    const chosen: THREE.Vector3[] = [];
    for (const cand of candidates) {
      if (chosen.every((c) => c.dot(cand.dir) <= cosThreshold)) {
        chosen.push(cand.dir);
        if (chosen.length === n) break;
      }
    }
    return chosen;
  };

  let separation = minSeparation;
  let chosen = pickWithSeparation(separation);
  while (chosen.length < n && separation > 0.04) {
    separation *= 0.75; // relax and try again until we can seat all n
    chosen = pickWithSeparation(separation);
  }

  // Last resort (tiny landmass): pad with the next tallest peaks regardless.
  for (let i = 0; chosen.length < n && i < candidates.length; i++) {
    if (!chosen.includes(candidates[i].dir)) chosen.push(candidates[i].dir);
  }

  return chosen.slice(0, n);
}
