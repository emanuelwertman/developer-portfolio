// Camera "stations": fixed viewpoints the camera flies between as the user
// navigates. Each section of the portfolio maps to one station. The globe
// itself never moves — only the camera orbits around it.

export type StationId = 'home' | 'about' | 'skills' | 'contact';

export interface Station {
  id: StationId;
  label: string;
  /** Camera world position. */
  position: [number, number, number];
  /** Point the camera looks at. Offsetting this nudges the globe to one side
   *  of the screen so an overlay panel has room to breathe. */
  target: [number, number, number];
}

/** Spherical → cartesian helper (phi measured from the +Y axis). */
function orbit(theta: number, phi: number, r: number): [number, number, number] {
  return [
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.cos(theta),
  ];
}

export const STATIONS: Record<StationId, Station> = {
  home: {
    id: 'home',
    label: 'Home',
    position: orbit(0.45, 1.36, 3.6),
    target: [0, 0, 0],
  },
  about: {
    id: 'about',
    label: 'About',
    // Globe shifts left; About panel sits on the right.
    position: orbit(2.25, 1.22, 2.95),
    target: [0.72, 0.02, 0],
  },
  skills: {
    id: 'skills',
    label: 'Skills',
    // Globe shifts right; Skills panel sits on the left.
    position: orbit(4.15, 1.5, 2.95),
    target: [-0.72, 0.06, 0],
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    // Globe lifts up; Contact panel sits below.
    position: orbit(5.75, 1.12, 2.9),
    target: [0, 0.55, 0],
  },
};

export const STATION_ORDER: StationId[] = ['home', 'about', 'skills', 'contact'];

/** Distance from globe centre the camera pulls back to when focusing a marker. */
export const PROJECT_FOCUS_DISTANCE = 1.95;
