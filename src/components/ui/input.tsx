import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]"
          >
            {label}
            {props.required && <span className="text-[#0c0a09] dark:text-white ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#a8a29e]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full h-11 px-4 text-sm bg-white dark:bg-[#1c1917] border rounded-lg transition-colors placeholder:text-[#a8a29e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#292524] dark:focus-visible:ring-[#f5f5f5] focus-visible:border-[#292524] disabled:opacity-40 disabled:bg-[#f0efed] shadow-none',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-[#e8b8c4] text-[#0c0a09] focus-visible:ring-[#e8b8c4]'
                : 'border-[#e7e5e4] dark:border-[#2e2a27] text-[#292524] dark:text-[#f5f5f5]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#a8a29e]">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
