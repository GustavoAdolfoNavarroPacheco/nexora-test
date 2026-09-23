'use client';

import React from 'react';
import { motion } from 'motion/react';
import { easeApple } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * iOS large title. When it scrolls away the topbar picks up a compact copy
 * (see Topbar), so the page always keeps its name in view.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeApple }}
        className="min-w-0"
      >
        {eyebrow && <p className="text-eyebrow mb-2 text-ink-2">{eyebrow}</p>}
        <h1 className="text-large-title text-ink">{title}</h1>
        {subtitle && <div className="text-body mt-1.5 max-w-2xl text-ink-2">{subtitle}</div>}
      </motion.div>
      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeApple, delay: 0.08 }}
          className="flex shrink-0 flex-wrap items-center gap-2.5"
        >
          {actions}
        </motion.div>
      )}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: easeApple }}
      className={cn('surface flex flex-col items-center px-6 py-14 text-center', className)}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fill-2 text-ink-3">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <h3 className="text-headline text-ink">{title}</h3>
      {description && <p className="text-footnote mt-1 max-w-sm text-ink-2">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2.5">{action}</div>}
    </motion.div>
  );
}

/** Section title used inside cards: headline + optional trailing link/control. */
export function SectionTitle({
  title,
  detail,
  trailing,
  className,
}: {
  title: string;
  detail?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-title-2 text-ink">{title}</h2>
        {detail && <p className="text-footnote mt-0.5 text-ink-2">{detail}</p>}
      </div>
      {trailing}
    </div>
  );
}
