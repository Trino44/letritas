/**
 * Lógica del juego "Escucha y toca": suena una sílaba y el niño la elige
 * entre varias opciones. Sin React, para poder probarla.
 */

export interface Round<T> {
  target: T;
  options: T[];
}

export type Rng = () => number;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Crea `count` rondas. Cada objetivo aparece de forma pareja, nunca dos
 * veces seguidas, y las opciones siempre incluyen el objetivo.
 */
export function makeRounds<T>(
  pool: T[],
  count: number,
  optionsPerRound = 3,
  rng: Rng = Math.random
): Round<T>[] {
  if (pool.length < 2) throw new Error('Se necesitan al menos 2 elementos');
  const k = Math.min(optionsPerRound, pool.length);
  const targets: T[] = [];
  while (targets.length < count) {
    let batch = shuffle(pool, rng);
    if (targets.length > 0 && batch[0] === targets[targets.length - 1]) {
      batch = [...batch.slice(1), batch[0]];
    }
    targets.push(...batch);
  }
  return targets.slice(0, count).map((target) => {
    const others = shuffle(
      pool.filter((p) => p !== target),
      rng
    ).slice(0, k - 1);
    return { target, options: shuffle([target, ...others], rng) };
  });
}
