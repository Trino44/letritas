import type React from 'react';
import { LETTER_GROUPS } from '@/content/letters';
import type { ConsonantModule, GameKind } from '@/content/modules';
import { findSyllableGroup } from '@/content/syllables';

interface Props {
  module: ConsonantModule;
  completions: Record<string, number>;
  onHome: () => void;
  onTrace: (letterId: string) => void;
  onSyllables: (groupId: string) => void;
  onGame: (kind: GameKind) => void;
}

const GAME_LABEL: Record<GameKind, { icon: string; text: string }> = {
  syllables: { icon: '🎮', text: 'Juego de sílabas' },
  'r-pairs': { icon: '👂', text: 'R suave o RR' },
};

function stars(n: number): string {
  return '★'.repeat(Math.min(3, n)) + '☆'.repeat(Math.max(0, 3 - n));
}

/** Pantalla de una consonante: trazar, ver sílabas y jugar. */
export const ConsonantScreen: React.FC<Props> = ({
  module,
  completions,
  onHome,
  onTrace,
  onSyllables,
  onGame,
}) => {
  const letters = LETTER_GROUPS.find((g) => g.id === module.id)?.letters ?? [];
  const syl = findSyllableGroup(module.id);

  return (
    <div className="syl-screen">
      <header className="trace-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onHome}
          aria-label="Inicio"
        >
          🏠
        </button>
        <h1 className="syl-title">{module.title}</h1>
        <span className="icon-spacer" />
      </header>

      <div className="hub-grid">
        {letters.map((l) => (
          <button
            key={l.id}
            type="button"
            className="letter-btn hub-btn"
            onClick={() => onTrace(l.id)}
            aria-label={`Trazar ${l.char}`}
          >
            <span className="letter-btn-char">{l.char}</span>
            <span className="hub-caption">Trazar</span>
            <span className="letter-btn-stars">
              {stars(completions[l.id] ?? 0)}
            </span>
          </button>
        ))}
        {syl && (
          <button
            type="button"
            className="letter-btn hub-btn"
            onClick={() => onSyllables(syl.id)}
            aria-label={syl.title}
          >
            <span className="syl-group-text">
              {syl.syllables.map((s) => s.text).join(' ')}
            </span>
            <span className="hub-caption">Sílabas</span>
          </button>
        )}
        {module.games.map((g) => (
          <button
            key={g}
            type="button"
            className="letter-btn hub-btn game-btn"
            onClick={() => onGame(g)}
            aria-label={GAME_LABEL[g].text}
          >
            <span className="letter-btn-char">{GAME_LABEL[g].icon}</span>
            <span className="hub-caption">{GAME_LABEL[g].text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
