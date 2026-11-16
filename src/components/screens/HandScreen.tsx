/**
 * La mano de las sílabas (idea del cuadernillo): la consonante en la palma
 * y una sílaba en cada dedo. Tocar un dedo dice la sílaba y su palabra.
 */

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  letterName,
  letterSound,
  syllableClip,
  wordClip,
} from '@/content/clips';
import { LETTER_GROUPS } from '@/content/letters';
import type { SyllableDef, SyllableGroup } from '@/content/syllables';
import { syllableColor } from '@/content/vowelColors';
import { play, stopSpeaking } from '@/services/speech';

interface Props {
  group: SyllableGroup;
  onExit: () => void;
}

const FINGERS = ['pulgar', 'indice', 'medio', 'anular', 'menique'] as const;

export const HandScreen: React.FC<Props> = ({ group, onExit }) => {
  const [inverse, setInverse] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const syllables: SyllableDef[] =
    inverse && group.inverse ? group.inverse : group.syllables;
  const letters = LETTER_GROUPS.find((g) => g.id === group.id)?.letters ?? [];
  const letter = letters[letters.length - 1];

  useEffect(() => () => stopSpeaking(), []);

  const tapFinger = (s: SyllableDef) => {
    setActive(s.text);
    void play([syllableClip(s), wordClip(s.word)], 0.7).then(() =>
      setActive((a) => (a === s.text ? null : a))
    );
  };

  const tapPalm = () => {
    if (!letter) return;
    const sound = letterSound(letter);
    void play([letterName(letter), ...(sound ? [sound] : [])], 0.75);
  };

  const playAll = async () => {
    for (const s of syllables) {
      setActive(s.text);
      await play(syllableClip(s), 0.7);
    }
    setActive(null);
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
        <h1 className="syl-title">La mano de la {group.letter}</h1>
        <button
          type="button"
          className="icon-btn"
          onClick={() => void playAll()}
          aria-label="Decir todas"
        >
          🔊
        </button>
      </header>

      <div className="hand-body">
        <div
          className="hand"
          role="group"
          aria-label={`Mano de sílabas con ${group.letter}`}
        >
          {syllables.slice(0, 5).map((s, i) => {
            const color = syllableColor(s.text, 'light') ?? '#5e35b1';
            return (
              <button
                key={s.text}
                type="button"
                className={`finger finger-${FINGERS[i]}${active === s.text ? ' active' : ''}`}
                style={{ '--finger-color': color } as React.CSSProperties}
                onClick={() => tapFinger(s)}
                aria-label={`Sílaba ${s.text}`}
              >
                <span className="finger-label" style={{ color }}>
                  {s.text}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="palm"
            onClick={tapPalm}
            aria-label={`Letra ${group.letter}`}
          >
            <span className="palm-letter">{group.letter.toLowerCase()}</span>
          </button>
        </div>

        <div className="hand-side">
          {group.inverse && group.inverse.length > 0 && (
            <div
              className="segmented"
              role="radiogroup"
              aria-label="Tipo de sílabas"
            >
              <button
                type="button"
                role="radio"
                aria-checked={!inverse}
                className={!inverse ? 'seg active' : 'seg'}
                onClick={() => setInverse(false)}
              >
                {group.syllables[0].text} {group.syllables[1].text}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={inverse}
                className={inverse ? 'seg active' : 'seg'}
                onClick={() => setInverse(true)}
              >
                {group.inverse[0].text} {group.inverse[1].text}
              </button>
            </div>
          )}
          <p className="hand-hint">
            Toca un dedo para escuchar la sílaba. Toca la palma para la letra.
          </p>
        </div>
      </div>
    </div>
  );
};
