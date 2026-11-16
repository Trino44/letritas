/**
 * Arma la sílaba / Arma la palabra: suena el objetivo y el niño toca las
 * piezas en orden para formarlo.
 */

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, PRAISE, wordClip, type Clip } from '@/content/clips';
import { isCorrect, type BuildRound } from '@/games/build';
import { recordActivity } from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  activityId: string;
  title: string;
  mode: 'syllable' | 'word';
  makeRounds: () => BuildRound[];
  onExit: () => void;
}

type Status = 'playing' | 'right' | 'wrong';

function targetClip(round: BuildRound, mode: 'syllable' | 'word'): Clip {
  return mode === 'syllable'
    ? { id: `silaba-${round.target}`, text: round.target }
    : wordClip(round.word);
}

export const BuildScreen: React.FC<Props> = ({
  activityId,
  title,
  mode,
  makeRounds,
  onExit,
}) => {
  const [game, setGame] = useState(0);
  // Rondas nuevas en cada partida.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => makeRounds(), [game]);
  const [index, setIndex] = useState(0);
  /** Índices de las piezas colocadas, en orden. */
  const [placed, setPlaced] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>('playing');
  const [errors, setErrors] = useState(0);
  const [clean, setClean] = useState(0);
  const failedThisRound = useRef(false);
  const timer = useRef<number | null>(null);
  const round = rounds[index];
  const finished = index >= rounds.length;
  const intro = mode === 'syllable' ? PHRASES.armaSilaba : PHRASES.armaPalabra;

  useEffect(() => {
    if (round)
      void play(
        index === 0
          ? [intro, targetClip(round, mode)]
          : targetClip(round, mode),
        0.7
      );
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

  const check = (nextPlaced: number[]) => {
    if (!round || nextPlaced.length < round.answer.length) return;
    const pieces = nextPlaced.map((i) => round.tiles[i]);
    if (isCorrect(round, pieces)) {
      setStatus('right');
      playStrokeDone();
      if (!failedThisRound.current) setClean((n) => n + 1);
      const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      const reward: Clip[] =
        mode === 'syllable'
          ? [praise, targetClip(round, mode), wordClip(round.word)]
          : [praise, wordClip(round.word)];
      void play(reward, 0.75);
      timer.current = window.setTimeout(() => {
        failedThisRound.current = false;
        setPlaced([]);
        setStatus('playing');
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
      setStatus('wrong');
      failedThisRound.current = true;
      setErrors((n) => n + 1);
      playOffPath();
      vibrate(40);
      void play([PHRASES.intentaOtraVez, targetClip(round, mode)], 0.7);
      timer.current = window.setTimeout(() => {
        setPlaced([]);
        setStatus('playing');
      }, 900);
    }
  };

  const tapTile = (i: number) => {
    if (!round || status !== 'playing' || placed.includes(i)) return;
    if (placed.length >= round.answer.length) return;
    const next = [...placed, i];
    setPlaced(next);
    check(next);
  };

  const tapSlot = (slot: number) => {
    if (status !== 'playing' || slot >= placed.length) return;
    setPlaced(placed.filter((_, k) => k !== slot));
  };

  const restart = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    setIndex(0);
    setPlaced([]);
    setStatus('playing');
    setErrors(0);
    setClean(0);
    failedThisRound.current = false;
    setGame((g) => g + 1);
  };

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
        <div className="game-dots" aria-label={title}>
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
        <div className="build-body">
          <div className="build-prompt">
            <button
              type="button"
              className="listen-btn small"
              onClick={() => void play(targetClip(round, mode), 0.65)}
              aria-label="Escuchar otra vez"
            >
              🔊
            </button>
            {mode === 'word' && (
              <span className="build-emoji" aria-hidden="true">
                {round.emoji}
              </span>
            )}
            {status === 'right' && mode === 'syllable' && (
              <span className="build-emoji" aria-hidden="true">
                {round.emoji}
              </span>
            )}
          </div>

          <div className={`build-slots ${status}`}>
            {round.answer.map((_, slot) => (
              <button
                key={slot}
                type="button"
                className={
                  placed[slot] !== undefined
                    ? 'build-slot filled'
                    : 'build-slot'
                }
                onClick={() => tapSlot(slot)}
                aria-label={
                  placed[slot] !== undefined
                    ? `Quitar ${round.tiles[placed[slot]]}`
                    : 'Casilla vacía'
                }
              >
                {placed[slot] !== undefined ? round.tiles[placed[slot]] : ''}
              </button>
            ))}
          </div>

          <div className="build-tiles">
            {round.tiles.map((t, i) => (
              <button
                key={`${t}-${i}`}
                type="button"
                className={
                  placed.includes(i) ? 'build-tile used' : 'build-tile'
                }
                onClick={() => tapTile(i)}
                disabled={placed.includes(i)}
                aria-label={`Pieza ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              🧩
            </div>
            <div className="celebration-praise">¡Terminaste!</div>
            <div className="celebration-word game-stars">
              {'★'.repeat(clean)}
              {'☆'.repeat(rounds.length - clean)}
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
