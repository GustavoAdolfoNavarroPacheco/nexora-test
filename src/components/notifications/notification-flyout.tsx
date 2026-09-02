'use client';

import React, { useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CheckCheck, Bell, CheckCircle2, AlertTriangle, Calendar, AtSign, ArrowRight } from 'lucide-react';
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
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'completion':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={flyoutRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {unreadCount} nuevas
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar leídas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No tienes notificaciones pendientes
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={cn(
                'p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                !item.read && 'bg-blue-50/40 dark:bg-blue-950/20'
              )}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={cn(
                      'text-xs truncate',
                      item.read
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'font-semibold text-slate-900 dark:text-slate-100'
                    )}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {item.timeAgo}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {item.description}
                </p>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/actividad"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
        >
          Ver registro completo de actividad
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
