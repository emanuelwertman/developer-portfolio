import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { PROJECT_FOCUS_DISTANCE, STATIONS } from '../lib/stations';
import { useReducedMotion } from '../lib/useReducedMotion';
import { usePortfolio } from '../state/store';

/**
 * Owns the single camera. Drives smooth flights between stations and project
 * focus points, and only allows free orbit while idle on the home station.
 */
export function CameraRig() {
  const controls = useRef<React.ElementRef<typeof CameraControls>>(null);
  const mounted = useRef(false);
  const reduced = useReducedMotion();

  const activeStation = usePortfolio((s) => s.activeStation);
  const activeProject = usePortfolio((s) => s.activeProject);
  const focusTarget = usePortfolio((s) => s.focusTarget);
  const setReady = usePortfolio((s) => s.setReady);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;

    const animate = mounted.current && !reduced;
    mounted.current = true;

    if (activeProject && focusTarget) {
      const t = new THREE.Vector3(...focusTarget);
      const camPos = t.clone().normalize().multiplyScalar(PROJECT_FOCUS_DISTANCE);
      c.setLookAt(camPos.x, camPos.y, camPos.z, t.x, t.y, t.z, animate);
    } else {
      const st = STATIONS[activeStation];
      c.setLookAt(...st.position, ...st.target, animate);
    }

    // Free orbit only on the home station with no project open.
    c.enabled = activeStation === 'home' && !activeProject;

    setReady();
  }, [activeStation, activeProject, focusTarget, reduced, setReady]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.85}
      draggingSmoothTime={0.18}
      minDistance={1.5}
      maxDistance={4.6}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.35}
      dollyToCursor={false}
    />
  );
}
