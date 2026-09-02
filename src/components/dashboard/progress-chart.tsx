'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none">
      {/* Header with Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              Progreso de proyectos
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0c0a09] bg-[#a7e5d3]/35 border border-[#a7e5d3]/70 px-2.5 py-0.5 rounded-full dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]">
              <TrendingUp className="w-3 h-3" />
              +5.8% este periodo
            </span>
          </div>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1">
            Evolución porcentual de cumplimiento y tareas completadas
          </p>
        </div>

        {/* Time Filter Pill */}
        <div className="flex items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524] self-start sm:self-auto">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => {
            const labels: Record<TimeRange, string> = {
              '7d': '7 días',
              '30d': '30 días',
              '90d': '90 días',
            };
            return (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setHoveredIndex(null);
                }}
                className={cn(
                  'px-3.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer',
                  timeRange === range
                    ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                    : 'text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white'
                )}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Visual Bar Visualization */}
      <div className="pt-6 pb-2">
        <div className="relative h-44 flex items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6">
          {/* Guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#a8a29e]">
            <div className="border-b border-dashed border-[#e7e5e4] dark:border-[#2e2a27] w-full flex justify-between">
              <span>100%</span>
            </div>
            <div className="border-b border-dashed border-[#e7e5e4] dark:border-[#2e2a27] w-full flex justify-between">
              <span>75%</span>
            </div>
            <div className="border-b border-dashed border-[#e7e5e4] dark:border-[#2e2a27] w-full flex justify-between">
              <span>50%</span>
            </div>
            <div className="border-b border-dashed border-[#e7e5e4] dark:border-[#2e2a27] w-full flex justify-between">
              <span>25%</span>
            </div>
            <div className="border-b border-[#e7e5e4] dark:border-[#2e2a27] w-full flex justify-between">
              <span>0%</span>
            </div>
          </div>

          {/* Bars */}
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
                  <div className="absolute -top-12 bg-[#0c0a09] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-lg z-20 whitespace-nowrap pointer-events-none animate-in fade-in duration-100">
                    <p className="font-semibold">{pt.label}</p>
                    <p className="text-[#a8a29e] dark:text-[#777169] text-[10px]">
                      {pt.progreso}% completado ({pt.completadas} tareas)
                    </p>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-[#f0efed] dark:bg-[#292524] rounded-t-lg overflow-hidden flex flex-col justify-end h-full transition-colors">
                  <div
                    className={cn(
                      'w-full bg-[#292524] dark:bg-[#f5f5f5] rounded-t-lg transition-all duration-300',
                      isHovered && 'bg-[#0c0a09] dark:bg-white'
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* X-axis label */}
                <span
                  className={cn(
                    'mt-2.5 text-xs transition-colors',
                    isHovered
                      ? 'font-semibold text-[#0c0a09] dark:text-white'
                      : 'text-[#777169] dark:text-[#a8a29e]'
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
      <div className="mt-4 pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27] flex items-center justify-center gap-6 text-xs text-[#777169] dark:text-[#a8a29e]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#292524] dark:bg-[#f5f5f5]" />
          <span>Tasa de avance acumulada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f0efed] dark:bg-[#292524]" />
          <span>Capacidad planificada</span>
        </div>
      </div>
    </div>
  );
}
