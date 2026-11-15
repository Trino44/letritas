/**
 * Audio hablado de la app.
 *
 * Todo lo que la app dice es un "clip" con un id estable. Si existe el
 * archivo public/audio/<id>.mp3 (grabado por una voz real), se reproduce.
 * Si no existe, se usa la voz del sistema (Web Speech API) leyendo `text`.
 * Para grabar los audios ver docs/guion-de-grabacion.md.
 */

export interface Clip {
  /** Nombre del archivo sin extensión, p. ej. "silaba-sa". */
  id: string;
  /** Texto que se graba y que lee la voz del sistema si no hay grabación. */
  text: string;
  /**
   * false = la voz del sistema no lo dice bien (sonidos sueltos como "sss");
   * si no hay grabación, se omite.
   */
  tts?: boolean;
}

const PREFERRED_LANGS = ['es-MX', 'es-US', 'es-419', 'es'];
const missingFiles = new Set<string>();
let cachedVoice: SpeechSynthesisVoice | null = null;
let currentAudio: HTMLAudioElement | null = null;
/** Cada llamada a play() incrementa el turno; las anteriores se detienen. */
let turn = 0;

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
synth()?.addEventListener?.('voiceschanged', () => {
  cachedVoice = null;
  pickVoice();
});

export function stopSpeaking(): void {
  turn++;
  synth()?.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

const EXTENSIONS = ['mp3', 'm4a'];

function playOne(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    let started = false;
    audio.onplaying = () => {
      started = true;
    };
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(started);
    audio.play().catch(() => resolve(started));
  });
}

/** Intenta reproducir la grabación del clip. Devuelve false si no existe. */
async function playFile(id: string): Promise<boolean> {
  if (missingFiles.has(id) || typeof Audio === 'undefined') return false;
  for (const ext of EXTENSIONS) {
    if (await playOne(`./audio/${id}.${ext}`)) return true;
  }
  missingFiles.add(id);
  return false;
}

function speakText(text: string, rate: number): Promise<void> {
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
    setTimeout(resolve, 900 + text.length * 130);
  });
}

/**
 * Reproduce uno o varios clips en orden. Cancela lo anterior.
 * `rate` menor a 1 hace más lenta la voz del sistema.
 */
export async function play(clips: Clip | Clip[], rate = 0.85): Promise<void> {
  stopSpeaking();
  const myTurn = turn;
  const list = Array.isArray(clips) ? clips : [clips];
  for (const clip of list) {
    if (myTurn !== turn) return;
    const played = await playFile(clip.id);
    if (myTurn !== turn) return;
    if (!played && clip.tts !== false) await speakText(clip.text, rate);
  }
}

export function hasSpanishVoice(): boolean {
  return pickVoice() !== null;
}
