'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Check, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <div className="w-5 h-5 rounded-full bg-[#a7e5d3]/40 text-[#0c0a09] flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></div>,
    warning: <div className="w-5 h-5 rounded-full bg-[#f4c5a8]/40 text-[#0c0a09] flex items-center justify-center shrink-0"><AlertTriangle className="w-3 h-3" /></div>,
    error: <div className="w-5 h-5 rounded-full bg-[#e8b8c4]/40 text-[#0c0a09] flex items-center justify-center shrink-0"><AlertCircle className="w-3 h-3" /></div>,
    info: <div className="w-5 h-5 rounded-full bg-[#a8c8e8]/40 text-[#0c0a09] flex items-center justify-center shrink-0"><Info className="w-3 h-3" /></div>,
  };

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const type = toast.type || 'info';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-[#1c1917] shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-150 border-[#e7e5e4] dark:border-[#2e2a27]'
            )}
            role="alert"
          >
            {icons[type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-[#a8a29e] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:hover:text-white"
              aria-label="Cerrar notificación"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
