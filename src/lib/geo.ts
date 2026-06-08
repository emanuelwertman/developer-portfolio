import * as THREE from 'three';

/** Default radius of the globe in world units. */
export const GLOBE_RADIUS = 1;

/**
 * Convert geographic coordinates to a point on a sphere of the given radius.
 *
 * Uses the standard equirectangular mapping. The same function backs both the
 * land dot-cloud and the project markers, so anything placed by lat/lng stays
 * mutually aligned regardless of the sphere's absolute orientation.
 */
export function latLngToVector3(lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Tuple form, handy for tests and serialisable state. */
export function latLngToTuple(lat: number, lng: number, radius = GLOBE_RADIUS): [number, number, number] {
  const v = latLngToVector3(lat, lng, radius);
  return [v.x, v.y, v.z];
}
