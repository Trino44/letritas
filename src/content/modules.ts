/**
 * Cada consonante tiene su propia pantalla con trazado, sílabas y juegos.
 * Para agregar una consonante: sus letras en letters.ts (grupo con el mismo
 * id), sus sílabas en syllables.ts y una entrada aquí.
 */

export type GameKind =
  | 'syllables'
  | 'r-pairs'
  | 'first-letter'
  | 'repeat'
  | 'memory'
  | 'build-syllable'
  | 'build-word'
  | 's-pairs'
  | 'complete-word'
  | 'identify-letter'
  | 'vocab';

/** Juegos que tiene cada consonante (además de los especiales). */
const STANDARD: GameKind[] = [
  'syllables',
  'repeat',
  'memory',
  'build-syllable',
  'build-word',
  'complete-word',
];

export interface ConsonantModule {
  /** Igual al id del grupo de letras y del grupo de sílabas. */
  id: string;
  letter: string;
  title: string;
  games: GameKind[];
}

export const CONSONANT_MODULES: ConsonantModule[] = [
  { id: 's', letter: 'S', title: 'La S', games: [...STANDARD, 's-pairs'] },
  { id: 'r', letter: 'R', title: 'La R', games: [...STANDARD, 'r-pairs'] },
  { id: 'm', letter: 'M', title: 'La M', games: STANDARD },
  { id: 'p', letter: 'P', title: 'La P', games: STANDARD },
  { id: 'l', letter: 'L', title: 'La L', games: STANDARD },
  { id: 't', letter: 'T', title: 'La T', games: STANDARD },
  { id: 'd', letter: 'D', title: 'La D', games: STANDARD },
  { id: 'n', letter: 'N', title: 'La N', games: STANDARD },
  { id: 'f', letter: 'F', title: 'La F', games: STANDARD },
  { id: 'b', letter: 'B', title: 'La B', games: STANDARD },
];

export function findModule(id: string): ConsonantModule | undefined {
  return CONSONANT_MODULES.find((m) => m.id === id);
}

/** Módulo al que pertenece una letra (p. ej. "s-min" → módulo "s"). */
export function moduleOfLetter(letterId: string): ConsonantModule | undefined {
  const base = letterId.replace(/-min$/, '').toLowerCase();
  return findModule(base);
}
