import type React from 'react';
import { syllableColor } from '@/content/vowelColors';

interface Props {
  text: string;
  /** Fondo donde va: oscuro (vidrio morado) o claro (tarjeta blanca). */
  surface?: 'dark' | 'light';
  className?: string;
}

/** Sílaba pintada con el color de su vocal. Palabras largas no se colorean. */
export const Syl: React.FC<Props> = ({ text, surface = 'dark', className }) => {
  const color = text.length <= 4 ? syllableColor(text, surface) : null;
  return (
    <span className={className} style={color ? { color } : undefined}>
      {text}
    </span>
  );
};
