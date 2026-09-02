import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'mint' | 'peach' | 'lavender' | 'sky' | 'rose' | 'outline';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'bg-[#f0efed] text-[#292524] border-transparent dark:bg-[#292524] dark:text-[#f5f5f5]',
    mint:
      'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/70 dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]',
    peach:
      'bg-[#f4c5a8]/35 text-[#0c0a09] border-[#f4c5a8]/70 dark:bg-[#f4c5a8]/20 dark:text-[#f5f5f5]',
    lavender:
      'bg-[#c8b8e0]/35 text-[#0c0a09] border-[#c8b8e0]/70 dark:bg-[#c8b8e0]/20 dark:text-[#f5f5f5]',
    sky:
      'bg-[#a8c8e8]/30 text-[#0c0a09] border-[#a8c8e8]/60 dark:bg-[#a8c8e8]/20 dark:text-[#f5f5f5]',
    rose:
      'bg-[#e8b8c4]/30 text-[#0c0a09] border-[#e8b8c4]/60 dark:bg-[#e8b8c4]/20 dark:text-[#f5f5f5]',
    outline:
      'bg-transparent text-[#4e4e4e] border-[#e7e5e4] dark:text-[#a8a29e] dark:border-[#44403c]',
  };

  const dotColors = {
    default: 'bg-[#777169]',
    mint: 'bg-[#a7e5d3]',
    peach: 'bg-[#f4c5a8]',
    lavender: 'bg-[#c8b8e0]',
    sky: 'bg-[#a8c8e8]',
    rose: 'bg-[#e8b8c4]',
    outline: 'bg-[#a8a29e]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors select-none tracking-normal',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
