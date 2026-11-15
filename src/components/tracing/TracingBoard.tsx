/**
 * Tablero de trazado: dibuja la letra con react-konva y pasa el dedo al motor.
 *
 * Capas (de abajo hacia arriba):
 * 1. Renglón de cuaderno (línea superior, media punteada y base).
 * 2. "Camino" de cada trazo: el ancho visible es la zona válida.
 * 3. Relleno: trazos terminados completos y el actual hasta donde va.
 * 4. Pista: punto de inicio con número y flecha de dirección.
 * 5. Marca del dedo (verde dentro, roja fuera).
 */

import Konva from 'konva';
import type React from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Arrow, Circle, Group, Layer, Line, Stage, Text } from 'react-konva';
import { GUIDE_LINES, TEMPLATE_SIZE } from '@/content/types';
import { indexAtLength, type Point } from '@/engine/path';
import type { EngineEvent, TracingEngine } from '@/engine/tracingEngine';

const COLORS = {
  line: '#9ec5ff',
  lineMid: '#c9ddff',
  road: '#efe9fb',
  roadCurrent: '#e2d7fa',
  roadEdge: '#c8b8ef',
  roadOff: '#ffd6d6',
  fill: '#7c4dff',
  fillDone: '#5e35b1',
  start: '#2ecc71',
  arrow: '#ff9800',
  fingerOk: 'rgba(46, 204, 113, 0.45)',
  fingerOff: 'rgba(255, 82, 82, 0.5)',
};

interface Props {
  engine: TracingEngine;
  /** Cambia cuando el motor se reinicia o se cambia de letra. */
  engineKey: string;
  onEvents: (events: EngineEvent[]) => void;
}

interface Layout {
  width: number;
  height: number;
  scale: number;
  ox: number;
  oy: number;
}

function computeLayout(width: number, height: number): Layout {
  const pad = Math.max(12, Math.min(width, height) * 0.04);
  const scale = Math.max(
    0.1,
    Math.min(
      (width - pad * 2) / TEMPLATE_SIZE.width,
      (height - pad * 2) / TEMPLATE_SIZE.height
    )
  );
  return {
    width,
    height,
    scale,
    ox: (width - TEMPLATE_SIZE.width * scale) / 2,
    oy: (height - TEMPLATE_SIZE.height * scale) / 2,
  };
}

function flat(points: Point[], l: Layout): number[] {
  const out: number[] = new Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    out[i * 2] = l.ox + points[i].x * l.scale;
    out[i * 2 + 1] = l.oy + points[i].y * l.scale;
  }
  return out;
}

export const TracingBoard: React.FC<Props> = ({
  engine,
  engineKey,
  onEvents,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>(() => computeLayout(300, 300));
  const [, setTick] = useState(0);
  const frame = useRef<number | null>(null);
  const activePointer = useRef<number | null>(null);
  const pulseRef = useRef<Konva.Circle>(null);

  // Redibujar como máximo una vez por cuadro.
  const requestDraw = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setTick((t) => t + 1);
    });
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setLayout(computeLayout(r.width, r.height));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    requestDraw();
  }, [engineKey, requestDraw]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    []
  );

  // Pulso del punto de inicio.
  useEffect(() => {
    const node = pulseRef.current;
    if (!node) return;
    const anim = new Konva.Animation((f) => {
      if (!f) return;
      const s = 1 + 0.35 * Math.abs(Math.sin(f.time / 380));
      node.scale({ x: s, y: s });
      node.opacity(1.25 - s * 0.75);
    }, node.getLayer());
    anim.start();
    return () => {
      anim.stop();
    };
  });

  const toTemplate = (clientX: number, clientY: number): Point => {
    const r = containerRef.current?.getBoundingClientRect();
    const x = clientX - (r?.left ?? 0);
    const y = clientY - (r?.top ?? 0);
    return {
      x: (x - layout.ox) / layout.scale,
      y: (y - layout.oy) / layout.scale,
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (activePointer.current !== null) return; // un solo dedo a la vez
    activePointer.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jsdom / navegadores viejos
    }
    onEvents(
      engine.pointerDown(toTemplate(e.clientX, e.clientY), performance.now())
    );
    requestDraw();
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activePointer.current) return;
    e.preventDefault();
    const native = e.nativeEvent;
    const list =
      typeof native.getCoalescedEvents === 'function'
        ? native.getCoalescedEvents()
        : [];
    const samples = list.length > 0 ? list : [native];
    const events: EngineEvent[] = [];
    for (const s of samples) {
      events.push(
        ...engine.pointerMove(
          toTemplate(s.clientX, s.clientY),
          performance.now()
        )
      );
    }
    if (events.length) onEvents(events);
    requestDraw();
  };

  const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activePointer.current) return;
    activePointer.current = null;
    onEvents(engine.pointerUp());
    requestDraw();
  };

  // ---------- Dibujo ----------
  const l = layout;
  const tol = engine.options.tolerance;
  // El camino visible es más angosto que la zona aceptada: así se ve
  // como letra y el niño tiene margen extra sin saberlo.
  const roadWidth = tol * 1.25 * l.scale;
  const fillWidth = tol * 0.95 * l.scale;
  const current = engine.currentStroke;
  const offPath = engine.isTracing && !engine.isOnPath;

  const guideY = (y: number) => l.oy + y * l.scale;

  const roads: React.ReactNode[] = [];
  const fills: React.ReactNode[] = [];
  for (let i = 0; i < engine.strokeCount; i++) {
    const def = engine.strokeDef(i);
    const isCurrent = i === current;
    const roadColor = isCurrent
      ? offPath
        ? COLORS.roadOff
        : COLORS.roadCurrent
      : COLORS.road;
    if (def.type === 'dot') {
      const cx = l.ox + def.at.x * l.scale;
      const cy = l.oy + def.at.y * l.scale;
      roads.push(
        <Circle
          key={`r${i}`}
          x={cx}
          y={cy}
          radius={tol * 0.75 * l.scale}
          fill={roadColor}
          stroke={COLORS.roadEdge}
          strokeWidth={2}
        />
      );
      if (engine.isStrokeCompleted(i)) {
        fills.push(
          <Circle
            key={`f${i}`}
            x={cx}
            y={cy}
            radius={tol * 0.55 * l.scale}
            fill={COLORS.fillDone}
          />
        );
      }
      continue;
    }
    const path = engine.sampledPath(i);
    if (!path) continue;
    const pts = flat(path.points, l);
    roads.push(
      <Group key={`r${i}`}>
        <Line
          points={pts}
          stroke={COLORS.roadEdge}
          strokeWidth={roadWidth + 4}
          lineCap="round"
          lineJoin="round"
        />
        <Line
          points={pts}
          stroke={roadColor}
          strokeWidth={roadWidth}
          lineCap="round"
          lineJoin="round"
        />
        {isCurrent && (
          <Line
            points={pts}
            stroke={COLORS.roadEdge}
            strokeWidth={2}
            dash={[6, 8]}
            lineCap="round"
          />
        )}
      </Group>
    );
    if (engine.isStrokeCompleted(i)) {
      fills.push(
        <Line
          key={`f${i}`}
          points={pts}
          stroke={COLORS.fillDone}
          strokeWidth={fillWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    } else if (isCurrent && engine.progressOf(i) > 0) {
      const end = indexAtLength(path, engine.progressOf(i));
      const partial = flat(path.points.slice(0, Math.max(2, end + 1)), l);
      fills.push(
        <Line
          key={`f${i}`}
          points={partial}
          stroke={COLORS.fill}
          strokeWidth={fillWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
  }

  // Pista: punto de inicio y flecha (solo cuando el dedo no está trazando).
  let hint: React.ReactNode = null;
  const resume = engine.resumePoint();
  if (resume && !engine.isTracing && !engine.isComplete) {
    const cx = l.ox + resume.x * l.scale;
    const cy = l.oy + resume.y * l.scale;
    const r = Math.max(14, tol * 0.95 * l.scale);
    const def = engine.strokeDef(current);
    let arrow: React.ReactNode = null;
    const path = engine.sampledPath(current);
    if (def.type === 'line' && path) {
      const from = indexAtLength(path, engine.progressOf(current) + tol * 0.6);
      const to = indexAtLength(
        path,
        engine.progressOf(current) + tol * 0.6 + 22
      );
      if (to - from >= 4) {
        const step = Math.max(1, Math.floor((to - from) / 8));
        const sel: Point[] = [];
        for (let k = from; k <= to; k += step) sel.push(path.points[k]);
        if (sel[sel.length - 1] !== path.points[to]) sel.push(path.points[to]);
        arrow = (
          <Arrow
            points={flat(sel, l)}
            stroke={COLORS.arrow}
            fill={COLORS.arrow}
            strokeWidth={Math.max(4, l.scale * 1.6)}
            pointerLength={Math.max(12, l.scale * 4)}
            pointerWidth={Math.max(12, l.scale * 4)}
            lineCap="round"
            lineJoin="round"
            tension={0.3}
          />
        );
      }
    }
    hint = (
      <Group listening={false}>
        {arrow}
        <Circle
          ref={pulseRef}
          x={cx}
          y={cy}
          radius={r * 1.25}
          stroke={COLORS.start}
          strokeWidth={4}
        />
        <Circle x={cx} y={cy} radius={r} fill={COLORS.start} />
        {engine.strokeCount > 1 && (
          <Text
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            text={String(current + 1)}
            fontSize={r * 1.1}
            fontStyle="bold"
            fill="#ffffff"
            align="center"
            verticalAlign="middle"
          />
        )}
      </Group>
    );
  }

  const finger = engine.fingerPosition;
  const fingerNode =
    finger && engine.isTracing ? (
      <Circle
        x={l.ox + finger.x * l.scale}
        y={l.oy + finger.y * l.scale}
        radius={Math.max(10, tol * 0.8 * l.scale)}
        fill={engine.isOnPath ? COLORS.fingerOk : COLORS.fingerOff}
        listening={false}
      />
    ) : null;

  return (
    <div
      ref={containerRef}
      className="tracing-board"
      data-testid="tracing-board"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage width={l.width} height={l.height} listening={false}>
        <Layer listening={false}>
          <Line
            points={[
              0,
              guideY(GUIDE_LINES.top),
              l.width,
              guideY(GUIDE_LINES.top),
            ]}
            stroke={COLORS.line}
            strokeWidth={2}
          />
          <Line
            points={[
              0,
              guideY(GUIDE_LINES.middle),
              l.width,
              guideY(GUIDE_LINES.middle),
            ]}
            stroke={COLORS.lineMid}
            strokeWidth={2}
            dash={[10, 10]}
          />
          <Line
            points={[
              0,
              guideY(GUIDE_LINES.base),
              l.width,
              guideY(GUIDE_LINES.base),
            ]}
            stroke={COLORS.line}
            strokeWidth={3}
          />
          {roads}
          {fills}
          {hint}
          {fingerNode}
        </Layer>
      </Stage>
    </div>
  );
};
