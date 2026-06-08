import * as THREE from 'three';

// Maps a point's elevation / slope / latitude to a surface colour. This is the
// "mixed earthlike" ramp: dark seabed under the water, a sandy shoreline,
// grass through the lowlands, bare rock on steep or high ground, and snow on
// the peaks and at high latitudes.

export interface BiomePalette {
  seabedDeep: THREE.Color;
  seabedShallow: THREE.Color;
  sand: THREE.Color;
  grassLow: THREE.Color;
  grassHigh: THREE.Color;
  rock: THREE.Color;
  snow: THREE.Color;
}

export interface BiomeThresholds {
  /** Land height (0 = shoreline … 1 = highest peak) where sand fades to grass. */
  sandLine: number;
  /** Land height where grass starts giving way to rock. */
  rockLine: number;
  /** Land height above which snow takes over. */
  snowLine: number;
  /** Slope (0 flat … 1 vertical) above which rock shows through grass. */
  rockSlope: number;
  /** |latitude| (0 equator … 1 pole) above which snow creeps down. */
  polarLatitude: number;
}

export const DEFAULT_PALETTE: BiomePalette = {
  seabedDeep: new THREE.Color('#12324d'),
  seabedShallow: new THREE.Color('#1f6f7a'),
  sand: new THREE.Color('#d8c89a'),
  grassLow: new THREE.Color('#3f7a3a'),
  grassHigh: new THREE.Color('#2f5d2c'),
  rock: new THREE.Color('#6b5d4a'),
  snow: new THREE.Color('#f4f1ea'),
};

export const DEFAULT_THRESHOLDS: BiomeThresholds = {
  sandLine: 0.06,
  rockLine: 0.55,
  snowLine: 0.78,
  rockSlope: 0.55,
  polarLatitude: 0.82,
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export interface BiomeInput {
  /** 0 at the shoreline, 1 at the highest land. Negative is underwater. */
  landHeight: number;
  /** 0 flat … 1 vertical. */
  slope: number;
  /** |latitude| from 0 (equator) to 1 (pole). */
  latitude: number;
}

/**
 * Resolve the surface colour for a point, writing into `target` to avoid
 * per-vertex allocation. Underwater points (negative landHeight) return a
 * seabed colour that mostly stays hidden beneath the translucent water shell.
 */
export function biomeColor(
  input: BiomeInput,
  target: THREE.Color,
  palette: BiomePalette = DEFAULT_PALETTE,
  thresholds: BiomeThresholds = DEFAULT_THRESHOLDS,
): THREE.Color {
  const { landHeight, slope, latitude } = input;

  if (landHeight < 0) {
    // Underwater: blend deep → shallow as we approach the shoreline.
    const t = clamp01(1 + landHeight); // landHeight in [-1,0] → t in [0,1]
    return target.copy(palette.seabedDeep).lerp(palette.seabedShallow, t);
  }

  // Land. Build up from sand → grass → rock, then layer snow on top.
  target.copy(palette.sand);

  const toGrass = smoothstep(thresholds.sandLine * 0.4, thresholds.sandLine, landHeight);
  const grass = palette.grassLow.clone().lerp(palette.grassHigh, smoothstep(thresholds.sandLine, thresholds.rockLine, landHeight));
  target.lerp(grass, toGrass);

  // Rock from altitude or steepness.
  const rockFromHeight = smoothstep(thresholds.rockLine, thresholds.snowLine, landHeight);
  const rockFromSlope = smoothstep(thresholds.rockSlope, thresholds.rockSlope + 0.2, slope);
  const rock = Math.max(rockFromHeight, rockFromSlope);
  target.lerp(palette.rock, rock);

  // Snow: caps the highest ground, pulled lower toward the poles. Only a light
  // slope penalty so the tall, sharp mountain summits still read as snow-capped
  // rather than bare rock.
  const snowLine = thresholds.snowLine - smoothstep(thresholds.polarLatitude, 1, latitude) * 0.5;
  const snow = smoothstep(snowLine, snowLine + 0.1, landHeight) * (1 - rockFromSlope * 0.25);
  target.lerp(palette.snow, clamp01(snow));

  return target;
}
