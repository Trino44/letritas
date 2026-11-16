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
  /** Sílabas de la palabra, para el juego de armar palabras (2 o 3). */
  parts?: string[];
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
      { text: 'sa', word: 'sapo', emoji: '🐸', parts: ['sa', 'po'] },
      { text: 'se', word: 'semáforo', emoji: '🚦' },
      { text: 'si', word: 'silla', emoji: '🪑', parts: ['si', 'lla'] },
      { text: 'so', word: 'sopa', emoji: '🍲', parts: ['so', 'pa'] },
      { text: 'su', word: 'suéter', emoji: '🧥' },
    ],
  },
  {
    id: 'r',
    letter: 'R',
    title: 'Sílabas con R',
    syllables: [
      { text: 'ra', word: 'ratón', emoji: '🐭', parts: ['ra', 'tón'] },
      { text: 're', word: 'regalo', emoji: '🎁', parts: ['re', 'ga', 'lo'] },
      { text: 'ri', word: 'rinoceronte', emoji: '🦏' },
      { text: 'ro', word: 'rosa', emoji: '🌹', parts: ['ro', 'sa'] },
      { text: 'ru', word: 'rueda', emoji: '🛞', parts: ['rue', 'da'] },
    ],
  },
  {
    id: 'm',
    letter: 'M',
    title: 'Sílabas con M',
    syllables: [
      { text: 'ma', word: 'mano', emoji: '✋', parts: ['ma', 'no'] },
      { text: 'me', word: 'melón', emoji: '🍈', parts: ['me', 'lón'] },
      { text: 'mi', word: 'miel', emoji: '🍯' },
      { text: 'mo', word: 'mono', emoji: '🐒', parts: ['mo', 'no'] },
      { text: 'mu', word: 'muñeca', emoji: '🪆', parts: ['mu', 'ñe', 'ca'] },
    ],
  },
  {
    id: 'p',
    letter: 'P',
    title: 'Sílabas con P',
    syllables: [
      { text: 'pa', word: 'pato', emoji: '🦆', parts: ['pa', 'to'] },
      { text: 'pe', word: 'pera', emoji: '🍐', parts: ['pe', 'ra'] },
      { text: 'pi', word: 'piña', emoji: '🍍', parts: ['pi', 'ña'] },
      { text: 'po', word: 'pollo', emoji: '🐥', parts: ['po', 'llo'] },
      { text: 'pu', word: 'puerta', emoji: '🚪', parts: ['puer', 'ta'] },
    ],
  },
  {
    id: 'l',
    letter: 'L',
    title: 'Sílabas con L',
    syllables: [
      { text: 'la', word: 'lata', emoji: '🥫', parts: ['la', 'ta'] },
      { text: 'le', word: 'león', emoji: '🦁', parts: ['le', 'ón'] },
      { text: 'li', word: 'limón', emoji: '🍋', parts: ['li', 'món'] },
      { text: 'lo', word: 'loro', emoji: '🦜', parts: ['lo', 'ro'] },
      { text: 'lu', word: 'luna', emoji: '🌙', parts: ['lu', 'na'] },
    ],
  },
  {
    id: 't',
    letter: 'T',
    title: 'Sílabas con T',
    syllables: [
      { text: 'ta', word: 'taza', emoji: '☕', parts: ['ta', 'za'] },
      { text: 'te', word: 'teléfono', emoji: '☎️' },
      { text: 'ti', word: 'tigre', emoji: '🐯', parts: ['ti', 'gre'] },
      { text: 'to', word: 'tomate', emoji: '🍅', parts: ['to', 'ma', 'te'] },
      { text: 'tu', word: 'tulipán', emoji: '🌷', parts: ['tu', 'li', 'pán'] },
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
