/**
 * Progreso y ajustes guardados en el propio dispositivo (localStorage).
 * No se envía nada a internet.
 */

import type { LetterMetrics } from '@/engine/tracingEngine';

export type Level = 'facil' | 'normal' | 'dificil';

/** Tolerancia del motor por nivel (unidades de plantilla, letra de 80). */
export const LEVEL_TOLERANCE: Record<Level, number> = {
  facil: 12,
  normal: 9,
  dificil: 6,
};

export const LEVEL_LABEL: Record<Level, string> = {
  facil: 'Fácil',
  normal: 'Normal',
  dificil: 'Difícil',
};

export interface Attempt {
  letterId: string;
  at: number;
  level: Level;
  durationMs: number;
  offPathCount: number;
  wrongStarts: number;
}

/** Resultado de un juego o actividad que no es trazado. */
export interface ActivityResult {
  activityId: string;
  at: number;
  correct: number;
  errors: number;
}

interface Stored {
  version: 1;
  level: Level;
  attempts: Attempt[];
  activities?: ActivityResult[];
}

const KEY = 'letritas.v1';
const MAX_ATTEMPTS = 2000;

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.version === 1 && Array.isArray(parsed.attempts)) return parsed;
    }
  } catch {
    // datos dañados o sin acceso: empezar de cero
  }
  return { version: 1, level: 'facil', attempts: [] };
}

function save(data: Stored): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // sin espacio o modo privado: se ignora
  }
}

export function getLevel(): Level {
  return load().level;
}

export function setLevel(level: Level): void {
  const d = load();
  d.level = level;
  save(d);
}

export function recordAttempt(
  letterId: string,
  level: Level,
  m: LetterMetrics
): void {
  const d = load();
  d.attempts.push({
    letterId,
    at: Date.now(),
    level,
    durationMs: m.durationMs,
    offPathCount: m.offPathCount,
    wrongStarts: m.wrongStarts,
  });
  if (d.attempts.length > MAX_ATTEMPTS)
    d.attempts.splice(0, d.attempts.length - MAX_ATTEMPTS);
  save(d);
}

export function completionsByLetter(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of load().attempts) out[a.letterId] = (out[a.letterId] ?? 0) + 1;
  return out;
}

export function getAttempts(): Attempt[] {
  return load().attempts;
}

export function recordActivity(
  activityId: string,
  correct: number,
  errors: number
): void {
  const d = load();
  const list = d.activities ?? [];
  list.push({ activityId, at: Date.now(), correct, errors });
  if (list.length > MAX_ATTEMPTS) list.splice(0, list.length - MAX_ATTEMPTS);
  d.activities = list;
  save(d);
}

export function getActivities(): ActivityResult[] {
  return load().activities ?? [];
}
