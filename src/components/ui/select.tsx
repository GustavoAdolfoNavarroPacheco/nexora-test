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
            className="block text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]"
          >
            {label}
            {props.required && <span className="text-[#0c0a09] dark:text-white ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full h-11 pl-4 pr-10 text-sm bg-white dark:bg-[#1c1917] border rounded-lg appearance-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#292524] dark:focus-visible:ring-[#f5f5f5] focus-visible:border-[#292524] disabled:opacity-40 cursor-pointer shadow-none',
              error
                ? 'border-[#e8b8c4] text-[#0c0a09]'
                : 'border-[#e7e5e4] dark:border-[#2e2a27] text-[#292524] dark:text-[#f5f5f5]',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-[#a8a29e]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-[#0c0a09] dark:text-[#e8b8c4] font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
