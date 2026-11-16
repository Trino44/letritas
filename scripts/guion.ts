/**
 * Genera docs/guion-de-grabacion.md con todos los audios que usa la app.
 * Uso: npm run guion
 */
import { writeFileSync } from 'node:fs';
import { allClips } from '../src/content/clips';

const lines: string[] = [
  '# Guion de grabación',
  '',
  'Archivo generado con `npm run guion`; no lo edites a mano.',
  '',
  '## Cómo grabar',
  '',
  '- Lugar silencioso, celular a unos 20 cm de la boca. Voz clara, alegre y sin prisa.',
  '- Un archivo por renglón. Deja medio segundo de silencio al inicio y al final.',
  '- Guarda cada audio con el nombre exacto de la columna "Archivo" dentro de `public/audio/`. Sirve MP3 o M4A (el formato de la grabadora de Android); solo cambia la extensión.',
  '- La app usa primero tu grabación, luego el audio generado con Gemini (`npm run voces`) y al final la voz del celular.',
  '- Sílabas: dilas despacio y completas ("sa", no "ese-a").',
  '- Sonidos sueltos como "sss": sostén el sonido uno o dos segundos. La voz del celular no los puede decir, así que solo suenan si están grabados.',
  '',
];

let total = 0;
for (const section of allClips()) {
  lines.push(
    `## ${section.section}`,
    '',
    '| ✔ | Archivo | Qué decir |',
    '|---|---|---|'
  );
  for (const c of section.clips) {
    lines.push(
      `| ☐ | \`${c.id}.mp3\` | ${c.text}${c.tts === false ? ' *(solo grabado)*' : ''} |`
    );
    total++;
  }
  lines.push('');
}
lines.splice(4, 0, `Total: ${total} audios.`, '');
writeFileSync('docs/guion-de-grabacion.md', lines.join('\n'));
process.stdout.write(`docs/guion-de-grabacion.md: ${total} audios\n`);
