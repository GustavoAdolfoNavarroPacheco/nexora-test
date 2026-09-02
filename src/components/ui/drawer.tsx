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
        className="fixed inset-0 bg-[#0c0a09]/45 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={cn('fixed inset-y-0 flex max-w-full', position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10')}>
        <div
          ref={drawerRef}
          className={cn(
            'w-screen bg-white dark:bg-[#1c1917] border-l border-[#e7e5e4] dark:border-[#2e2a27] shadow-xl flex flex-col animate-in duration-200',
            position === 'right' ? 'slide-in-from-right' : 'slide-in-from-left',
            maxWidths[maxWidth]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
            <div>
              {title && (
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:hover:text-white dark:hover:bg-[#292524] transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
