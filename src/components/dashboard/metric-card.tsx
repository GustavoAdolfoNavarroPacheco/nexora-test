import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'positive',
  icon: Icon,
  progress,
}: MetricCardProps) {
  const trendColors = {
    positive: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
    negative: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/60',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60',
    neutral: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Progress bar if present */}
      {typeof progress === 'number' && (
        <div className="mt-3">
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend indicator & Subtitle */}
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                trendColors[trendType]
              )}
            >
              {trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
              {trendType === 'negative' && <TrendingDown className="w-3 h-3" />}
              {trendType === 'warning' && <AlertCircle className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
