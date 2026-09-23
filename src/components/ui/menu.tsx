'use client';

import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { spring } from '@/lib/motion';
import { useClickOutside, useEscape } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export interface MenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
}

/** macOS-style contextual menu anchored to a trigger. */
export function Menu({
  items,
  trigger,
  label,
  align = 'right',
  className,
}: {
  items: MenuItem[];
  trigger: React.ReactNode;
  label: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, open, close);
  useEscape(open, close);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-fill-2 hover:text-ink',
          open && 'bg-fill-2 text-ink'
        )}
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={spring}
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            className={cn(
              'glass absolute top-10 z-40 min-w-[200px] rounded-[14px] bg-elevated p-1.5 shadow-pop',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  {item.separatorBefore && <div className="mx-2.5 my-1 h-px bg-line" />}
                  <button
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpen(false);
                      item.onSelect();
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-left text-[13px] transition-colors',
                      item.destructive ? 'text-red-ink hover:bg-red hover:text-white' : 'text-ink hover:bg-accent hover:text-white'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 opacity-80" />}
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
