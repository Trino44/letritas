import type React from 'react';
import { LETTER_GROUPS } from '@/content/letters';
import { SYLLABLE_GROUPS } from '@/content/syllables';
import type { LetterDef } from '@/content/types';
import { LEVEL_LABEL, type Level } from '@/services/progress';

interface Props {
  level: Level;
  completions: Record<string, number>;
  onSelectLetter: (letterId: string) => void;
  onSelectSyllables: (groupId: string) => void;
  onPlayGame: (groupId: string) => void;
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
  onSelectSyllables,
  onPlayGame,
  onChangeLevel,
  onFullscreen,
}) => {
  const letterButton = (l: LetterDef) => {
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
  };

  const vowels = LETTER_GROUPS.filter((g) => g.id !== 'consonantes');
  const consonants = LETTER_GROUPS.find((g) => g.id === 'consonantes');

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1 className="home-title">Letritas</h1>
        <div className="home-level">
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
        </div>
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
        {vowels.map((g) => (
          <section key={g.id} className="letter-group">
            <h2>{g.title}</h2>
            <div className="letter-row">{g.letters.map(letterButton)}</div>
          </section>
        ))}

        <section className="letter-group">
          <h2>Consonantes y sílabas</h2>
          <div className="letter-row">
            {consonants?.letters.map(letterButton)}
            {SYLLABLE_GROUPS.map((sg) => (
              <button
                key={`syl-${sg.id}`}
                type="button"
                className="letter-btn syl-group-btn"
                onClick={() => onSelectSyllables(sg.id)}
                aria-label={sg.title}
              >
                <span className="syl-group-text">
                  {sg.syllables.map((s) => s.text).join(' ')}
                </span>
              </button>
            ))}
            {SYLLABLE_GROUPS.map((sg) => (
              <button
                key={`game-${sg.id}`}
                type="button"
                className="letter-btn game-btn"
                onClick={() => onPlayGame(sg.id)}
                aria-label={`Juego de sílabas con ${sg.letter}`}
              >
                <span className="letter-btn-char">🎮</span>
                <span className="letter-btn-stars">{sg.letter}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
