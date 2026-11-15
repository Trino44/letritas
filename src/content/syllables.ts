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
];

export function findSyllableGroup(id: string): SyllableGroup | undefined {
  return SYLLABLE_GROUPS.find((g) => g.id === id);
}
