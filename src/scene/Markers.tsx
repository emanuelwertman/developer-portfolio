import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import { projects, type Project } from '../data/content';
import { usePortfolio } from '../state/store';
import { getPlanet } from './planetInstance';

const OUT = new THREE.Vector3(0, 0, 1);

// Minimum angular gap (radians) enforced between project markers, so they sit on
// separate peaks rather than clustering on one summit. ~0.6 rad ≈ 34°.
const MIN_PEAK_SEPARATION = 0.6;

function Marker({ project, index, anchor }: { project: Project; index: number; anchor: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pingRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  const openProject = usePortfolio((s) => s.openProject);
  const activeProject = usePortfolio((s) => s.activeProject);
  const isActive = activeProject?.id === project.id;

  const { position, quaternion } = useMemo(() => {
    // Seat the marker on the terrain surface at its peak anchor, hovering just
    // above the ground so the ping ring clears any scenery.
    const dir = anchor.clone().normalize();
    const r = getPlanet().field.surfaceRadius(dir) - 0.014;
    const p = dir.multiplyScalar(r);
    const q = new THREE.Quaternion().setFromUnitVectors(OUT, p.clone().normalize());
    return { position: p, quaternion: q };
  }, [anchor]);

  const worldPos = useRef(new THREE.Vector3());
  const toCam = useRef(new THREE.Vector3());

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;

    // Hide markers on the far side of the globe so they're neither seen nor clickable.
    g.getWorldPosition(worldPos.current);
    toCam.current.copy(state.camera.position).sub(worldPos.current);
    const facing = worldPos.current.dot(toCam.current) > 0;
    g.visible = facing;

    // Labels are only offered on the home view, and only for near-side markers.
    const { activeStation, activeProject: open } = usePortfolio.getState();
    const showLabel = facing && activeStation === 'home' && !open;
    if (labelRef.current) {
      labelRef.current.style.opacity = showLabel ? '1' : '0';
      labelRef.current.style.pointerEvents = showLabel ? 'auto' : 'none';
    }

    const t = reduced ? 0.5 : (Math.sin(state.clock.elapsedTime * 2 + position.x) + 1) / 2;
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      ringRef.current.scale.setScalar(1 + t * 0.8);
      mat.opacity = (isActive || hovered ? 0.85 : 0.65) * (1 - t * 0.6);
    }

    // Expanding radar "ping" to advertise that markers are interactive.
    if (pingRef.current) {
      const mat = pingRef.current.material as THREE.MeshBasicMaterial;
      if (reduced) {
        pingRef.current.scale.setScalar(1.8);
        mat.opacity = 0.18;
      } else {
        const cycle = (state.clock.elapsedTime * 0.7 + index * 0.45) % 1;
        pingRef.current.scale.setScalar(1 + cycle * 3.4);
        mat.opacity = 0.5 * (1 - cycle);
      }
    }
  });

  const focusHere = () => {
    const wp = new THREE.Vector3();
    groupRef.current?.getWorldPosition(wp);
    document.body.style.cursor = '';
    openProject(project, [wp.x, wp.y, wp.z]);
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const handleOut = () => {
    setHovered(false);
    document.body.style.cursor = '';
  };

  const headScale = hovered || isActive ? 1.45 : 1;

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      {/* Radar ping — flat on the ground, advertises the spot */}
      <mesh ref={pingRef} renderOrder={1}>
        <ringGeometry args={[0.022, 0.034, 40]} />
        <meshBasicMaterial color={COLORS.accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Steady pulse ring at the pin's base */}
      <mesh ref={ringRef} renderOrder={2}>
        <ringGeometry args={[0.034, 0.048, 40]} />
        <meshBasicMaterial color={COLORS.accent} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* A raised map pin: a thin pole topped with a ball, standing above the
          terrain and scenery so it's unmistakably a clickable target. The whole
          pin is parented to one group scaled on hover; +Z is the surface normal. */}
      <group
        scale={headScale}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          focusHere();
        }}
      >
        {/* Pole */}
        <mesh position={[0, 0, 0.038]} rotation={[Math.PI / 2, 0, 0]} renderOrder={3}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.076, 8]} />
          <meshStandardMaterial color={COLORS.accent} roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0, 0.086]} renderOrder={4}>
          <sphereGeometry args={[0.018, 20, 20]} />
          <meshStandardMaterial
            color={COLORS.accent}
            emissive={COLORS.accent}
            emissiveIntensity={hovered || isActive ? 0.5 : 0.25}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {/* Generous invisible hit cylinder covering the whole pin */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <cylinderGeometry args={[0.05, 0.05, 0.13, 12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Persistent, clickable label — floats beside the pin head */}
      <Html position={[0, 0, 0.1]} zIndexRange={[20, 0]} style={{ transition: 'opacity 0.4s ease' }}>
        <div
          ref={labelRef}
          className={`marker-tag${hovered || isActive ? ' is-hot' : ''}`}
          role="button"
          tabIndex={0}
          onClick={focusHere}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && focusHere()}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <span className="marker-tag__num">{String(index + 1).padStart(2, '0')}</span>
          <span className="marker-tag__name">{project.name}</span>
          <span className="marker-tag__cta" aria-hidden>
            View ↗
          </span>
        </div>
      </Html>
    </group>
  );
}

export function Markers() {
  // Anchor every project to one of the planet's tallest peaks, keeping them a
  // minimum distance apart. Deterministic for the loaded seed.
  const anchors = useMemo(
    () => getPlanet().getPeakAnchors(projects.length, MIN_PEAK_SEPARATION),
    [],
  );

  return (
    <>
      {projects.map((p, i) => (
        <Marker key={p.id} project={p} index={i} anchor={anchors[i]} />
      ))}
    </>
  );
}
