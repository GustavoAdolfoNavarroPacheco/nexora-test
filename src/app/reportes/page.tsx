'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const { projects, tasks, addToast } = useStore();
  const [period, setPeriod] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const inProgressTasks = tasks.filter((t) => t.status === 'en_progreso').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'en_revision').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pendiente').length;

  const handleExport = () => {
    addToast({
      title: 'Reporte generado con éxito',
      description: 'El resumen ejecutivo ha sido exportado en formato CSV y PDF.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#e7e5e4]/80 dark:border-[#2e2a27]">
        <div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
            Reportes y Analítica
          </h1>
          <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
            Rendimiento operativo, velocidad de entrega y distribución de carga de trabajo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector pill */}
          <div className="flex items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524]">
            {(['semana', 'mes', 'trimestre'] as const).map((p) => {
              const labels = {
                semana: 'Esta semana',
                mes: 'Este mes',
                trimestre: 'Este trimestre',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer',
                    period === p
                      ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                      : 'text-[#777169] hover:text-[#0c0a09]'
                  )}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Eficiencia operativa
          </span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
              94.2%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#0c0a09] bg-[#a7e5d3]/35 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +2.1%
            </span>
          </div>
          <p className="text-xs text-[#777169] mt-3 pt-3 border-t border-[#e7e5e4]/60">
            Cumplimiento de plazos previstos
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Velocidad de entrega
          </span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
              3.8 días
            </span>
            <span className="text-xs text-[#777169]">promedio por tarea</span>
          </div>
          <p className="text-xs text-[#777169] mt-3 pt-3 border-t border-[#e7e5e4]/60">
            -0.4 días comparado al trimestre previo
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Tareas cerradas
          </span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
              {completedTasks}
            </span>
            <span className="text-xs text-[#777169]">de {totalTasks} totales</span>
          </div>
          <p className="text-xs text-[#777169] mt-3 pt-3 border-t border-[#e7e5e4]/60">
            Tasa de resolución del {Math.round((completedTasks / totalTasks) * 100)}%
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Cuellos de botella
          </span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
              {inReviewTasks}
            </span>
            <span className="text-xs text-[#777169]">tareas en revisión</span>
          </div>
          <p className="text-xs text-[#777169] mt-3 pt-3 border-t border-[#e7e5e4]/60">
            Sin bloqueos críticos detectados
          </p>
        </div>
      </div>

      {/* Visual Distributions using exact palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
            <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              Distribución de tareas por estado
            </h3>
            <span className="text-xs text-[#777169]">Total: {totalTasks}</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#4e4e4e] dark:text-[#d6d3d1]">Completadas</span>
                <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {completedTasks} ({Math.round((completedTasks / totalTasks) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                <div
                  className="h-full bg-[#a7e5d3] rounded-full"
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#4e4e4e] dark:text-[#d6d3d1]">En progreso</span>
                <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {inProgressTasks} ({Math.round((inProgressTasks / totalTasks) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                <div
                  className="h-full bg-[#a8c8e8] rounded-full"
                  style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#4e4e4e] dark:text-[#d6d3d1]">En revisión</span>
                <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {inReviewTasks} ({Math.round((inReviewTasks / totalTasks) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                <div
                  className="h-full bg-[#c8b8e0] rounded-full"
                  style={{ width: `${(inReviewTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#4e4e4e] dark:text-[#d6d3d1]">Pendientes</span>
                <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {pendingTasks} ({Math.round((pendingTasks / totalTasks) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                <div
                  className="h-full bg-[#f4c5a8] rounded-full"
                  style={{ width: `${(pendingTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Health Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
            <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              Cumplimiento de proyectos activos
            </h3>
            <span className="text-xs text-[#777169]">{projects.length} iniciativas</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5] truncate max-w-[240px]">
                    {p.name}
                  </span>
                  <span className="text-[#777169] dark:text-[#a8a29e]">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                  <div
                    className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
