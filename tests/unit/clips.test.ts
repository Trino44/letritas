import { describe, expect, it } from 'vitest';
import { allClips, letterExample, syllableClip } from '@/content/clips';
import { findLetter } from '@/content/letters';
import { SYLLABLE_GROUPS } from '@/content/syllables';

describe('clips de audio', () => {
  const all = allClips().flatMap((s) => s.clips);

  it('cada id aparece una sola vez y es un nombre de archivo válido', () => {
    const ids = all.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('la A y la a comparten audio', () => {
    expect(letterExample(findLetter('A')!).id).toBe(
      letterExample(findLetter('a-min')!).id
    );
  });

  it('las palabras contienen su sílaba (al inicio, salvo grupos como la RR)', () => {
    const plain = (w: string) =>
      w.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const g of SYLLABLE_GROUPS) {
      for (const s of g.syllables) {
        if (g.medial) expect(plain(s.word)).toContain(s.text);
        else expect(s.word.startsWith(s.text)).toBe(true);
        expect(syllableClip(s).id).toBe(`silaba-${s.text}`);
      }
      for (const s of g.inverse ?? []) {
        expect(plain(s.word)).toContain(s.text);
      }
    }
  });
});
