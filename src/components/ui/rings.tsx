'use client';

import React, { useId, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { easeApple } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface RingSpec {
  value: number; // 0–100
  color: string;
  colorEnd?: string;
  label: string;
}

interface ActivityRingsProps {
  rings: RingSpec[];
  size?: number;
  stroke?: number;
  gap?: number;
  trackOpacity?: number;
  className?: string;
}

/** Concentric Fitness-style rings that close as they scroll into view. */
export function ActivityRings({
  rings,
  size = 220,
  stroke = 22,
  gap = 4,
  trackOpacity = 0.2,
  className,
}: ActivityRingsProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const uid = useId().replace(/:/g, '');
  const center = size / 2;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn('-rotate-90 overflow-visible', className)}
      role="img"
      aria-label={rings.map((r) => `${r.label}: ${Math.round(r.value)}%`).join(', ')}
    >
      <defs>
        {rings.map((r, i) => (
          <linearGradient key={i} id={`${uid}-g${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={r.colorEnd ?? r.color} />
            <stop offset="100%" stopColor={r.color} />
          </linearGradient>
        ))}
      </defs>
      {rings.map((r, i) => {
        const radius = center - stroke / 2 - i * (stroke + gap);
        if (radius <= stroke / 2) return null;
        const pct = Math.max(0, Math.min(100, r.value)) / 100;
        return (
          <g key={r.label}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={r.color} strokeOpacity={trackOpacity} strokeWidth={stroke} />
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#${uid}-g${i})`}
              strokeWidth={stroke}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: Math.max(pct, 0.001), opacity: pct > 0 ? 1 : 0 } : undefined}
              transition={{ duration: 1.6, ease: easeApple, delay: 0.15 + i * 0.14 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Single compact ring with the percentage in its center. */
export function ProgressRing({
  value,
  size = 44,
  stroke = 4.5,
  color = 'var(--accent)',
  showLabel = true,
  className,
  labelClassName,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
  labelClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const pct = Math.max(0, Math.min(100, value)) / 100;

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(value)}% completado`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill-2)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: Math.max(pct, 0.001), opacity: pct > 0 ? 1 : 0 } : undefined}
          transition={{ duration: 1.2, ease: easeApple }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'tabular absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink',
            labelClassName
          )}
        >
          {Math.round(value)}
        </span>
      )}
    </div>
  );
}
