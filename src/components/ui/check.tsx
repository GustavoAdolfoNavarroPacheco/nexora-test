'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Reminders-style round checkbox: the fill pops in and the tick draws itself. */
export function Check({
  checked,
  onChange,
  label,
  size = 22,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  size?: number;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      whileTap={{ scale: 0.82 }}
      transition={spring}
      className={cn(
        'group/check relative inline-flex shrink-0 items-center justify-center rounded-full',
        !checked && 'shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:shadow-[inset_0_0_0_1.5px_var(--accent)]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span
            key="fill"
            className="absolute inset-0 rounded-full bg-accent"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={spring}
          />
        )}
      </AnimatePresence>
      <svg viewBox="0 0 24 24" className="relative h-[62%] w-[62%]" aria-hidden>
        <motion.path
          d="M5 12.5l4.2 4.2L19 7"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: checked ? 0.32 : 0.12, delay: checked ? 0.08 : 0, ease: 'easeOut' }}
        />
      </svg>
    </motion.button>
  );
}
