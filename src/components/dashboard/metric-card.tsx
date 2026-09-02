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
  const trendStyles = {
    positive: 'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/60 dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]',
    negative: 'bg-[#e8b8c4]/30 text-[#0c0a09] border-[#e8b8c4]/60 dark:bg-[#e8b8c4]/20 dark:text-[#f5f5f5]',
    warning: 'bg-[#f4c5a8]/35 text-[#0c0a09] border-[#f4c5a8]/60 dark:bg-[#f4c5a8]/20 dark:text-[#f5f5f5]',
    neutral: 'bg-[#f0efed] text-[#4e4e4e] border-[#e7e5e4] dark:bg-[#292524] dark:text-[#a8a29e]',
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col justify-between transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            {title}
          </span>
          <div className="mt-2.5">
            <span className="font-editorial text-4xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              {value}
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#292524] dark:text-[#f5f5f5] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Progress bar if present */}
      {typeof progress === 'number' && (
        <div className="mt-4">
          <div className="w-full h-1 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
            <div
              className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Trend indicator & Subtitle */}
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#e7e5e4]/60 dark:border-[#2e2a27]">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
                trendStyles[trendType]
              )}
            >
              {trendType === 'positive' && <TrendingUp className="w-3 h-3" />}
              {trendType === 'negative' && <TrendingDown className="w-3 h-3" />}
              {trendType === 'warning' && <AlertCircle className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-[#777169] dark:text-[#a8a29e] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
