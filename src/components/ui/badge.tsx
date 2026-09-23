import React from 'react';
import { cn, toneClasses, type Tone } from '@/lib/utils';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  size?: 'sm' | 'md';
}

/** Soft, borderless status capsule in the iOS "tinted" style. */
export function Pill({ tone = 'gray', dot = false, size = 'sm', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap select-none',
        size === 'sm' ? 'h-[22px] px-2.5 text-[11px]' : 'h-7 px-3 text-xs',
        toneClasses[tone].soft,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', toneClasses[tone].dot)} />}
      {children}
    </span>
  );
}

/** Reminders-style priority marks: "!!!", "!!", "!". */
export function PriorityMarks({ marks, tone, className }: { marks: string; tone: Tone; className?: string }) {
  if (!marks) return null;
  return (
    <span className={cn('font-semibold tracking-[0.02em]', toneClasses[tone].ink, className)} aria-hidden>
      {marks}
    </span>
  );
}
