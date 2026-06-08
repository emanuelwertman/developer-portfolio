import { describe, expect, it } from 'vitest';
import { PROJECT_FOCUS_DISTANCE, STATIONS, STATION_ORDER } from './stations';

describe('camera stations', () => {
  it('defines one station per ordered id', () => {
    expect(STATION_ORDER).toHaveLength(4);
    for (const id of STATION_ORDER) {
      expect(STATIONS[id]).toBeDefined();
      expect(STATIONS[id].id).toBe(id);
    }
  });

  it('keeps every camera position finite and outside the globe', () => {
    for (const id of STATION_ORDER) {
      const [x, y, z] = STATIONS[id].position;
      const dist = Math.hypot(x, y, z);
      expect(Number.isFinite(dist)).toBe(true);
      expect(dist).toBeGreaterThan(1); // never inside the unit globe
      expect(dist).toBeLessThan(4.6); // within camera-controls max distance
    }
  });

  it('focuses markers from outside the globe surface', () => {
    expect(PROJECT_FOCUS_DISTANCE).toBeGreaterThan(1);
    expect(PROJECT_FOCUS_DISTANCE).toBeLessThan(4);
  });
});
