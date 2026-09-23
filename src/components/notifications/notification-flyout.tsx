'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { UserRound, CalendarDays, CircleCheck, AtSign, TriangleAlert, BellOff } from 'lucide-react';
import { useStore } from '@/lib/store';
import { spring, easeApple } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/lib/types';

const typeMeta: Record<NotificationItem['type'], { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  assignment: { icon: UserRound, cls: 'bg-accent' },
  deadline: { icon: CalendarDays, cls: 'bg-orange' },
  completion: { icon: CircleCheck, cls: 'bg-green' },
  mention: { icon: AtSign, cls: 'bg-purple' },
  alert: { icon: TriangleAlert, cls: 'bg-red' },
};

/** Notification Center-style popover anchored under the bell. */
export function NotificationFlyout({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
          transition={spring}
          style={{ transformOrigin: 'top right' }}
          className={cn(
            'glass z-50 overflow-hidden rounded-[22px] bg-elevated shadow-pop',
            'max-sm:fixed max-sm:inset-x-3 max-sm:top-[62px]',
            'sm:absolute sm:top-[calc(100%+10px)] sm:right-0 sm:w-[380px]'
          )}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div>
              <h2 className="text-headline text-ink">Notificaciones</h2>
              <p className="text-caption text-ink-2">{unread > 0 ? `${unread} sin leer` : 'Todo al día'}</p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="rounded-full px-3 py-1.5 text-[12px] font-medium text-accent-ink transition-colors hover:bg-accent-soft"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div data-lenis-prevent className="max-h-[min(440px,70vh)] space-y-1.5 overflow-y-auto overscroll-contain p-2.5 pt-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center text-ink-3">
                <BellOff className="mb-2 h-6 w-6" />
                <p className="text-footnote">No hay notificaciones.</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const meta = typeMeta[n.type];
                const Icon = meta.icon;
                const body = (
                  <>
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white', meta.cls)}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-[13px]', n.read ? 'font-medium text-ink-2' : 'font-semibold text-ink')}>
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-3">{n.timeAgo}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-ink-2">{n.description}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Sin leer" />}
                  </>
                );
                const cls = cn(
                  'flex w-full items-start gap-3 rounded-[16px] p-3 text-left transition-colors',
                  n.read ? 'hover:bg-fill' : 'bg-card/70 shadow-card hover:bg-card'
                );
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeApple, delay: 0.04 * i }}
                  >
                    {n.link ? (
                      <Link
                        href={n.link}
                        className={cls}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          onClose();
                        }}
                      >
                        {body}
                      </Link>
                    ) : (
                      <button className={cls} onClick={() => markNotificationAsRead(n.id)}>
                        {body}
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
