import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { Dropdown, optionsFromChildren } from './dropdown';

const fieldBase =
  'w-full rounded-[12px] bg-fill text-[14px] text-ink placeholder:text-ink-3 shadow-[inset_0_0_0_1px_var(--line)] ' +
  'transition-[box-shadow,background-color] duration-200 ease-apple outline-none ' +
  'hover:bg-fill-2 focus:bg-card focus:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-soft)] ' +
  'disabled:opacity-50 disabled:hover:bg-fill';

const errorRing =
  'shadow-[inset_0_0_0_1px_var(--red)] focus:shadow-[inset_0_0_0_1px_var(--red),0_0_0_4px_var(--red-soft)]';

function FieldShell({
  id,
  label,
  error,
  helperText,
  required,
  children,
}: {
  id: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block pl-1 text-[12px] font-medium text-ink-2">
          {label}
          {required && <span className="ml-0.5 text-red">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="pl-1 text-[12px] text-red-ink">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-msg`} className="pl-1 text-[12px] text-ink-3">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <FieldShell id={inputId} label={label} error={error} helperText={helperText} required={props.required}>
        <div className="relative flex items-center">
          {leftIcon && <span className="pointer-events-none absolute left-3.5 text-ink-3">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helperText ? `${inputId}-msg` : undefined}
            className={cn(fieldBase, 'h-11 px-3.5', leftIcon && 'pl-10', rightIcon && 'pr-10', error && errorRing, className)}
            {...props}
          />
          {rightIcon && <span className="absolute right-3.5 text-ink-3">{rightIcon}</span>}
        </div>
      </FieldShell>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <FieldShell id={inputId} label={label} error={error} helperText={helperText} required={props.required}>
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(fieldBase, 'resize-none px-3.5 py-3 leading-relaxed', error && errorRing, className)}
          {...props}
        />
      </FieldShell>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const openRing = 'aria-expanded:bg-card aria-expanded:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-soft)]';

/** Form select: a macOS popup menu with a mouse, the native picker on touch screens. */
export function Select({ className, label, error, helperText, id, children, value, onValueChange, required, disabled }: SelectProps) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <FieldShell id={selectId} label={label} error={error} helperText={helperText} required={required}>
      <Dropdown
        id={selectId}
        label={label ?? ''}
        value={value}
        onChange={onValueChange}
        options={optionsFromChildren(children)}
        invalid={Boolean(error)}
        describedBy={error || helperText ? `${selectId}-msg` : undefined}
        disabled={disabled}
        className="flex w-full"
        triggerClassName={cn(fieldBase, openRing, 'h-11 pr-10 pl-3.5', error && errorRing, className)}
        adornment={<Chevrons className="pointer-events-none absolute right-3.5 text-ink-3" />}
      />
    </FieldShell>
  );
}

/** macOS popup-button double chevron. */
export function Chevrons({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 16" className={cn('h-3.5 w-2.5', className)} aria-hidden>
      <path d="M2 6l3-3 3 3M2 10l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compact pill-shaped select for toolbars; tinted while a filter is applied. */
export function PillSelect({
  value,
  onChange,
  children,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Dropdown
      label={label}
      value={value}
      onChange={onChange}
      options={optionsFromChildren(children)}
      className={cn('shrink-0', className)}
      triggerClassName={cn(
        'h-9 max-w-[220px] truncate rounded-full pr-8 pl-3.5 text-[13px] font-medium outline-none transition-colors',
        value
          ? 'bg-accent-soft text-accent-ink'
          : 'bg-fill-2 text-ink hover:bg-[color-mix(in_srgb,var(--fill-2)_100%,var(--ink)_6%)] aria-expanded:bg-[color-mix(in_srgb,var(--fill-2)_100%,var(--ink)_6%)]'
      )}
      adornment={<Chevrons className={cn('pointer-events-none absolute right-3', value ? 'text-accent-ink' : 'text-ink-3')} />}
    />
  );
}
