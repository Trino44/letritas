import type React from 'react';
import { LETTER_GROUPS } from '@/content/letters';
import { LEVEL_LABEL, type Level } from '@/services/progress';

interface Props {
  level: Level;
  completions: Record<string, number>;
  onSelectLetter: (letterId: string) => void;
  onChangeLevel: (level: Level) => void;
  onFullscreen: () => void;
}

const LEVELS: Level[] = ['facil', 'normal', 'dificil'];

function stars(n: number): string {
  return '★'.repeat(Math.min(3, n)) + '☆'.repeat(Math.max(0, 3 - n));
}

export const HomeScreen: React.FC<Props> = ({
  level,
  completions,
  onSelectLetter,
  onChangeLevel,
  onFullscreen,
}) => (
  <div className="home-screen">
    <header className="home-header">
      <h1 className="home-title">Letritas</h1>
      <button
        type="button"
        className="icon-btn"
        onClick={onFullscreen}
        aria-label="Pantalla completa"
      >
        ⛶
      </button>
    </header>

    <div className="home-groups">
      {LETTER_GROUPS.map((g) => (
        <section key={g.id} className="letter-group">
          <h2>{g.title}</h2>
          <div className="letter-row">
            {g.letters.map((l) => {
              const n = completions[l.id] ?? 0;
              return (
                <button
                  key={l.id}
                  type="button"
                  className="letter-btn"
                  onClick={() => onSelectLetter(l.id)}
                  aria-label={`Letra ${l.char}`}
                >
                  <span className="letter-btn-char">{l.char}</span>
                  <span className="letter-btn-stars" aria-label={`${n} veces`}>
                    {stars(n)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>

    <footer className="home-footer">
      <span>Nivel:</span>
      <div className="segmented" role="radiogroup" aria-label="Nivel">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            role="radio"
            aria-checked={level === lv}
            className={level === lv ? 'seg active' : 'seg'}
            onClick={() => onChangeLevel(lv)}
          >
            {LEVEL_LABEL[lv]}
          </button>
        ))}
      </div>
    </footer>
  </div>
);
