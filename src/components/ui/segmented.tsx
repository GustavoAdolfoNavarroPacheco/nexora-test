'use client';

import React, { useId } from 'react';
import { motion } from 'motion/react';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  stretch?: boolean;
  label: string;
}

/** iOS segmented control — the selected thumb glides between options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  stretch = false,
  label,
}: SegmentedProps<T>) {
  const id = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('relative inline-flex shrink-0 rounded-full bg-fill-2 p-[3px]', stretch && 'flex w-full', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.ariaLabel}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-0 inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-200',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-8 px-4 text-[13px]',
              stretch && 'flex-1',
              active ? 'text-ink' : 'text-ink-2 hover:text-ink'
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-thumb`}
                transition={spring}
                className="absolute inset-0 -z-10 rounded-full bg-card shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.05)] dark:bg-[#636366]"
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
