import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full h-10 pl-3 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent disabled:opacity-50 shadow-xs cursor-pointer',
              error
                ? 'border-red-500 text-red-900 dark:text-red-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
