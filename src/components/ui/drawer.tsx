'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  maxWidth = 'lg',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={cn('fixed inset-y-0 flex max-w-full', position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10')}>
        <div
          ref={drawerRef}
          className={cn(
            'w-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in duration-300',
            position === 'right' ? 'slide-in-from-right' : 'slide-in-from-left',
            maxWidths[maxWidth]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
