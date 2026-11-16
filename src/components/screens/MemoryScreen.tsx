/** Juego de memoria: parejas imagen ↔ sílaba, con audio al voltear. */

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, syllableClip, wordClip } from '@/content/clips';
import type { SyllableGroup } from '@/content/syllables';
import {
  closeOpen,
  flip,
  isFinished,
  newMemoryGame,
  type MemoryState,
} from '@/games/memory';
import { recordActivity } from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking } from '@/services/speech';
import { Syl } from '../ui/Syl';

interface Props {
  group: SyllableGroup;
  onExit: () => void;
}

const PAIRS = 4;

export const MemoryScreen: React.FC<Props> = ({ group, onExit }) => {
  const items = useMemo(
    () =>
      group.syllables.map((s) => ({
        key: s.text,
        label: s.text,
        emoji: s.emoji,
      })),
    [group]
  );
  const [state, setState] = useState<MemoryState>(() =>
    newMemoryGame(items, PAIRS)
  );
  const timer = useRef<number | null>(null);
  const done = isFinished(state);

  useEffect(() => {
    void play(PHRASES.encuentraParejas);
    return () => {
      stopSpeaking();
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const tap = (cardId: string) => {
    const { state: nextState, result } = flip(state, cardId);
    if (result === 'ignored') return;
    setState(nextState);
    const card = state.cards.find((c) => c.id === cardId)!;
    const syl = group.syllables.find((s) => s.text === card.key)!;
    if (result === 'first') {
      void play(
        card.face === 'image' ? wordClip(syl.word) : syllableClip(syl),
        0.75
      );
    } else if (result === 'match') {
      playStrokeDone();
      void play([syllableClip(syl), wordClip(syl.word)], 0.75);
      if (isFinished(nextState)) {
        timer.current = window.setTimeout(() => {
          playCelebration();
          vibrate(80);
          recordActivity(`memoria-${group.id}`, PAIRS, nextState.moves - PAIRS);
          void play(PHRASES.terminaste);
        }, 900);
      }
    } else {
      playOffPath();
      void play(
        card.face === 'image' ? wordClip(syl.word) : syllableClip(syl),
        0.75
      );
      timer.current = window.setTimeout(
        () => setState((s) => closeOpen(s)),
        1200
      );
    }
  };

  const restart = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    setState(newMemoryGame(items, PAIRS));
  };

  const extra = Math.max(0, state.moves - PAIRS);
  const stars = Math.max(1, 3 - Math.floor(extra / 2));

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
        <h1 className="syl-title">Memoria · {group.letter}</h1>
        <span className="icon-spacer" />
      </header>

      {!done && (
        <div className="memory-grid">
          {state.cards.map((c) => {
            const isOpen =
              state.open.includes(c.id) || state.matched.includes(c.key);
            const syl = group.syllables.find((s) => s.text === c.key)!;
            const cls = [
              'memory-card',
              isOpen ? 'open' : '',
              state.matched.includes(c.key) ? 'matched' : '',
            ].join(' ');
            return (
              <button
                key={c.id}
                type="button"
                className={cls}
                onClick={() => tap(c.id)}
                aria-label={
                  isOpen
                    ? c.face === 'image'
                      ? syl.word
                      : syl.text
                    : 'Tarjeta'
                }
              >
                <span className="memory-inner">
                  <span className="memory-back">?</span>
                  <span className="memory-front">
                    {c.face === 'image' ? (
                      <span className="memory-emoji">{syl.emoji}</span>
                    ) : (
                      <Syl
                        text={syl.text}
                        surface="light"
                        className="memory-text"
                      />
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {done && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              🧠
            </div>
            <div className="celebration-praise">¡Encontraste todas!</div>
            <div className="celebration-word game-stars">
              {'★'.repeat(stars)}
              {'☆'.repeat(3 - stars)}
            </div>
            <div className="celebration-actions">
              <button
                type="button"
                className="big-btn secondary"
                onClick={restart}
              >
                Otra vez
              </button>
              <button
                type="button"
                className="big-btn primary"
                onClick={onExit}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
