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
  /**
   * true si las sílabas van en medio de la palabra (rra en "perra"), no al
   * principio. Así funcionan la RR y otras que nunca inician palabra.
   */
  medial?: boolean;
  /** Sílabas inversas (am, as, ar…), con una palabra que las contiene. */
  inverse?: SyllableDef[];
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
    inverse: [
      { text: 'as', word: 'más', emoji: '➕' },
      { text: 'es', word: 'escoba', emoji: '🧹' },
      { text: 'is', word: 'isla', emoji: '🏝️' },
      { text: 'os', word: 'osos', emoji: '🐻' },
      { text: 'us', word: 'autobús', emoji: '🚌' },
    ],
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
    inverse: [
      { text: 'ar', word: 'árbol', emoji: '🌳' },
      { text: 'er', word: 'comer', emoji: '🍽️' },
      { text: 'ir', word: 'dormir', emoji: '😴' },
      { text: 'or', word: 'flor', emoji: '🌸' },
      { text: 'ur', word: 'surfear', emoji: '🏄' },
    ],
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
    inverse: [
      { text: 'am', word: 'ambulancia', emoji: '🚑' },
      { text: 'em', word: 'empanada', emoji: '🥟' },
      { text: 'im', word: 'imán', emoji: '🧲' },
      { text: 'om', word: 'bombón', emoji: '🍬' },
      { text: 'um', word: 'cumpleaños', emoji: '🎂' },
    ],
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
    inverse: [
      { text: 'al', word: 'sal', emoji: '🧂' },
      { text: 'el', word: 'miel', emoji: '🍯' },
      { text: 'il', word: 'abril', emoji: '📅' },
      { text: 'ol', word: 'sol', emoji: '☀️' },
      { text: 'ul', word: 'azul', emoji: '🔵' },
    ],
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
  {
    id: 'd',
    letter: 'D',
    title: 'Sílabas con D',
    syllables: [
      { text: 'da', word: 'dado', emoji: '🎲', parts: ['da', 'do'] },
      { text: 'de', word: 'dedo', emoji: '☝️', parts: ['de', 'do'] },
      { text: 'di', word: 'dinosaurio', emoji: '🦕' },
      { text: 'do', word: 'dona', emoji: '🍩', parts: ['do', 'na'] },
      { text: 'du', word: 'ducha', emoji: '🚿', parts: ['du', 'cha'] },
    ],
  },
  {
    id: 'n',
    letter: 'N',
    title: 'Sílabas con N',
    inverse: [
      { text: 'an', word: 'pan', emoji: '🍞' },
      { text: 'en', word: 'tren', emoji: '🚂' },
      { text: 'in', word: 'pingüino', emoji: '🐧' },
      { text: 'on', word: 'ratón', emoji: '🐭' },
      { text: 'un', word: 'uno', emoji: '1️⃣' },
    ],
    syllables: [
      { text: 'na', word: 'nariz', emoji: '👃', parts: ['na', 'riz'] },
      { text: 'ne', word: 'negro', emoji: '⚫', parts: ['ne', 'gro'] },
      { text: 'ni', word: 'nido', emoji: '🪺', parts: ['ni', 'do'] },
      { text: 'no', word: 'noche', emoji: '🌃', parts: ['no', 'che'] },
      { text: 'nu', word: 'nube', emoji: '☁️', parts: ['nu', 'be'] },
    ],
  },
  {
    id: 'f',
    letter: 'F',
    title: 'Sílabas con F',
    syllables: [
      { text: 'fa', word: 'falda', emoji: '👗', parts: ['fal', 'da'] },
      { text: 'fe', word: 'feliz', emoji: '😊', parts: ['fe', 'liz'] },
      { text: 'fi', word: 'fideo', emoji: '🍜', parts: ['fi', 'de', 'o'] },
      { text: 'fo', word: 'foca', emoji: '🦭', parts: ['fo', 'ca'] },
      { text: 'fu', word: 'fuego', emoji: '🔥', parts: ['fue', 'go'] },
    ],
  },
  {
    id: 'b',
    letter: 'B',
    title: 'Sílabas con B',
    syllables: [
      { text: 'ba', word: 'barco', emoji: '⛵', parts: ['bar', 'co'] },
      { text: 'be', word: 'bebé', emoji: '👶', parts: ['be', 'bé'] },
      { text: 'bi', word: 'bici', emoji: '🚲', parts: ['bi', 'ci'] },
      { text: 'bo', word: 'bota', emoji: '👢', parts: ['bo', 'ta'] },
      { text: 'bu', word: 'burro', emoji: '🫏', parts: ['bu', 'rro'] },
    ],
  },
  {
    id: 'rr',
    letter: 'RR',
    title: 'Sílabas con RR',
    medial: true,
    syllables: [
      { text: 'rra', word: 'perra', emoji: '🐕', parts: ['pe', 'rra'] },
      { text: 'rre', word: 'torre', emoji: '🏰', parts: ['to', 'rre'] },
      { text: 'rri', word: 'burrito', emoji: '🌯', parts: ['bu', 'rri', 'to'] },
      { text: 'rro', word: 'perro', emoji: '🐶', parts: ['pe', 'rro'] },
      {
        text: 'rru',
        word: 'carrusel',
        emoji: '🎠',
        parts: ['ca', 'rru', 'sel'],
      },
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

/** Pares con S y sin S, para que el niño escuche bien el sonido de la S. */
export const S_PAIRS: SoundPair[] = [
  {
    id: 'sopa-copa',
    soft: { word: 'sopa', emoji: '🍲' },
    strong: { word: 'copa', emoji: '🏆' },
  },
  {
    id: 'sol-col',
    soft: { word: 'sol', emoji: '☀️' },
    strong: { word: 'col', emoji: '🥬' },
  },
  {
    id: 'saco-taco',
    soft: { word: 'saco', emoji: '🧥' },
    strong: { word: 'taco', emoji: '🌮' },
  },
];

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
