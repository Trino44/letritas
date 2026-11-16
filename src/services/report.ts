/**
 * Resumen del progreso para el panel de papás. Funciones puras: reciben los
 * intentos guardados y devuelven lo que se muestra.
 */

import type { LetterDef } from '@/content/types';
import type { ActivityResult, Attempt } from './progress';

export interface LetterSummary {
  id: string;
  char: string;
  count: number;
  lastAt: number | null;
  /** Promedio de salidas del camino en los últimos 5 intentos. */
  recentOffPath: number | null;
}

export interface GameSummary {
  id: string;
  title: string;
  plays: number;
  lastAt: number | null;
  /** Promedio de errores por partida en las últimas 5. */
  recentErrors: number | null;
}

export interface DaySummary {
  /** AAAA-MM-DD en hora local. */
  date: string;
  traces: number;
  games: number;
}

export interface Report {
  totalTraces: number;
  totalGames: number;
  tracingMinutes: number;
  letters: LetterSummary[];
  games: GameSummary[];
  days: DaySummary[];
  /** Sílabas o palabras de Escucha y repite que más le cuestan. */
  toPractice: PracticeItem[];
}

const GAME_PREFIX: [string, string][] = [
  ['escucha-y-toca-', 'Juego de sílabas'],
  ['repite-', 'Escucha y repite'],
  ['memoria-', 'Memoria'],
  ['arma-silaba-', 'Arma la sílaba'],
  ['arma-palabra-', 'Arma la palabra'],
];

const FIXED_TITLES: Record<string, string> = {
  'r-suave-o-rr': 'R suave o RR',
  'con-que-empieza': '¿Con qué empieza?',
};

/** Nombre del juego para mostrar, a partir de su id (p. ej. "memoria-s"). */
export function gameTitle(id: string): string {
  if (FIXED_TITLES[id]) return FIXED_TITLES[id];
  for (const [prefix, title] of GAME_PREFIX) {
    if (id.startsWith(prefix))
      return `${title} · ${id.slice(prefix.length).toUpperCase()}`;
  }
  return id;
}

export interface PracticeItem {
  key: string;
  /** De 0 a 1: qué tan fácil le resulta (1 = lo dice a la primera). */
  score: number;
  times: number;
}

export function localDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function buildReport(
  letters: LetterDef[],
  attempts: Attempt[],
  activities: ActivityResult[],
  now: number,
  days = 7
): Report {
  const letterSummaries = letters.map((l) => {
    const mine = attempts
      .filter((a) => a.letterId === l.id)
      .sort((a, b) => a.at - b.at);
    return {
      id: l.id,
      char: l.char,
      count: mine.length,
      lastAt: mine.length ? mine[mine.length - 1].at : null,
      recentOffPath: avg(mine.slice(-5).map((a) => a.offPathCount)),
    };
  });

  const gameIds = [...new Set(activities.map((a) => a.activityId))];
  const games = gameIds.map((id) => {
    const mine = activities
      .filter((a) => a.activityId === id)
      .sort((a, b) => a.at - b.at);
    return {
      id,
      title: gameTitle(id),
      plays: mine.length,
      lastAt: mine.length ? mine[mine.length - 1].at : null,
      recentErrors: avg(mine.slice(-5).map((a) => a.errors)),
    };
  });

  const dayList: DaySummary[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = localDate(now - i * 86400000);
    dayList.push({
      date,
      traces: attempts.filter((a) => localDate(a.at) === date).length,
      games: activities.filter((a) => localDate(a.at) === date).length,
    });
  }

  const perItem = new Map<string, number[]>();
  for (const a of activities) {
    if (!a.activityId.startsWith('repite-')) continue;
    for (const it of a.items ?? []) {
      const list = perItem.get(it.key) ?? [];
      list.push(it.ok ? 1 / Math.max(1, it.tries) : 0);
      perItem.set(it.key, list);
    }
  }
  const toPractice = [...perItem.entries()]
    .map(([key, scores]) => ({
      key,
      score: avg(scores) ?? 0,
      times: scores.length,
    }))
    .filter((p) => p.score < 0.75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 8);

  return {
    toPractice,
    totalTraces: attempts.length,
    totalGames: activities.length,
    tracingMinutes: Math.round(
      attempts.reduce((a, t) => a + t.durationMs, 0) / 60000
    ),
    letters: letterSummaries,
    games: games.sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0)),
    days: dayList,
  };
}

/** "hoy", "ayer", "hace 3 días" o la fecha. */
export function relativeDay(ts: number | null, now: number): string {
  if (ts === null) return '—';
  const diff = Math.round(
    (new Date(localDate(now)).getTime() - new Date(localDate(ts)).getTime()) /
      86400000
  );
  if (diff <= 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff < 7) return `hace ${diff} días`;
  return localDate(ts);
}
