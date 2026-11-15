import { describe, expect, it } from 'vitest';
import { ALL_LETTERS, nextLetter } from '@/content/letters';
import { samplePath } from '@/engine/path';

describe('plantillas de letras', () => {
  it('los ids son únicos', () => {
    const ids = ALL_LETTERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const letter of ALL_LETTERS) {
    it(`${letter.id}: trazos válidos y dentro de la caja`, () => {
      expect(letter.strokes.length).toBeGreaterThan(0);
      for (const s of letter.strokes) {
        const pts = s.type === 'line' ? samplePath(s.d).points : [s.at];
        if (s.type === 'line')
          expect(samplePath(s.d).length).toBeGreaterThan(5);
        for (const p of pts) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(100);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(100);
        }
      }
    });
  }

  it('nextLetter da la vuelta dentro del grupo', () => {
    expect(nextLetter('A')?.id).toBe('E');
    expect(nextLetter('U')?.id).toBe('A');
  });
});
