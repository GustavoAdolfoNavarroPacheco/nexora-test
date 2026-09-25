'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { spring } from '@/lib/motion';
import { useMediaQuery } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

/** Reads `<option value>label</option>` children so call sites keep plain option markup. */
export function optionsFromChildren(children: React.ReactNode): DropdownOption[] {
  const out: DropdownOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ value?: string; children?: React.ReactNode }>(child)) return;
    if (child.type === React.Fragment) {
      out.push(...optionsFromChildren(child.props.children));
      return;
    }
    const label = React.Children.toArray(child.props.children).join('');
    out.push({ value: String(child.props.value ?? label), label });
  });
  return out;
}

/** Mouse or trackpad. Touch screens (iPhone, iPad, Android) keep the native picker. */
export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label: string;
  id?: string;
  /** Classes shared by the desktop button and the native select, so both look identical. */
  triggerClassName: string;
  /** Rendered after the value (usually the chevrons). */
  adornment?: React.ReactNode;
  className?: string;
  align?: 'start' | 'end';
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

interface Placement {
  top?: number;
  bottom?: number;
  left: number;
  minWidth: number;
  maxHeight: number;
  up: boolean;
}

const GAP = 6;
const MAX_HEIGHT = 320;

export function Dropdown({
  value,
  onChange,
  options,
  label,
  id,
  triggerClassName,
  adornment,
  className,
  align = 'start',
  invalid,
  describedBy,
  disabled,
}: DropdownProps) {
  const fine = useFinePointer();
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const typeahead = useRef({ text: '', at: 0 });

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const selected = options.find((o) => o.value === value);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - GAP - 12;
    const above = r.top - GAP - 12;
    const up = below < 200 && above > below;
    const width = Math.max(r.width, 180);
    const left = align === 'end' ? Math.max(8, r.right - width) : Math.min(r.left, window.innerWidth - width - 8);
    setPlacement({
      left,
      minWidth: r.width,
      up,
      maxHeight: Math.min(MAX_HEIGHT, up ? above : below),
      ...(up ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
    });
  }, [align]);

  const openList = () => {
    if (disabled) return;
    place();
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    if (option.value !== value) onChange(option.value);
    close();
  };

  // Focus the list once it exists and keep the highlighted option in view.
  useLayoutEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  // Close on outside press, resize, or when anything other than the list scrolls.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (listRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close(false);
    };
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return;
      close(false);
    };
    const onResize = () => close(false);
    document.addEventListener('pointerdown', onPointer, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      case 'Escape':
        // Keep the Escape inside the menu so an enclosing sheet stays open.
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case 'Tab':
        e.preventDefault();
        close();
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const now = Date.now();
          const buffer = now - typeahead.current.at < 600 ? typeahead.current.text + e.key : e.key;
          typeahead.current = { text: buffer, at: now };
          const q = buffer.toLowerCase();
          const match = options.findIndex((o) => o.label.toLowerCase().startsWith(q));
          if (match >= 0) setActive(match);
        }
    }
  };

  // Touch devices (and the first server render): the platform's own picker.
  if (!fine) {
    return (
      <span className={cn('relative inline-flex items-center', className)}>
        <select
          id={id}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('appearance-none', triggerClassName)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {adornment}
      </span>
    );
  }

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKey}
        className={cn('text-left', triggerClassName)}
      >
        <span className="block truncate">{selected?.label ?? ''}</span>
      </button>
      {adornment}

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && placement && (
              <motion.div
                ref={listRef}
                id={listId}
                role="listbox"
                tabIndex={-1}
                aria-label={label}
                aria-activedescendant={`${listId}-${active}`}
                onKeyDown={onListKey}
                data-lenis-prevent
                initial={{ opacity: 0, scale: 0.96, y: placement.up ? 6 : -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                transition={spring}
                style={{
                  position: 'fixed',
                  top: placement.top,
                  bottom: placement.bottom,
                  left: placement.left,
                  minWidth: placement.minWidth,
                  maxHeight: placement.maxHeight,
                  transformOrigin: placement.up ? 'bottom center' : 'top center',
                }}
                className="glass z-[95] max-w-[340px] overflow-y-auto overscroll-contain rounded-[12px] bg-elevated p-1 shadow-pop outline-none"
              >
                {options.map((o, i) => {
                  const isSelected = o.value === value;
                  const isActive = i === active;
                  return (
                    <div
                      key={o.value}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={isSelected}
                      data-index={i}
                      onPointerMove={() => active !== i && setActive(i)}
                      onClick={() => choose(i)}
                      className={cn(
                        'flex cursor-default items-center gap-2 rounded-[7px] py-[6px] pr-3 pl-2 text-[13px] leading-snug select-none',
                        isActive ? 'bg-accent text-white' : 'text-ink'
                      )}
                    >
                      <Check
                        aria-hidden
                        strokeWidth={2.6}
                        className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0', isActive ? 'text-white' : 'text-accent-ink')}
                      />
                      <span className="truncate">{o.label}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}
