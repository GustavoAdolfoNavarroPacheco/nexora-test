'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const type = toast.type || 'info';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xl transition-all animate-in slide-in-from-bottom-2 duration-200 border-slate-200 dark:border-slate-800'
            )}
            role="alert"
          >
            {icons[type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
