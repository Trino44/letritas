import { describe, expect, it } from 'vitest';
import { CONSONANT_MODULES } from '@/content/modules';
import { findReading, READING, wordsOf } from '@/content/reading';

describe('lectura', () => {
  it('cada consonante tiene oraciones y un cuento', () => {
    for (const m of CONSONANT_MODULES) expect(findReading(m.id)).toBeDefined();
  });

  it('oraciones y cuentos bien formados', () => {
    for (const r of READING) {
      expect(r.sentences.length).toBeGreaterThanOrEqual(4);
      for (const s of [...r.sentences, ...r.story.sentences])
        expect(s).toMatch(/[.!?]$/);
      expect(r.story.sentences.length).toBeGreaterThanOrEqual(4);
      expect(r.story.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of r.story.questions) expect(q.text).toMatch(/^¿.*\?$/);
      // Que no todas las respuestas sean "sí".
      expect(r.story.questions.some((q) => !q.answer)).toBe(true);
    }
  });

  it('separa palabras sin signos', () => {
    expect(wordsOf('El loro dice: ¡hola, Sara!').map((w) => w.spoken)).toEqual([
      'el',
      'loro',
      'dice',
      'hola',
      'sara',
    ]);
  });
});
