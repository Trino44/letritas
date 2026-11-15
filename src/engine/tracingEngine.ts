/**
 * Motor de trazado por progreso.
 *
 * Idea central: cada trazo tiene un "progreso" (distancia recorrida sobre el
 * camino) que solo avanza. El dedo solo puede hacerlo avanzar si está dentro
 * de la tolerancia y cerca del punto donde va el progreso. Con esto se
 * cumplen a la vez el orden de los trazos, la dirección, la cobertura y el
 * relleno progresivo.
 *
 * Todas las coordenadas están en unidades de plantilla (caja de 100 de alto).
 * El componente de pantalla convierte de píxeles a estas unidades.
 * Este módulo no depende de React ni del DOM.
 */

import {
  distance,
  indexAtLength,
  pointAtLength,
  samplePath,
  type Point,
  type SampledPath,
} from './path';

export type { Point } from './path';

export type StrokeDef =
  | { type: 'line'; d: string }
  | { type: 'dot'; at: Point };

export interface EngineOptions {
  /** Distancia máxima al camino para contar como "dentro" (unidades). */
  tolerance: number;
  /** Qué tan adelante del progreso puede "engancharse" el dedo (unidades). */
  lookAhead: number;
  /** Radio para empezar o retomar un trazo, como múltiplo de la tolerancia. */
  startRadiusFactor: number;
  /** Lo que falta para dar el trazo por terminado (unidades). */
  endSlack: number;
}

export const DEFAULT_OPTIONS: EngineOptions = {
  tolerance: 9,
  lookAhead: 14,
  startRadiusFactor: 1.6,
  endSlack: 4,
};

export type EngineEvent =
  | { type: 'strokeStarted'; stroke: number }
  | { type: 'resumed'; stroke: number }
  | { type: 'wrongStart'; stroke: number; at: Point }
  | { type: 'offPath'; stroke: number; at: Point }
  | { type: 'backOnPath'; stroke: number }
  | { type: 'strokeCompleted'; stroke: number }
  | { type: 'letterCompleted'; metrics: LetterMetrics };

export interface StrokeMetrics {
  offPathCount: number;
  wrongStarts: number;
  /** Veces que levantó el dedo a medio trazo. */
  lifts: number;
  startedAt: number | null;
  completedAt: number | null;
}

export interface LetterMetrics {
  strokes: StrokeMetrics[];
  offPathCount: number;
  wrongStarts: number;
  durationMs: number;
}

interface StrokeRuntime {
  def: StrokeDef;
  path: SampledPath | null; // null para puntos
  progress: number;
  completed: boolean;
  metrics: StrokeMetrics;
}

export class TracingEngine {
  readonly options: EngineOptions;
  private strokes: StrokeRuntime[];
  private index = 0;
  private active = false;
  private onPath = true;
  private lastFinger: Point | null = null;
  private finger: Point | null = null;
  private firstTouchAt: number | null = null;
  private finishedAt: number | null = null;

  constructor(defs: StrokeDef[], options: Partial<EngineOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.strokes = defs.map((def) => ({
      def,
      path: def.type === 'line' ? samplePath(def.d, 1) : null,
      progress: 0,
      completed: false,
      metrics: {
        offPathCount: 0,
        wrongStarts: 0,
        lifts: 0,
        startedAt: null,
        completedAt: null,
      },
    }));
  }

  // ---------- Lectura de estado (para dibujar) ----------

  get strokeCount(): number {
    return this.strokes.length;
  }

  get currentStroke(): number {
    return this.index;
  }

  get isComplete(): boolean {
    return this.index >= this.strokes.length;
  }

  get isTracing(): boolean {
    return this.active;
  }

  get isOnPath(): boolean {
    return this.onPath;
  }

  get fingerPosition(): Point | null {
    return this.finger;
  }

  strokeDef(i: number): StrokeDef {
    return this.strokes[i].def;
  }

  sampledPath(i: number): SampledPath | null {
    return this.strokes[i].path;
  }

  isStrokeCompleted(i: number): boolean {
    return this.strokes[i].completed;
  }

  /** Progreso del trazo en unidades de longitud. */
  progressOf(i: number): number {
    return this.strokes[i].progress;
  }

  /** Progreso del trazo de 0 a 1. */
  fractionOf(i: number): number {
    const s = this.strokes[i];
    if (s.completed) return 1;
    if (!s.path || s.path.length === 0) return 0;
    return s.progress / s.path.length;
  }

  /** Punto donde el niño debe poner el dedo para seguir. */
  resumePoint(): Point | null {
    if (this.isComplete) return null;
    const s = this.strokes[this.index];
    if (s.def.type === 'dot') return s.def.at;
    return s.path ? pointAtLength(s.path, s.progress) : null;
  }

  // ---------- Entrada del dedo ----------

  pointerDown(p: Point, now: number): EngineEvent[] {
    if (this.isComplete) return [];
    const events: EngineEvent[] = [];
    const s = this.strokes[this.index];
    const target = this.resumePoint();
    const startRadius = this.options.tolerance * this.options.startRadiusFactor;
    this.finger = p;

    if (!target || distance(p, target) > startRadius) {
      s.metrics.wrongStarts++;
      events.push({ type: 'wrongStart', stroke: this.index, at: p });
      return events;
    }

    if (this.firstTouchAt === null) this.firstTouchAt = now;

    if (s.def.type === 'dot') {
      s.metrics.startedAt = now;
      events.push({ type: 'strokeStarted', stroke: this.index });
      events.push(...this.completeCurrent(now));
      return events;
    }

    this.active = true;
    this.onPath = true;
    this.lastFinger = p;
    if (s.metrics.startedAt === null) {
      s.metrics.startedAt = now;
      events.push({ type: 'strokeStarted', stroke: this.index });
    } else {
      events.push({ type: 'resumed', stroke: this.index });
    }
    events.push(...this.advanceTo(p, now));
    return events;
  }

  pointerMove(p: Point, now: number): EngineEvent[] {
    this.finger = p;
    if (!this.active || this.isComplete) return [];
    const events: EngineEvent[] = [];
    const from = this.lastFinger ?? p;
    // Interpolar entre lecturas para que un movimiento rápido no "salte".
    const gap = distance(from, p);
    const steps = Math.max(1, Math.ceil(gap / 2));
    for (let k = 1; k <= steps && this.active; k++) {
      const t = k / steps;
      const q = {
        x: from.x + (p.x - from.x) * t,
        y: from.y + (p.y - from.y) * t,
      };
      events.push(...this.advanceTo(q, now));
    }
    this.lastFinger = p;
    return events;
  }

  pointerUp(): EngineEvent[] {
    if (this.active && !this.isComplete) {
      this.strokes[this.index].metrics.lifts++;
    }
    this.active = false;
    this.onPath = true;
    this.lastFinger = null;
    this.finger = null;
    return [];
  }

  /** Reinicia la letra completa. */
  reset(): void {
    for (const s of this.strokes) {
      s.progress = 0;
      s.completed = false;
      s.metrics = {
        offPathCount: 0,
        wrongStarts: 0,
        lifts: 0,
        startedAt: null,
        completedAt: null,
      };
    }
    this.index = 0;
    this.active = false;
    this.onPath = true;
    this.lastFinger = null;
    this.finger = null;
    this.firstTouchAt = null;
    this.finishedAt = null;
  }

  // ---------- Lógica interna ----------

  private advanceTo(p: Point, now: number): EngineEvent[] {
    const s = this.strokes[this.index];
    const path = s.path;
    if (!path) return [];
    const events: EngineEvent[] = [];
    const { tolerance, lookAhead, endSlack } = this.options;

    // Buscar el punto más cercano solo en una ventana alrededor del progreso:
    // un poco hacia atrás (para tolerar temblor) y un poco hacia adelante.
    const from = indexAtLength(path, s.progress - tolerance);
    const to = indexAtLength(path, s.progress + lookAhead);
    let best = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = from; i <= to; i++) {
      const dd = distance(p, path.points[i]);
      if (dd < bestDist) {
        bestDist = dd;
        best = i;
      }
    }

    if (bestDist <= tolerance) {
      if (!this.onPath) {
        this.onPath = true;
        events.push({ type: 'backOnPath', stroke: this.index });
      }
      const reached = path.cumulative[best];
      if (reached > s.progress) s.progress = reached;
      if (s.progress >= path.length - Math.min(endSlack, path.length * 0.1)) {
        events.push(...this.completeCurrent(now));
      }
    } else if (this.onPath) {
      this.onPath = false;
      s.metrics.offPathCount++;
      events.push({ type: 'offPath', stroke: this.index, at: p });
    }
    return events;
  }

  private completeCurrent(now: number): EngineEvent[] {
    const s = this.strokes[this.index];
    s.completed = true;
    s.progress = s.path ? s.path.length : 0;
    s.metrics.completedAt = now;
    const events: EngineEvent[] = [
      { type: 'strokeCompleted', stroke: this.index },
    ];
    this.index++;
    // Hay que levantar el dedo para empezar el siguiente trazo.
    this.active = false;
    this.onPath = true;
    this.lastFinger = null;
    if (this.isComplete) {
      this.finishedAt = now;
      events.push({ type: 'letterCompleted', metrics: this.metrics() });
    }
    return events;
  }

  metrics(): LetterMetrics {
    const strokes = this.strokes.map((s) => ({ ...s.metrics }));
    return {
      strokes,
      offPathCount: strokes.reduce((a, m) => a + m.offPathCount, 0),
      wrongStarts: strokes.reduce((a, m) => a + m.wrongStarts, 0),
      durationMs:
        this.firstTouchAt !== null && this.finishedAt !== null
          ? this.finishedAt - this.firstTouchAt
          : 0,
    };
  }
}
