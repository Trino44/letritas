/**
 * Geometría de trazos.
 *
 * Convierte un path SVG sencillo (comandos absolutos M, L, H, V, Q, C, Z)
 * en una polilínea con puntos equiespaciados por longitud de arco.
 * Se implementa a mano para que funcione igual en el navegador y en las
 * pruebas (jsdom no implementa getPointAtLength).
 */

export interface Point {
  x: number;
  y: number;
}

/** Trazo muestreado: puntos equiespaciados y longitud acumulada en cada uno. */
export interface SampledPath {
  points: Point[];
  /** cumulative[i] = distancia recorrida desde el inicio hasta points[i] */
  cumulative: number[];
  length: number;
}

const CURVE_STEPS = 48;

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function tokenize(d: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  const re = /([MLHVQCZmlhvqcz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) !== null) {
    if (m[1]) tokens.push(m[1]);
    else tokens.push(Number.parseFloat(m[2]));
  }
  return tokens;
}

function quad(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
}

/**
 * Convierte el path en una polilínea densa (sin espaciado uniforme).
 * Un path de un trazo debe ser continuo: solo se admite un M inicial.
 */
export function flattenPath(d: string): Point[] {
  const tokens = tokenize(d);
  const out: Point[] = [];
  let i = 0;
  let cmd = '';
  let current: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };

  const num = (): number => {
    const v = tokens[i++];
    if (typeof v !== 'number') {
      throw new Error(`Path inválido: se esperaba número en "${d}"`);
    }
    return v;
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') {
      cmd = t;
      i++;
      if (cmd !== cmd.toUpperCase()) {
        throw new Error(`Solo se admiten comandos absolutos: "${cmd}"`);
      }
    }
    switch (cmd) {
      case 'M': {
        if (out.length > 0) {
          throw new Error('Un trazo no puede tener más de un M');
        }
        current = { x: num(), y: num() };
        start = current;
        out.push(current);
        cmd = 'L'; // coordenadas extra después de M son líneas
        break;
      }
      case 'L': {
        current = { x: num(), y: num() };
        out.push(current);
        break;
      }
      case 'H': {
        current = { x: num(), y: current.y };
        out.push(current);
        break;
      }
      case 'V': {
        current = { x: current.x, y: num() };
        out.push(current);
        break;
      }
      case 'Q': {
        const c1 = { x: num(), y: num() };
        const end = { x: num(), y: num() };
        for (let s = 1; s <= CURVE_STEPS; s++) {
          out.push(quad(current, c1, end, s / CURVE_STEPS));
        }
        current = end;
        break;
      }
      case 'C': {
        const c1 = { x: num(), y: num() };
        const c2 = { x: num(), y: num() };
        const end = { x: num(), y: num() };
        for (let s = 1; s <= CURVE_STEPS; s++) {
          out.push(cubic(current, c1, c2, end, s / CURVE_STEPS));
        }
        current = end;
        break;
      }
      case 'Z': {
        current = start;
        out.push(start);
        cmd = '';
        break;
      }
      default:
        throw new Error(`Comando no soportado en "${d}"`);
    }
  }
  return out;
}

/** Remuestrea una polilínea con puntos separados `step` unidades. */
export function resample(poly: Point[], step: number): SampledPath {
  if (poly.length === 0) {
    return { points: [], cumulative: [], length: 0 };
  }
  const points: Point[] = [poly[0]];
  const cumulative: number[] = [0];
  let travelled = 0;
  let nextMark = step;

  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1];
    const b = poly[i];
    const seg = distance(a, b);
    if (seg === 0) continue;
    while (travelled + seg >= nextMark) {
      const t = (nextMark - travelled) / seg;
      points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      cumulative.push(nextMark);
      nextMark += step;
    }
    travelled += seg;
  }

  const last = poly[poly.length - 1];
  if (travelled - cumulative[cumulative.length - 1] > 1e-6) {
    points.push(last);
    cumulative.push(travelled);
  }
  return { points, cumulative, length: travelled };
}

export function samplePath(d: string, step = 1): SampledPath {
  return resample(flattenPath(d), step);
}

/** Índice del primer punto cuya longitud acumulada es >= s. */
export function indexAtLength(path: SampledPath, s: number): number {
  const c = path.cumulative;
  if (c.length === 0) return 0;
  if (s <= 0) return 0;
  if (s >= path.length) return c.length - 1;
  let lo = 0;
  let hi = c.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (c[mid] < s) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function pointAtLength(path: SampledPath, s: number): Point {
  return path.points[indexAtLength(path, s)] ?? { x: 0, y: 0 };
}
