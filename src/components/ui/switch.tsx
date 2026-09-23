'use client';

import React from 'react';
import { motion } from 'motion/react';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** iOS toggle with a thumb that springs across and stretches while pressed. */
export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-300 ease-apple',
        checked ? 'justify-end bg-green' : 'justify-start bg-fill-2',
        className
      )}
    >
      <motion.span
        layout
        transition={spring}
        whileTap={{ width: 34 }}
        className="block h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)]"
      />
    </button>
  );
}
