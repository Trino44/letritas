import { describe, expect, it } from 'vitest';
import { syllableColor, vowelOf, VOWEL_COLORS } from '@/content/vowelColors';

describe('colores por vocal', () => {
  it('toma la primera vocal, también en sílabas inversas y con acento', () => {
    expect(vowelOf('ma')).toBe('a');
    expect(vowelOf('es')).toBe('e');
    expect(vowelOf('rue')).toBe('u');
    expect(vowelOf('lón')).toBe('o');
    expect(vowelOf('rr')).toBeNull();
  });

  it('usa el color del cuadernillo', () => {
    expect(VOWEL_COLORS.a.name).toBe('rojo');
    expect(VOWEL_COLORS.u.name).toBe('morado');
    expect(syllableColor('mi', 'light')).toBe(VOWEL_COLORS.i.light);
  });
});
