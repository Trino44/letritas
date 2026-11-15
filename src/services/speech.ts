/**
 * Voz en español usando la voz del sistema (Web Speech API).
 *
 * Es temporal: sirve para probar sin grabaciones. Más adelante cada texto
 * se podrá reemplazar por un audio grabado por una voz mexicana real
 * (ver `RECORDED_AUDIO`). Si existe una grabación para el texto, se usa;
 * si no, se usa la voz del sistema.
 */

const PREFERRED_LANGS = ['es-MX', 'es-US', 'es-419', 'es'];

/** Grabaciones disponibles: texto exacto -> ruta en /public/audio. */
const RECORDED_AUDIO: Record<string, string> = {};

let cachedVoice: SpeechSynthesisVoice | null = null;

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  if (cachedVoice) return cachedVoice;
  const voices = s.getVoices();
  for (const lang of PREFERRED_LANGS) {
    const v = voices.find((x) =>
      x.lang.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase())
    );
    if (v) {
      cachedVoice = v;
      return v;
    }
  }
  return null;
}

// Las voces cargan de forma asíncrona en Android.
const s0 = synth();
if (s0) {
  s0.addEventListener?.('voiceschanged', () => {
    cachedVoice = null;
    pickVoice();
  });
}

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking(): void {
  synth()?.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function speakOne(text: string, rate: number): Promise<void> {
  const recorded = RECORDED_AUDIO[text];
  if (recorded) {
    return new Promise((resolve) => {
      const audio = new Audio(recorded);
      currentAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  const s = synth();
  if (!s) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'es-MX';
    u.rate = rate;
    u.pitch = 1.1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    s.speak(u);
    // Seguridad: algunos Android no disparan onend.
    setTimeout(resolve, 600 + text.length * 120);
  });
}

/**
 * Dice una o varias frases en orden. Cancela lo que se estuviera diciendo.
 * `rate` menor a 1 habla más despacio (bueno para niños pequeños).
 */
export async function say(
  parts: string | string[],
  rate = 0.85
): Promise<void> {
  stopSpeaking();
  const list = Array.isArray(parts) ? parts : [parts];
  for (const p of list) {
    await speakOne(p, rate);
  }
}

export function hasSpanishVoice(): boolean {
  return pickVoice() !== null;
}
