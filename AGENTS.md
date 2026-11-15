# AGENTS.md — Letritas

App educativa infantil de trazado de letras en español mexicano.
Stack: React 19, TypeScript, Vite, react-konva, Vitest. Capacitor para empaquetar en móvil.

## Comandos

```bash
npm run dev          # servidor en la red local
npm run test:unit    # pruebas
npm run typecheck
npm run lint
npm run format
npm run build
```

## Reglas

- La interfaz, los textos y los comentarios van en español.
- `src/engine/` no importa React ni el DOM; todo cambio de lógica de trazado lleva pruebas en `tests/unit/`.
- Las plantillas viven en `src/content/letters.ts` con el sistema de coordenadas de `src/content/types.ts`.
- Sin servicios de pago, anuncios ni analítica. Datos solo en el dispositivo.
- Antes de terminar un cambio: `npm run typecheck && npm run test:unit && npm run lint`.
