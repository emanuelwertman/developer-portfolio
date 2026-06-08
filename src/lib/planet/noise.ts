// Self-contained, seeded 3D simplex noise + fractal Brownian motion.
//
// The planet's whole shape is a function of this noise, so it must be
// deterministic: the same seed always yields the same terrain, which is what
// lets the curated marker anchors and scattered scenery stay put across loads.

/** Tiny deterministic RNG (mulberry32) — matches the one used elsewhere. */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

const F3 = 1 / 3;
const G3 = 1 / 6;

/** A seeded 3D simplex noise sampler returning values in roughly [-1, 1]. */
export class SimplexNoise {
  private perm = new Uint8Array(512);
  private permMod12 = new Uint8Array(512);

  constructor(seed: number) {
    const rng = mulberry32(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher–Yates shuffle with the seeded RNG.
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise3D(x: number, y: number, z: number): number {
    const { perm, permMod12 } = this;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const corner = (
      ox: number, oy: number, oz: number,
      gi: number,
    ): number => {
      let tt = 0.6 - ox * ox - oy * oy - oz * oz;
      if (tt < 0) return 0;
      const g = GRAD3[gi];
      tt *= tt;
      return tt * tt * (g[0] * ox + g[1] * oy + g[2] * oz);
    };

    const gi0 = permMod12[ii + perm[jj + perm[kk]]];
    const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
    const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
    const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];

    const n =
      corner(x0, y0, z0, gi0) +
      corner(x1, y1, z1, gi1) +
      corner(x2, y2, z2, gi2) +
      corner(x3, y3, z3, gi3);

    return 32 * n;
  }
}

export interface FbmOptions {
  octaves?: number;
  frequency?: number;
  /** Amplitude falloff per octave. */
  persistence?: number;
  /** Frequency growth per octave. */
  lacunarity?: number;
}

/**
 * Layered ("fractal Brownian motion") noise built on {@link SimplexNoise}.
 * Returns values normalised to roughly [-1, 1].
 */
export function makeFbm(noise: SimplexNoise, opts: FbmOptions = {}) {
  const octaves = opts.octaves ?? 5;
  const baseFreq = opts.frequency ?? 1.6;
  const persistence = opts.persistence ?? 0.5;
  const lacunarity = opts.lacunarity ?? 2.0;

  // Pre-compute the normalising factor so output stays within [-1, 1].
  let norm = 0;
  let amp = 1;
  for (let o = 0; o < octaves; o++) {
    norm += amp;
    amp *= persistence;
  }

  return (x: number, y: number, z: number): number => {
    let freq = baseFreq;
    let a = 1;
    let sum = 0;
    for (let o = 0; o < octaves; o++) {
      sum += a * noise.noise3D(x * freq, y * freq, z * freq);
      freq *= lacunarity;
      a *= persistence;
    }
    return sum / norm;
  };
}
