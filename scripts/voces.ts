/**
 * Genera los audios de la app con la voz de Gemini (texto a voz).
 *
 * Uso:
 *   npm run voces                     genera solo los que faltan
 *   npm run voces -- --lista          muestra qué generaría, sin llamar a Gemini
 *   npm run voces -- --solo silaba-sa,palabra-perra   regenera esos
 *   npm run voces -- --forzar         regenera todos los generados
 *   npm run voces -- --voz Achird     prueba otra voz
 *
 * Necesita GEMINI_API_KEY en el archivo .env (ver .env.example).
 * Guarda public/audio/<id>.wav. Nunca toca grabaciones humanas (.mp3/.m4a):
 * si existe una, ese audio se salta.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allClips } from '../src/content/clips';
import type { Clip } from '../src/services/speech';
import {
  API_URL,
  buildRequest,
  DEFAULT_MODEL,
  DEFAULT_VOICE,
  extractAudio,
  parseQuotaError,
  toWav,
} from './voces-lib';

const OUT_DIR = join('public', 'audio');
const HUMAN_EXT = ['mp3', 'm4a'];

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const listOnly = process.argv.includes('--lista');
const force = process.argv.includes('--forzar');
const only = arg('--solo')
  ?.split(',')
  .map((s) => s.trim());
const voice = arg('--voz') ?? process.env.GEMINI_TTS_VOICE ?? DEFAULT_VOICE;
const model = process.env.GEMINI_TTS_MODEL ?? DEFAULT_MODEL;
const apiKey = process.env.GEMINI_API_KEY;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Peticiones por minuto que se permiten (la cuenta gratis tiene pocas). */
const rpm = Number(process.env.GEMINI_TTS_RPM ?? '3');
const pauseMs = Math.ceil(60000 / Math.max(1, rpm));

class DailyQuotaError extends Error {}

async function generate(clip: Clip): Promise<Uint8Array> {
  const body = JSON.stringify(buildRequest(clip, voice, model));
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey ?? '',
        'Content-Type': 'application/json',
      },
      body,
    });
    const text = await res.text();
    if (res.status === 429) {
      const q = parseQuotaError(text);
      if (q.daily) throw new DailyQuotaError(q.quotaId ?? 'cuota diaria');
      const wait = Math.ceil((q.retryAfterSec ?? 60) + 3);
      console.warn(`  Límite por minuto; espero ${wait} s y reintento…`);
      await sleep(wait * 1000);
      continue;
    }
    if (res.status >= 500) {
      console.warn(
        `  Gemini respondió ${res.status}; espero 20 s y reintento…`
      );
      await sleep(20000);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Gemini respondió ${res.status}: ${text.slice(0, 400)}`);
    }
    const audio = extractAudio(JSON.parse(text));
    if (!audio)
      throw new Error(`La respuesta no trae audio: ${text.slice(0, 400)}`);
    return toWav(new Uint8Array(Buffer.from(audio.data, 'base64')));
  }
  throw new Error('Gemini siguió ocupado después de 6 intentos.');
}

async function main(): Promise<void> {
  const clips = allClips().flatMap((s) => s.clips);
  const pending = clips.filter((c) => {
    if (only) return only.includes(c.id);
    if (HUMAN_EXT.some((e) => existsSync(join(OUT_DIR, `${c.id}.${e}`))))
      return false;
    return force || !existsSync(join(OUT_DIR, `${c.id}.wav`));
  });

  console.warn(
    `Voz: ${voice} · Modelo: ${model} · Por generar: ${pending.length} de ${clips.length}` +
      ` · Ritmo: ${rpm} por minuto (≈ ${Math.ceil((pending.length * pauseMs) / 60000)} min)`
  );
  if (listOnly) {
    for (const c of pending) console.warn(`  ${c.id}.wav  →  "${c.text}"`);
    return;
  }
  if (pending.length === 0) {
    console.warn(
      'No falta ningún audio. Usa --forzar o --solo para regenerar.'
    );
    return;
  }
  if (!apiKey) {
    console.error(
      'Falta GEMINI_API_KEY. Copia .env.example a .env y pon tu clave.'
    );
    process.exitCode = 1;
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const failed: string[] = [];
  for (const [i, clip] of pending.entries()) {
    process.stdout.write(`[${i + 1}/${pending.length}] ${clip.id} … `);
    try {
      const wav = await generate(clip);
      writeFileSync(join(OUT_DIR, `${clip.id}.wav`), wav);
      process.stdout.write(`listo (${Math.round(wav.length / 1024)} KB)\n`);
    } catch (err) {
      process.stdout.write('error\n');
      if (err instanceof DailyQuotaError) {
        console.error(
          `\nSe acabó la cuota del día de Gemini (${err.message}).` +
            '\nSe reinicia a medianoche hora del Pacífico (2:00 am en CDMX).' +
            '\nVuelve a correr npm run voces mañana: seguirá donde se quedó.'
        );
        failed.push(...pending.slice(i).map((c) => c.id));
        break;
      }
      console.error(`  ${(err as Error).message}`);
      failed.push(clip.id);
      if (/\b(400|401|403|404)\b/.test((err as Error).message)) {
        console.error('  Error de clave, permiso o modelo: se detiene aquí.');
        break;
      }
    }
    if (i < pending.length - 1) await sleep(pauseMs);
  }

  const review = pending.filter((c) => c.tts === false).map((c) => c.id);
  console.warn(
    failed.length
      ? `\nFaltan ${failed.length} audios; vuelve a correr npm run voces para seguir.`
      : '\nTerminado: todos los audios quedaron generados.'
  );
  if (review.length) {
    console.warn(
      `Escucha con atención estos sonidos sueltos; si no suenan bien, grábalos tú:\n  ${review.join('\n  ')}`
    );
  }
}

void main();
