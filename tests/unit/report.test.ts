import { describe, expect, it } from 'vitest';
import { ALL_LETTERS } from '@/content/letters';
import type { ActivityResult, Attempt } from '@/services/progress';
import {
  buildReport,
  gameTitle,
  localDate,
  relativeDay,
} from '@/services/report';

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

  it('resumen por juego, solo los jugados', () => {
    const rr = report.games.find((g) => g.id === 'r-suave-o-rr')!;
    expect(rr.plays).toBe(2);
    expect(rr.recentErrors).toBe(3);
    expect(
      report.games.find((g) => g.id === 'con-que-empieza')
    ).toBeUndefined();
  });

  it('detecta lo que más le cuesta en Escucha y repite', () => {
    const r = buildReport(
      ALL_LETTERS,
      [],
      [
        {
          activityId: 'repite-r',
          at: NOW,
          correct: 2,
          errors: 1,
          items: [
            { key: 'ra', ok: true, tries: 1 },
            { key: 'rro', ok: false, tries: 3 },
            { key: 're', ok: true, tries: 3 },
          ],
        },
      ],
      NOW
    );
    expect(r.toPractice.map((p) => p.key)).toEqual(['rro', 're']);
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

describe('gameTitle', () => {
  it('nombra juegos por consonante', () => {
    expect(gameTitle('memoria-p')).toBe('Memoria · P');
    expect(gameTitle('r-suave-o-rr')).toBe('R suave o RR');
  });
});
