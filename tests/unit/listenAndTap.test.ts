import { describe, expect, it } from 'vitest';
import { makeRounds } from '@/games/listenAndTap';

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

describe('makeRounds', () => {
  const pool = ['sa', 'se', 'si', 'so', 'su'];

  it('crea el número de rondas pedido con 3 opciones que incluyen el objetivo', () => {
    const rounds = makeRounds(pool, 5, 3, seeded(1));
    expect(rounds).toHaveLength(5);
    for (const r of rounds) {
      expect(r.options).toHaveLength(3);
      expect(r.options).toContain(r.target);
      expect(new Set(r.options).size).toBe(3);
    }
  });

  it('en 5 rondas usa las 5 sílabas una vez', () => {
    const rounds = makeRounds(pool, 5, 3, seeded(7));
    expect(new Set(rounds.map((r) => r.target)).size).toBe(5);
  });

  it('nunca repite el objetivo dos veces seguidas', () => {
    for (let seed = 1; seed < 50; seed++) {
      const rounds = makeRounds(pool, 15, 3, seeded(seed));
      for (let i = 1; i < rounds.length; i++) {
        expect(rounds[i].target).not.toBe(rounds[i - 1].target);
      }
    }
  });

  it('rechaza un grupo de un solo elemento', () => {
    expect(() => makeRounds(['sa'], 3)).toThrow();
  });
});
