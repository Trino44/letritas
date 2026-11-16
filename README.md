# Letritas

App para que niños pequeños aprendan a trazar letras con el dedo, en español mexicano.

Incluye vocales, S y R para trazar; sílabas sa–su y ra–ru; los juegos "Escucha y toca", "R suave o RR" (pera / perra) y "¿Con qué empieza?"; y un panel para papás (mantener presionado 👪 en el inicio).

El niño pone el dedo en el punto verde y sigue la flecha. La letra se va rellenando conforme avanza. Si se sale del camino, el camino se pone rojo y el teléfono vibra suave, sin perder lo avanzado. Al terminar escucha la letra y una palabra ejemplo.

## Cómo correrla

Requisitos: Node 22 o más reciente.

```bash
npm install
npm run dev
```

La terminal muestra una dirección `Network: http://192.168.x.x:5173`. Ábrela en el celular o la tablet conectados al mismo Wi‑Fi.

## Comandos

| Comando             | Para qué                                         |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo (visible en la red local) |
| `npm run test:unit` | Pruebas                                          |
| `npm run typecheck` | Revisión de tipos                                |
| `npm run build`     | Versión final en `dist/`                         |

## Estructura

```
src/
  engine/       Motor de trazado (TypeScript puro, sin React)
    path.ts            Lee paths SVG y los muestrea por longitud
    tracingEngine.ts   Progreso, dirección, orden, salidas del camino
  content/      Contenido educativo
    types.ts           Sistema de coordenadas de las plantillas
    letters.ts         Plantillas de letras (aquí se agregan letras)
    syllables.ts       Sílabas por consonante con palabra e imagen
    clips.ts           Todo lo que la app dice, con id = nombre del audio
  games/        Lógica de juegos (sin React)
  services/     Voz, efectos de sonido y progreso guardado en el dispositivo
  components/
    tracing/TracingBoard.tsx   Dibujo con react-konva y manejo del dedo
    screens/                   Pantalla de inicio y de trazado
tests/unit/     Pruebas del motor, de los paths y de las plantillas
```

## Agregar una letra

1. Abre `src/content/letters.ts`.
2. Copia una letra parecida y cambia `id`, `char`, `spokenName`, `word`, `emoji` y `strokes`.
3. Cada trazo es un path SVG en una caja de 100 × 100: línea superior en y = 10, línea media en y = 40, renglón base en y = 90. Dibuja cada trazo en el sentido en que se enseña; el orden del arreglo es el orden de los trazos.
4. Agrega la letra a un grupo en `LETTER_GROUPS`.
5. Corre `npm run test:unit`: valida que la plantilla sea correcta.

## Voces

Todo lo que dice la app es un audio con nombre fijo (lista en `docs/guion-de-grabacion.md`). La app busca, en este orden:

1. Una grabación humana: `public/audio/<nombre>.m4a` o `.mp3`.
2. Un audio generado con Gemini: `public/audio/<nombre>.wav`.
3. Si no hay ninguno, la voz del celular.

### Generar las voces con Gemini

Se hace una sola vez en la computadora; la app no llama a Gemini ni necesita internet.

1. Copia `.env.example` como `.env` y pon tu clave en `GEMINI_API_KEY`. El archivo `.env` no se sube a GitHub.
2. `npm run voces -- --lista` muestra qué audios va a generar, sin gastar.
3. `npm run voces` genera los que falten. Va a ritmo de 3 por minuto (la cuenta gratis de Gemini tiene pocas peticiones por minuto y por día). Si se acaba la cuota del día, se detiene solo; al correrlo otra vez sigue donde se quedó. La cuota se reinicia a las 2:00 am (hora de CDMX).
4. Escucha los audios en `public/audio/`. Para rehacer alguno: `npm run voces -- --solo silaba-sa,palabra-perra`. Para probar otra voz: `npm run voces -- --voz Achird --solo frase-muy-bien`.

Los sonidos sueltos (`sonido-s`, `sonido-r`) son los más difíciles para una voz artificial: revísalos con cuidado y, si no suenan bien, grábalos tú como `.m4a` con el mismo nombre. Una grabación siempre gana sobre la generada.

## Instalar en Android

**Rápido, sin instalar nada:** abre la app en Chrome del celular (dirección `Network` de `npm run dev`) → menú ⋮ → **Agregar a pantalla principal**. Funciona mientras tu computadora tenga el servidor corriendo.

**Como app (APK), sin depender de la computadora:**

1. Instala [Android Studio](https://developer.android.com/studio) (trae el SDK de Android y Java).
2. Una sola vez: `npm run android:agregar` (crea la carpeta `android/`).
3. Cada vez que cambie la app o se agreguen audios: `npm run android:sincronizar`.
4. `npm run android:abrir` abre el proyecto en Android Studio. Conecta el celular por USB con la depuración USB activada y presiona ▶ Run, o usa **Build → Build APK(s)** para generar el archivo e instalarlo.
5. Ícono: en Android Studio, clic derecho en `app` → **New → Image Asset** y elige `public/icons/icon-512.png`.

## Privacidad

No hay anuncios, cuentas ni analítica. El progreso se guarda solo en el dispositivo.

## Créditos

Basado en [Little Writing](https://github.com/jellydn/little-writing) de Dung Huynh Duc (licencia MIT, ver `LICENSE`). El motor de trazado, las plantillas y las pantallas se reescribieron para este proyecto.

Esta app es un complemento educativo y no sustituye la evaluación de un terapeuta de lenguaje.
