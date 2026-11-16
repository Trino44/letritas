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

/**
 * Rondas con pares (p. ej. pera / perra): en cada ronda se muestran las dos
 * palabras del par y suena una de ellas al azar. Recorre los pares de forma
 * pareja y no repite la misma palabra dos veces seguidas.
 */
export function makePairRounds<T>(
  pairs: [T, T][],
  count: number,
  rng: Rng = Math.random
): Round<T>[] {
  if (pairs.length === 0) throw new Error('Se necesita al menos un par');
  const order: [T, T][] = [];
  while (order.length < count) order.push(...shuffle(pairs, rng));
  const rounds: Round<T>[] = [];
  for (const pair of order.slice(0, count)) {
    let target = rng() < 0.5 ? pair[0] : pair[1];
    const prev = rounds[rounds.length - 1]?.target;
    if (target === prev) target = target === pair[0] ? pair[1] : pair[0];
    rounds.push({ target, options: shuffle([pair[0], pair[1]], rng) });
  }
  return rounds;
}
