import type { Transition } from 'motion/react';
import type Lenis from 'lenis';

/** Snappy UI spring — segmented thumbs, menus, toggles. */
export const spring: Transition = { type: 'spring', stiffness: 460, damping: 36, mass: 0.8 };

/** Softer spring for large surfaces — sheets, drawers, cards settling. */
export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };

/** Apple's signature deceleration curve. */
export const easeApple = [0.22, 1, 0.36, 1] as const;

// ---------------------------------------------------------------------------
// Lenis registry + scroll locking shared by every overlay.
// ---------------------------------------------------------------------------

let lenisInstance: Lenis | null = null;
let lockCount = 0;

export function registerLenis(instance: Lenis | null) {
  lenisInstance = instance;
  if (instance && lockCount > 0) instance.stop();
}

export function getLenis() {
  return lenisInstance;
}

export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    lenisInstance?.stop();
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    if (gap > 0) document.documentElement.style.paddingRight = `${gap}px`;
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
    lenisInstance?.start();
  }
}
