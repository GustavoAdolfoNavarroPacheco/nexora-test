import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tinted' | 'plain' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
  secondary: 'bg-fill-2 text-ink hover:bg-[color-mix(in_srgb,var(--fill-2)_100%,var(--ink)_6%)]',
  tinted: 'bg-accent-soft text-accent-ink hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
  plain: 'bg-transparent text-accent-ink hover:bg-accent-soft',
  ghost: 'bg-transparent text-ink-2 hover:text-ink hover:bg-fill-2',
  danger: 'bg-red-soft text-red-ink hover:bg-[color-mix(in_srgb,var(--red)_20%,transparent)]',
  dark: 'bg-ink text-canvas hover:opacity-90',
};

const sizes = {
  sm: 'h-8 px-3.5 text-[13px] gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-[15px] gap-2.5',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-8 w-8 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium tracking-[-0.01em] whitespace-nowrap',
        'transition-[background-color,color,transform,opacity,box-shadow] duration-200 ease-apple active:scale-[0.96]',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="invisible inline-flex items-center gap-[inherit]">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = 'Button';
