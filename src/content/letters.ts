import type { LetterDef, LetterGroup } from './types';

/**
 * Plantillas de letras.
 *
 * Para agregar una letra: copia un objeto, cambia el id, los datos y los
 * trazos. Revisa el sistema de coordenadas en ./types.ts. Las pruebas en
 * tests/unit/letters.test.ts validan automáticamente que cada trazo se pueda
 * leer y que quede dentro de la caja.
 */

const A: LetterDef = {
  id: 'A',
  char: 'A',
  spokenName: 'a',
  word: 'abeja',
  emoji: '🐝',
  strokes: [
    { type: 'line', d: 'M50 10 L18 90' },
    { type: 'line', d: 'M50 10 L82 90' },
    { type: 'line', d: 'M30 60 L70 60' },
  ],
};

const E: LetterDef = {
  id: 'E',
  char: 'E',
  spokenName: 'e',
  word: 'elefante',
  emoji: '🐘',
  strokes: [
    { type: 'line', d: 'M30 10 L30 90' },
    { type: 'line', d: 'M30 10 L74 10' },
    { type: 'line', d: 'M30 50 L68 50' },
    { type: 'line', d: 'M30 90 L74 90' },
  ],
};

const I: LetterDef = {
  id: 'I',
  char: 'I',
  spokenName: 'i',
  word: 'iguana',
  emoji: '🦎',
  strokes: [{ type: 'line', d: 'M50 10 L50 90' }],
};

const O: LetterDef = {
  id: 'O',
  char: 'O',
  spokenName: 'o',
  word: 'oso',
  emoji: '🐻',
  strokes: [
    {
      type: 'line',
      d: 'M50 10 C32.3 10 18 27.9 18 50 C18 72.1 32.3 90 50 90 C67.7 90 82 72.1 82 50 C82 27.9 67.7 10 50 10',
    },
  ],
};

const U: LetterDef = {
  id: 'U',
  char: 'U',
  spokenName: 'u',
  word: 'uvas',
  emoji: '🍇',
  strokes: [
    {
      type: 'line',
      d: 'M22 10 L22 60 C22 78 34 90 50 90 C66 90 78 78 78 60 L78 10',
    },
  ],
};

const a: LetterDef = {
  id: 'a-min',
  char: 'a',
  spokenName: 'a',
  word: 'abeja',
  emoji: '🐝',
  strokes: [
    {
      type: 'line',
      d: 'M72 50 C68 44 60 40 50 40 C37 40 27 51 27 65 C27 79 37 90 50 90 C60 90 68 85 72 78',
    },
    { type: 'line', d: 'M72 40 L72 90' },
  ],
};

const e: LetterDef = {
  id: 'e-min',
  char: 'e',
  spokenName: 'e',
  word: 'elefante',
  emoji: '🐘',
  strokes: [
    {
      type: 'line',
      d: 'M28 66 L72 66 C72 51 63 40 50 40 C37 40 27 51 27 65 C27 79 37 90 51 90 C60 90 67 86 71 80',
    },
  ],
};

const i: LetterDef = {
  id: 'i-min',
  char: 'i',
  spokenName: 'i',
  word: 'iguana',
  emoji: '🦎',
  strokes: [
    { type: 'line', d: 'M50 40 L50 90' },
    { type: 'dot', at: { x: 50, y: 24 } },
  ],
};

const o: LetterDef = {
  id: 'o-min',
  char: 'o',
  spokenName: 'o',
  word: 'oso',
  emoji: '🐻',
  strokes: [
    {
      type: 'line',
      d: 'M50 40 C36.7 40 26 51.2 26 65 C26 78.8 36.7 90 50 90 C63.3 90 74 78.8 74 65 C74 51.2 63.3 40 50 40',
    },
  ],
};

const u: LetterDef = {
  id: 'u-min',
  char: 'u',
  spokenName: 'u',
  word: 'uvas',
  emoji: '🍇',
  strokes: [
    {
      type: 'line',
      d: 'M28 40 L28 68 C28 81 37 90 49 90 C61 90 72 81 72 68 L72 40',
    },
    { type: 'line', d: 'M72 40 L72 90' },
  ],
};

export const LETTER_GROUPS: LetterGroup[] = [
  {
    id: 'vocales-mayusculas',
    title: 'Vocales grandes',
    letters: [A, E, I, O, U],
  },
  {
    id: 'vocales-minusculas',
    title: 'Vocales chicas',
    letters: [a, e, i, o, u],
  },
];

export const ALL_LETTERS: LetterDef[] = LETTER_GROUPS.flatMap((g) => g.letters);

export function findLetter(id: string): LetterDef | undefined {
  return ALL_LETTERS.find((l) => l.id === id);
}

/** Letra siguiente dentro de su grupo (da la vuelta al final). */
export function nextLetter(id: string): LetterDef | undefined {
  const group = LETTER_GROUPS.find((g) => g.letters.some((l) => l.id === id));
  if (!group) return undefined;
  const idx = group.letters.findIndex((l) => l.id === id);
  return group.letters[(idx + 1) % group.letters.length];
}
