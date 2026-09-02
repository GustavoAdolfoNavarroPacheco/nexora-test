'use client';

import React from 'react';
import { Search, LayoutGrid, Table, X } from 'lucide-react';
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
    <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input: 44px height, radius 8px */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por nombre de proyecto o área..."
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] dark:focus:ring-white text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#0c0a09] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switchers: pill */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="flex items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                  : 'text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e]'
              )}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                  : 'text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e]'
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
          className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer"
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
          className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer"
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
          className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer max-w-[180px] truncate"
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
            className="h-9 inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-medium text-[#0c0a09] bg-[#f0efed] hover:bg-[#e7e5e4] dark:bg-[#292524] dark:text-white transition-colors ml-auto cursor-pointer"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}

        <span className="text-xs text-[#777169] dark:text-[#a8a29e] ml-auto">
          {totalResults} {totalResults === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>
    </div>
  );
}
