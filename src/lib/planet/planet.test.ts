import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { SimplexNoise, makeFbm } from './noise';
import { biomeColor, DEFAULT_PALETTE } from './biome';
import { TerrainField } from './field';
import { buildTerrainGeometry } from './geometry';
import { scatterScenery } from './scatter';
import { buildPlanet } from './index';

/** Deterministic directions on the unit sphere for sampling invariants. */
function dirs(n: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    return new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).normalize();
  });
}

describe('noise', () => {
  it('is deterministic for a given seed', () => {
    const a = new SimplexNoise(42);
    const b = new SimplexNoise(42);
    for (const d of dirs(50)) {
      expect(a.noise3D(d.x, d.y, d.z)).toBe(b.noise3D(d.x, d.y, d.z));
    }
  });

  it('differs across seeds', () => {
    const a = new SimplexNoise(1);
    const b = new SimplexNoise(2);
    const diff = dirs(50).some((d) => a.noise3D(d.x, d.y, d.z) !== b.noise3D(d.x, d.y, d.z));
    expect(diff).toBe(true);
  });

  it('fbm stays within [-1, 1]', () => {
    const fbm = makeFbm(new SimplexNoise(7));
    for (const d of dirs(500)) {
      const v = fbm(d.x * 1.3, d.y * 1.3, d.z * 1.3);
      expect(v).toBeGreaterThanOrEqual(-1.0001);
      expect(v).toBeLessThanOrEqual(1.0001);
    }
  });
});

describe('biome', () => {
  const c = new THREE.Color();

  it('returns a dark seabed colour underwater', () => {
    biomeColor({ landHeight: -0.5, slope: 0, latitude: 0 }, c);
    expect(c.r).toBeLessThan(0.3); // far from sandy/snow
  });

  it('returns sand at the shoreline', () => {
    biomeColor({ landHeight: 0.01, slope: 0, latitude: 0 }, c);
    expect(c.getHex()).toBe(DEFAULT_PALETTE.sand.getHex());
  });

  it('returns snow on high, flat, equatorial peaks', () => {
    biomeColor({ landHeight: 0.97, slope: 0, latitude: 0 }, c);
    expect(c.r).toBeGreaterThan(0.85);
    expect(c.g).toBeGreaterThan(0.85);
    expect(c.b).toBeGreaterThan(0.8);
  });
});

describe('terrain field', () => {
  it('keeps land above the water shell and seabed below it', () => {
    const field = new TerrainField({ seed: 7 });
    for (const d of dirs(800)) {
      const { radius, landHeight } = field.heightAt(d);
      expect(radius).toBeGreaterThanOrEqual(field.waterRadius * (1 - field.seaDepth) - 1e-6);
      expect(radius).toBeLessThanOrEqual(field.waterRadius * (1 + field.landAmplitude) + 1e-6);
      if (landHeight >= 0) expect(radius).toBeGreaterThanOrEqual(field.waterRadius - 1e-6);
      else expect(radius).toBeLessThanOrEqual(field.waterRadius + 1e-6);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = new TerrainField({ seed: 7 });
    const b = new TerrainField({ seed: 7 });
    for (const d of dirs(100)) {
      expect(a.surfaceRadius(d)).toBe(b.surfaceRadius(d));
    }
  });
});

describe('terrain geometry', () => {
  it('builds non-indexed, flat-shaded, fully coloured geometry', () => {
    const field = new TerrainField({ seed: 7 });
    const geo = buildTerrainGeometry(field, 2); // low detail for speed
    const pos = geo.getAttribute('position');
    const col = geo.getAttribute('color');
    expect(geo.index).toBeNull(); // non-indexed → hard facets
    expect(pos.count).toBe(col.count);
    expect(pos.count % 3).toBe(0); // whole triangles
    expect(geo.getAttribute('normal')).toBeTruthy();
  });
});

describe('scatter', () => {
  it('places every instance on land (at or above the water shell)', () => {
    const field = new TerrainField({ seed: 7 });
    const result = scatterScenery(field, { seed: 7, samples: 1200 });
    const all = [...result.pines, ...result.trees, ...result.rocks];
    expect(all.length).toBeGreaterThan(0);

    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    for (const m of all) {
      m.decompose(p, q, s);
      expect(p.length()).toBeGreaterThanOrEqual(field.waterRadius - 1e-6);
    }
  });
});

describe('buildPlanet', () => {
  it('builds non-empty geometry for every scenery model', () => {
    const planet = buildPlanet({ seed: 7, detail: 3 });
    for (const model of [planet.models.pine, planet.models.tree, planet.models.rock]) {
      expect(model.geometry).toBeTruthy(); // mergeGeometries returns null on mismatch
      expect(model.geometry.getAttribute('position').count).toBeGreaterThan(0);
      expect(model.materials.length).toBeGreaterThan(0);
    }
  });

  it('produces peak anchors that sit on land and stay separated', () => {
    const planet = buildPlanet({ seed: 7, detail: 3 });
    const minSep = 0.6;
    const anchors = planet.getPeakAnchors(4, minSep);
    expect(anchors).toHaveLength(4);
    for (const a of anchors) {
      expect(a.length()).toBeCloseTo(1, 5); // unit direction
      expect(planet.field.heightAt(a).landHeight).toBeGreaterThan(0);
    }
    // Anchors are tall: each should sit well above the median land height.
    const heights = anchors.map((a) => planet.field.heightAt(a).landHeight);
    expect(Math.min(...heights)).toBeGreaterThan(0.3);
    // No two anchors coincide.
    for (let i = 0; i < anchors.length; i++) {
      for (let j = i + 1; j < anchors.length; j++) {
        expect(anchors[i].dot(anchors[j])).toBeLessThan(0.999);
      }
    }
  });
});
