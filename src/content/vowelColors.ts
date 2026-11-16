/**
 * Colores por vocal, como en el cuadernillo:
 * a rojo, e amarillo, i verde, o azul, u morado.
 * Hay una versión para fondo oscuro (vidrio) y otra para fondo claro.
 */

export type Vowel = 'a' | 'e' | 'i' | 'o' | 'u';

export const VOWEL_COLORS: Record<
  Vowel,
  { dark: string; light: string; name: string }
> = {
  a: { dark: '#ff8787', light: '#e03131', name: 'rojo' },
  e: { dark: '#ffe066', light: '#e67700', name: 'amarillo' },
  i: { dark: '#8ce99a', light: '#2b8a3e', name: 'verde' },
  o: { dark: '#74c0fc', light: '#1864ab', name: 'azul' },
  u: { dark: '#e599f7', light: '#862e9c', name: 'morado' },
};

/** Primera vocal de una sílaba ("ma" → a, "as" → a, "rue" → u). */
export function vowelOf(text: string): Vowel | null {
  const plain = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const m = plain.match(/[aeiou]/);
  return m ? (m[0] as Vowel) : null;
}

/** Color de la sílaba según su vocal, o null si no tiene vocal. */
export function syllableColor(
  text: string,
  surface: 'dark' | 'light' = 'dark'
): string | null {
  const v = vowelOf(text);
  return v ? VOWEL_COLORS[v][surface] : null;
}
