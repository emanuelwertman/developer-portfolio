import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import { usePortfolio } from '../state/store';
import { getPlanet } from './planetInstance';
import type { PlanetModel } from '../lib/planet';
import { Markers } from './Markers';

/**
 * One InstancedMesh of a single low-poly model (pine, tree, or rock). Models
 * whose geometry has material groups render with the full material array; a
 * single-material model (the rock) uses its one material directly.
 */
function Scenery({ model, matrices }: { model: PlanetModel; matrices: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  if (matrices.length === 0) return null;
  const material = (model.materials.length === 1 ? model.materials[0] : model.materials) as THREE.Material;

  return (
    <instancedMesh ref={ref} args={[model.geometry, material, matrices.length]} frustumCulled={false} />
  );
}

/**
 * The tiny planet: a faceted, biome-coloured terrain shell, a translucent sea
 * that gently swells, and instanced low-poly scenery — all parented to one
 * group (with the project markers) so they rotate together. The group spins
 * slowly only while idle on the home station.
 */
export function Globe() {
  const group = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const planet = useMemo(getPlanet, []);
  const reduced = useReducedMotion();

  useFrame((state, delta) => {
    const { activeStation, activeProject } = usePortfolio.getState();
    if (group.current && activeStation === 'home' && !activeProject) {
      group.current.rotation.y += delta * 0.045;
    }
    // A barely-there swell so the sea reads as alive, not a frozen shell.
    if (waterRef.current && !reduced) {
      waterRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.004);
    }
  });

  return (
    <group ref={group} scale={0.88}>
      {/* Terrain — per-vertex biome colours, flat-shaded for hard facets. */}
      <mesh geometry={planet.terrainGeometry}>
        <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0} />
      </mesh>

      {/* Sea */}
      <mesh ref={waterRef} geometry={planet.waterGeometry} renderOrder={1}>
        <meshStandardMaterial
          color={PLANET.water}
          transparent
          opacity={0.84}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* Low-poly scenery */}
      <Scenery model={planet.models.pine} matrices={planet.scatter.pines} />
      <Scenery model={planet.models.tree} matrices={planet.scatter.trees} />
      <Scenery model={planet.models.rock} matrices={planet.scatter.rocks} />

      <Markers />
    </group>
  );
}
