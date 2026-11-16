import { describe, expect, it } from 'vitest';
import {
  buildRequest,
  extractAudio,
  parseQuotaError,
  pcmToWav,
  styleFor,
  toWav,
  transcriptFor,
} from '../../scripts/voces-lib';

describe('generador de voces', () => {
  it('alarga los sonidos sueltos', () => {
    expect(transcriptFor({ id: 'sonido-s', text: 'sss', tts: false })).toBe(
      'Ssssss' + 's'
    );
    expect(transcriptFor({ id: 'silaba-sa', text: 'sa' })).toBe('sa');
  });

  it('pide RR vibrante en perra y R suave en pera', () => {
    expect(styleFor({ id: 'palabra-perra', text: 'perra' })).toMatch(
      /erre doble/
    );
    expect(styleFor({ id: 'palabra-pera', text: 'pera' })).toMatch(/suave/);
    expect(styleFor({ id: 'palabra-sapo', text: 'sapo' })).not.toMatch(
      /erre|suave/
    );
  });

  it('arma la petición con voz, modelo y estilo', () => {
    const req = buildRequest(
      { id: 'silaba-sa', text: 'sa' },
      'Kore',
      'modelo-x'
    ) as {
      model: string;
      input: {
        content: { text: string; annotations: { style: string }[] }[];
      }[];
      generation_config: { speech_config: { voice: string }[] };
    };
    expect(req.model).toBe('modelo-x');
    expect(req.input[0].content[0].text).toBe('sa');
    expect(req.input[0].content[0].annotations[0].style).toMatch(/sílaba/);
    expect(req.generation_config.speech_config[0].voice).toBe('Kore');
  });

  it('encuentra el audio en la respuesta de la API', () => {
    const json = {
      steps: [
        { type: 'thought', content: [] },
        {
          type: 'model_output',
          content: [{ type: 'audio', data: 'QUJD', mime_type: 'audio/wav' }],
        },
      ],
    };
    expect(extractAudio(json)).toEqual({ data: 'QUJD', mimeType: 'audio/wav' });
    expect(extractAudio({ steps: [] })).toBeNull();
  });

  it('agrega encabezado WAV solo si hace falta', () => {
    const pcm = new Uint8Array([1, 2, 3, 4]);
    const wav = pcmToWav(pcm);
    expect(wav.length).toBe(48);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF');
    expect(toWav(wav)).toBe(wav);
    expect(toWav(pcm).length).toBe(48);
  });
});

describe('errores de cuota', () => {
  it('distingue el límite diario', () => {
    const body =
      '{"error":{"code":429,"details":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]},{"retryDelay":"12s"}]}}';
    expect(parseQuotaError(body)).toEqual({
      daily: true,
      retryAfterSec: 12,
      quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
    });
  });

  it('reconoce el límite por minuto con su espera', () => {
    const body =
      '{"error":{"details":[{"violations":[{"quotaId":"GenerateRequestsPerMinutePerProjectPerModel-FreeTier"}]},{"retryDelay":"41.5s"}]}}';
    const q = parseQuotaError(body);
    expect(q.daily).toBe(false);
    expect(q.retryAfterSec).toBe(41.5);
  });
});
