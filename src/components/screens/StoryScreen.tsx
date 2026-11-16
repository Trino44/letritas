/**
 * Cuento corto: se escucha resaltando la oración que se está leyendo, y al
 * final hay preguntas de Sí o No (como "Tacha SÍ o NO" del cuadernillo).
 */

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  PHRASES,
  PRAISE,
  questionClip,
  storyClip,
  storyTitleClip,
} from '@/content/clips';
import type { UnitReading } from '@/content/reading';
import { recordActivity } from '@/services/progress';
import {
  playCelebration,
  playOffPath,
  playStrokeDone,
  vibrate,
} from '@/services/sounds';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  reading: UnitReading;
  onExit: () => void;
}

type Mode = 'story' | 'questions' | 'done';

export const StoryScreen: React.FC<Props> = ({ reading, onExit }) => {
  const { story } = reading;
  const [mode, setMode] = useState<Mode>('story');
  const [current, setCurrent] = useState<number | null>(null);
  const [q, setQ] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [errors, setErrors] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const wrongThis = useRef(false);
  const busy = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current !== null) clearTimeout(timer.current);
    },
    []
  );

  const stop = () => {
    busy.current++;
    stopSpeaking();
    setCurrent(null);
  };

  const readAll = async () => {
    stop();
    const me = busy.current;
    await play(
      [PHRASES.escuchaCuento, storyTitleClip(reading.id, story.title)],
      0.85
    );
    for (let i = 0; i < story.sentences.length; i++) {
      if (busy.current !== me) return;
      setCurrent(i);
      await play(storyClip(reading.id, i, story.sentences[i]), 0.8);
    }
    if (busy.current === me) setCurrent(null);
  };

  const readOne = (i: number) => {
    stop();
    setCurrent(i);
    void play(storyClip(reading.id, i, story.sentences[i]), 0.8).then(() =>
      setCurrent((c) => (c === i ? null : c))
    );
  };

  const startQuestions = () => {
    stop();
    setMode('questions');
    setQ(0);
    void play(
      [
        PHRASES.respondeSiNo,
        questionClip(reading.id, 0, story.questions[0].text),
      ],
      0.8
    );
  };

  const answer = (yes: boolean) => {
    const question = story.questions[q];
    if (!question || feedback === 'right') return;
    if (yes === question.answer) {
      setFeedback('right');
      playStrokeDone();
      if (!wrongThis.current) setFirstTry((n) => n + 1);
      void play(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      timer.current = window.setTimeout(() => {
        wrongThis.current = false;
        setFeedback(null);
        const next = q + 1;
        if (next >= story.questions.length) {
          setMode('done');
          playCelebration();
          vibrate(80);
          recordActivity(
            `cuento-${reading.id}`,
            story.questions.length,
            errors
          );
          void play(PHRASES.terminaste);
        } else {
          setQ(next);
          void play(
            questionClip(reading.id, next, story.questions[next].text),
            0.8
          );
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      wrongThis.current = true;
      setErrors((n) => n + 1);
      playOffPath();
      vibrate(40);
      void play(
        [PHRASES.intentaOtraVez, questionClip(reading.id, q, question.text)],
        0.8
      );
      timer.current = window.setTimeout(() => setFeedback(null), 800);
    }
  };

  const restart = () => {
    setMode('story');
    setQ(0);
    setErrors(0);
    setFirstTry(0);
    setFeedback(null);
    wrongThis.current = false;
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
        <h1 className="syl-title">{story.title}</h1>
        <span className="icon-spacer" />
      </header>

      {mode === 'story' && (
        <div className="story-body">
          <div className="story-picture" aria-hidden="true">
            {story.picture}
          </div>
          <div className="story-text">
            {story.sentences.map((t, i) => (
              <button
                key={i}
                type="button"
                className={current === i ? 'story-line active' : 'story-line'}
                onClick={() => readOne(i)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="read-controls">
            <button
              type="button"
              className="big-btn secondary"
              onClick={() => void readAll()}
            >
              🔊 Escuchar el cuento
            </button>
            <button
              type="button"
              className="big-btn primary"
              onClick={startQuestions}
            >
              Preguntas ➜
            </button>
          </div>
        </div>
      )}

      {mode === 'questions' && story.questions[q] && (
        <div className="story-body">
          <div
            className="game-dots"
            aria-label={`Pregunta ${q + 1} de ${story.questions.length}`}
          >
            {story.questions.map((_, i) => (
              <span
                key={i}
                className={i < q ? 'dot done' : i === q ? 'dot current' : 'dot'}
              />
            ))}
          </div>
          <button
            type="button"
            className="question-text"
            onClick={() =>
              void play(
                questionClip(reading.id, q, story.questions[q].text),
                0.8
              )
            }
          >
            {story.questions[q].text} 🔊
          </button>
          <div className={`yes-no ${feedback ?? ''}`}>
            <button
              type="button"
              className="big-btn yes"
              onClick={() => answer(true)}
            >
              ✅ Sí
            </button>
            <button
              type="button"
              className="big-btn no"
              onClick={() => answer(false)}
            >
              ❌ No
            </button>
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              {story.picture}
            </div>
            <div className="celebration-praise">¡Muy bien!</div>
            <div className="celebration-word game-stars">
              {'★'.repeat(firstTry)}
              {'☆'.repeat(story.questions.length - firstTry)}
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
