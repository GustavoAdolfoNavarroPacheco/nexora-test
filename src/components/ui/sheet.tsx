'use client';

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { springSoft, easeApple } from '@/lib/motion';
import { useEscape, useIsCompact, useMounted, useScrollLock } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const widths = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab inside the panel and restores focus to the trigger on close. */
function useFocusTrap(panelRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel;
    requestAnimationFrame(() => first?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const head = nodes[0];
      const tail = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [panelRef, active]);
}

function Header({
  titleId,
  title,
  description,
  onClose,
}: {
  titleId: string;
  title?: string;
  description?: string;
  onClose: () => void;
}) {
  if (!title && !description) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 sm:px-7 sm:pt-6">
      <div className="min-w-0">
        {title && (
          <h2 id={titleId} className="text-title-2 text-ink">
            {title}
          </h2>
        )}
        {description && <p className="text-footnote mt-1 text-ink-2">{description}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill-2 text-ink-2 transition-colors hover:text-ink active:scale-95"
      >
        <X className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

type Placement = 'center' | 'side';

function Overlay({ placement, isOpen, onClose, title, description, children, footer, width = 'lg', className }: OverlayProps & { placement: Placement }) {
  const mounted = useMounted();
  const compact = useIsCompact();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const dragControls = useDragControls();

  useScrollLock(isOpen);
  useEscape(isOpen, onClose);
  useFocusTrap(panelRef, isOpen);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 120 || info.velocity.y > 600) onClose();
    },
    [onClose]
  );

  if (!mounted) return null;

  const asSheet = compact;
  const panelMotion = asSheet
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : placement === 'side'
      ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
      : {
          initial: { opacity: 0, scale: 0.94, y: 12 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.18, ease: easeApple } },
        };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-[70] flex',
            asSheet ? 'items-end' : placement === 'side' ? 'justify-end' : 'items-center justify-center p-6'
          )}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 dark:bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeApple }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            {...panelMotion}
            transition={springSoft}
            drag={asSheet ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.9 }}
            onDragEnd={onDragEnd}
            className={cn(
              'relative flex flex-col bg-card text-ink outline-none',
              asSheet
                ? 'max-h-[92dvh] w-full rounded-t-[28px] pb-[env(safe-area-inset-bottom)] shadow-pop'
                : placement === 'side'
                  ? 'h-full w-full max-w-[480px] shadow-pop sm:rounded-l-[28px]'
                  : cn('max-h-[88vh] w-full rounded-[28px] shadow-pop', widths[width]),
              className
            )}
          >
            {asSheet && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
                aria-hidden
              >
                <span className="h-[5px] w-9 rounded-full bg-fill-2" />
              </div>
            )}
            <div onPointerDown={(e) => asSheet && dragControls.start(e)} className={cn(asSheet && 'touch-none')}>
              <Header titleId={titleId} title={title} description={description} onClose={onClose} />
            </div>
            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-7">
              {children}
            </div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line px-6 py-4 sm:px-7">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Centered macOS sheet on desktop, draggable iOS bottom sheet on phones. */
export function Modal(props: OverlayProps) {
  return <Overlay placement="center" {...props} />;
}

/** Inspector panel from the right on desktop, bottom sheet on phones. */
export function Drawer(props: OverlayProps) {
  return <Overlay placement="side" {...props} />;
}
