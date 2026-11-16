/**
 * Lectura por unidad: oraciones para "Lee conmigo" y un cuento corto con
 * preguntas de Sí/No. Textos originales de Letritas (no copiados del
 * cuadernillo); usan sobre todo letras ya vistas en el orden M, L, P, S, T,
 * N, D, F, R, RR, B.
 *
 * Para agregar: escribe oraciones cortas, un cuento de 4 o 5 oraciones y
 * preguntas cuya respuesta esté en el cuento.
 */

export interface StoryQuestion {
  text: string;
  answer: boolean;
}

export interface Story {
  title: string;
  /** Uno o dos emojis como ilustración. */
  picture: string;
  sentences: string[];
  questions: StoryQuestion[];
}

export interface UnitReading {
  /** Igual al id de la consonante (m, l, p…). */
  id: string;
  sentences: string[];
  story: Story;
}

export const READING: UnitReading[] = [
  {
    id: 'm',
    sentences: [
      'Mamá me ama.',
      'Amo a mi mamá.',
      'Mi mamá mima a Memo.',
      'Memo mima a Mimí.',
      'Mamá y Memo.',
    ],
    story: {
      title: 'Memo y su mamá',
      picture: '👩‍👦',
      sentences: [
        'Memo tiene una mamá.',
        'Mamá mima a Memo.',
        'Memo ama a su mamá.',
        'Mamá y Memo comen juntos.',
      ],
      questions: [
        { text: '¿Mamá mima a Memo?', answer: true },
        { text: '¿Memo ama a su mamá?', answer: true },
        { text: '¿Memo come solo?', answer: false },
      ],
    },
  },
  {
    id: 'l',
    sentences: [
      'Lola lee.',
      'Lalo ama a Lola.',
      'La mula es mala.',
      'Lili mima a la mula.',
      'Mi mamá le lee a Lalo.',
    ],
    story: {
      title: 'La mula Lula',
      picture: '🫏',
      sentences: [
        'Lula es una mula.',
        'A Lula le gusta la miel.',
        'Lalo le lleva miel a Lula.',
        'Lula está muy feliz.',
      ],
      questions: [
        { text: '¿Lula es una mula?', answer: true },
        { text: '¿A Lula le gusta la sal?', answer: false },
        { text: '¿Lalo le lleva miel a Lula?', answer: true },
      ],
    },
  },
  {
    id: 'p',
    sentences: [
      'Papá mira el mapa.',
      'Pepe pela la papa.',
      'La pipa es de papá.',
      'Pepa pule el piso.',
      'Mi papá me ama.',
    ],
    story: {
      title: 'El pato Pepe',
      picture: '🦆',
      sentences: [
        'Pepe es un pato.',
        'Pepe pasea por la loma.',
        'Papá pato mira a Pepe.',
        'Pepe se mete a la laguna.',
      ],
      questions: [
        { text: '¿Pepe es un pato?', answer: true },
        { text: '¿Papá pato mira a Pepe?', answer: true },
        { text: '¿Pepe es un perro?', answer: false },
      ],
    },
  },
  {
    id: 's',
    sentences: [
      'Susi sale al sol.',
      'El sapo salta solo.',
      'Sami pasa la sal.',
      'Los osos son lindos.',
      'Mis papás me besan.',
    ],
    story: {
      title: 'El sapo Saúl',
      picture: '🐸☀️',
      sentences: [
        'Saúl es un sapo.',
        'Saúl salta sobre las piedras.',
        'Saúl se asoma al sol.',
        'Susi saluda a Saúl.',
        'Los dos se sientan en el pasto.',
      ],
      questions: [
        { text: '¿Saúl es un sapo?', answer: true },
        { text: '¿Saúl se asoma a la luna?', answer: false },
        { text: '¿Susi saluda a Saúl?', answer: true },
      ],
    },
  },
  {
    id: 't',
    sentences: [
      'Tito toma té.',
      'Mi tía tiene una moto.',
      'El tomate es de Tita.',
      'Tomás pinta la mesa.',
      'La pata está en el patio.',
    ],
    story: {
      title: 'La tortuga Tina',
      picture: '🐢🍅',
      sentences: [
        'Tina es una tortuga.',
        'Tina toma el sol en el patio.',
        'Tito le pone un tomate.',
        'Tina se lo come todito.',
      ],
      questions: [
        { text: '¿Tina es una tortuga?', answer: true },
        { text: '¿Tito le pone una pelota?', answer: false },
        { text: '¿Tina se come el tomate?', answer: true },
      ],
    },
  },
  {
    id: 'n',
    sentences: [
      'Nina nada.',
      'Ana tiene un pino.',
      'La luna sale de noche.',
      'Nino no tiene sueño.',
      'Mi nana me mima.',
    ],
    story: {
      title: 'La nube Nena',
      picture: '☁️🌙',
      sentences: [
        'Nena es una nube.',
        'Nena pasea en la noche.',
        'La luna mira a Nena.',
        'Nena no tiene miedo.',
      ],
      questions: [
        { text: '¿Nena es una nube?', answer: true },
        { text: '¿Nena pasea de día?', answer: false },
        { text: '¿La luna mira a Nena?', answer: true },
      ],
    },
  },
  {
    id: 'd',
    sentences: [
      'Dani tiene un dado.',
      'Me duele un diente.',
      'Dora me da la mano.',
      'Papá me da una dona.',
      'El dedo de Dino.',
    ],
    story: {
      title: 'El dinosaurio Dino',
      picture: '🦕🍩',
      sentences: [
        'Dino es un dinosaurio.',
        'Dino come dulces y donas.',
        'Un día le duele un diente.',
        'Dino ya no come tantos dulces.',
      ],
      questions: [
        { text: '¿Dino es un dinosaurio?', answer: true },
        { text: '¿A Dino le duele la pata?', answer: false },
        { text: '¿Dino come donas?', answer: true },
      ],
    },
  },
  {
    id: 'f',
    sentences: [
      'Fani tiene una falda.',
      'La foca es feliz.',
      'Fito toma fotos.',
      'La fiesta es de Fela.',
      'Mi familia sale a pasear.',
    ],
    story: {
      title: 'La foca Fifí',
      picture: '🦭',
      sentences: [
        'Fifí es una foca.',
        'Fifí nada feliz en el mar.',
        'Fifí juega con su familia.',
        'Al final, Fifí se duerme.',
      ],
      questions: [
        { text: '¿Fifí es una foca?', answer: true },
        { text: '¿Fifí está triste?', answer: false },
        { text: '¿Fifí juega con su familia?', answer: true },
      ],
    },
  },
  {
    id: 'r',
    sentences: [
      'La rosa es roja.',
      'Ramón rema en el río.',
      'La rana mira la luna.',
      'Rita come peras.',
      'El loro dice: ¡hola, Sara!',
    ],
    story: {
      title: 'La rana Rosa',
      picture: '🐸🌹',
      sentences: [
        'Rosa es una rana.',
        'Rosa rema en el río.',
        'Un loro le dice: ¡hola, Rosa!',
        'Rosa se ríe y sigue remando.',
      ],
      questions: [
        { text: '¿Rosa es una rana?', answer: true },
        { text: '¿Rosa rema en el mar?', answer: false },
        { text: '¿El loro saluda a Rosa?', answer: true },
      ],
    },
  },
  {
    id: 'rr',
    sentences: [
      'El perro corre.',
      'La torre es alta.',
      'Mi carro es rojo.',
      'El burro come pasto.',
      'La perrita se aburre.',
    ],
    story: {
      title: 'El perro Rocco',
      picture: '🐶🫏',
      sentences: [
        'Rocco es un perro.',
        'Rocco corre y corre en el parque.',
        'Rocco ve a un burro.',
        'El burro y Rocco corren juntos.',
      ],
      questions: [
        { text: '¿Rocco es un perro?', answer: true },
        { text: '¿Rocco ve a un gato?', answer: false },
        { text: '¿Rocco corre con el burro?', answer: true },
      ],
    },
  },
  {
    id: 'b',
    sentences: [
      'Beto bebe agua.',
      'El bebé baila.',
      'Mi bota es bonita.',
      'Bibi sube al barco.',
      'Toma tu bici.',
    ],
    story: {
      title: 'El barco de Beto',
      picture: '⛵🐋',
      sentences: [
        'Beto tiene un barco.',
        'El barco es azul y bonito.',
        'Beto sube al barco con su abuela.',
        'Ven una ballena y la saludan.',
      ],
      questions: [
        { text: '¿Beto tiene un barco?', answer: true },
        { text: '¿El barco es rojo?', answer: false },
        { text: '¿Ven una ballena?', answer: true },
      ],
    },
  },
];

export function findReading(id: string): UnitReading | undefined {
  return READING.find((r) => r.id === id);
}

/** Palabras de una oración, sin signos ("¡hola," → "hola"). */
export function wordsOf(sentence: string): { shown: string; spoken: string }[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((shown) => ({
      shown,
      spoken: shown.replace(/[¡!¿?.,;:]/g, '').toLowerCase(),
    }))
    .filter((w) => w.spoken.length > 0);
}
