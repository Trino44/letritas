import type { Point, StrokeDef } from '@/engine/tracingEngine';

export type { Point, StrokeDef };

/**
 * Sistema de coordenadas de las plantillas (como un renglón de cuaderno):
 * - Caja de 100 de ancho por 100 de alto.
 * - y = 10: línea superior (alto de mayúsculas).
 * - y = 40: línea media (alto de minúsculas).
 * - y = 90: renglón base.
 * Cada trazo es un path SVG absoluto (M, L, H, V, Q, C, Z) dibujado en el
 * sentido en que se enseña. El orden del arreglo es el orden de los trazos.
 */
export const GUIDE_LINES = { top: 10, middle: 40, base: 90 } as const;
export const TEMPLATE_SIZE = { width: 100, height: 100 } as const;

export interface LetterDef {
  /** Identificador único, p. ej. "A" o "a-min". */
  id: string;
  /** Lo que se muestra en botones. */
  char: string;
  /** Cómo se dice el nombre de la letra ("a", "ese", "erre"). */
  spokenName: string;
  /** Palabra ejemplo e imagen (emoji por ahora). */
  word: string;
  emoji: string;
  strokes: StrokeDef[];
}

export interface LetterGroup {
  id: string;
  title: string;
  letters: LetterDef[];
}
