'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useStore } from '@/lib/store';
import { clearWelcome } from '@/lib/auth-client';
import type { Provider } from '@/lib/auth-shared';
import { easeApple } from '@/lib/motion';
import { AppleLogo, GoogleLogo } from './brand-icons';
import { Aurora } from './aurora';

const RING = 58;
const CIRCUMFERENCE_BOX = 132;

/**
 * Played once after returning from Google or Apple: a Face ID–style ring closes around the
 * user's photo, turns green with a check, says hello, then zooms away to reveal the app.
 */
export function WelcomeOverlay({ provider, onDone }: { provider: Provider; onDone: () => void }) {
  const { currentUser } = useStore();
  const [verified, setVerified] = useState(false);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    clearWelcome();
    const check = setTimeout(() => setVerified(true), 800);
    const leave = setTimeout(() => done.current(), 2500);
    return () => {
      clearTimeout(check);
      clearTimeout(leave);
    };
  }, []);

  const firstName = currentUser.name.split(/\s+/)[0];
  const ProviderLogo = provider === 'apple' ? AppleLogo : GoogleLogo;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      onClick={() => done.current()}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.12, filter: 'blur(14px)' }}
      transition={{ duration: 0.65, ease: easeApple }}
      className="fixed inset-0 z-[120] isolate flex cursor-default items-center justify-center bg-canvas"
    >
      <Aurora soft />

      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative" style={{ width: CIRCUMFERENCE_BOX, height: CIRCUMFERENCE_BOX }}>
          {/* Success ripple */}
          <AnimatePresence>
            {verified && (
              <motion.span
                aria-hidden
                initial={{ scale: 0.85, opacity: 0.55 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.1, ease: easeApple }}
                className="absolute inset-0 rounded-full border-2 border-green"
              />
            )}
          </AnimatePresence>

          <svg viewBox={`0 0 ${CIRCUMFERENCE_BOX} ${CIRCUMFERENCE_BOX}`} className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx={66} cy={66} r={RING} fill="none" stroke="var(--fill-2)" strokeWidth={4} />
            <motion.circle
              cx={66}
              cy={66}
              r={RING}
              fill="none"
              strokeWidth={4}
              strokeLinecap="round"
              initial={{ pathLength: 0, stroke: 'var(--accent)' }}
              animate={{ pathLength: 1, stroke: verified ? 'var(--green)' : 'var(--accent)' }}
              transition={{ pathLength: { duration: 0.8, ease: easeApple }, stroke: { duration: 0.3 } }}
            />
          </svg>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: verified ? [1, 1.07, 1] : 1, opacity: 1 }}
            transition={verified ? { duration: 0.45, ease: easeApple } : { type: 'spring', stiffness: 220, damping: 18 }}
            className="absolute inset-[16px] flex items-center justify-center"
          >
            <Avatar src={currentUser.avatar} name={currentUser.name} className="scale-[1.25]" size="xl" />
          </motion.div>

          <AnimatePresence>
            {verified && (
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 17 }}
                className="absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-green text-white ring-4 ring-canvas"
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.9, ease: easeApple }}
          className="text-large-title mt-8 text-ink"
        >
          Hola, {firstName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05, ease: easeApple }}
          className="mt-2 flex items-center gap-2 text-[15px] text-ink-2"
        >
          <ProviderLogo className="h-4 w-4" />
          Sesión iniciada con {provider === 'apple' ? 'Apple' : 'Google'}
        </motion.p>
      </div>
    </motion.div>
  );
}
