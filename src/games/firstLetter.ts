/**
 * Lógica del juego "¿Con qué empieza?": aparece una imagen, se oye su
 * palabra y el niño elige la letra con la que empieza. Sin React.
 */

import type { Round, Rng } from './listenAndTap';

export interface PictureWord {
  word: string;
  emoji: string;
  /** Letra inicial en mayúscula, como se muestra en la opción. */
  letter: string;
}

export interface FirstLetterRound {
  item: PictureWord;
  /** Letras a elegir; incluye la correcta. */
  options: string[];
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Elige `count` palabras distintas (sin repetir letra dos veces seguidas
 * cuando se puede) y para cada una arma opciones con letras distintas.
 */
export function makeFirstLetterRounds(
  words: PictureWord[],
  count: number,
  optionsPerRound = 3,
  rng: Rng = Math.random
): FirstLetterRound[] {
  const letters = [...new Set(words.map((w) => w.letter))];
  if (letters.length < 2)
    throw new Error('Se necesitan palabras de al menos 2 letras');
  const k = Math.min(optionsPerRound, letters.length);

  const pool = shuffle(words, rng);
  const chosen: PictureWord[] = [];
  while (chosen.length < count && pool.length > 0) {
    const prev = chosen[chosen.length - 1]?.letter;
    const idx = pool.findIndex((w) => w.letter !== prev);
    chosen.push(pool.splice(idx >= 0 ? idx : 0, 1)[0]);
  }

  return chosen.map((item) => {
    const others = shuffle(
      letters.filter((l) => l !== item.letter),
      rng
    ).slice(0, k - 1);
    return { item, options: shuffle([item.letter, ...others], rng) };
  });
}

/** Adaptador al formato de rondas del juego genérico. */
export function toChoiceRounds<T>(
  rounds: FirstLetterRound[],
  toItem: (letter: string, picture: PictureWord | null) => T
): Round<T>[] {
  return rounds.map((r) => ({
    target: toItem(r.item.letter, r.item),
    options: r.options.map((l) => toItem(l, null)),
  }));
}
