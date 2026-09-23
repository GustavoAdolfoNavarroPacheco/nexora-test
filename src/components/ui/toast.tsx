'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';

const icons = {
  success: { Icon: Check, cls: 'bg-[#30d158]' },
  warning: { Icon: AlertTriangle, cls: 'bg-[#ff9f0a]' },
  error: { Icon: AlertCircle, cls: 'bg-[#ff453a]' },
  info: { Icon: Info, cls: 'bg-[#2997ff]' },
};

/**
 * Feedback lives in a Dynamic Island: black capsules that grow out of the
 * top-center of the screen and fold back when they are done.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[max(10px,env(safe-area-inset-top))] z-[90] flex flex-col items-center gap-2 px-3"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { Icon, cls } = icons[toast.type || 'info'];
          return (
            <motion.div
              key={toast.id}
              layout
              role="status"
              initial={{ opacity: 0, y: -18, scale: 0.4, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, scale: 0.6, filter: 'blur(6px)', transition: { duration: 0.28 } }}
              transition={springSoft}
              style={{ borderRadius: 26 }}
              className="pointer-events-auto flex w-full max-w-[380px] items-center gap-3 bg-black py-2.5 pr-2.5 pl-2.5 text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
            >
              <motion.span
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springSoft, delay: 0.12 }}
                className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white', cls)}
              >
                <Icon className="h-4 w-4" strokeWidth={2.6} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-tight font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-0.5 truncate text-[12px] leading-tight text-white/60">{toast.description}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Descartar aviso"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
