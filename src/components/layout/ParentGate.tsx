import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onOpen: () => void;
  /** Milisegundos que hay que mantener presionado. */
  holdMs?: number;
}

/**
 * Botón para entrar al área de papás: hay que mantenerlo presionado, así un
 * niño pequeño no entra por accidente con un toque.
 */
export const ParentGate: React.FC<Props> = ({ onOpen, holdMs = 1500 }) => {
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef<number | null>(null);

  const cancel = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };

  useEffect(() => cancel, []);

  return (
    <button
      type="button"
      className={holding ? 'parent-gate holding' : 'parent-gate'}
      style={{ '--hold-ms': `${holdMs}ms` } as React.CSSProperties}
      aria-label="Para papás: mantén presionado"
      onPointerDown={() => {
        setHolding(true);
        setHint(false);
        timer.current = window.setTimeout(() => {
          timer.current = null;
          setHolding(false);
          onOpen();
        }, holdMs);
      }}
      onPointerUp={() => {
        if (timer.current !== null) setHint(true);
        cancel();
      }}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="parent-gate-fill" />
      <span className="parent-gate-icon">👪</span>
      {hint && <span className="parent-gate-hint">Mantén presionado</span>}
    </button>
  );
};
