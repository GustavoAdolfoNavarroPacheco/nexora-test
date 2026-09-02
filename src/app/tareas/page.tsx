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
  Filter,
  Kanban,
  LayoutList,
  CheckCircle2,
  Calendar,
  FolderKanban,
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

  // Filter tasks
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Tareas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {tasks.length} totales
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organiza, prioriza y ejecuta las actividades diarias del equipo en todos los proyectos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateTaskOpen(true)}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Filters & View Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas por título..."
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Filter select tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="en_revision">En revisión</option>
            <option value="completada">Completada</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[180px] truncate"
          >
            <option value="">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[160px] truncate"
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
              className="h-8 inline-flex items-center gap-1 px-2.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 transition-colors ml-auto"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}

          <span className="text-xs text-slate-400 ml-auto">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>
      </div>

      {/* Task Content */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No se encontraron tareas
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajusta los filtros o crea una nueva tarea para comenzar a colaborar.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
            Limpiar filtros
          </Button>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={filteredTasks} projectId="global" />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredTasks.map((task) => {
            const pMeta = getPriorityMeta(task.priority);
            const sMeta = getTaskStatusMeta(task.status);

            return (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="shrink-0 transition-transform active:scale-90"
                    title={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-colors" />
                    )}
                  </button>

                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <h3
                      className={cn(
                        'text-sm font-semibold truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
                        task.completed && 'line-through text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
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
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sMeta.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sMeta.dot}`} />
                    {sMeta.label}
                  </span>

                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pMeta.bg}`}
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
