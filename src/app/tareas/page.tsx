'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { KanbanBoard } from '@/components/projects/kanban-board';
import {
  getPriorityMeta,
  getTaskStatusMeta,
  formatDate,
  cn,
  normalizeText,
} from '@/lib/utils';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  LayoutList,
  Check,
  Calendar,
  X,
} from 'lucide-react';

export default function TareasPage() {
  const {
    tasks,
    projects,
    users,
    toggleTaskComplete,
    setSelectedTaskId,
    setIsCreateTaskOpen,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const filteredTasks = tasks.filter((t) => {
    if (search && !normalizeText(t.title).includes(normalizeText(search))) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (projectFilter && t.projectId !== projectFilter) return false;
    if (assigneeFilter && t.assignee.id !== assigneeFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
    setAssigneeFilter('');
  };

  const hasActiveFilters = Boolean(
    search || statusFilter || priorityFilter || projectFilter || assigneeFilter
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#e7e5e4]/80 dark:border-[#2e2a27]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-4xl sm:text-5xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
              Tareas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0efed] text-[#777169] dark:bg-[#292524] dark:text-[#a8a29e]">
              {tasks.length}
            </span>
          </div>
          <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
            Organiza, prioriza y ejecuta las actividades diarias del equipo en todos los proyectos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas por título..."
              className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524] self-end lg:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                  : 'text-[#777169] hover:text-[#0c0a09]'
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                viewMode === 'kanban'
                  ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                  : 'text-[#777169] hover:text-[#0c0a09]'
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Filter select tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="en_revision">En revisión</option>
            <option value="completada">Completada</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer max-w-[180px] truncate"
          >
            <option value="">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer max-w-[160px] truncate"
          >
            <option value="">Todos los asignados</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

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
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>
      </div>

      {/* Task Content */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-3">
          <CheckSquare className="w-10 h-10 text-[#a8a29e] mx-auto" />
          <h3 className="text-base font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
            No se encontraron tareas
          </h3>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e] max-w-sm mx-auto">
            Ajusta los filtros o crea una nueva tarea para comenzar a colaborar.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-2">
            Limpiar filtros
          </Button>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={filteredTasks} projectId="global" />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] divide-y divide-[#e7e5e4] dark:divide-[#2e2a27] overflow-hidden">
          {filteredTasks.map((task) => {
            const pMeta = getPriorityMeta(task.priority);
            const sMeta = getTaskStatusMeta(task.status);

            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fafafa] dark:hover:bg-[#292524]/30 transition-colors"
              >
                {/* Checkbox & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="shrink-0 cursor-pointer"
                    title={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
                  >
                    {task.completed ? (
                      <div className="w-4 h-4 rounded bg-[#0c0a09] dark:bg-[#f5f5f5] text-white dark:text-[#0c0a09] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-[#d6d3d1] hover:border-[#0c0a09] dark:border-[#44403c] transition-colors" />
                    )}
                  </button>

                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <h3
                      className={cn(
                        'text-sm font-medium truncate group-hover:underline',
                        task.completed
                          ? 'line-through text-[#a8a29e]'
                          : 'text-[#0c0a09] dark:text-[#f5f5f5]'
                      )}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#777169] dark:text-[#a8a29e]">
                      <span className="font-normal truncate max-w-[200px]">
                        {task.projectName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Assignee */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sMeta.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sMeta.dot}`} />
                    {sMeta.label}
                  </span>

                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${pMeta.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pMeta.dot}`} />
                    {pMeta.label}
                  </span>

                  <Avatar
                    src={task.assignee.avatar}
                    name={task.assignee.name}
                    size="sm"
                    status={task.assignee.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
