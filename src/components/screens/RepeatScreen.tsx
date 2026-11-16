/**
 * Escucha y repite: suena una sílaba o palabra, el niño la repite en voz
 * alta y el adulto marca cómo le fue. No se graba la voz del niño.
 */

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES, PRAISE, syllableClip, wordClip } from '@/content/clips';
import type { SyllableGroup } from '@/content/syllables';
import { recordActivity, type ItemResult } from '@/services/progress';
import { playCelebration, playStrokeDone, vibrate } from '@/services/sounds';
import { play, stopSpeaking, type Clip } from '@/services/speech';
import { Syl } from '../ui/Syl';

interface RepeatItem {
  key: string;
  label: string;
  emoji: string;
  clip: Clip;
}

interface Props {
  group: SyllableGroup;
  onExit: () => void;
}

const WORDS_PER_GAME = 3;
const INVERSE_PER_GAME = 2;

function shuffled<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/** Sílabas directas, unas inversas (as, ar) y unas palabras. */
function buildItems(group: SyllableGroup): RepeatItem[] {
  const toItem = (s: { text: string; emoji: string }, clip: Clip) => ({
    key: s.text,
    label: s.text,
    emoji: s.emoji,
    clip,
  });
  const syllables = group.syllables.map((s) => toItem(s, syllableClip(s)));
  const inverse = shuffled(group.inverse ?? [])
    .slice(0, INVERSE_PER_GAME)
    .map((s) => toItem(s, syllableClip(s)));
  const words = shuffled(group.syllables)
    .slice(0, WORDS_PER_GAME - (inverse.length ? 1 : 0))
    .map((s) => ({
      key: s.word,
      label: s.word,
      emoji: s.emoji,
      clip: wordClip(s.word),
    }));
  return [...syllables, ...inverse, ...words];
}

export const RepeatScreen: React.FC<Props> = ({ group, onExit }) => {
  const [game, setGame] = useState(0);
  // Elementos nuevos en cada partida.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => buildItems(group), [group.id, game]);
  const [index, setIndex] = useState(0);
  const [tries, setTries] = useState(1);
  const [celebrate, setCelebrate] = useState(false);
  const results = useRef<ItemResult[]>([]);
  const timer = useRef<number | null>(null);
  const item = items[index];
  const finished = index >= items.length;

  useEffect(() => {
    if (!item) return;
    void play(
      index === 0 ? [PHRASES.escuchaYRepite, item.clip] : item.clip,
      0.65
    );
    // Solo al cambiar de elemento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, game]);

  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current !== null) clearTimeout(timer.current);
    },
    []
  );

  const next = (ok: boolean) => {
    if (!item) return;
    results.current.push({ key: item.key, ok, tries });
    const nextIndex = index + 1;
    setTries(1);
    setCelebrate(false);
    setIndex(nextIndex);
    if (nextIndex >= items.length) {
      const good = results.current.filter((r) => r.ok).length;
      recordActivity(
        `repite-${group.id}`,
        good,
        items.length - good,
        results.current
      );
      playCelebration();
      vibrate(80);
      void play(PHRASES.terminaste);
    }
  };

  const markOk = () => {
    if (celebrate) return;
    playStrokeDone();
    setCelebrate(true);
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    void play(praise);
    timer.current = window.setTimeout(() => next(true), 1300);
  };

  const again = () => {
    if (!item || celebrate) return;
    setTries((t) => t + 1);
    void play(item.clip, 0.6);
  };

  const restart = () => {
    results.current = [];
    setIndex(0);
    setTries(1);
    setCelebrate(false);
    setGame((g) => g + 1);
  };

  const firstTry = results.current.filter((r) => r.ok && r.tries === 1).length;

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
        <div
          className="game-dots"
          aria-label={`${Math.min(index + 1, items.length)} de ${items.length}`}
        >
          {items.map((it, i) => (
            <span
              key={it.key}
              className={
                i < index ? 'dot done' : i === index ? 'dot current' : 'dot'
              }
            />
          ))}
        </div>
        <span className="icon-spacer" />
      </header>

      {item && (
        <div className="repeat-body">
          <button
            type="button"
            className={celebrate ? 'repeat-card right' : 'repeat-card'}
            onClick={() => void play(item.clip, 0.6)}
            aria-label={`Escuchar ${item.label}`}
          >
            <span className="repeat-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <Syl text={item.label} className="repeat-label" />
            <span className="repeat-hint">🔊 toca para escuchar</span>
          </button>

          <div className="repeat-adult">
            <span className="repeat-adult-title">
              Para el adulto: ¿lo dijo bien?
            </span>
            <div className="repeat-actions">
              <button
                type="button"
                className="big-btn primary"
                onClick={markOk}
              >
                ✓ Lo dijo bien
              </button>
              <button
                type="button"
                className="big-btn secondary"
                onClick={again}
              >
                🔁 Otra vez
              </button>
              <button
                type="button"
                className="big-btn ghost"
                onClick={() => next(false)}
              >
                Pasar ⏭
              </button>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              🗣️
            </div>
            <div className="celebration-praise">¡Terminaste!</div>
            <div className="celebration-word game-stars">
              {'★'.repeat(firstTry)}
              {'☆'.repeat(items.length - firstTry)}
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
