/**
 * Lee conmigo: una oración a la vez. Se puede escuchar completa, palabra por
 * palabra (con la palabra resaltada) o tocando cada palabra. El adulto marca
 * si la leyó solo o con ayuda (como "palomear" en el cuadernillo).
 */

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PHRASES, PRAISE, sentenceClip, wordClip } from '@/content/clips';
import { wordsOf, type UnitReading } from '@/content/reading';
import { recordActivity, type ItemResult } from '@/services/progress';
import { playCelebration, playStrokeDone, vibrate } from '@/services/sounds';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  reading: UnitReading;
  onExit: () => void;
}

export const ReadScreen: React.FC<Props> = ({ reading, onExit }) => {
  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const results = useRef<ItemResult[]>([]);
  const busy = useRef(0);
  const sentence = reading.sentences[index];
  const finished = index >= reading.sentences.length;
  const words = sentence ? wordsOf(sentence) : [];

  useEffect(() => {
    if (index === 0 && !finished) void play(PHRASES.leeConmigo);
    // Solo al empezar cada partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => () => stopSpeaking(), []);

  const stop = () => {
    busy.current++;
    stopSpeaking();
    setHighlight(null);
  };

  const listenAll = () => {
    stop();
    void play(sentenceClip(reading.id, index, sentence), 0.8);
  };

  const wordByWord = async () => {
    stop();
    const me = busy.current;
    for (let i = 0; i < words.length; i++) {
      if (busy.current !== me) return;
      setHighlight(i);
      await play(wordClip(words[i].spoken), 0.7);
    }
    if (busy.current === me) setHighlight(null);
  };

  const tapWord = (i: number) => {
    stop();
    setHighlight(i);
    void play(wordClip(words[i].spoken), 0.7).then(() =>
      setHighlight((h) => (h === i ? null : h))
    );
  };

  const mark = (alone: boolean) => {
    stop();
    results.current.push({ key: `oracion-${index + 1}`, ok: alone, tries: 1 });
    if (alone) {
      playStrokeDone();
      void play(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    }
    const next = index + 1;
    setIndex(next);
    if (next >= reading.sentences.length) {
      const good = results.current.filter((r) => r.ok).length;
      recordActivity(
        `lee-${reading.id}`,
        good,
        reading.sentences.length - good,
        results.current
      );
      playCelebration();
      vibrate(80);
    }
  };

  const restart = () => {
    results.current = [];
    setIndex(0);
    setRound((r) => r + 1);
  };

  const alone = results.current.filter((r) => r.ok).length;

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
          aria-label={`Oración ${Math.min(index + 1, reading.sentences.length)}`}
        >
          {reading.sentences.map((_, i) => (
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

      {!finished && (
        <div className="read-body">
          <div className="read-sentence" aria-label={sentence}>
            {words.map((w, i) => (
              <button
                key={`${w.shown}-${i}`}
                type="button"
                className={highlight === i ? 'read-word active' : 'read-word'}
                onClick={() => tapWord(i)}
              >
                {w.shown}
              </button>
            ))}
          </div>

          <div className="read-controls">
            <button
              type="button"
              className="big-btn secondary"
              onClick={listenAll}
            >
              🔊 Escuchar
            </button>
            <button
              type="button"
              className="big-btn secondary"
              onClick={() => void wordByWord()}
            >
              🐢 Palabra por palabra
            </button>
          </div>

          <div className="read-adult">
            <span className="repeat-adult-title">
              Para el adulto: ¿cómo la leyó?
            </span>
            <div className="read-controls">
              <button
                type="button"
                className="big-btn primary"
                onClick={() => mark(true)}
              >
                ✓ La leyó solo
              </button>
              <button
                type="button"
                className="big-btn ghost"
                onClick={() => mark(false)}
              >
                Con ayuda ➜
              </button>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="game-body">
          <div className="celebration-card">
            <div className="celebration-emoji" aria-hidden="true">
              📖
            </div>
            <div className="celebration-praise">¡Terminaste de leer!</div>
            <div className="celebration-word">
              Leyó solo {alone} de {reading.sentences.length}
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
