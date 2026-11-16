/**
 * Vocabulario por temas. Para agregar una palabra: { word, emoji } en su
 * tema. Para un tema nuevo: copia uno completo y cambia id, título e ícono.
 */

export interface VocabWord {
  word: string;
  emoji: string;
}

export interface VocabCategory {
  id: string;
  title: string;
  icon: string;
  words: VocabWord[];
}

export const VOCABULARY: VocabCategory[] = [
  {
    id: 'animales',
    title: 'Animales',
    icon: '🐶',
    words: [
      { word: 'perro', emoji: '🐶' },
      { word: 'gato', emoji: '🐱' },
      { word: 'vaca', emoji: '🐮' },
      { word: 'caballo', emoji: '🐴' },
      { word: 'pato', emoji: '🦆' },
      { word: 'pez', emoji: '🐟' },
      { word: 'pájaro', emoji: '🐦' },
      { word: 'conejo', emoji: '🐰' },
      { word: 'oso', emoji: '🐻' },
      { word: 'mono', emoji: '🐒' },
    ],
  },
  {
    id: 'frutas',
    title: 'Frutas',
    icon: '🍎',
    words: [
      { word: 'manzana', emoji: '🍎' },
      { word: 'plátano', emoji: '🍌' },
      { word: 'uvas', emoji: '🍇' },
      { word: 'fresa', emoji: '🍓' },
      { word: 'naranja', emoji: '🍊' },
      { word: 'sandía', emoji: '🍉' },
      { word: 'piña', emoji: '🍍' },
      { word: 'mango', emoji: '🥭' },
      { word: 'pera', emoji: '🍐' },
      { word: 'limón', emoji: '🍋' },
    ],
  },
  {
    id: 'colores',
    title: 'Colores',
    icon: '🎨',
    words: [
      { word: 'rojo', emoji: '🔴' },
      { word: 'azul', emoji: '🔵' },
      { word: 'verde', emoji: '🟢' },
      { word: 'amarillo', emoji: '🟡' },
      { word: 'naranja', emoji: '🟠' },
      { word: 'morado', emoji: '🟣' },
      { word: 'café', emoji: '🟤' },
      { word: 'negro', emoji: '⚫' },
      { word: 'blanco', emoji: '⚪' },
      { word: 'rosa', emoji: '🩷' },
    ],
  },
  {
    id: 'objetos',
    title: 'Objetos',
    icon: '⚽',
    words: [
      { word: 'pelota', emoji: '⚽' },
      { word: 'cama', emoji: '🛏️' },
      { word: 'libro', emoji: '📕' },
      { word: 'coche', emoji: '🚗' },
      { word: 'reloj', emoji: '⏰' },
      { word: 'llave', emoji: '🔑' },
      { word: 'zapato', emoji: '👟' },
      { word: 'lápiz', emoji: '✏️' },
      { word: 'vaso', emoji: '🥛' },
      { word: 'casa', emoji: '🏠' },
    ],
  },
  {
    id: 'personas',
    title: 'Personas',
    icon: '👨‍👩‍👧',
    words: [
      { word: 'mamá', emoji: '👩' },
      { word: 'papá', emoji: '👨' },
      { word: 'bebé', emoji: '👶' },
      { word: 'abuela', emoji: '👵' },
      { word: 'abuelo', emoji: '👴' },
      { word: 'niño', emoji: '👦' },
      { word: 'niña', emoji: '👧' },
      { word: 'doctora', emoji: '👩‍⚕️' },
      { word: 'maestra', emoji: '👩‍🏫' },
      { word: 'bombero', emoji: '🧑‍🚒' },
    ],
  },
];

export function findCategory(id: string): VocabCategory | undefined {
  return VOCABULARY.find((c) => c.id === id);
}
