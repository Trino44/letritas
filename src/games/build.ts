/**
 * Lógica de "Arma la sílaba" (m + a = ma) y "Arma la palabra"
 * (sa + po = sapo). Sin React.
 */

import type { SyllableDef, SyllableGroup } from '@/content/syllables';
import type { Rng } from './listenAndTap';

export interface BuildRound {
  /** Lo que se forma, p. ej. "ma" o "sapo". */
  target: string;
  /** Piezas en orden correcto. */
  answer: string[];
  /** Piezas a elegir, revueltas (incluye las correctas). */
  tiles: string[];
  emoji: string;
  /** Palabra completa (para el audio de premio). */
  word: string;
}

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sílabas: la consonante del grupo y otra consonante como distractor, más
 * la vocal correcta y dos vocales más.
 */
export function makeSyllableBuild(
  group: SyllableGroup,
  otherConsonants: string[],
  count: number,
  rng: Rng = Math.random
): BuildRound[] {
  const consonant = group.letter.toLowerCase();
  const others = otherConsonants
    .map((c) => c.toLowerCase())
    .filter((c) => c !== consonant);
  const picked = shuffle(group.syllables, rng).slice(
    0,
    Math.min(count, group.syllables.length)
  );
  return picked.map((s: SyllableDef) => {
    const vowel = s.text.slice(consonant.length);
    const distractor = others.length ? shuffle(others, rng)[0] : null;
    const otherVowels = shuffle(
      VOWELS.filter((v) => v !== vowel),
      rng
    ).slice(0, 2);
    const tiles = shuffle(
      [consonant, ...(distractor ? [distractor] : []), vowel, ...otherVowels],
      rng
    );
    return {
      target: s.text,
      answer: [consonant, vowel],
      tiles,
      emoji: s.emoji,
      word: s.word,
    };
  });
}

/** Palabras: sus sílabas más dos sílabas del grupo que no están en la palabra. */
export function makeWordBuild(
  group: SyllableGroup,
  count: number,
  rng: Rng = Math.random
): BuildRound[] {
  const words = shuffle(
    group.syllables.filter((s) => s.parts && s.parts.length >= 2),
    rng
  ).slice(0, count);
  const pool = group.syllables.map((s) => s.text);
  return words.map((s) => {
    const parts = s.parts as string[];
    const distractors = shuffle(
      pool.filter((p) => !parts.includes(p)),
      rng
    ).slice(0, 2);
    return {
      target: s.word,
      answer: parts,
      tiles: shuffle([...parts, ...distractors], rng),
      emoji: s.emoji,
      word: s.word,
    };
  });
}

/** Compara lo armado con la respuesta. */
export function isCorrect(round: BuildRound, placed: string[]): boolean {
  return (
    placed.length === round.answer.length &&
    placed.every((p, i) => p === round.answer[i])
  );
}
