'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Search, X, LayoutGrid, Rows3 } from 'lucide-react';
import { Project, ProjectFiltersState, User } from '@/lib/types';
import { Segmented } from '@/components/ui/segmented';
import { PillSelect } from '@/components/ui/input';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** iOS search field: filled capsule, clear button appears once there is text. */
export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-3" strokeWidth={2.2} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-[12px] bg-fill-2 pr-9 pl-9 text-[14px] text-ink outline-none transition-shadow duration-200 placeholder:text-ink-3 focus:shadow-[0_0_0_4px_var(--accent-soft)] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-3 text-canvas"
        >
          <X className="h-3 w-3" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

const statusChips: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'planificacion', label: 'Planificación' },
  { value: 'en_pausa', label: 'En pausa' },
  { value: 'completado', label: 'Completados' },
  { value: 'archivado', label: 'Archivados' },
];

export function ProjectFilters({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  users,
  projects,
}: {
  filters: ProjectFiltersState;
  onFilterChange: (filters: ProjectFiltersState) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  users: User[];
  projects: Project[];
}) {
  const managers = users.filter((u) => projects.some((p) => p.manager.id === u.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchField
          value={filters.search}
          onChange={(search) => onFilterChange({ ...filters, search })}
          placeholder="Buscar por nombre o área"
          className="flex-1"
        />
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <PillSelect label="Prioridad" value={filters.priority} onChange={(priority) => onFilterChange({ ...filters, priority })}>
            <option value="">Cualquier prioridad</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </PillSelect>
          <PillSelect label="Responsable" value={filters.managerId} onChange={(managerId) => onFilterChange({ ...filters, managerId })}>
            <option value="">Cualquier responsable</option>
            {managers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </PillSelect>
          <Segmented
            label="Vista"
            value={viewMode}
            onChange={onViewModeChange}
            options={[
              { value: 'grid', label: '', icon: LayoutGrid, ariaLabel: 'Tarjetas' },
              { value: 'table', label: '', icon: Rows3, ariaLabel: 'Lista' },
            ]}
          />
        </div>
      </div>

      <div role="radiogroup" aria-label="Estado" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {statusChips.map((chip) => {
          const selected = filters.status === chip.value;
          const count = chip.value ? projects.filter((p) => p.status === chip.value).length : projects.length;
          return (
            <button
              key={chip.value || 'all'}
              role="radio"
              aria-checked={selected}
              onClick={() => onFilterChange({ ...filters, status: chip.value })}
              className={cn(
                'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors',
                selected ? 'text-white' : 'text-ink-2 hover:bg-fill-2 hover:text-ink'
              )}
            >
              {selected && <motion.span layoutId="project-status-chip" transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
              <span className={cn('relative', selected && 'text-canvas')}>{chip.label}</span>
              <span className={cn('tabular relative text-[12px]', selected ? 'text-canvas/60' : 'text-ink-3')}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
