'use client';

import React, { useState } from 'react';
import { cn, getMemberStatusMeta } from '@/lib/utils';
import { MemberStatus, User } from '@/lib/types';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: MemberStatus;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

const statusSizes = {
  xs: 'h-2 w-2 ring-[1.5px]',
  sm: 'h-2.5 w-2.5 ring-2',
  md: 'h-3 w-3 ring-2',
  lg: 'h-3.5 w-3.5 ring-[2.5px]',
  xl: 'h-4 w-4 ring-[3px]',
};

const statusColor: Record<MemberStatus, string> = {
  disponible: 'bg-green animate-breathe',
  ocupado: 'bg-orange',
  ausente: 'bg-gray',
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)).toUpperCase();
}

export function Avatar({ src, name, size = 'md', status, className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-fill-2 font-medium text-ink-2',
          'shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)]',
          sizes[size]
        )}
      >
        {src && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{initials(name)}</span>
        )}
      </div>
      <span className="sr-only">{name}</span>
      {status && (
        <span
          className={cn('absolute right-0 bottom-0 rounded-full ring-card', statusSizes[size], statusColor[status])}
          title={getMemberStatusMeta(status).label}
        />
      )}
    </div>
  );
}

export function AvatarStack({
  users,
  max = 4,
  size = 'xs',
  className,
}: {
  users: User[];
  max?: number;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((u, i) => (
        <Avatar
          key={u.id}
          src={u.avatar}
          name={u.name}
          size={size}
          className={cn('rounded-full ring-2 ring-card', i > 0 && (size === 'xs' ? '-ml-1.5' : '-ml-2'))}
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            '-ml-1.5 flex items-center justify-center rounded-full bg-fill-2 font-medium text-ink-2 ring-2 ring-card',
            size === 'xs' ? 'h-6 min-w-6 px-1 text-[10px]' : 'h-8 min-w-8 px-1.5 text-[11px]'
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
