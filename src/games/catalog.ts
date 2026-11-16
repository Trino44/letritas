/**
 * Juegos disponibles, armados a partir del contenido.
 */

import type { ChoiceItem } from '@/components/screens/ChoiceGameScreen';
import {
  letterExample,
  letterName,
  PHRASES,
  syllableClip,
  wordClip,
  type Clip,
} from '@/content/clips';
import { ALL_LETTERS } from '@/content/letters';
import {
  R_PAIRS,
  S_PAIRS,
  SYLLABLE_GROUPS,
  type SoundPair,
  type SyllableGroup,
} from '@/content/syllables';
import type { VocabCategory } from '@/content/vocabulary';
import { makeCompleteRounds } from './complete';
import {
  makeFirstLetterRounds,
  toChoiceRounds,
  type PictureWord,
} from './firstLetter';
import { makePairRounds, makeRounds, type Round } from './listenAndTap';

export interface GameDef {
  id: string;
  title: string;
  intro: Clip;
  showEmoji: boolean;
  /** Muestra la imagen del objetivo junto al botón de escuchar. */
  showTargetEmoji?: boolean;
  makeRounds: () => Round<ChoiceItem>[];
}

export function syllableGame(group: SyllableGroup): GameDef {
  const items: ChoiceItem[] = group.syllables.map((s) => ({
    key: s.text,
    label: s.text,
    emoji: s.emoji,
    clip: syllableClip(s),
    rewardClips: [syllableClip(s), wordClip(s.word)],
  }));
  return {
    id: `escucha-y-toca-${group.id}`,
    title: `Sílabas con ${group.letter}`,
    intro: PHRASES.escuchaYToca,
    showEmoji: false,
    makeRounds: () => makeRounds(items, 5, 3),
  };
}

function pairsGame(id: string, title: string, list: SoundPair[]): GameDef {
  const pairs: [ChoiceItem, ChoiceItem][] = list.map((p) => {
    const toItem = (w: { word: string; emoji: string }): ChoiceItem => ({
      key: w.word,
      label: w.word,
      emoji: w.emoji,
      clip: wordClip(w.word),
      rewardClips: [wordClip(w.word)],
    });
    return [toItem(p.soft), toItem(p.strong)];
  });
  return {
    id,
    title,
    intro: PHRASES.escuchaPalabra,
    showEmoji: true,
    makeRounds: () => makePairRounds(pairs, 6),
  };
}

export function rPairsGame(): GameDef {
  return pairsGame('r-suave-o-rr', 'R suave o RR', R_PAIRS);
}

export function sPairsGame(): GameDef {
  return pairsGame('s-o-no-s', '¿S o no S?', S_PAIRS);
}

/** Toca la letra que escuchas: suena "eme" y se elige la M. */
export function identifyLetterGame(): GameDef {
  const items: ChoiceItem[] = ALL_LETTERS.filter(
    (l) => l.char === l.char.toUpperCase()
  ).map((l) => ({
    key: l.char,
    label: l.char,
    emoji: l.emoji,
    clip: letterName(l),
    rewardClips: [letterName(l), letterExample(l)],
  }));
  return {
    id: 'toca-la-letra',
    title: 'Toca la letra',
    intro: PHRASES.tocaLaLetra,
    showEmoji: false,
    makeRounds: () => makeRounds(items, 6, 3),
  };
}

/** Completa la palabra: 🐸 "＿po" → sa. */
export function completeWordGame(group: SyllableGroup): GameDef {
  return {
    id: `completa-${group.id}`,
    title: `Completa la palabra · ${group.letter}`,
    intro: PHRASES.completaPalabra,
    showEmoji: false,
    showTargetEmoji: true,
    makeRounds: () =>
      makeCompleteRounds(group, 4).map((r) => {
        const item = (text: string, target: boolean): ChoiceItem => ({
          key: text,
          label: text,
          emoji: target ? r.emoji : '',
          prompt: target ? r.prompt : undefined,
          clip: target ? wordClip(r.word) : { id: `silaba-${text}`, text },
          rewardClips: [
            { id: `silaba-${r.answer}`, text: r.answer },
            wordClip(r.word),
          ],
        });
        return {
          target: item(r.answer, true),
          options: r.options.map((o) => item(o, false)),
        };
      }),
  };
}

/** Vocabulario: suena una palabra y se toca su imagen. */
export function vocabGame(category: VocabCategory): GameDef {
  const items: ChoiceItem[] = category.words.map((w) => ({
    key: w.word,
    label: w.word,
    emoji: w.emoji,
    clip: wordClip(w.word),
    rewardClips: [wordClip(w.word)],
  }));
  return {
    id: `vocabulario-${category.id}`,
    title: category.title,
    intro: PHRASES.escuchaPalabra,
    showEmoji: true,
    makeRounds: () => makeRounds(items, 6, 3),
  };
}

/** Palabras con imagen y su letra inicial, tomadas del contenido. */
export function pictureWords(): PictureWord[] {
  const out: PictureWord[] = [];
  const seen = new Set<string>();
  const add = (word: string, emoji: string, letter: string) => {
    if (seen.has(word)) return;
    seen.add(word);
    out.push({ word, emoji, letter: letter.toUpperCase() });
  };
  for (const l of ALL_LETTERS) {
    if (l.char === l.char.toUpperCase()) add(l.word, l.emoji, l.char);
  }
  for (const g of SYLLABLE_GROUPS) {
    if (g.medial) continue; // "perro" no empieza con RR
    for (const s of g.syllables) add(s.word, s.emoji, g.letter);
  }
  return out;
}

export function firstLetterGame(): GameDef {
  const letters = new Map(
    ALL_LETTERS.filter((l) => l.char === l.char.toUpperCase()).map((l) => [
      l.char,
      l,
    ])
  );
  const toItem = (letter: string, picture: PictureWord | null): ChoiceItem => {
    const def = letters.get(letter);
    const name = def
      ? letterName(def)
      : { id: `letra-${letter.toLowerCase()}`, text: letter };
    return {
      key: letter,
      label: letter,
      emoji: picture?.emoji ?? '',
      clip: picture ? wordClip(picture.word) : name,
      rewardClips: picture ? [name, wordClip(picture.word)] : [name],
    };
  };
  return {
    id: 'con-que-empieza',
    title: '¿Con qué empieza?',
    intro: PHRASES.conQueEmpieza,
    showEmoji: false,
    showTargetEmoji: true,
    makeRounds: () =>
      toChoiceRounds(makeFirstLetterRounds(pictureWords(), 6), toItem),
  };
}
