'use client';

import React, { useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { spring } from '@/lib/motion';
import { useEscape, useMounted, useScrollLock } from '@/lib/hooks';

/** iOS-style alert: small, centered, two stacked choices. Used before destructive actions. */
export function AlertDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mounted = useMounted();
  const titleId = useId();
  useScrollLock(isOpen);
  useEscape(isOpen, onCancel);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-6">
          <motion.div
            className="absolute inset-0 bg-black/30 dark:bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
            transition={spring}
            className="glass relative w-full max-w-[290px] overflow-hidden rounded-[20px] bg-elevated text-center shadow-pop"
          >
            <div className="px-5 pt-5 pb-4">
              <h2 id={titleId} className="text-[16px] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </h2>
              {message && <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{message}</p>}
            </div>
            <div className="flex flex-col border-t border-line">
              <button
                autoFocus
                onClick={onConfirm}
                className="h-12 text-[16px] font-semibold text-red-ink transition-colors hover:bg-fill-2"
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="h-12 border-t border-line text-[16px] text-accent-ink transition-colors hover:bg-fill-2"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
