'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Segmented } from '@/components/ui/segmented';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { easeApple } from '@/lib/motion';
import { useStore } from '@/lib/store';

type Range = '7d' | '30d' | '90d';

interface Point {
  label: string;
  progress: number; // cumulative portfolio progress, %
  closed: number; // tasks closed in the bucket
}

// Portfolio history recorded by the workspace.
const SERIES: Record<Range, Point[]> = {
  '7d': [
    { label: 'jue 27', progress: 61, closed: 3 },
    { label: 'vie 28', progress: 63, closed: 5 },
    { label: 'sáb 29', progress: 63, closed: 0 },
    { label: 'dom 30', progress: 64, closed: 1 },
    { label: 'lun 31', progress: 67, closed: 6 },
    { label: 'mar 1', progress: 70, closed: 7 },
    { label: 'mié 2', progress: 72, closed: 4 },
  ],
  '30d': [
    { label: '4 ago', progress: 38, closed: 9 },
    { label: '7 ago', progress: 41, closed: 7 },
    { label: '10 ago', progress: 43, closed: 5 },
    { label: '13 ago', progress: 47, closed: 11 },
    { label: '16 ago', progress: 50, closed: 8 },
    { label: '19 ago', progress: 52, closed: 6 },
    { label: '22 ago', progress: 55, closed: 10 },
    { label: '25 ago', progress: 59, closed: 12 },
    { label: '28 ago', progress: 63, closed: 9 },
    { label: '31 ago', progress: 67, closed: 13 },
    { label: '2 sept', progress: 72, closed: 11 },
  ],
  '90d': [
    { label: '9 jun', progress: 8, closed: 14 },
    { label: '16 jun', progress: 12, closed: 18 },
    { label: '23 jun', progress: 15, closed: 12 },
    { label: '30 jun', progress: 19, closed: 21 },
    { label: '7 jul', progress: 24, closed: 25 },
    { label: '14 jul', progress: 27, closed: 17 },
    { label: '21 jul', progress: 31, closed: 22 },
    { label: '28 jul', progress: 36, closed: 28 },
    { label: '4 ago', progress: 40, closed: 24 },
    { label: '11 ago', progress: 46, closed: 30 },
    { label: '18 ago', progress: 52, closed: 27 },
    { label: '25 ago', progress: 60, closed: 33 },
    { label: '2 sept', progress: 72, closed: 36 },
  ],
};

const HEIGHT = 200;
const PAD = { top: 16, right: 8, bottom: 28, left: 8 };

/** Catmull-Rom → cubic Bézier for a smooth line through every point. */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function ProgressChart() {
  const [range, setRange] = useState<Range>('30d');
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: '0px 0px -10% 0px' });
  const gradId = useId().replace(/:/g, '');

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // History is stored as a shape; the last point is pinned to today's live portfolio average
  // so the chart always agrees with the rings above it.
  const { projects } = useStore();
  const live = projects.filter((p) => p.status !== 'archivado' && p.status !== 'completado');
  const today = live.length ? Math.round(live.reduce((a, p) => a + p.progress, 0) / live.length) : 0;
  const points = useMemo(() => {
    const raw = SERIES[range];
    const last = raw[raw.length - 1].progress;
    return raw.map((p) => ({ ...p, progress: Math.round((p.progress / last) * today) }));
  }, [range, today]);
  const { coords, line, area, min, max } = useMemo(() => {
    const values = points.map((p) => p.progress);
    const lo = Math.max(0, Math.floor((Math.min(...values) - 6) / 10) * 10);
    const hi = Math.min(100, Math.ceil((Math.max(...values) + 4) / 10) * 10);
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const c: [number, number][] = points.map((p, i) => [
      PAD.left + (i / (points.length - 1)) * innerW,
      PAD.top + (1 - (p.progress - lo) / (hi - lo || 1)) * innerH,
    ]);
    const l = smoothPath(c);
    const baseline = HEIGHT - PAD.bottom;
    return {
      coords: c,
      line: l,
      area: `${l} L${c[c.length - 1][0]},${baseline} L${c[0][0]},${baseline} Z`,
      min: lo,
      max: hi,
    };
  }, [points, width]);

  const active = hover ?? points.length - 1;
  const current = points[active];
  const first = points[0];
  const delta = current.progress - first.progress;
  const totalClosed = points.slice(0, active + 1).reduce((a, p) => a + p.closed, 0);

  const onPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let best = 0;
    coords.forEach((c, i) => {
      if (Math.abs(c[0] - x) < Math.abs(coords[best][0] - x)) best = i;
    });
    setHover(best);
  };

  const labelEvery = Math.ceil(points.length / (width < 480 ? 4 : 7));

  return (
    <section className="surface h-full p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-footnote font-medium text-ink-2">Avance acumulado de la cartera</p>
          <div className="mt-1 flex items-baseline gap-2">
            <AnimatedNumber value={current.progress} suffix="%" className="text-[34px] leading-none font-semibold tracking-[-0.04em] text-ink" />
            <span className="text-[13px] font-medium text-green-ink">
              {delta >= 0 ? '+' : ''}
              {delta} pts
            </span>
          </div>
          <p className="text-caption mt-1.5 text-ink-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${range}-${active}`}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                {hover === null ? 'Hoy' : current.label} · {totalClosed} tareas cerradas en el periodo
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
        <Segmented
          label="Periodo"
          size="sm"
          value={range}
          onChange={(r) => {
            setRange(r);
            setHover(null);
          }}
          options={[
            { value: '7d', label: '7 días' },
            { value: '30d', label: '30 días' },
            { value: '90d', label: '90 días' },
          ]}
        />
      </div>

      <div ref={wrapRef} className="relative mt-5 w-full select-none" style={{ height: HEIGHT }}>
        <svg width={width} height={HEIGHT} className="absolute inset-0 overflow-visible" role="img" aria-label={`Avance de ${first.progress}% a ${points[points.length - 1].progress}%`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((f) => {
            const y = PAD.top + f * (HEIGHT - PAD.top - PAD.bottom);
            return (
              <g key={f}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke="var(--line)" strokeDasharray={f === 1 ? undefined : '2 4'} />
                <text x={width - PAD.right} y={y - 5} textAnchor="end" className="fill-ink-3 text-[10px]">
                  {Math.round(max - f * (max - min))}%
                </text>
              </g>
            );
          })}

          <motion.path
            key={`area-${range}`}
            d={area}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.9, ease: easeApple, delay: 0.5 }}
          />
          <motion.path
            key={`line-${range}`}
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: 1.3, ease: easeApple }}
          />

          {points.map((p, i) =>
            (i % labelEvery === 0 && points.length - 1 - i >= labelEvery / 2) || i === points.length - 1 ? (
              <text
                key={p.label}
                x={coords[i][0]}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                className={i === active ? 'fill-ink text-[10px] font-medium' : 'fill-ink-3 text-[10px]'}
              >
                {p.label}
              </text>
            ) : null
          )}

          {/* Scrubber */}
          <motion.line
            x1={coords[active][0]}
            x2={coords[active][0]}
            y1={PAD.top - 6}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--ink-3)"
            strokeWidth={1}
            initial={false}
            animate={{ x1: coords[active][0], x2: coords[active][0], opacity: hover === null ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40 }}
          />
          <motion.circle
            r={6}
            fill="var(--card)"
            stroke="var(--accent)"
            strokeWidth={3}
            initial={false}
            animate={{ cx: coords[active][0], cy: coords[active][1], opacity: inView ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40, opacity: { delay: inView && hover === null ? 1.2 : 0 } }}
          />

          <rect
            x={0}
            y={0}
            width={width}
            height={HEIGHT}
            fill="transparent"
            className="cursor-crosshair touch-pan-y"
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      </div>
    </section>
  );
}
