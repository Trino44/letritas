/**
 * Sílabas por consonante.
 *
 * Para agregar una familia (p. ej. R): copia el grupo de S, cambia las
 * sílabas, las palabras y los emojis. Las palabras deben empezar con la
 * sílaba exacta (sa-po, no sol).
 */

export interface SyllableDef {
  /** En minúsculas, como se escribe: "sa". */
  text: string;
  /** Palabra que empieza con la sílaba. */
  word: string;
  emoji: string;
}

export interface SyllableGroup {
  id: string;
  /** Letra que se practica, como se muestra. */
  letter: string;
  title: string;
  syllables: SyllableDef[];
}

export const SYLLABLE_GROUPS: SyllableGroup[] = [
  {
    id: 's',
    letter: 'S',
    title: 'Sílabas con S',
    syllables: [
      { text: 'sa', word: 'sapo', emoji: '🐸' },
      { text: 'se', word: 'semáforo', emoji: '🚦' },
      { text: 'si', word: 'silla', emoji: '🪑' },
      { text: 'so', word: 'sopa', emoji: '🍲' },
      { text: 'su', word: 'suéter', emoji: '🧥' },
    ],
  },
  {
    id: 'r',
    letter: 'R',
    title: 'Sílabas con R',
    syllables: [
      { text: 'ra', word: 'ratón', emoji: '🐭' },
      { text: 're', word: 'regalo', emoji: '🎁' },
      { text: 'ri', word: 'rinoceronte', emoji: '🦏' },
      { text: 'ro', word: 'rosa', emoji: '🌹' },
      { text: 'ru', word: 'rueda', emoji: '🛞' },
    ],
  },
];

/**
 * Pares de palabras que solo cambian en R suave / RR, para entrenar el oído.
 * El primero de cada par lleva R suave y el segundo RR.
 */
export interface SoundPair {
  id: string;
  soft: SyllableWord;
  strong: SyllableWord;
}

export interface SyllableWord {
  word: string;
  emoji: string;
}

export const R_PAIRS: SoundPair[] = [
  {
    id: 'pera-perra',
    soft: { word: 'pera', emoji: '🍐' },
    strong: { word: 'perra', emoji: '🐕' },
  },
  {
    id: 'cero-cerro',
    soft: { word: 'cero', emoji: '0️⃣' },
    strong: { word: 'cerro', emoji: '⛰️' },
  },
  {
    id: 'coro-corro',
    soft: { word: 'coro', emoji: '🎤' },
    strong: { word: 'corro', emoji: '🏃' },
  },
];

export function findSyllableGroup(id: string): SyllableGroup | undefined {
  return SYLLABLE_GROUPS.find((g) => g.id === id);
}
