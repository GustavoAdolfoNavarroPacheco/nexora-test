'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { MyTasksWidget } from '@/components/dashboard/my-tasks-widget';
import { formatFullDate } from '@/lib/utils';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    projects,
    tasks,
    setIsCreateProjectOpen,
  } = useStore();

  const activeProjectsCount = projects.filter(
    (p) => p.status === 'activo' || p.status === 'planificacion'
  ).length;

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  // Calculate average progress
  const avgProgress = Math.round(
    projects.reduce((acc, curr) => acc + curr.progress, 0) / Math.max(projects.length, 1)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Buenos días, {currentUser.name.split(' ')[0]}
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {formatFullDate()} — Esto es lo que está pasando con tus proyectos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateProjectOpen(true)}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo proyecto
          </Button>
        </div>
      </div>

      {/* Metrics Row: 4 Columns (Desktop) -> 2 Columns (Tablet) -> 1 Column (Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Proyectos activos"
          value={activeProjectsCount || 24}
          trend="+12.5% vs. mes anterior"
          trendType="positive"
          icon={FolderKanban}
        />

        <MetricCard
          title="Tareas pendientes"
          value={pendingTasksCount || 87}
          trend="-4.2% vs. semana pasada"
          trendType="positive"
          icon={CheckSquare}
        />

        <MetricCard
          title="Tareas vencidas"
          value={6}
          trend="+2 que requieren atención"
          trendType="warning"
          icon={AlertTriangle}
        />

        <MetricCard
          title="Progreso promedio"
          value={`${avgProgress}%`}
          trend="+5.8% vs. mes anterior"
          trendType="positive"
          icon={TrendingUp}
          progress={avgProgress}
        />
      </div>

      {/* Main Charts & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Progress Chart: spans 7 cols on large screens */}
        <div className="lg:col-span-7">
          <ProgressChart />
        </div>

        {/* Active Projects List: spans 5 cols on large screens */}
        <div className="lg:col-span-5">
          <ActiveProjectsList />
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & My Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivityFeed />
        <MyTasksWidget />
      </div>
    </div>
  );
}
