'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard } from '@/components/projects/kanban-board';
import { ProjectMilestones } from '@/components/projects/project-milestones';
import { EditProjectModal } from '@/components/projects/edit-project-modal';
import {
  getPriorityMeta,
  getProjectStatusMeta,
  getTaskStatusMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  Edit2,
  Plus,
  Users,
  LayoutList,
  Kanban,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Activity,
  ListTodo,
} from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const {
    projects,
    tasks,
    activities,
    setIsCreateTaskOpen,
    toggleTaskComplete,
    setSelectedTaskId,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'actividad' | 'equipo'>('resumen');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Proyecto no encontrado
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          El proyecto solicitado no existe o fue archivado/eliminado.
        </p>
        <Link href="/proyectos">
          <Button variant="primary">Volver a proyectos</Button>
        </Link>
      </div>
    );
  }

  const priorityMeta = getPriorityMeta(project.priority);
  const statusMeta = getProjectStatusMeta(project.status);

  // Tasks for this project
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed);
  const pendingTasks = projectTasks.filter((t) => !t.completed);
  const overdueTasks = projectTasks.filter(
    (t) => !t.completed && new Date(t.dueDate) < new Date('2026-09-02')
  );

  const filteredProjectTasks = projectTasks.filter((t) =>
    taskSearch ? t.title.toLowerCase().includes(taskSearch.toLowerCase()) : true
  );

  // Project activities
  const projectActivities = activities.filter(
    (a) => a.projectId === project.id || a.entity === project.name
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Link */}
      <div>
        <Link
          href="/proyectos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al listado de proyectos
        </Link>
      </div>

      {/* Project Header Banner Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {project.clientOrArea}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityMeta.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                {priorityMeta.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Editar proyecto
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nueva tarea
            </Button>
          </div>
        </div>

        {/* Sub-meta Info Strip */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Responsable:</span>
            <Avatar
              src={project.manager.avatar}
              name={project.manager.name}
              size="xs"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {project.manager.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Inicio: {formatDate(project.startDate)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Fecha límite: {formatDate(project.dueDate)}</span>
          </div>

          <div className="flex-1 min-w-[200px] flex items-center gap-3 ml-auto">
            <span className="text-xs font-semibold whitespace-nowrap">
              {project.progress}% completado
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
        <nav className="flex items-center gap-2">
          {(
            [
              { id: 'resumen', label: 'Resumen' },
              { id: 'tareas', label: `Tareas (${projectTasks.length})` },
              { id: 'actividad', label: 'Actividad' },
              { id: 'equipo', label: `Equipo (${project.team.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all select-none whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'tareas' && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTaskViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                  taskViewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setTaskViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                  taskViewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Resumen */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Tareas completadas
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {completedTasks.length}
                </span>
                <span className="text-xs text-emerald-600">
                  de {projectTasks.length} totales
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Tareas pendientes
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {pendingTasks.length}
                </span>
                <span className="text-xs text-blue-600">en desarrollo</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Tareas vencidas
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {overdueTasks.length}
                </span>
                <span className="text-xs text-amber-600">atención requerida</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Miembros asignados
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {project.team.length}
                </span>
                <span className="text-xs text-slate-400">colaboradores</span>
              </div>
            </div>
          </div>

          {/* Strategic Milestones & Team preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <ProjectMilestones
                milestones={project.milestones}
                projectId={project.id}
              />
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800">
                Equipo del proyecto
              </h3>

              <div className="space-y-3">
                {project.team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="xs"
                        status={member.status}
                      />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {projectTasks.filter((t) => t.assignee.id === member.id).length} tareas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tareas (Kanban o Lista) */}
      {activeTab === 'tareas' && (
        <div className="space-y-4">
          {/* Quick search inside tasks */}
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Buscar en tareas del proyecto..."
              className="max-w-xs w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nueva tarea
            </Button>
          </div>

          {taskViewMode === 'kanban' ? (
            <KanbanBoard tasks={filteredProjectTasks} projectId={project.id} />
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjectTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No hay tareas registradas con los filtros actuales.
                </div>
              ) : (
                filteredProjectTasks.map((task) => {
                  const pMeta = getPriorityMeta(task.priority);
                  const sMeta = getTaskStatusMeta(task.status);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                          ) : (
                            <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600" />
                          )}
                        </button>

                        <div
                          onClick={() => setSelectedTaskId(task.id)}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <h4
                            className={cn(
                              'text-xs font-semibold truncate',
                              task.completed && 'line-through text-slate-400'
                            )}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Entrega: {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${sMeta.bg}`}
                        >
                          {sMeta.label}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${pMeta.bg}`}
                        >
                          {pMeta.label}
                        </span>

                        <Avatar
                          src={task.assignee.avatar}
                          name={task.assignee.name}
                          size="xs"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Actividad */}
      {activeTab === 'actividad' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800">
            Registro cronológico del proyecto
          </h3>

          <div className="space-y-4">
            {projectActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Aún no hay registros de actividad específicos para este proyecto.
              </p>
            ) : (
              projectActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <Avatar src={act.user.avatar} name={act.user.name} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.user.name}
                      </span>{' '}
                      {act.action}{' '}
                      <span className="font-semibold">&ldquo;{act.entity}&rdquo;</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {act.timeAgo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Equipo */}
      {activeTab === 'equipo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.team.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  size="md"
                  status={member.status}
                />
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {member.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {member.name}
                </h4>
                <p className="text-xs text-slate-400">{member.role}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{member.department}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between text-slate-500">
                <span>Tareas asignadas en proyecto:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {projectTasks.filter((t) => t.assignee.id === member.id).length}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
