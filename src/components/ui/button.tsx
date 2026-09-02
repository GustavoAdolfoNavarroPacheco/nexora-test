import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292524] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-[#292524] text-white hover:bg-[#1c1917] active:bg-[#0c0a09] dark:bg-[#f5f5f5] dark:text-[#0c0a09] dark:hover:bg-[#e7e5e4] shadow-xs',
      secondary:
        'border border-[#e7e5e4] bg-transparent text-[#292524] hover:bg-[#f0efed] active:bg-[#e7e5e4] dark:border-[#44403c] dark:text-[#f5f5f5] dark:hover:bg-[#292524]',
      outline:
        'border border-[#d6d3d1] bg-white text-[#292524] hover:bg-[#fafafa] dark:bg-[#1c1917] dark:border-[#44403c] dark:text-[#f5f5f5] dark:hover:bg-[#292524]',
      ghost:
        'bg-transparent text-[#292524] hover:bg-[#f0efed] dark:text-[#f5f5f5] dark:hover:bg-[#292524]',
      danger:
        'bg-[#0c0a09] text-white hover:bg-[#1c1917] border border-[#e8b8c4]/40 dark:bg-[#292524]',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-5 text-[15px] gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
