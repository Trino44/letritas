/**
 * Juegos disponibles, armados a partir del contenido.
 */

import type { ChoiceItem } from '@/components/screens/ChoiceGameScreen';
import {
  letterName,
  PHRASES,
  syllableClip,
  wordClip,
  type Clip,
} from '@/content/clips';
import { ALL_LETTERS } from '@/content/letters';
import {
  R_PAIRS,
  SYLLABLE_GROUPS,
  type SyllableGroup,
} from '@/content/syllables';
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

export function rPairsGame(): GameDef {
  const pairs: [ChoiceItem, ChoiceItem][] = R_PAIRS.map((p) => {
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
    id: 'r-suave-o-rr',
    title: 'R suave o RR',
    intro: PHRASES.escuchaPalabra,
    showEmoji: true,
    makeRounds: () => makePairRounds(pairs, 6),
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
