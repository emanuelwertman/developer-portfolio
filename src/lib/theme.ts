// Shared palette for the 3D scene. Keep in sync with the CSS variables in
// styles/global.css so the canvas and DOM read as one surface.
export const COLORS = {
  paper: '#ece7da', // page / background
  globeBody: '#e1dac8', // occluding sphere, a touch darker than paper
  ink: '#222a38', // land dots & text
  accent: '#d8552f', // vermilion — markers & highlights
  graticule: '#8a94a6', // subtle blue-grey lat/lng lines
} as const;

// The tiny-planet's own palette: a translucent sea, and the two-tone gradient
// sky/space backdrop the planet reads against. Land/biome colours live with the
// terrain in lib/planet/biome.ts; scenery colours live in lib/planet/models.ts.
export const PLANET = {
  water: '#1f6f9c', // stylised sea shell
  waterDeep: '#0b3b66', // sea seen edge-on / in shadow
  skyTop: '#10131f', // backdrop near the top — deep dusk
  skyBottom: '#2a3350', // backdrop near the horizon — lighter blue-grey
} as const;
