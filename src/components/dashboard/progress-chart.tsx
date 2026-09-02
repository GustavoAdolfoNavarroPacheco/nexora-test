'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp } from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d';

interface DataPoint {
  label: string;
  completadas: number;
  activas: number;
  progreso: number;
}

export function ProgressChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dataMap: Record<TimeRange, DataPoint[]> = {
    '7d': [
      { label: 'Lun', completadas: 12, activas: 34, progreso: 65 },
      { label: 'Mar', completadas: 18, activas: 32, progreso: 68 },
      { label: 'Mié', completadas: 24, activas: 29, progreso: 71 },
      { label: 'Jue', completadas: 30, activas: 27, progreso: 74 },
      { label: 'Vie', completadas: 35, activas: 25, progreso: 76 },
      { label: 'Sáb', completadas: 38, activas: 24, progreso: 77 },
      { label: 'Dom', completadas: 42, activas: 23, progreso: 78 },
    ],
    '30d': [
      { label: 'Sem 1', completadas: 28, activas: 45, progreso: 52 },
      { label: 'Sem 2', completadas: 44, activas: 39, progreso: 61 },
      { label: 'Sem 3', completadas: 62, activas: 31, progreso: 70 },
      { label: 'Sem 4', completadas: 87, activas: 24, progreso: 78 },
    ],
    '90d': [
      { label: 'Mes 1', completadas: 95, activas: 60, progreso: 42 },
      { label: 'Mes 2', completadas: 180, activas: 48, progreso: 64 },
      { label: 'Mes 3', completadas: 260, activas: 24, progreso: 78 },
    ],
  };

  const points = dataMap[timeRange];
  const maxProgreso = 100;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Header with Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Progreso de proyectos
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +5.8% este periodo
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evolución porcentual de cumplimiento y tareas completadas
          </p>
        </div>

        {/* Time Filter Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => {
            const labels: Record<TimeRange, string> = {
              '7d': 'Últimos 7 días',
              '30d': 'Últimos 30 días',
              '90d': 'Últimos 90 días',
            };
            return (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setHoveredIndex(null);
                }}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Visual Bar & Line Visualization */}
      <div className="pt-6 pb-2">
        <div className="relative h-48 flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6">
          {/* Y-axis guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 dark:text-slate-500">
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>100%</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>75%</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>50%</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>25%</span>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800 w-full flex justify-between">
              <span>0%</span>
            </div>
          </div>

          {/* Bars / Columns */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const heightPercent = (pt.progreso / maxProgreso) * 100;

            return (
              <div
                key={pt.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer"
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl z-20 whitespace-nowrap animate-in fade-in duration-150 pointer-events-none">
                    <p className="font-bold">{pt.label}</p>
                    <p className="text-slate-300 dark:text-slate-600 text-[10px]">
                      {pt.progreso}% completado ({pt.completadas} tareas)
                    </p>
                  </div>
                )}

                {/* Progress bar column */}
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-700/60">
                  <div
                    className={cn(
                      'w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg transition-all duration-500',
                      isHovered && 'from-blue-600 to-blue-400 brightness-110'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* X-axis label */}
                <span
                  className={cn(
                    'mt-2 text-xs transition-colors',
                    isHovered
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {pt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-600" />
          <span>Tasa de avance acumulada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
          <span>Capacidad total planificada</span>
        </div>
      </div>
    </div>
  );
}
