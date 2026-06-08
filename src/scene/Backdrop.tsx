import { useMemo } from 'react';
import * as THREE from 'three';
import { PLANET } from '../lib/theme';

/**
 * A large inward-facing sphere with a soft vertical gradient — the dusk-sky /
 * space backdrop the planet reads against. Sits behind everything and ignores
 * depth so it never occludes the scene.
 */
export function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color(PLANET.skyTop) },
          bottom: { value: new THREE.Color(PLANET.skyBottom) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vPos;
          uniform vec3 top;
          uniform vec3 bottom;
          void main() {
            float t = clamp(normalize(vPos).y * 0.5 + 0.6, 0.0, 1.0);
            gl_FragColor = vec4(mix(bottom, top, t), 1.0);
          }
        `,
      }),
    [],
  );

  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[50, 32, 16]} />
    </mesh>
  );
}
