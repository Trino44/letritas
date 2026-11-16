/**
 * Cada consonante tiene su propia pantalla con trazado, sílabas y juegos.
 * Para agregar una consonante: sus letras en letters.ts (grupo con el mismo
 * id), sus sílabas en syllables.ts y una entrada aquí.
 */

export type GameKind = 'syllables' | 'r-pairs';

export interface ConsonantModule {
  /** Igual al id del grupo de letras y del grupo de sílabas. */
  id: string;
  letter: string;
  title: string;
  games: GameKind[];
}

export const CONSONANT_MODULES: ConsonantModule[] = [
  { id: 's', letter: 'S', title: 'La S', games: ['syllables'] },
  { id: 'r', letter: 'R', title: 'La R', games: ['syllables', 'r-pairs'] },
];

export function findModule(id: string): ConsonantModule | undefined {
  return CONSONANT_MODULES.find((m) => m.id === id);
}

/** Módulo al que pertenece una letra (p. ej. "s-min" → módulo "s"). */
export function moduleOfLetter(letterId: string): ConsonantModule | undefined {
  const base = letterId.replace(/-min$/, '').toLowerCase();
  return findModule(base);
}
