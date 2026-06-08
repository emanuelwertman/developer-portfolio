import * as THREE from 'three';
import { makeFbm, SimplexNoise } from './noise';
import {
  biomeColor,
  DEFAULT_PALETTE,
  DEFAULT_THRESHOLDS,
  type BiomePalette,
  type BiomeThresholds,
} from './biome';

// The single source of truth for the planet's shape. Geometry, vegetation
// scatter, marker seating, and land-anchor picking all read elevation and
// colour from one TerrainField instance, so everything stays mutually aligned.

export interface TerrainFieldOptions {
  seed?: number;
  /** Radius of the (sea-level) water shell, in world units. */
  waterRadius?: number;
  /** Elevation threshold separating sea from land, in [-1, 1]. */
  seaLevel?: number;
  /** How far the highest land rises above the water shell, as a fraction. */
  landAmplitude?: number;
  /** How far the deepest seabed sinks below the water shell, as a fraction. */
  seaDepth?: number;
  palette?: BiomePalette;
  thresholds?: BiomeThresholds;
}

export interface HeightSample {
  /** Distance from planet centre to the terrain surface at this direction. */
  radius: number;
  /** Raw fBm value in ~[-1, 1] (the continent field). */
  elevationNorm: number;
  /** Normalised land height: <0 underwater, 0 shoreline, ~1 highest peak. */
  landHeight: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export class TerrainField {
  readonly waterRadius: number;
  readonly seaLevel: number;
  readonly landAmplitude: number;
  readonly seaDepth: number;
  private readonly palette: BiomePalette;
  private readonly thresholds: BiomeThresholds;
  private readonly continents: (x: number, y: number, z: number) => number;
  private readonly mountains: (x: number, y: number, z: number) => number;

  // Scratch vectors reused across the hot path to avoid per-call allocation.
  private readonly _n = new THREE.Vector3();
  private readonly _ta = new THREE.Vector3();
  private readonly _tb = new THREE.Vector3();
  private readonly _p = new THREE.Vector3();

  constructor(opts: TerrainFieldOptions = {}) {
    const seed = opts.seed ?? 1337;
    this.waterRadius = opts.waterRadius ?? 1;
    this.seaLevel = opts.seaLevel ?? 0.02;
    this.landAmplitude = opts.landAmplitude ?? 0.16;
    this.seaDepth = opts.seaDepth ?? 0.06;
    this.palette = opts.palette ?? DEFAULT_PALETTE;
    this.thresholds = opts.thresholds ?? DEFAULT_THRESHOLDS;

    this.continents = makeFbm(new SimplexNoise(seed), {
      octaves: 5,
      frequency: 1.5,
      persistence: 0.5,
      lacunarity: 2.0,
    });
    this.mountains = makeFbm(new SimplexNoise(seed ^ 0x9e3779b9), {
      octaves: 4,
      frequency: 3.4,
      persistence: 0.55,
      lacunarity: 2.2,
    });
  }

  /** Elevation sample for a (not necessarily unit) direction from centre. */
  heightAt(dir: THREE.Vector3): HeightSample {
    const n = this._n.copy(dir).normalize();
    const elevationNorm = this.continents(n.x, n.y, n.z);

    if (elevationNorm <= this.seaLevel) {
      // Underwater: gentle seabed dipping below the water shell.
      const landHeight = (elevationNorm - this.seaLevel) / (this.seaLevel + 1); // [-1, 0]
      const radius = this.waterRadius * (1 + landHeight * this.seaDepth);
      return { radius, elevationNorm, landHeight };
    }

    // Land: base slope from the continent field, plus ridged peaks that bite in
    // higher up, so snowy summits only appear well inland/uphill.
    const base = (elevationNorm - this.seaLevel) / (1 - this.seaLevel); // [0, 1]
    const ridge = clamp01(this.mountains(n.x, n.y, n.z) * 0.5 + 0.5);
    // Bias the ridge term toward its peaks (pow) and weight it heavily, so the
    // surface swings between gentle lowlands and tall, sharp mountains rather
    // than a uniform gradient — much more variation in terrain height.
    const peak = Math.pow(base, 1.5) * Math.pow(ridge, 1.6);
    const landHeight = clamp01(base * 0.55 + peak * 1.15);
    const radius = this.waterRadius * (1 + landHeight * this.landAmplitude);
    return { radius, elevationNorm, landHeight };
  }

  /** Surface radius only — used to seat markers on the ground. */
  surfaceRadius(dir: THREE.Vector3): number {
    return this.heightAt(dir).radius;
  }

  /**
   * Local steepness in [0, 1]: how fast the surface radius changes across the
   * tangent plane, sampled with small finite differences.
   */
  slopeAt(dir: THREE.Vector3): number {
    const n = this._n.copy(dir).normalize();
    // Build a tangent basis around n.
    const up = Math.abs(n.y) < 0.99 ? Y_UP : X_UP;
    this._ta.crossVectors(up, n).normalize();
    this._tb.crossVectors(n, this._ta).normalize();

    const eps = 0.04;
    const r0 = this.heightAt(n).radius;
    const ra = this.heightAt(this._p.copy(n).addScaledVector(this._ta, eps)).radius;
    const rb = this.heightAt(this._p.copy(n).addScaledVector(this._tb, eps)).radius;
    const grad = Math.hypot(ra - r0, rb - r0) / (eps * this.waterRadius);
    return clamp01(grad);
  }

  /** Surface colour at a direction, written into `target`. */
  colorAt(dir: THREE.Vector3, target: THREE.Color): THREE.Color {
    const n = this._n.copy(dir).normalize();
    const { landHeight } = this.heightAt(n);
    const slope = landHeight < 0 ? 0 : this.slopeAt(n);
    const latitude = Math.abs(n.y);
    return biomeColor({ landHeight, slope, latitude }, target, this.palette, this.thresholds);
  }
}

const Y_UP = new THREE.Vector3(0, 1, 0);
const X_UP = new THREE.Vector3(1, 0, 0);
