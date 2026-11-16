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
}

export const GAME_TITLES: Record<string, string> = {
  'escucha-y-toca-s': 'Sílabas con S',
  'escucha-y-toca-r': 'Sílabas con R',
  'r-suave-o-rr': 'R suave o RR',
  'con-que-empieza': '¿Con qué empieza?',
};

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

  const gameIds = [
    ...new Set([
      ...Object.keys(GAME_TITLES),
      ...activities.map((a) => a.activityId),
    ]),
  ];
  const games = gameIds.map((id) => {
    const mine = activities
      .filter((a) => a.activityId === id)
      .sort((a, b) => a.at - b.at);
    return {
      id,
      title: GAME_TITLES[id] ?? id,
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

  return {
    totalTraces: attempts.length,
    totalGames: activities.length,
    tracingMinutes: Math.round(
      attempts.reduce((a, t) => a + t.durationMs, 0) / 60000
    ),
    letters: letterSummaries,
    games,
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
