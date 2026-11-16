import type React from 'react';
import { useEffect } from 'react';
import { syllableClip, wordClip } from '@/content/clips';
import type { SyllableDef, SyllableGroup } from '@/content/syllables';
import { syllableColor } from '@/content/vowelColors';
import { play, stopSpeaking } from '@/services/speech';
import { Syl } from '../ui/Syl';

interface Props {
  group: SyllableGroup;
  onExit: () => void;
  onPlayGame: () => void;
}

/** Parte la palabra para resaltar la sílaba donde aparezca ("pe·rro"). */
function splitWord(word: string, syl: string): [string, string, string] {
  const plain = word.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Si la normalización cambió el largo, buscar en la palabra tal cual.
  const base = plain.length === word.length ? plain : word;
  const i = base.toLowerCase().indexOf(syl.toLowerCase());
  if (i < 0) return [word, '', ''];
  return [
    word.slice(0, i),
    word.slice(i, i + syl.length),
    word.slice(i + syl.length),
  ];
}

const SyllableCard: React.FC<{ s: SyllableDef }> = ({ s }) => {
  const [before, match, after] = splitWord(s.word, s.text);
  return (
    <button
      type="button"
      className="syl-card"
      onClick={() => void play([syllableClip(s), wordClip(s.word)], 0.7)}
      aria-label={`Sílaba ${s.text}, ${s.word}`}
    >
      <Syl text={s.text} className="syl-text" />
      <span className="syl-emoji" aria-hidden="true">
        {s.emoji}
      </span>
      <span className="syl-word">
        {before}
        <strong style={{ color: syllableColor(s.text) ?? undefined }}>
          {match}
        </strong>
        {after}
      </span>
    </button>
  );
};

/** Explorar: tocar una sílaba la dice despacio y luego su palabra. */
export const SyllablesScreen: React.FC<Props> = ({
  group,
  onExit,
  onPlayGame,
}) => {
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="syl-screen">
      <header className="trace-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onExit}
          aria-label="Regresar"
        >
          ⬅️
        </button>
        <h1 className="syl-title">{group.title}</h1>
        <button
          type="button"
          className="big-btn primary syl-play"
          onClick={onPlayGame}
        >
          🎮 Jugar
        </button>
      </header>

      <div className="syl-scroll">
        <div className="syl-grid">
          {group.syllables.map((s) => (
            <SyllableCard key={s.text} s={s} />
          ))}
        </div>
        {group.inverse && group.inverse.length > 0 && (
          <>
            <h2 className="syl-section">Al revés</h2>
            <div className="syl-grid">
              {group.inverse.map((s) => (
                <SyllableCard key={s.text} s={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
