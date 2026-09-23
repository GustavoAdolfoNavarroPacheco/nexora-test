'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { SectionTitle } from '@/components/layout/page-header';
import { Stagger, StaggerItem } from '@/components/ui/reveal';
import { firstName } from '@/lib/utils';

export function RecentActivityFeed() {
  const { activities } = useStore();
  const latest = activities.slice(0, 5);

  return (
    <section className="surface h-full p-5 sm:p-7">
      <SectionTitle
        title="Actividad"
        detail="Lo último que movió el equipo"
        trailing={
          <Link href="/actividad" className="shrink-0 text-[13px] font-medium text-accent-ink hover:underline">
            Historial
          </Link>
        }
      />

      <Stagger as="ol" className="relative mt-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-line">
        {latest.map((event) => (
          <StaggerItem as="li" key={event.id} className="relative flex gap-3">
            <Avatar src={event.user.avatar} name={event.user.name} size="xs" className="rounded-full ring-4 ring-card" />
            <div className="min-w-0 flex-1 text-[13px] leading-snug">
              <p className="text-ink-2">
                <span className="font-medium text-ink">{firstName(event.user.name)}</span> {event.action}{' '}
                <span className="font-medium text-ink">{event.entity}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-ink-3">{event.timeAgo}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
