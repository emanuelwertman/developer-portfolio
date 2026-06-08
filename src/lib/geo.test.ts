import { describe, expect, it } from 'vitest';
import { GLOBE_RADIUS, latLngToTuple, latLngToVector3 } from './geo';

describe('latLngToVector3', () => {
  it('places every point at the requested radius', () => {
    const samples: [number, number][] = [
      [0, 0],
      [45, 90],
      [-33.87, 151.21],
      [90, 0],
      [-90, -180],
    ];
    for (const [lat, lng] of samples) {
      expect(latLngToVector3(lat, lng, 2).length()).toBeCloseTo(2, 5);
    }
  });

  it('defaults to the globe radius', () => {
    expect(latLngToVector3(12, 34).length()).toBeCloseTo(GLOBE_RADIUS, 5);
  });

  it('maps the (0,0) anchor to a stable axis point', () => {
    const v = latLngToVector3(0, 0, 1);
    expect(v.x).toBeCloseTo(1, 5);
    expect(v.y).toBeCloseTo(0, 5);
    expect(v.z).toBeCloseTo(0, 5);
  });

  it('puts the north pole on +Y', () => {
    const v = latLngToVector3(90, 0, 1);
    expect(v.y).toBeCloseTo(1, 5);
  });

  it('tuple form agrees with the vector form', () => {
    const v = latLngToVector3(20, -60, 1.5);
    expect(latLngToTuple(20, -60, 1.5)).toEqual([v.x, v.y, v.z]);
  });
});
