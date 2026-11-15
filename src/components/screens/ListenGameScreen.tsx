import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, PRAISE, syllableClip, wordClip } from '@/content/clips';
import type { SyllableDef, SyllableGroup } from '@/content/syllables';
import { makeRounds } from '@/games/listenAndTap';
import { recordActivity } from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  group: SyllableGroup;
  onHome: () => void;
  onBack: () => void;
}

const ROUNDS = 5;

type Feedback =
  | { kind: 'none' }
  | { kind: 'right'; text: string }
  | { kind: 'wrong'; text: string };

export const ListenGameScreen: React.FC<Props> = ({
  group,
  onHome,
  onBack,
}) => {
  const [game, setGame] = useState(0);
  const rounds = useMemo(
    () => makeRounds(group.syllables, ROUNDS),
    // Rondas nuevas en cada partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group.id, game]
  );
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'none' });
  const [errors, setErrors] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const wrongThisRound = useRef(false);
  const timer = useRef<number | null>(null);
  const finished = index >= rounds.length;
  const round = finished ? null : rounds[index];

  const sayTarget = useCallback(
    (withIntro: boolean) => {
      if (!round) return;
      void play(
        withIntro
          ? [PHRASES.escuchaYToca, syllableClip(round.target)]
          : syllableClip(round.target),
        0.7
      );
    },
    [round]
  );

  useEffect(() => {
    if (round) sayTarget(index === 0);
    // Solo al cambiar de ronda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, game]);

  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current !== null) clearTimeout(timer.current);
    },
    []
  );

  const choose = (opt: SyllableDef) => {
    if (!round || feedback.kind === 'right') return;
    if (opt === round.target) {
      playStrokeDone();
      if (!wrongThisRound.current) setFirstTry((n) => n + 1);
      setFeedback({ kind: 'right', text: opt.text });
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      void play([praise, syllableClip(opt), wordClip(opt.word)], 0.75);
      timer.current = window.setTimeout(() => {
        wrongThisRound.current = false;
        setFeedback({ kind: 'none' });
        const nextIndex = index + 1;
        setIndex(nextIndex);
        if (nextIndex >= rounds.length) {
          playCelebration();
          vibrate(80);
          recordActivity(`escucha-y-toca-${group.id}`, ROUNDS, errors);
          void play(PHRASES.terminaste);
        }
      }, 2200);
    } else {
      playOffPath();
      vibrate(40);
      wrongThisRound.current = true;
      setErrors((n) => n + 1);
      setFeedback({ kind: 'wrong', text: opt.text });
      void play([PHRASES.intentaOtraVez, syllableClip(round.target)], 0.7);
      timer.current = window.setTimeout(
        () => setFeedback({ kind: 'none' }),
        700
      );
    }
  };

  const restart = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    setIndex(0);
    setErrors(0);
    setFirstTry(0);
    setFeedback({ kind: 'none' });
    wrongThisRound.current = false;
    setGame((g) => g + 1);
  };

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
        <div
          className="game-dots"
          aria-label={`Ronda ${Math.min(index + 1, ROUNDS)} de ${ROUNDS}`}
        >
          {rounds.map((_, i) => (
            <span
              key={i}
              className={
                i < index ? 'dot done' : i === index ? 'dot current' : 'dot'
              }
            />
          ))}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onBack}
          aria-label="Ver sílabas"
        >
          🔤
        </button>
      </header>

      {round && (
        <div className="game-body">
          <button
            type="button"
            className="listen-btn"
            onClick={() => sayTarget(false)}
            aria-label="Escuchar otra vez"
          >
            🔊
          </button>
          <div className="game-options">
            {round.options.map((opt) => {
              const state =
                feedback.kind !== 'none' && feedback.text === opt.text
                  ? feedback.kind
                  : '';
              return (
                <button
                  key={opt.text}
                  type="button"
                  className={`syl-card option ${state}`}
                  onClick={() => choose(opt)}
                  aria-label={`Sílaba ${opt.text}`}
                >
                  <span className="syl-text">{opt.text}</span>
                  {state === 'right' && (
                    <span className="syl-emoji" aria-hidden="true">
                      {opt.emoji}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {finished && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              🏆
            </div>
            <div className="celebration-praise">¡Terminaste!</div>
            <div className="celebration-word game-stars">
              {'★'.repeat(firstTry)}
              {'☆'.repeat(ROUNDS - firstTry)}
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
                onClick={onHome}
              >
                Inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
