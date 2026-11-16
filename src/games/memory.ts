/**
 * Lógica del juego de memoria: parejas de tarjetas imagen ↔ texto
 * (p. ej. 🐸 con "sa"). Sin React.
 */

import type { Rng } from './listenAndTap';

export interface MemoryItem {
  key: string;
  label: string;
  emoji: string;
}

export interface MemoryCard {
  id: string;
  key: string;
  face: 'image' | 'text';
}

export interface MemoryState {
  cards: MemoryCard[];
  /** Tarjetas volteadas que aún no forman pareja (0, 1 o 2). */
  open: string[];
  matched: string[];
  moves: number;
}

export type FlipResult = 'ignored' | 'first' | 'match' | 'nomatch';

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newMemoryGame(
  items: MemoryItem[],
  pairs: number,
  rng: Rng = Math.random
): MemoryState {
  const chosen = shuffle(items, rng).slice(0, Math.min(pairs, items.length));
  const cards = chosen.flatMap((it): MemoryCard[] => [
    { id: `${it.key}-img`, key: it.key, face: 'image' },
    { id: `${it.key}-txt`, key: it.key, face: 'text' },
  ]);
  return { cards: shuffle(cards, rng), open: [], matched: [], moves: 0 };
}

/** Voltea una tarjeta. No modifica el estado recibido. */
export function flip(
  state: MemoryState,
  cardId: string
): { state: MemoryState; result: FlipResult } {
  const card = state.cards.find((c) => c.id === cardId);
  if (
    !card ||
    state.matched.includes(card.key) ||
    state.open.includes(cardId) ||
    state.open.length >= 2
  ) {
    return { state, result: 'ignored' };
  }
  const open = [...state.open, cardId];
  if (open.length === 1) return { state: { ...state, open }, result: 'first' };

  const first = state.cards.find((c) => c.id === open[0])!;
  const moves = state.moves + 1;
  if (first.key === card.key) {
    return {
      state: {
        ...state,
        open: [],
        matched: [...state.matched, card.key],
        moves,
      },
      result: 'match',
    };
  }
  return { state: { ...state, open, moves }, result: 'nomatch' };
}

/** Cierra las dos tarjetas que no hicieron pareja. */
export function closeOpen(state: MemoryState): MemoryState {
  return { ...state, open: [] };
}

export function isFinished(state: MemoryState): boolean {
  return state.matched.length * 2 === state.cards.length;
}
