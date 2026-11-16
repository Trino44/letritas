import { describe, expect, it } from 'vitest';
import { findSyllableGroup, SYLLABLE_GROUPS } from '@/content/syllables';
import { isCorrect, makeSyllableBuild, makeWordBuild } from '@/games/build';
import { BLANK, makeCompleteRounds } from '@/games/complete';
import { closeOpen, flip, isFinished, newMemoryGame } from '@/games/memory';

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

describe('memoria', () => {
  const items = [
    { key: 'sa', label: 'sa', emoji: '🐸' },
    { key: 'se', label: 'se', emoji: '🚦' },
    { key: 'si', label: 'si', emoji: '🪑' },
    { key: 'so', label: 'so', emoji: '🍲' },
    { key: 'su', label: 'su', emoji: '🧥' },
  ];

  it('arma 4 parejas: imagen y texto de cada una', () => {
    const g = newMemoryGame(items, 4, seeded(2));
    expect(g.cards).toHaveLength(8);
    const keys = new Set(g.cards.map((c) => c.key));
    expect(keys.size).toBe(4);
    for (const k of keys) {
      expect(
        g.cards
          .filter((c) => c.key === k)
          .map((c) => c.face)
          .sort()
      ).toEqual(['image', 'text']);
    }
  });

  it('pareja correcta, incorrecta y fin de juego', () => {
    let g = newMemoryGame(items, 2, seeded(5));
    const [k1, k2] = [...new Set(g.cards.map((c) => c.key))];
    let r = flip(g, `${k1}-img`);
    expect(r.result).toBe('first');
    r = flip(r.state, `${k2}-txt`);
    expect(r.result).toBe('nomatch');
    expect(flip(r.state, `${k2}-img`).result).toBe('ignored'); // hay dos abiertas
    g = closeOpen(r.state);
    g = flip(g, `${k1}-img`).state;
    r = flip(g, `${k1}-txt`);
    expect(r.result).toBe('match');
    expect(flip(r.state, `${k1}-img`).result).toBe('ignored'); // ya encontrada
    g = flip(r.state, `${k2}-img`).state;
    g = flip(g, `${k2}-txt`).state;
    expect(isFinished(g)).toBe(true);
    expect(g.moves).toBe(3);
  });

  it('no cuenta voltear la misma tarjeta dos veces', () => {
    const g = newMemoryGame(items, 2, seeded(1));
    const id = g.cards[0].id;
    const r = flip(flip(g, id).state, id);
    expect(r.result).toBe('ignored');
  });
});

describe('armar sílabas', () => {
  const m = findSyllableGroup('m')!;

  it('cada ronda trae la consonante, la vocal y distractores', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (const r of makeSyllableBuild(m, ['S', 'P', 'L'], 5, seeded(seed))) {
        expect(r.answer[0]).toBe('m');
        expect(r.answer.join('')).toBe(r.target);
        for (const piece of r.answer) expect(r.tiles).toContain(piece);
        expect(r.tiles).toHaveLength(5);
        expect(new Set(r.tiles).size).toBe(5);
      }
    }
  });

  it('valida el orden', () => {
    const [r] = makeSyllableBuild(m, ['S'], 1, seeded(3));
    expect(isCorrect(r, r.answer)).toBe(true);
    expect(isCorrect(r, [...r.answer].reverse())).toBe(false);
    expect(isCorrect(r, [r.answer[0]])).toBe(false);
  });
});

describe('armar palabras', () => {
  it('las partes de cada palabra forman la palabra', () => {
    for (const g of SYLLABLE_GROUPS) {
      for (const s of g.syllables) {
        if (s.parts) expect(s.parts.join('')).toBe(s.word);
      }
    }
  });

  it('cada grupo tiene al menos 3 palabras para armar', () => {
    for (const g of SYLLABLE_GROUPS) {
      expect(g.syllables.filter((s) => s.parts).length).toBeGreaterThanOrEqual(
        3
      );
    }
  });

  it('las piezas incluyen la respuesta y distractores que no son parte', () => {
    const p = findSyllableGroup('p')!;
    for (const r of makeWordBuild(p, 4, seeded(9))) {
      for (const piece of r.answer) expect(r.tiles).toContain(piece);
      const extra = r.tiles.filter((t) => !r.answer.includes(t));
      expect(extra).toHaveLength(2);
    }
  });
});

describe('completa la palabra', () => {
  it('oculta una sílaba y la ofrece entre 3 opciones distintas', () => {
    for (const g of SYLLABLE_GROUPS) {
      for (let seed = 1; seed < 15; seed++) {
        for (const r of makeCompleteRounds(g, 4, seeded(seed))) {
          expect(r.prompt).toContain(BLANK);
          expect(r.prompt.replace(BLANK, r.answer)).toBe(r.word);
          expect(r.options).toContain(r.answer);
          expect(r.options).toHaveLength(3);
          expect(new Set(r.options).size).toBe(3);
        }
      }
    }
  });
});
