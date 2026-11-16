/**
 * Lógica de "Completa la palabra": se ve 🐸 y "＿po"; el niño elige la
 * sílaba que falta ("sa"). Sin React.
 */

import type { SyllableGroup } from '@/content/syllables';
import type { Rng } from './listenAndTap';

export const BLANK = '＿';

export interface CompleteRound {
  word: string;
  emoji: string;
  /** La palabra con la sílaba que falta, p. ej. "＿po". */
  prompt: string;
  answer: string;
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
 * Para cada palabra con partes oculta una sílaba (la mayoría de las veces la
 * del grupo, que es la que se practica) y ofrece dos sílabas más del grupo.
 */
export function makeCompleteRounds(
  group: SyllableGroup,
  count: number,
  rng: Rng = Math.random
): CompleteRound[] {
  const words = shuffle(
    group.syllables.filter((s) => s.parts && s.parts.length >= 2),
    rng
  ).slice(0, count);
  const pool = group.syllables.map((s) => s.text);

  return words.map((s) => {
    const parts = s.parts as string[];
    // Casi siempre se oculta la sílaba que se practica (sa en "sapo", rro
    // en "perro"); a veces otra, para variar.
    const practiced = Math.max(
      0,
      parts.findIndex((p) => pool.includes(p))
    );
    const others = parts.map((_, i) => i).filter((i) => i !== practiced);
    const hide =
      rng() < 0.7 || others.length === 0
        ? practiced
        : others[Math.floor(rng() * others.length)];
    const answer = parts[hide];
    const prompt = parts.map((p, i) => (i === hide ? BLANK : p)).join('');
    const distractors = shuffle(
      pool.filter((p) => p !== answer),
      rng
    ).slice(0, 2);
    return {
      word: s.word,
      emoji: s.emoji,
      prompt,
      answer,
      options: shuffle([answer, ...distractors], rng),
    };
  });
}
