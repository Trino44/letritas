import type React from 'react';
import { isVowelGroup, LETTER_GROUPS } from '@/content/letters';
import { CONSONANT_MODULES } from '@/content/modules';
import { findSyllableGroup } from '@/content/syllables';
import type { LetterDef } from '@/content/types';
import { ParentGate } from '../layout/ParentGate';

interface Props {
  completions: Record<string, number>;
  onSelectLetter: (letterId: string) => void;
  onSelectModule: (moduleId: string) => void;
  onFirstLetterGame: () => void;
  onIdentifyLetterGame: () => void;
  onVocab: () => void;
  onOpenParents: () => void;
  onFullscreen: () => void;
}

function stars(n: number): string {
  return '★'.repeat(Math.min(3, n)) + '☆'.repeat(Math.max(0, 3 - n));
}

export const HomeScreen: React.FC<Props> = ({
  completions,
  onSelectLetter,
  onSelectModule,
  onFirstLetterGame,
  onIdentifyLetterGame,
  onVocab,
  onOpenParents,
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

  const vowels = LETTER_GROUPS.filter((g) => isVowelGroup(g.id));

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1 className="home-title">Letritas</h1>
        <div className="home-level">
          <ParentGate onOpen={onOpenParents} />
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
          <h2>Consonantes</h2>
          <div className="letter-row consonants">
            {CONSONANT_MODULES.map((m) => {
              const syl = findSyllableGroup(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  className="letter-btn module-btn"
                  onClick={() => onSelectModule(m.id)}
                  aria-label={m.title}
                >
                  <span className="letter-btn-char">
                    {m.letter}
                    {m.letter.toLowerCase()}
                  </span>
                  {syl && (
                    <span className="module-syl">
                      {syl.syllables.map((s) => s.text).join(' ')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <section className="letter-group">
          <h2>Juegos y palabras</h2>
          <div className="letter-row games-row">
            <button
              type="button"
              className="letter-btn module-btn game-btn"
              onClick={onFirstLetterGame}
              aria-label="¿Con qué empieza?"
            >
              <span className="letter-btn-char">🔤</span>
              <span className="module-syl">¿Con qué empieza?</span>
            </button>
            <button
              type="button"
              className="letter-btn module-btn game-btn"
              onClick={onIdentifyLetterGame}
              aria-label="Toca la letra"
            >
              <span className="letter-btn-char">🔎</span>
              <span className="module-syl">Toca la letra</span>
            </button>
            <button
              type="button"
              className="letter-btn module-btn game-btn"
              onClick={onVocab}
              aria-label="Palabras"
            >
              <span className="letter-btn-char">📚</span>
              <span className="module-syl">Palabras</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
