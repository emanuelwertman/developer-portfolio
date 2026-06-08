import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';
import { Overlay } from './ui/Overlay';
import { Loader } from './ui/Loader';
import { Fallback } from './ui/Fallback';
import { isWebGLAvailable } from './lib/webgl';

export default function App() {
  const [webglOk] = useState(isWebGLAvailable);

  if (!webglOk) return <Fallback />;

  return (
    <div className="stage">
      <Canvas
        className="canvas"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38, position: [0, 0, 2.75], near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
      <Loader />
    </div>
  );
}
