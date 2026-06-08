import { Globe } from './Globe';
import { CameraRig } from './CameraRig';
import { Backdrop } from './Backdrop';

/** Everything that lives inside the R3F canvas. */
export function Scene() {
  return (
    <>
      {/* Dusk-sky backdrop the colourful planet reads against. */}
      <Backdrop />

      {/* Key / fill / ambient tuned to flatter saturated colour and crisp
          facets: a warm sun, a cool sky-bounce fill, and a soft hemisphere. */}
      <hemisphereLight args={['#cfe3ff', '#43608a', 0.6]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.7} color="#fff6e8" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#93b8ff" />

      <Globe />
      <CameraRig />
    </>
  );
}
