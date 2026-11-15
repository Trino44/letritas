# Letritas

App para que niños pequeños aprendan a trazar letras con el dedo, en español mexicano.

Incluye vocales y la S para trazar, las sílabas sa‑se‑si‑so‑su y el juego "Escucha y toca".

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

## Audios grabados

La app dice todo con la voz del celular mientras no haya grabaciones. Para usar una voz real, graba los audios de `docs/guion-de-grabacion.md` y cópialos a `public/audio/` con el nombre exacto (MP3 o M4A). No hay que cambiar código: si el archivo existe, se usa.

## Privacidad

No hay anuncios, cuentas ni analítica. El progreso se guarda solo en el dispositivo.

## Créditos

Basado en [Little Writing](https://github.com/jellydn/little-writing) de Dung Huynh Duc (licencia MIT, ver `LICENSE`). El motor de trazado, las plantillas y las pantallas se reescribieron para este proyecto.

Esta app es un complemento educativo y no sustituye la evaluación de un terapeuta de lenguaje.
