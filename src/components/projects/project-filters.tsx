'use client';

import React from 'react';
import { Search, LayoutGrid, Table, X, Filter } from 'lucide-react';
import { ProjectFiltersState, User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectFiltersProps {
  filters: ProjectFiltersState;
  onFilterChange: (filters: ProjectFiltersState) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  users: User[];
  totalResults: number;
}

export function ProjectFilters({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  users,
  totalResults,
}: ProjectFiltersProps) {
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'en_pausa', label: 'En pausa' },
    { value: 'planificacion', label: 'Planificación' },
    { value: 'completado', label: 'Completado' },
    { value: 'archivado', label: 'Archivado' },
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
  ];

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    Boolean(filters.managerId);

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      priority: '',
      managerId: '',
    });
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por nombre de proyecto o cliente..."
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )}
              title="Vista de tabla"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Manager */}
        <select
          value={filters.managerId}
          onChange={(e) => onFilterChange({ ...filters, managerId: e.target.value })}
          className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[180px] truncate"
        >
          <option value="">Todos los responsables</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-8 inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}

        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
          {totalResults} {totalResults === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>
    </div>
  );
}
