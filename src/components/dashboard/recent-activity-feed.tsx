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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              Actividad reciente
            </h3>
          </div>
          <Link
            href="/actividad"
            className="text-xs text-[#292524] hover:text-[#0c0a09] dark:text-[#f5f5f5] font-medium hover:underline"
          >
            Ver timeline
          </Link>
        </div>

        <div className="divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27] mt-1">
          {latestActivities.map((event) => (
            <div key={event.id} className="py-3 flex items-start gap-3 text-xs">
              <Avatar
                src={event.user.avatar}
                name={event.user.name}
                size="xs"
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-[#4e4e4e] dark:text-[#d6d3d1] leading-snug">
                  <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                    {event.user.name}
                  </span>{' '}
                  <span className="text-[#777169]">{event.action}</span>{' '}
                  <span className="font-medium text-[#292524] dark:text-white">
                    &ldquo;{event.entity}&rdquo;
                  </span>
                </p>
                <span className="text-[11px] text-[#a8a29e] mt-0.5 block">
                  {event.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27] text-center">
        <Link
          href="/actividad"
          className="inline-flex items-center gap-1 text-xs text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white font-medium"
        >
          Explorar historial de auditoría
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
