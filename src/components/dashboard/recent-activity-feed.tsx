'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Activity, ArrowRight } from 'lucide-react';

export function RecentActivityFeed() {
  const { activities } = useStore();

  const latestActivities = activities.slice(0, 5);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Actividad reciente
            </h3>
          </div>
          <Link
            href="/actividad"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline"
          >
            Ver timeline
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
          {latestActivities.map((event) => (
            <div key={event.id} className="py-3 flex items-start gap-3 text-xs">
              <Avatar
                src={event.user.avatar}
                name={event.user.name}
                size="xs"
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {event.user.name}
                  </span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">{event.action}</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    &ldquo;{event.entity}&rdquo;
                  </span>
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                  {event.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/actividad"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
        >
          Explorar historial de auditoría
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
