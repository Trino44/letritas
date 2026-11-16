/**
 * Genera los íconos (y la pantalla de arranque) de Android a partir de
 * public/icons/icon-512.png, con fondo #241357.
 * Uso: npm run android:iconos  (requiere que exista la carpeta android/)
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const FONDO = '#241357';
// Carpeta temporal dentro del proyecto (ya ignorada por git en .cache/).
const carpeta = join('.cache', 'iconos-android');

rmSync(carpeta, { recursive: true, force: true });
mkdirSync(carpeta, { recursive: true });
// @capacitor/assets busca un archivo llamado "logo" en la carpeta de recursos.
copyFileSync(
  join('public', 'icons', 'icon-512.png'),
  join(carpeta, 'logo.png')
);

try {
  execFileSync(
    process.execPath,
    [
      join('node_modules', '@capacitor', 'assets', 'bin', 'capacitor-assets'),
      'generate',
      '--android',
      '--assetPath',
      carpeta,
      '--iconBackgroundColor',
      FONDO,
      '--iconBackgroundColorDark',
      FONDO,
      '--splashBackgroundColor',
      FONDO,
      '--splashBackgroundColorDark',
      FONDO,
    ],
    { stdio: 'inherit' }
  );
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}
