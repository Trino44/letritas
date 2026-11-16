/**
 * Catálogo de todo lo que la app dice en voz alta.
 * Cada clip tiene un id fijo = nombre del archivo de audio a grabar.
 */

import type { Clip } from '../services/speech';
import { ALL_LETTERS } from './letters';
import { R_PAIRS, SYLLABLE_GROUPS, type SyllableDef } from './syllables';
import type { LetterDef } from './types';

export type { Clip };

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function base(letter: LetterDef): string {
  return slug(letter.char);
}

export const PHRASES = {
  vamosATrazar: { id: 'frase-vamos-a-trazar', text: 'Vamos a trazar la' },
  empiezaPuntoVerde: {
    id: 'frase-empieza-punto-verde',
    text: 'Empieza en el punto verde.',
  },
  escuchaYToca: {
    id: 'frase-escucha-y-toca',
    text: 'Escucha y toca la sílaba.',
  },
  escuchaPalabra: {
    id: 'frase-escucha-palabra',
    text: 'Escucha y toca la palabra que oíste.',
  },
  intentaOtraVez: { id: 'frase-intenta-otra-vez', text: 'Intenta otra vez.' },
  terminaste: {
    id: 'frase-terminaste-el-juego',
    text: '¡Terminaste el juego!',
  },
} satisfies Record<string, Clip>;

export const PRAISE: Clip[] = [
  { id: 'frase-muy-bien', text: '¡Muy bien!' },
  { id: 'frase-excelente', text: '¡Excelente!' },
  { id: 'frase-lo-lograste', text: '¡Lo lograste!' },
  { id: 'frase-bravo', text: '¡Bravo!' },
  { id: 'frase-que-bonito', text: '¡Qué bonito!' },
];

export function letterName(l: LetterDef): Clip {
  return { id: `letra-${base(l)}`, text: l.spokenName };
}

export function letterSound(l: LetterDef): Clip | null {
  return l.soundText
    ? { id: `sonido-${base(l)}`, text: l.soundText, tts: false }
    : null;
}

export function letterExample(l: LetterDef): Clip {
  return {
    id: `letra-${base(l)}-de-${slug(l.word)}`,
    text: `${l.spokenName}, de ${l.word}.`,
  };
}

export function syllableClip(s: SyllableDef): Clip {
  return { id: `silaba-${slug(s.text)}`, text: s.text };
}

export function wordClip(word: string): Clip {
  return { id: `palabra-${slug(word)}`, text: word };
}

/** Lista sin repetidos de todos los clips, para el guion de grabación. */
export function allClips(): { section: string; clips: Clip[] }[] {
  const uniq = (list: Clip[]): Clip[] => {
    const seen = new Set<string>();
    return list.filter((c) =>
      seen.has(c.id) ? false : (seen.add(c.id), true)
    );
  };
  return [
    { section: 'Frases', clips: [...Object.values(PHRASES), ...PRAISE] },
    {
      section: 'Letras',
      clips: uniq(
        ALL_LETTERS.flatMap((l) => {
          const snd = letterSound(l);
          return [letterName(l), ...(snd ? [snd] : []), letterExample(l)];
        })
      ),
    },
    ...SYLLABLE_GROUPS.map((g) => ({
      section: g.title,
      clips: uniq(
        g.syllables.flatMap((s) => [syllableClip(s), wordClip(s.word)])
      ),
    })),
    {
      section: 'R suave y RR',
      clips: uniq(
        R_PAIRS.flatMap((p) => [wordClip(p.soft.word), wordClip(p.strong.word)])
      ),
    },
  ];
}
