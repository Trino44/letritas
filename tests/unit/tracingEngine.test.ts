import { describe, expect, it } from 'vitest';
import {
  TracingEngine,
  type EngineEvent,
  type Point,
  type StrokeDef,
} from '@/engine/tracingEngine';

const VERTICAL: StrokeDef = { type: 'line', d: 'M50 10 L50 90' };
const CIRCLE: StrokeDef = {
  type: 'line',
  d: 'M50 10 C32.3 10 18 27.9 18 50 C18 72.1 32.3 90 50 90 C67.7 90 82 72.1 82 50 C82 27.9 67.7 10 50 10',
};

function types(events: EngineEvent[]): string[] {
  return events.map((e) => e.type);
}

/** Simula un dedo que recorre una lista de puntos. */
function drag(engine: TracingEngine, pts: Point[], t0 = 0): EngineEvent[] {
  const events: EngineEvent[] = [];
  events.push(...engine.pointerDown(pts[0], t0));
  pts
    .slice(1)
    .forEach((p, k) => events.push(...engine.pointerMove(p, t0 + k + 1)));
  events.push(...engine.pointerUp());
  return events;
}

function line(from: Point, to: Point, n = 20): Point[] {
  return Array.from({ length: n + 1 }, (_, k) => ({
    x: from.x + ((to.x - from.x) * k) / n,
    y: from.y + ((to.y - from.y) * k) / n,
  }));
}

describe('TracingEngine', () => {
  it('completa una línea recorrida en la dirección correcta', () => {
    const engine = new TracingEngine([VERTICAL]);
    const ev = drag(engine, line({ x: 50, y: 10 }, { x: 50, y: 90 }));
    expect(types(ev)).toContain('strokeCompleted');
    expect(types(ev)).toContain('letterCompleted');
    expect(engine.isComplete).toBe(true);
  });

  it('no deja empezar lejos del punto inicial', () => {
    const engine = new TracingEngine([VERTICAL]);
    const ev = engine.pointerDown({ x: 50, y: 90 }, 0);
    expect(types(ev)).toEqual(['wrongStart']);
    expect(engine.isTracing).toBe(false);
  });

  it('no avanza si se recorre al revés', () => {
    const engine = new TracingEngine([VERTICAL]);
    // Empieza bien pero se va hacia arriba (fuera del trazo) y vuelve.
    drag(engine, line({ x: 50, y: 12 }, { x: 50, y: 0 }));
    expect(engine.progressOf(0)).toBeLessThan(5);
  });

  it('un trazo corto no aprueba (exige cobertura)', () => {
    const engine = new TracingEngine([VERTICAL]);
    drag(engine, line({ x: 50, y: 10 }, { x: 50, y: 30 }));
    expect(engine.isComplete).toBe(false);
    expect(engine.fractionOf(0)).toBeGreaterThan(0.2);
    expect(engine.fractionOf(0)).toBeLessThan(0.3);
  });

  it('no se puede saltar una parte del camino', () => {
    const engine = new TracingEngine([VERTICAL]);
    const ev = engine.pointerDown({ x: 50, y: 10 }, 0);
    expect(types(ev)).toContain('strokeStarted');
    // Brinco directo al final: queda fuera de la ventana permitida.
    engine.pointerMove({ x: 80, y: 50 }, 1);
    engine.pointerMove({ x: 50, y: 88 }, 2);
    expect(engine.isComplete).toBe(false);
    expect(engine.progressOf(0)).toBeLessThan(20);
  });

  it('avisa al salirse del camino y al regresar, sin perder progreso', () => {
    const engine = new TracingEngine([VERTICAL]);
    engine.pointerDown({ x: 50, y: 10 }, 0);
    engine.pointerMove({ x: 50, y: 40 }, 1);
    const before = engine.progressOf(0);
    const off = engine.pointerMove({ x: 75, y: 42 }, 2);
    expect(types(off)).toContain('offPath');
    expect(engine.progressOf(0)).toBeLessThanOrEqual(before + 2);
    const back = engine.pointerMove({ x: 50, y: 44 }, 3);
    expect(types(back)).toContain('backOnPath');
    expect(engine.metrics().offPathCount).toBe(1);
  });

  it('permite levantar el dedo y retomar donde se quedó', () => {
    const engine = new TracingEngine([VERTICAL]);
    drag(engine, line({ x: 50, y: 10 }, { x: 50, y: 50 }));
    const resume = engine.resumePoint();
    expect(resume?.y).toBeCloseTo(50, 0);
    const ev = drag(engine, line({ x: 50, y: 50 }, { x: 50, y: 90 }), 100);
    expect(types(ev)).toContain('resumed');
    expect(engine.isComplete).toBe(true);
    expect(engine.metrics().strokes[0].lifts).toBe(1);
  });

  it('un movimiento rápido en una sola lectura sí avanza si sigue el camino', () => {
    const engine = new TracingEngine([VERTICAL]);
    engine.pointerDown({ x: 50, y: 10 }, 0);
    engine.pointerMove({ x: 50, y: 90 }, 1);
    expect(engine.isComplete).toBe(true);
  });

  it('respeta el orden de los trazos', () => {
    const engine = new TracingEngine([
      { type: 'line', d: 'M30 10 L30 90' },
      { type: 'line', d: 'M30 10 L74 10' },
    ]);
    // Intentar el segundo trazo primero: el inicio coincide pero la
    // dirección no, así que no completa nada.
    drag(engine, line({ x: 30, y: 10 }, { x: 74, y: 10 }));
    expect(engine.currentStroke).toBe(0);
    drag(engine, line({ x: 30, y: 10 }, { x: 30, y: 90 }));
    expect(engine.currentStroke).toBe(1);
    drag(engine, line({ x: 30, y: 10 }, { x: 74, y: 10 }));
    expect(engine.isComplete).toBe(true);
  });

  it('el círculo no se completa al empezar aunque inicio y fin coincidan', () => {
    const engine = new TracingEngine([CIRCLE]);
    const ev = engine.pointerDown({ x: 50, y: 10 }, 0);
    expect(types(ev)).not.toContain('strokeCompleted');
    expect(engine.fractionOf(0)).toBeLessThan(0.05);
  });

  it('el círculo se completa recorriéndolo en sentido antihorario', () => {
    const engine = new TracingEngine([CIRCLE]);
    const pts: Point[] = [];
    for (let k = 0; k <= 72; k++) {
      const ang = -Math.PI / 2 - (k / 72) * 2 * Math.PI; // desde arriba hacia la izquierda
      pts.push({ x: 50 + 32 * Math.cos(ang), y: 50 + 40 * Math.sin(ang) });
    }
    drag(engine, pts);
    expect(engine.isComplete).toBe(true);
  });

  it('el círculo en sentido horario no avanza', () => {
    const engine = new TracingEngine([CIRCLE]);
    const pts: Point[] = [];
    for (let k = 0; k <= 72; k++) {
      const ang = -Math.PI / 2 + (k / 72) * 2 * Math.PI;
      pts.push({ x: 50 + 32 * Math.cos(ang), y: 50 + 40 * Math.sin(ang) });
    }
    drag(engine, pts);
    expect(engine.isComplete).toBe(false);
    expect(engine.fractionOf(0)).toBeLessThan(0.1);
  });

  it('los puntos (como el de la i) se completan con un toque', () => {
    const engine = new TracingEngine([{ type: 'dot', at: { x: 50, y: 24 } }]);
    const ev = engine.pointerDown({ x: 52, y: 26 }, 0);
    expect(types(ev)).toContain('letterCompleted');
  });

  it('reset deja todo como al inicio', () => {
    const engine = new TracingEngine([VERTICAL]);
    drag(engine, line({ x: 50, y: 10 }, { x: 50, y: 90 }));
    engine.reset();
    expect(engine.isComplete).toBe(false);
    expect(engine.progressOf(0)).toBe(0);
    expect(engine.metrics().offPathCount).toBe(0);
  });
});
