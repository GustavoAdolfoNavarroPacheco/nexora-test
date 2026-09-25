'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/layout/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Button } from '@/components/ui/button';
import { SummaryRings } from '@/components/dashboard/summary-rings';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { today, firstName, formatLongDate, greetingFor } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, setIsCreateTaskOpen } = useStore();

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={formatLongDate(today())}
        title={
          <span suppressHydrationWarning>
            {greetingFor(new Date())}, {firstName(currentUser.name)}
          </span>
        }
        subtitle="Esto es lo que avanzó y lo que necesita tu atención."
        actions={
          <Button variant="tinted" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nueva tarea
          </Button>
        }
      />

      <Reveal>
        <SummaryRings />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-7">
          <ActiveProjectsList />
        </Reveal>
        <Reveal className="lg:col-span-5" delay={0.08}>
          <UpcomingTasks />
        </Reveal>
        <Reveal className="lg:col-span-7">
          <ProgressChart />
        </Reveal>
        <Reveal className="lg:col-span-5" delay={0.08}>
          <RecentActivityFeed />
        </Reveal>
      </div>
    </div>
  );
}
