'use client';

import React, { useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationFlyout({ isOpen, onClose }: NotificationFlyoutProps) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={flyoutRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
            Notificaciones
          </h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f0efed] dark:bg-[#292524] text-[#292524] dark:text-[#f5f5f5]">
              {unreadCount} nuevas
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white font-medium cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar leídas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#a8a29e]">
            No tienes notificaciones pendientes.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={cn(
                'p-4 flex items-start gap-3 transition-colors cursor-pointer',
                !notif.read
                  ? 'bg-[#fafafa] dark:bg-[#292524]/40'
                  : 'hover:bg-[#fafafa] dark:hover:bg-[#292524]/20'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5 shrink-0',
                  !notif.read ? 'bg-[#0c0a09] dark:bg-[#a7e5d3]' : 'bg-transparent'
                )}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-semibold',
                    !notif.read ? 'text-[#0c0a09] dark:text-white' : 'text-[#4e4e4e] dark:text-[#a8a29e]'
                  )}
                >
                  {notif.title}
                </p>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5 leading-snug">
                  {notif.description}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#a8a29e]">
                  <Clock className="w-3 h-3" />
                  <span>{notif.timeAgo}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#fafafa] dark:bg-[#1c1917] border-t border-[#e7e5e4] dark:border-[#2e2a27] text-center">
        <Link
          href="/actividad"
          onClick={onClose}
          className="text-xs font-medium text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white"
        >
          Ver todo el historial de auditoría →
        </Link>
      </div>
    </div>
  );
}
