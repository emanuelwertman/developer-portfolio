import { latLngToVector3 } from './geo';

/**
 * Build a line-segment position buffer for a globe graticule (the faint grid of
 * parallels and meridians). Returns a flat Float32Array of x,y,z triples, two
 * vertices per segment.
 */
export function buildGraticule(radius: number, latStep = 30, lngStep = 30, resolution = 4): Float32Array {
  const verts: number[] = [];

  const pushArc = (sample: (t: number) => [number, number]) => {
    let prev: ReturnType<typeof latLngToVector3> | null = null;
    const steps = 360 / resolution;
    for (let i = 0; i <= steps; i++) {
      const [lat, lng] = sample(i / steps);
      const p = latLngToVector3(lat, lng, radius);
      if (prev) verts.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
      prev = p;
    }
  };

  // Parallels (constant latitude).
  for (let lat = -90 + latStep; lat < 90; lat += latStep) {
    pushArc((t) => [lat, -180 + t * 360]);
  }
  // Meridians (constant longitude).
  for (let lng = -180; lng < 180; lng += lngStep) {
    pushArc((t) => [-90 + t * 180, lng]);
  }

  return new Float32Array(verts);
}
