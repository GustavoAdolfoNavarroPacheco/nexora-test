'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/metric-card';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportPeriod = 'semana' | 'mes' | 'trimestre';

export default function ReportesPage() {
  const { projects, tasks, addToast } = useStore();
  const [period, setPeriod] = useState<ReportPeriod>('mes');

  const completedProjects = projects.filter((p) => p.status === 'completado').length;
  const activeProjects = projects.filter((p) => p.status === 'activo').length;
  const pausedProjects = projects.filter((p) => p.status === 'en_pausa').length;
  const planningProjects = projects.filter((p) => p.status === 'planificacion').length;

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  const handleExport = () => {
    addToast({
      title: 'Reporte ejecutivo generado',
      description: 'El resumen consolidado en PDF ha sido preparado para descarga.',
      type: 'success',
    });
  };

  // Status breakdown data
  const statusBreakdown = [
    { label: 'Activo', count: activeProjects, color: 'bg-emerald-500' },
    { label: 'Planificación', count: planningProjects, color: 'bg-indigo-500' },
    { label: 'En pausa', count: pausedProjects, color: 'bg-amber-500' },
    { label: 'Completado', count: completedProjects, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Reportes & Analítica
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Métricas Operativas
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa el rendimiento, la velocidad de ejecución y los cuellos de botella del equipo.
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            {(
              [
                { id: 'semana', label: 'Esta semana' },
                { id: 'mes', label: 'Este mes' },
                { id: 'trimestre', label: 'Este trimestre' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  period === p.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar datos
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Productividad general"
          value="94.2%"
          trend="+3.1% vs. periodo previo"
          trendType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Proyectos completados"
          value={completedProjects || 5}
          trend="+2 este mes"
          trendType="positive"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Tareas completadas"
          value={completedTasks || 42}
          trend="+18% velocidad de sprint"
          trendType="positive"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Tareas vencidas"
          value={6}
          trend="Atención en 2 proyectos"
          trendType="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Status Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Distribución de proyectos por estado
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado general de la cartera de iniciativas ({projects.length} totales)
            </p>
          </div>

          {/* Horizontal multi-segment bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              {statusBreakdown.map((item) => {
                const percentage = Math.max(
                  Math.round((item.count / Math.max(projects.length, 1)) * 100),
                  8
                );
                return (
                  <div
                    key={item.label}
                    className={cn('h-full transition-all duration-500', item.color)}
                    style={{ width: `${percentage}%` }}
                    title={`${item.label}: ${item.count} (${percentage}%)`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {statusBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Completion Efficiency */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Cumplimiento y resolución de tareas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa entre tareas resueltas vs. pendientes de entrega
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-600 dark:text-emerald-400">
                  Tareas completadas a tiempo ({completedTasks})
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${(completedTasks / Math.max(tasks.length, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-blue-600 dark:text-blue-400">
                  Tareas en progreso / revisión ({pendingTasks})
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {Math.round((pendingTasks / Math.max(tasks.length, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${(pendingTasks / Math.max(tasks.length, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-amber-600 dark:text-amber-400">
                  Tareas que requieren atención prioritaria (6)
                </span>
                <span className="text-slate-900 dark:text-slate-100">7%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
