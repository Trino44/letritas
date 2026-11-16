import type React from 'react';
import { useEffect } from 'react';
import { syllableClip, wordClip } from '@/content/clips';
import type { SyllableGroup } from '@/content/syllables';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  group: SyllableGroup;
  onExit: () => void;
  onPlayGame: () => void;
}

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

      <div className="syl-grid">
        {group.syllables.map((s) => (
          <button
            key={s.text}
            type="button"
            className="syl-card"
            onClick={() => void play([syllableClip(s), wordClip(s.word)], 0.7)}
            aria-label={`Sílaba ${s.text}, ${s.word}`}
          >
            <span className="syl-text">{s.text}</span>
            <span className="syl-emoji" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="syl-word">
              <strong>{s.text}</strong>
              {s.word.slice(s.text.length)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
