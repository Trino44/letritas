import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  letterExample,
  letterName,
  letterSound,
  PHRASES,
  PRAISE,
} from '@/content/clips';
import { nextLetter } from '@/content/letters';
import type { LetterDef } from '@/content/types';
import { TracingEngine, type EngineEvent } from '@/engine/tracingEngine';
import {
  LEVEL_TOLERANCE,
  recordAttempt,
  type Level,
} from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  playWrongStart,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking, type Clip } from '@/services/speech';
import { TracingBoard } from '../tracing/TracingBoard';

interface Props {
  letter: LetterDef;
  level: Level;
  onHome: () => void;
  onChangeLetter: (letterId: string) => void;
}

function letterIntro(letter: LetterDef): Clip[] {
  return [PHRASES.vamosATrazar, letterName(letter), PHRASES.empiezaPuntoVerde];
}

function letterInfo(letter: LetterDef): Clip[] {
  const sound = letterSound(letter);
  return [letterName(letter), ...(sound ? [sound] : []), letterExample(letter)];
}

export const TraceScreen: React.FC<Props> = ({
  letter,
  level,
  onHome,
  onChangeLetter,
}) => {
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);
  const engine = useMemo(
    () =>
      new TracingEngine(letter.strokes, { tolerance: LEVEL_TOLERANCE[level] }),
    // Un motor nuevo por letra, nivel e intento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letter.id, level, attempt]
  );
  const lastOffSound = useRef(0);
  const celebrateTimer = useRef<number | null>(null);
  const lastWrongStartVoice = useRef(0);
  const praise = useMemo(
    () => PRAISE[Math.floor(Math.random() * PRAISE.length)],
    [attempt, letter.id]
  );

  useEffect(() => {
    setDone(false);
    void play(letterIntro(letter));
    return () => {
      stopSpeaking();
      if (celebrateTimer.current !== null) clearTimeout(celebrateTimer.current);
    };
  }, [letter]);

  const handleEvents = useCallback(
    (events: EngineEvent[]) => {
      const now = performance.now();
      for (const ev of events) {
        switch (ev.type) {
          case 'offPath':
            if (now - lastOffSound.current > 600) {
              playOffPath();
              vibrate(40);
              lastOffSound.current = now;
            }
            break;
          case 'wrongStart':
            playWrongStart();
            if (now - lastWrongStartVoice.current > 5000) {
              void play(PHRASES.empiezaPuntoVerde);
              lastWrongStartVoice.current = now;
            }
            break;
          case 'strokeCompleted':
            if (!engine.isComplete) playStrokeDone();
            break;
          case 'letterCompleted':
            playCelebration();
            vibrate(80);
            recordAttempt(letter.id, level, ev.metrics);
            // Pausa breve para que el niño vea su letra terminada.
            celebrateTimer.current = window.setTimeout(
              () => setDone(true),
              900
            );
            void play([praise, ...letterInfo(letter)]);
            break;
          default:
            break;
        }
      }
    },
    [engine, letter, level, praise]
  );

  const repeat = () => {
    if (celebrateTimer.current !== null) clearTimeout(celebrateTimer.current);
    setDone(false);
    setAttempt((a) => a + 1);
  };

  const next = () => {
    const n = nextLetter(letter.id);
    if (n) onChangeLetter(n.id);
  };

  return (
    <div className="trace-screen">
      <header className="trace-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onHome}
          aria-label="Inicio"
        >
          🏠
        </button>
        <div className="trace-title" aria-live="polite">
          <span className="trace-letter">{letter.char}</span>
          <span className="trace-emoji" aria-hidden="true">
            {letter.emoji}
          </span>
        </div>
        <div className="trace-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => void play(letterInfo(letter))}
            aria-label="Escuchar la letra"
          >
            🔊
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={repeat}
            aria-label="Empezar de nuevo"
          >
            🔄
          </button>
        </div>
      </header>

      <div className="trace-body">
        <TracingBoard
          engine={engine}
          engineKey={`${letter.id}-${level}-${attempt}`}
          onEvents={handleEvents}
        />

        {done && (
          <div className="celebration" role="dialog" aria-label={praise.text}>
            <div className="celebration-card">
              <div className="celebration-emoji" aria-hidden="true">
                {letter.emoji}
              </div>
              <div className="celebration-praise">{praise.text}</div>
              <div className="celebration-word">
                <strong>{letter.char}</strong> de {letter.word}
              </div>
              <div className="celebration-actions">
                <button
                  type="button"
                  className="big-btn secondary"
                  onClick={repeat}
                >
                  Otra vez
                </button>
                <button
                  type="button"
                  className="big-btn primary"
                  onClick={next}
                >
                  Siguiente ➜
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
