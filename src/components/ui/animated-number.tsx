'use client';

import React, { useRef } from 'react';
import NumberFlow from '@number-flow/react';
import { useInView } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

/**
 * Rolls digits like the iOS clock: counts up from zero when it first scrolls
 * into view, then animates between values whenever the data changes.
 */
export function AnimatedNumber({ value, suffix, prefix, className, decimals = 0 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' });

  return (
    <span ref={ref} className={cn('tabular inline-flex', className)}>
      <NumberFlow
        value={inView ? value : 0}
        prefix={prefix}
        suffix={suffix}
        format={{ maximumFractionDigits: decimals, minimumFractionDigits: decimals }}
        locales="es-ES"
        willChange
      />
    </span>
  );
}
