import { describe, expect, it } from 'vitest';
import { pictureWords } from '@/games/catalog';
import { makeFirstLetterRounds, type PictureWord } from '@/games/firstLetter';

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const words: PictureWord[] = [
  { word: 'abeja', emoji: '🐝', letter: 'A' },
  { word: 'oso', emoji: '🐻', letter: 'O' },
  { word: 'sapo', emoji: '🐸', letter: 'S' },
  { word: 'sol', emoji: '☀️', letter: 'S' },
  { word: 'rosa', emoji: '🌹', letter: 'R' },
  { word: 'rey', emoji: '👑', letter: 'R' },
];

describe('makeFirstLetterRounds', () => {
  it('cada ronda trae 3 letras distintas con la correcta', () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const r of makeFirstLetterRounds(words, 5, 3, seeded(seed))) {
        expect(r.options).toHaveLength(3);
        expect(new Set(r.options).size).toBe(3);
        expect(r.options).toContain(r.item.letter);
      }
    }
  });

  it('no repite palabra ni letra seguida cuando se puede', () => {
    for (let seed = 1; seed < 30; seed++) {
      const rounds = makeFirstLetterRounds(words, 5, 3, seeded(seed));
      expect(new Set(rounds.map((r) => r.item.word)).size).toBe(5);
      for (let i = 1; i < rounds.length; i++) {
        expect(rounds[i].item.letter).not.toBe(rounds[i - 1].item.letter);
      }
    }
  });
});

describe('palabras con imagen del contenido', () => {
  it('cada palabra empieza con su letra y no se repite', () => {
    const list = pictureWords();
    expect(list.length).toBeGreaterThanOrEqual(15);
    expect(new Set(list.map((w) => w.word)).size).toBe(list.length);
    for (const w of list) {
      const first = w.word.normalize('NFD').replace(/[̀-ͯ]/g, '')[0];
      expect(first.toUpperCase()).toBe(w.letter);
    }
  });
});
