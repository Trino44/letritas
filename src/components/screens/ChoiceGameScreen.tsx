/**
 * Juego genérico de "escucha y elige": suena algo y el niño toca la opción
 * correcta. Sirve para sílabas (sa / se / si) y para pares de palabras
 * (pera / perra).
 */

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, PRAISE } from '@/content/clips';
import type { Round } from '@/games/listenAndTap';
import { recordActivity } from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking, type Clip } from '@/services/speech';

export interface ChoiceItem {
  key: string;
  /** Texto grande en la tarjeta. */
  label: string;
  emoji: string;
  /** Lo que suena como objetivo. */
  clip: Clip;
  /** Lo que suena al acertar (además de la felicitación). */
  rewardClips: Clip[];
}

interface Props {
  activityId: string;
  intro: Clip;
  /** true = la imagen se ve siempre (para palabras); false = solo al acertar. */
  showEmoji: boolean;
  /** Muestra en grande la imagen del objetivo (p. ej. ¿Con qué empieza?). */
  showTargetEmoji?: boolean;
  makeRounds: () => Round<ChoiceItem>[];
  onExit: () => void;
  exitIcon: string;
  exitLabel: string;
}

type Feedback = { kind: 'none' } | { kind: 'right' | 'wrong'; key: string };

export const ChoiceGameScreen: React.FC<Props> = ({
  activityId,
  intro,
  showEmoji,
  showTargetEmoji = false,
  makeRounds,
  onExit,
  exitIcon,
  exitLabel,
}) => {
  const [game, setGame] = useState(0);
  // Rondas nuevas en cada partida.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => makeRounds(), [game]);
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
        withIntro ? [intro, round.target.clip] : round.target.clip,
        0.7
      );
    },
    [round, intro]
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

  const choose = (opt: ChoiceItem) => {
    if (!round || feedback.kind === 'right') return;
    if (opt.key === round.target.key) {
      playStrokeDone();
      const clean = !wrongThisRound.current;
      if (clean) setFirstTry((n) => n + 1);
      setFeedback({ kind: 'right', key: opt.key });
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      void play([praise, ...round.target.rewardClips], 0.75);
      timer.current = window.setTimeout(() => {
        wrongThisRound.current = false;
        setFeedback({ kind: 'none' });
        const nextIndex = index + 1;
        setIndex(nextIndex);
        if (nextIndex >= rounds.length) {
          playCelebration();
          vibrate(80);
          recordActivity(activityId, rounds.length, errors);
          void play(PHRASES.terminaste);
        }
      }, 2200);
    } else {
      playOffPath();
      vibrate(40);
      wrongThisRound.current = true;
      setErrors((n) => n + 1);
      setFeedback({ kind: 'wrong', key: opt.key });
      void play([PHRASES.intentaOtraVez, round.target.clip], 0.7);
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
          onClick={onExit}
          aria-label={exitLabel}
        >
          {exitIcon}
        </button>
        <div
          className="game-dots"
          aria-label={`Ronda ${Math.min(index + 1, rounds.length)} de ${rounds.length}`}
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
        <span className="icon-spacer" />
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
          {showTargetEmoji && (
            <button
              type="button"
              className="target-emoji"
              onClick={() => sayTarget(false)}
              aria-label="Escuchar la palabra"
            >
              {round.target.emoji}
            </button>
          )}
          <div className="game-options">
            {round.options.map((opt) => {
              const state =
                feedback.kind !== 'none' && feedback.key === opt.key
                  ? feedback.kind
                  : '';
              const emojiVisible =
                (showEmoji || state === 'right') && opt.emoji !== '';
              return (
                <button
                  key={opt.key}
                  type="button"
                  className={`syl-card option ${state}`}
                  onClick={() => choose(opt)}
                  aria-label={opt.label}
                >
                  {emojiVisible && (
                    <span className="syl-emoji" aria-hidden="true">
                      {opt.emoji}
                    </span>
                  )}
                  <span className={showEmoji ? 'syl-word-big' : 'syl-text'}>
                    {opt.label}
                  </span>
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
              {'☆'.repeat(rounds.length - firstTry)}
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
