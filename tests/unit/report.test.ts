import { describe, expect, it } from 'vitest';
import { ALL_LETTERS } from '@/content/letters';
import type { ActivityResult, Attempt } from '@/services/progress';
import { buildReport, localDate, relativeDay } from '@/services/report';

const NOW = new Date(2026, 10, 15, 18, 0).getTime();
const DAY = 86400000;

function attempt(letterId: string, at: number, offPathCount = 0): Attempt {
  return {
    letterId,
    at,
    level: 'facil',
    durationMs: 30000,
    offPathCount,
    wrongStarts: 0,
  };
}

describe('buildReport', () => {
  const attempts = [
    attempt('A', NOW - 2 * DAY, 4),
    attempt('A', NOW - DAY, 2),
    attempt('A', NOW, 0),
    attempt('S', NOW, 1),
  ];
  const activities: ActivityResult[] = [
    { activityId: 'r-suave-o-rr', at: NOW, correct: 6, errors: 2 },
    { activityId: 'r-suave-o-rr', at: NOW - DAY, correct: 6, errors: 4 },
  ];
  const report = buildReport(ALL_LETTERS, attempts, activities, NOW);

  it('totales', () => {
    expect(report.totalTraces).toBe(4);
    expect(report.totalGames).toBe(2);
    expect(report.tracingMinutes).toBe(2);
  });

  it('resumen por letra', () => {
    const a = report.letters.find((l) => l.id === 'A')!;
    expect(a.count).toBe(3);
    expect(a.lastAt).toBe(NOW);
    expect(a.recentOffPath).toBe(2);
    expect(report.letters.find((l) => l.id === 'E')!.count).toBe(0);
  });

  it('resumen por juego incluye juegos sin jugar', () => {
    const rr = report.games.find((g) => g.id === 'r-suave-o-rr')!;
    expect(rr.plays).toBe(2);
    expect(rr.recentErrors).toBe(3);
    expect(report.games.find((g) => g.id === 'con-que-empieza')!.plays).toBe(0);
  });

  it('últimos 7 días, de más viejo a hoy', () => {
    expect(report.days).toHaveLength(7);
    expect(report.days[6]).toEqual({
      date: localDate(NOW),
      traces: 2,
      games: 1,
    });
    expect(report.days[5].traces).toBe(1);
  });
});

describe('relativeDay', () => {
  it('describe fechas cercanas', () => {
    expect(relativeDay(NOW, NOW)).toBe('hoy');
    expect(relativeDay(NOW - DAY, NOW)).toBe('ayer');
    expect(relativeDay(NOW - 3 * DAY, NOW)).toBe('hace 3 días');
    expect(relativeDay(null, NOW)).toBe('—');
  });
});
