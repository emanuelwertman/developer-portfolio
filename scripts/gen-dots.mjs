// Generates a dot-matrix point cloud of Earth's landmasses.
//
// Downloads Natural Earth land geometry (world-atlas land-110m), then samples a
// near-uniform lat/lng grid over the sphere, keeping only points that fall on
// land. The output is a compact JSON array of [lat, lng] pairs consumed at
// runtime by the Globe component. Run with: npm run gen:dots
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const SOURCE = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';
const OUT = fileURLToPath(new URL('../src/data/globe-dots.json', import.meta.url));

// Angular spacing between sampled rings (degrees). Smaller => denser globe.
const STEP = 1.9;

async function main() {
  console.log('Fetching land topology…');
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const topo = await res.json();
  const land = feature(topo, topo.objects.land);

  console.log('Sampling land points…');
  const dots = [];
  for (let lat = -90 + STEP / 2; lat < 90; lat += STEP) {
    // Keep east-west density roughly even by scaling the count with cos(lat).
    const circumferenceFactor = Math.max(Math.cos((lat * Math.PI) / 180), 1e-6);
    const lngStep = STEP / circumferenceFactor;
    for (let lng = -180; lng < 180; lng += lngStep) {
      if (geoContains(land, [lng, lat])) {
        dots.push([Math.round(lat * 100) / 100, Math.round(lng * 100) / 100]);
      }
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(dots));
  console.log(`Wrote ${dots.length} land dots to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
