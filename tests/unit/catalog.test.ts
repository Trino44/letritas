import { describe, expect, it } from 'vitest';
import { findSyllableGroup } from '@/content/syllables';
import { VOCABULARY } from '@/content/vocabulary';
import {
  completeWordGame,
  identifyLetterGame,
  sPairsGame,
  vocabGame,
} from '@/games/catalog';

describe('juegos del catálogo', () => {
  it('Toca la letra: el objetivo suena con el nombre de la letra', () => {
    for (const r of identifyLetterGame().makeRounds()) {
      expect(r.options.map((o) => o.key)).toContain(r.target.key);
      expect(r.target.clip.id).toBe(`letra-${r.target.key.toLowerCase()}`);
    }
  });

  it('Completa la palabra: el objetivo trae imagen y palabra con hueco', () => {
    const g = completeWordGame(findSyllableGroup('s')!);
    for (const r of g.makeRounds()) {
      expect(r.target.prompt).toContain('＿');
      expect(r.target.emoji).not.toBe('');
      expect(r.options.map((o) => o.key)).toContain(r.target.key);
    }
  });

  it('¿S o no S? alterna palabras con y sin S', () => {
    const rounds = sPairsGame().makeRounds();
    expect(rounds).toHaveLength(6);
    for (const r of rounds) expect(r.options).toHaveLength(2);
  });

  it('vocabulario: palabras únicas por tema y juego válido', () => {
    for (const c of VOCABULARY) {
      expect(new Set(c.words.map((w) => w.word)).size).toBe(c.words.length);
      expect(c.words.length).toBeGreaterThanOrEqual(6);
      for (const r of vocabGame(c).makeRounds()) {
        expect(r.options).toHaveLength(3);
        expect(r.options.map((o) => o.key)).toContain(r.target.key);
      }
    }
  });
});
