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

const S: LetterDef = {
  id: 'S',
  char: 'S',
  spokenName: 'ese',
  soundText: 'sss',
  word: 'sol',
  emoji: '☀️',
  strokes: [
    {
      type: 'line',
      d: 'M76 22 C70 13 60 10 50 10 C36 10 25 18 25 30 C25 42 36 47 50 50 C64 53 76 58 76 70 C76 82 64 90 50 90 C38 90 28 85 23 77',
    },
  ],
};

const s: LetterDef = {
  id: 's-min',
  char: 's',
  spokenName: 'ese',
  soundText: 'sss',
  word: 'sol',
  emoji: '☀️',
  strokes: [
    {
      type: 'line',
      d: 'M70 47 C66 42 58 40 50 40 C40 40 32 44 32 52 C32 60 40 63 50 65 C60 67 69 70 69 78 C69 86 60 90 50 90 C41 90 34 87 30 82',
    },
  ],
};

const R: LetterDef = {
  id: 'R',
  char: 'R',
  spokenName: 'erre',
  soundText: 'rrr',
  word: 'rey',
  emoji: '👑',
  strokes: [
    { type: 'line', d: 'M28 10 L28 90' },
    {
      type: 'line',
      d: 'M28 10 L52 10 C66 10 74 19 74 31 C74 43 66 51 52 51 L28 51',
    },
    { type: 'line', d: 'M48 51 L76 90' },
  ],
};

const r: LetterDef = {
  id: 'r-min',
  char: 'r',
  spokenName: 'erre',
  soundText: 'rrr',
  word: 'rey',
  emoji: '👑',
  strokes: [
    { type: 'line', d: 'M36 40 L36 90' },
    { type: 'line', d: 'M36 58 C40 46 48 40 58 40 C64 40 68 42 71 45' },
  ],
};

function letter(
  id: string,
  char: string,
  spokenName: string,
  word: string,
  emoji: string,
  strokes: string[],
  soundText?: string
): LetterDef {
  return {
    id,
    char,
    spokenName,
    word,
    emoji,
    ...(soundText ? { soundText } : {}),
    strokes: strokes.map((d) => ({ type: 'line' as const, d })),
  };
}

const M = letter(
  'M',
  'M',
  'eme',
  'mano',
  '✋',
  ['M22 10 L22 90', 'M22 10 L50 60 L78 10', 'M78 10 L78 90'],
  'mmm'
);
const m = letter(
  'm-min',
  'm',
  'eme',
  'mano',
  '✋',
  [
    'M24 40 L24 90',
    'M24 54 C24 45 30 40 37 40 C44 40 50 45 50 54 L50 90',
    'M50 54 C50 45 56 40 63 40 C70 40 76 45 76 54 L76 90',
  ],
  'mmm'
);
const P = letter('P', 'P', 'pe', 'pato', '🦆', [
  'M30 10 L30 90',
  'M30 10 L52 10 C66 10 74 19 74 31 C74 43 66 52 52 52 L30 52',
]);
const p = letter('p-min', 'p', 'pe', 'pato', '🦆', [
  'M32 40 L32 99',
  'M32 50 C36 43 43 40 52 40 C64 40 72 51 72 65 C72 79 64 90 52 90 C43 90 36 86 32 80',
]);
const L = letter(
  'L',
  'L',
  'ele',
  'luna',
  '🌙',
  ['M30 10 L30 90 L72 90'],
  'lll'
);
const l = letter('l-min', 'l', 'ele', 'luna', '🌙', ['M50 10 L50 90'], 'lll');
const T = letter('T', 'T', 'te', 'tomate', '🍅', [
  'M22 10 L78 10',
  'M50 10 L50 90',
]);
const t = letter('t-min', 't', 'te', 'tomate', '🍅', [
  'M46 18 L46 80 C46 87 50 90 56 90 C61 90 65 88 68 85',
  'M32 40 L62 40',
]);

const D = letter('D', 'D', 'de', 'dado', '🎲', [
  'M30 10 L30 90',
  'M30 10 L46 10 C66 10 78 28 78 50 C78 72 66 90 46 90 L30 90',
]);
const d = letter('d-min', 'd', 'de', 'dado', '🎲', [
  'M70 50 C66 44 59 40 50 40 C37 40 28 51 28 65 C28 79 37 90 50 90 C59 90 66 86 70 80',
  'M70 10 L70 90',
]);
const N = letter(
  'N',
  'N',
  'ene',
  'nube',
  '☁️',
  ['M24 10 L24 90', 'M24 10 L76 90', 'M76 90 L76 10'],
  'nnn'
);
const n = letter(
  'n-min',
  'n',
  'ene',
  'nube',
  '☁️',
  ['M30 40 L30 90', 'M30 56 C30 46 38 40 48 40 C60 40 68 47 68 58 L68 90'],
  'nnn'
);
const F = letter(
  'F',
  'F',
  'efe',
  'foca',
  '🦭',
  ['M30 10 L30 90', 'M30 10 L72 10', 'M30 48 L64 48'],
  'fff'
);
const f = letter(
  'f-min',
  'f',
  'efe',
  'foca',
  '🦭',
  ['M62 16 C58 11 53 10 49 10 C42 10 38 15 38 23 L38 90', 'M26 42 L56 42'],
  'fff'
);
const B = letter('B', 'B', 'be', 'barco', '⛵', [
  'M30 10 L30 90',
  'M30 10 L50 10 C62 10 69 17 69 29 C69 41 62 48 50 48 L30 48',
  'M30 48 L54 48 C67 48 74 57 74 69 C74 82 66 90 53 90 L30 90',
]);
const b = letter('b-min', 'b', 'be', 'barco', '⛵', [
  'M30 10 L30 90',
  'M30 62 C32 48 41 40 52 40 C64 40 72 51 72 65 C72 79 64 90 52 90 C41 90 33 82 30 72',
]);

/** Doble r: se traza como dos r seguidas. */
const rr = letter(
  'rr-min',
  'rr',
  'erre',
  'perro',
  '🐶',
  [
    'M24 40 L24 90',
    'M24 58 C27 47 33 40 41 40 C45 40 48 41 50 43',
    'M58 40 L58 90',
    'M58 58 C61 47 67 40 75 40 C79 40 82 41 84 43',
  ],
  'rrr'
);

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
  { id: 's', title: 'La S', letters: [S, s] },
  { id: 'r', title: 'La R', letters: [R, r] },
  { id: 'm', title: 'La M', letters: [M, m] },
  { id: 'p', title: 'La P', letters: [P, p] },
  { id: 'l', title: 'La L', letters: [L, l] },
  { id: 't', title: 'La T', letters: [T, t] },
  { id: 'd', title: 'La D', letters: [D, d] },
  { id: 'n', title: 'La N', letters: [N, n] },
  { id: 'f', title: 'La F', letters: [F, f] },
  { id: 'b', title: 'La B', letters: [B, b] },
  { id: 'rr', title: 'La RR', letters: [rr] },
];

/** Grupos de vocales (los demás son consonantes con su propia pantalla). */
export function isVowelGroup(id: string): boolean {
  return id.startsWith('vocales');
}

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
