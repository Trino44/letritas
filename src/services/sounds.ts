/**
 * Efectos de sonido generados con Web Audio (no requieren archivos).
 * El navegador solo permite sonido después de un toque: llamar `unlockAudio`
 * en el primer botón que toque el niño o el papá.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    ctx = Ctor ? new Ctor() : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') void c.resume();
}

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.18
): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Trazo terminado: "pop" corto y alegre. */
export function playStrokeDone(): void {
  tone(660, 0, 0.12, 'triangle');
  tone(990, 0.08, 0.15, 'triangle');
}

/** Letra terminada: arpegio de celebración. */
export function playCelebration(): void {
  [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, i * 0.11, 0.35, 'triangle', 0.2)
  );
  tone(1319, 0.5, 0.6, 'sine', 0.15);
}

/** Fuera del camino: tono grave y suave (no regaña). */
export function playOffPath(): void {
  tone(220, 0, 0.18, 'sine', 0.12);
}

/** Tocó lejos del punto de inicio. */
export function playWrongStart(): void {
  tone(330, 0, 0.1, 'sine', 0.1);
  tone(262, 0.1, 0.14, 'sine', 0.1);
}

export function vibrate(ms: number): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // algunos navegadores no lo permiten
  }
}
