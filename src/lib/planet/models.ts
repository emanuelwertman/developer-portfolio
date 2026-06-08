import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Low-poly scenery scattered across the land. Each builder returns a single
// grouped geometry plus a matching ordered material array, so the whole model
// renders from one InstancedMesh. Sizes are tuned for a planet of radius ~1.

export interface PlanetModel {
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
}

const flat = (color: string, roughness = 0.95) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true });

// Trees are built at their original proportions, then scaled up uniformly about
// the origin (their base sits at y≈0, so they stay seated on the ground). Fewer
// of them are scattered now, so each one is bigger and reads as a real landmark.
const TREE_SCALE = 1.9;

/** Conifer: a thin trunk under two stacked cones. */
export function makePine(): PlanetModel {
  const trunk = new THREE.CylinderGeometry(0.004, 0.005, 0.014, 5);
  trunk.translate(0, 0.007, 0);
  const lower = new THREE.ConeGeometry(0.018, 0.032, 7);
  lower.translate(0, 0.03, 0);
  const upper = new THREE.ConeGeometry(0.013, 0.026, 7);
  upper.translate(0, 0.046, 0);
  const geometry = mergeGeometries([trunk, lower, upper], true);
  geometry.scale(TREE_SCALE, TREE_SCALE, TREE_SCALE);
  return {
    geometry,
    materials: [flat('#6b4f3a', 1), flat('#3f6f57', 0.9), flat('#4f8268', 0.9)],
  };
}

/** Broadleaf: a short trunk topped with a faceted rounded canopy. */
export function makeLeafyTree(): PlanetModel {
  // The canopy (Icosahedron) is non-indexed while the trunk (Cylinder) is
  // indexed; mergeGeometries needs them consistent, so drop the trunk's index.
  const trunk = new THREE.CylinderGeometry(0.005, 0.006, 0.018, 5).toNonIndexed();
  trunk.translate(0, 0.009, 0);
  const canopy = new THREE.IcosahedronGeometry(0.018, 0);
  canopy.scale(1, 0.9, 1);
  canopy.translate(0, 0.032, 0);
  const geometry = mergeGeometries([trunk, canopy], true);
  geometry.scale(TREE_SCALE, TREE_SCALE, TREE_SCALE);
  return {
    geometry,
    materials: [flat('#7a5a3c', 1), flat('#4f8a3a', 0.85)],
  };
}

/** A single faceted boulder, squashed a little so it sits low. */
export function makeRock(): PlanetModel {
  const rock = new THREE.IcosahedronGeometry(0.012, 0);
  rock.scale(1.2, 0.7, 1);
  rock.translate(0, 0.006, 0);
  return {
    geometry: rock,
    materials: [flat('#7d7468', 0.95)],
  };
}
