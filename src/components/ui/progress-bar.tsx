'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { easeApple } from '@/lib/motion';
import { cn, toneClasses, type Tone } from '@/lib/utils';

/** Capsule meter that fills from the left the first time it becomes visible. */
export function ProgressBar({
  value,
  tone = 'blue',
  className,
  height = 6,
  delay = 0,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      ref={ref}
      className={cn('w-full overflow-hidden rounded-full bg-fill-2', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn('h-full origin-left rounded-full', toneClasses[tone].bar)}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? pct / 100 : 0 }}
        transition={{ duration: 1.1, ease: easeApple, delay }}
      />
    </div>
  );
}

/** One capsule split into colored segments — Screen Time style. */
export function SegmentedBar({
  segments,
  className,
  height = 12,
}: {
  segments: { value: number; tone: Tone; label: string }[];
  className?: string;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  return (
    <div
      ref={ref}
      className={cn('flex w-full gap-[3px] overflow-hidden rounded-full', className)}
      style={{ height }}
    >
      {segments
        .filter((s) => s.value > 0)
        .map((s, i) => (
          <motion.div
            key={s.label}
            title={`${s.label}: ${s.value}`}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', toneClasses[s.tone].bar)}
            initial={{ flexGrow: 0.0001 }}
            animate={{ flexGrow: inView ? s.value / total : 0.0001 }}
            transition={{ duration: 1.1, ease: easeApple, delay: 0.1 + i * 0.08 }}
            style={{ flexBasis: 0 }}
          />
        ))}
    </div>
  );
}
