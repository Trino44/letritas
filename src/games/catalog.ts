/**
 * Juegos disponibles, armados a partir del contenido.
 */

import type { ChoiceItem } from '@/components/screens/ChoiceGameScreen';
import { PHRASES, syllableClip, wordClip, type Clip } from '@/content/clips';
import { R_PAIRS, type SyllableGroup } from '@/content/syllables';
import { makePairRounds, makeRounds, type Round } from './listenAndTap';

export interface GameDef {
  id: string;
  title: string;
  intro: Clip;
  showEmoji: boolean;
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
