import * as THREE from 'three';
import type { TerrainField } from './field';

// Turns a TerrainField into a renderable mesh: a subdivided icosphere whose
// vertices are pushed out to the terrain surface and coloured per-face. Three's
// IcosahedronGeometry is already non-indexed (no shared vertices), so giving
// every face one flat colour and recomputing normals yields the hard-edged,
// low-poly facets that define the tiny-planet look.

export function buildTerrainGeometry(field: TerrainField, detail = 6): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  const dir = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const color = new THREE.Color();

  // Displace every vertex out to the terrain surface.
  for (let i = 0; i < count; i++) {
    dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    const r = field.heightAt(dir).radius;
    pos.setXYZ(i, dir.x * r, dir.y * r, dir.z * r);
  }

  // One colour per triangle, sampled at the face centroid's direction.
  for (let f = 0; f < count; f += 3) {
    a.set(pos.getX(f), pos.getY(f), pos.getZ(f));
    b.set(pos.getX(f + 1), pos.getY(f + 1), pos.getZ(f + 1));
    c.set(pos.getX(f + 2), pos.getY(f + 2), pos.getZ(f + 2));
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    field.colorAt(centroid, color);
    for (let v = 0; v < 3; v++) {
      colors[(f + v) * 3] = color.r;
      colors[(f + v) * 3 + 1] = color.g;
      colors[(f + v) * 3 + 2] = color.b;
    }
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  pos.needsUpdate = true;
  return geo;
}

/**
 * The translucent water shell: a smooth icosphere at sea level. Returned with a
 * morph target so the surface can gently bob (see Globe).
 */
export function buildWaterGeometry(waterRadius: number, detail = 4): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(waterRadius, detail);
  geo.computeVertexNormals();
  return geo;
}
