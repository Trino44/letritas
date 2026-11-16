/**
 * Partes del generador de voces que no dependen de la red (con pruebas).
 */

import type { Clip } from '../src/services/speech';

export const DEFAULT_MODEL = 'gemini-3.8-flash-tts';
export const DEFAULT_VOICE = 'Sulafat';
export const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/interactions';

const BASE_STYLE =
  'Maestra de preescolar de México: voz cálida, alegre y paciente. ' +
  'Español de México con pronunciación muy clara.';

/** Texto que lee la voz. Los sonidos sueltos se escriben alargados. */
export function transcriptFor(clip: Clip): string {
  if (clip.id.startsWith('sonido-')) {
    const letter = clip.id.slice('sonido-'.length);
    return letter.toUpperCase() + letter.repeat(6);
  }
  return clip.text;
}

/** Indicación de estilo según el tipo de audio. */
export function styleFor(clip: Clip): string {
  const id = clip.id;
  if (id.startsWith('sonido-s')) {
    return `${BASE_STYLE} Sostén el sonido de la letra s, como el de una serpiente, durante dos segundos. No digas ninguna vocal.`;
  }
  if (id.startsWith('sonido-r')) {
    return `${BASE_STYLE} Haz vibrar la lengua con el sonido de erre fuerte durante dos segundos. No digas ninguna vocal.`;
  }
  if (id.startsWith('sonido-')) {
    return `${BASE_STYLE} Sostén solo el sonido de la letra durante dos segundos, sin vocales.`;
  }
  if (id.startsWith('silaba-')) {
    return `${BASE_STYLE} Pronuncia solo esta sílaba, una sola vez, despacio y muy clara, como cuando se enseña a leer.`;
  }
  if (id.startsWith('palabra-')) {
    const word = clip.text.toLowerCase();
    const r = word.includes('rr')
      ? ' Haz vibrar bien la erre doble, fuerte y clara.'
      : /r/.test(word)
        ? ' La r es suave: un solo toque de la lengua, sin vibrar.'
        : '';
    return `${BASE_STYLE} Di solo esta palabra, despacio, marcando cada sílaba.${r}`;
  }
  if (id.startsWith('oracion-') || id.startsWith('cuento-')) {
    return `${BASE_STYLE} Lee como se lee un cuento a un niño que está aprendiendo a leer: despacio, claro y con expresión.`;
  }
  if (id.startsWith('pregunta-')) {
    return `${BASE_STYLE} Haz la pregunta despacio, con entonación de pregunta, amable.`;
  }
  if (id.startsWith('letra-') && id.includes('-de-')) {
    return `${BASE_STYLE} Despacio, con una pausa corta después del nombre de la letra.`;
  }
  if (id.startsWith('letra-')) {
    return `${BASE_STYLE} Di solo el nombre de la letra, despacio y claro.`;
  }
  return `${BASE_STYLE} Ritmo tranquilo y tono animado.`;
}

export function buildRequest(
  clip: Clip,
  voice: string,
  model: string
): unknown {
  return {
    model,
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text: transcriptFor(clip),
            annotations: [{ type: 'speech_metadata', style: styleFor(clip) }],
          },
        ],
      },
    ],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  };
}

interface AudioPart {
  data: string;
  mimeType?: string;
}

/**
 * Busca el último bloque de audio en la respuesta. Recorre todo el JSON para
 * tolerar cambios menores en la forma de la respuesta.
 */
export function extractAudio(json: unknown): AudioPart | null {
  let found: AudioPart | null = null;
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const n of node) walk(n);
      return;
    }
    if (!node || typeof node !== 'object') return;
    const o = node as Record<string, unknown>;
    const mime = (o.mime_type ?? o.mimeType) as string | undefined;
    if (
      typeof o.data === 'string' &&
      (o.type === 'audio' ||
        (typeof mime === 'string' && mime.startsWith('audio/')))
    ) {
      found = { data: o.data, mimeType: mime };
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(json);
  return found;
}

/** Envuelve PCM 16 bits mono en un archivo WAV. */
export function pcmToWav(pcm: Uint8Array, sampleRate = 24000): Uint8Array {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  write(0, 'RIFF');
  v.setUint32(4, 36 + pcm.length, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, 'data');
  v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(header), 0);
  out.set(pcm, 44);
  return out;
}

/** Devuelve bytes WAV listos para guardar, agregue o no la API el encabezado. */
export function toWav(bytes: Uint8Array): Uint8Array {
  const isRiff =
    bytes.length > 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === 'RIFF';
  return isRiff ? bytes : pcmToWav(bytes);
}

export interface QuotaInfo {
  /** true si es el límite diario (no tiene caso esperar unos segundos). */
  daily: boolean;
  /** Espera sugerida por la API, en segundos. */
  retryAfterSec: number | null;
  /** Nombre del límite que se rebasó, si viene en la respuesta. */
  quotaId: string | null;
}

/** Lee el cuerpo de un error 429 de Gemini para saber qué límite se rebasó. */
export function parseQuotaError(body: string): QuotaInfo {
  const info: QuotaInfo = { daily: false, retryAfterSec: null, quotaId: null };
  const delay = body.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
  if (delay) info.retryAfterSec = Number.parseFloat(delay[1]);
  const quota = body.match(/"quotaId"\s*:\s*"([^"]+)"/);
  if (quota) info.quotaId = quota[1];
  info.daily =
    /PerDay/i.test(info.quotaId ?? '') || /per day|daily/i.test(body);
  return info;
}
