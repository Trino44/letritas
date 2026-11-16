import type React from 'react';
import { useEffect } from 'react';
import { wordClip } from '@/content/clips';
import { VOCABULARY, type VocabCategory } from '@/content/vocabulary';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  /** null = lista de temas. */
  category: VocabCategory | null;
  onHome: () => void;
  onBack: () => void;
  onOpen: (categoryId: string) => void;
  onPlay: (categoryId: string) => void;
}

/** Vocabulario: lista de temas o las palabras de un tema. */
export const VocabScreen: React.FC<Props> = ({
  category,
  onHome,
  onBack,
  onOpen,
  onPlay,
}) => {
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="syl-screen">
      <header className="trace-bar">
        {category ? (
          <button
            type="button"
            className="icon-btn"
            onClick={onBack}
            aria-label="Regresar"
          >
            ⬅️
          </button>
        ) : (
          <button
            type="button"
            className="icon-btn"
            onClick={onHome}
            aria-label="Inicio"
          >
            🏠
          </button>
        )}
        <h1 className="syl-title">{category ? category.title : 'Palabras'}</h1>
        {category ? (
          <button
            type="button"
            className="big-btn primary syl-play"
            onClick={() => onPlay(category.id)}
          >
            🎮 Jugar
          </button>
        ) : (
          <span className="icon-spacer" />
        )}
      </header>

      {!category && (
        <div className="hub-grid">
          {VOCABULARY.map((c) => (
            <button
              key={c.id}
              type="button"
              className="letter-btn hub-btn"
              onClick={() => onOpen(c.id)}
              aria-label={c.title}
            >
              <span className="letter-btn-char">{c.icon}</span>
              <span className="hub-caption">{c.title}</span>
            </button>
          ))}
        </div>
      )}

      {category && (
        <div className="syl-grid vocab-grid">
          {category.words.map((w) => (
            <button
              key={w.word}
              type="button"
              className="syl-card"
              onClick={() => void play(wordClip(w.word), 0.75)}
              aria-label={w.word}
            >
              <span className="vocab-emoji" aria-hidden="true">
                {w.emoji}
              </span>
              <span className="syl-word-big">{w.word}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
