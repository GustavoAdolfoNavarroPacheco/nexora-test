'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MemberStatus } from '@/lib/types';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: MemberStatus;
}

export function Avatar({ src, name, size = 'md', status, className, ...props }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str: string) => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const statusColors = {
    disponible: 'bg-emerald-500',
    ocupado: 'bg-amber-500',
    ausente: 'bg-slate-400',
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
          sizes[size]
        )}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900',
            statusSizes[size],
            statusColors[status]
          )}
          title={`Estado: ${status}`}
        />
      )}
    </div>
  );
}
