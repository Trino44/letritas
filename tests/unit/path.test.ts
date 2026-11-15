import { describe, expect, it } from 'vitest';
import {
  flattenPath,
  indexAtLength,
  pointAtLength,
  samplePath,
} from '@/engine/path';

describe('path', () => {
  it('muestrea una línea recta con puntos equiespaciados', () => {
    const p = samplePath('M0 0 L10 0', 1);
    expect(p.length).toBeCloseTo(10);
    expect(p.points).toHaveLength(11);
    expect(p.points[5]).toEqual({ x: 5, y: 0 });
    expect(p.cumulative[10]).toBeCloseTo(10);
  });

  it('soporta H, V y Z', () => {
    const p = samplePath('M0 0 H10 V10 Z', 1);
    expect(p.length).toBeCloseTo(20 + Math.SQRT2 * 10, 3);
    expect(p.points[p.points.length - 1]).toEqual({ x: 0, y: 0 });
  });

  it('aproxima bien la longitud de un círculo con cúbicas', () => {
    const d =
      'M50 10 C32.3 10 10 27.7 10 50 C10 72.3 27.7 90 50 90 C72.3 90 90 72.3 90 50 C90 27.7 72.3 10 50 10';
    const p = samplePath(d, 1);
    expect(p.length).toBeGreaterThan(2 * Math.PI * 40 * 0.98);
    expect(p.length).toBeLessThan(2 * Math.PI * 40 * 1.02);
  });

  it('rechaza comandos relativos y varios M', () => {
    expect(() => flattenPath('m0 0 l10 0')).toThrow();
    expect(() => flattenPath('M0 0 L1 1 M5 5 L6 6')).toThrow();
  });

  it('encuentra puntos por longitud', () => {
    const p = samplePath('M0 0 L0 20', 1);
    expect(indexAtLength(p, -5)).toBe(0);
    expect(indexAtLength(p, 7)).toBe(7);
    expect(pointAtLength(p, 100)).toEqual({ x: 0, y: 20 });
  });
});
