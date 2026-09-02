'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
  Clock,
  Edit2,
  Plus,
  LayoutList,
  Kanban,
  Check,
  FolderKanban,
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
        <FolderKanban className="w-12 h-12 text-[#a8a29e] mx-auto" />
        <h2 className="font-editorial text-3xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
          Proyecto no encontrado
        </h2>
        <p className="text-sm text-[#777169] max-w-sm mx-auto">
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

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed);
  const pendingTasks = projectTasks.filter((t) => !t.completed);
  const overdueTasks = projectTasks.filter(
    (t) => !t.completed && new Date(t.dueDate) < new Date('2026-09-02')
  );

  const filteredProjectTasks = projectTasks.filter((t) =>
    taskSearch ? t.title.toLowerCase().includes(taskSearch.toLowerCase()) : true
  );

  const projectActivities = activities.filter(
    (a) => a.projectId === project.id || a.entity === project.name
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back Link */}
      <div>
        <Link
          href="/proyectos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a proyectos
        </Link>
      </div>

      {/* Project Header Banner Card */}
      <div className="p-8 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-medium px-3 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                {project.clientOrArea}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium border ${statusMeta.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium border ${priorityMeta.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                {priorityMeta.label}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
              {project.name}
            </h1>
            <p className="text-sm text-[#777169] dark:text-[#a8a29e] max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Editar
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
        <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-[#e7e5e4] dark:border-[#2e2a27] text-xs text-[#777169] dark:text-[#a8a29e]">
          <div className="flex items-center gap-2">
            <span className="text-[#a8a29e]">Responsable:</span>
            <Avatar
              src={project.manager.avatar}
              name={project.manager.name}
              size="xs"
            />
            <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
              {project.manager.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#a8a29e]" />
            <span>Inicio: {formatDate(project.startDate)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#a8a29e]" />
            <span>Fecha límite: {formatDate(project.dueDate)}</span>
          </div>

          <div className="flex-1 min-w-[200px] flex items-center gap-3 ml-auto">
            <span className="text-xs font-medium whitespace-nowrap text-[#0c0a09] dark:text-[#f5f5f5]">
              {project.progress}% completado
            </span>
            <div className="flex-1 h-1 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
              <div
                className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#e7e5e4] dark:border-[#2e2a27] flex items-center justify-between gap-4 overflow-x-auto">
        <nav className="flex items-center gap-4">
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
                'py-3 text-sm font-medium border-b-2 transition-all select-none whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'border-[#0c0a09] text-[#0c0a09] dark:border-[#f5f5f5] dark:text-[#f5f5f5]'
                  : 'border-transparent text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'tareas' && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex items-center p-1 rounded-full bg-[#f0efed] dark:bg-[#292524]">
              <button
                onClick={() => setTaskViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                  taskViewMode === 'kanban'
                    ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                    : 'text-[#777169]'
                )}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setTaskViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                  taskViewMode === 'list'
                    ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                    : 'text-[#777169]'
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
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
              <span className="text-[12px] text-[#777169] dark:text-[#a8a29e] font-medium uppercase tracking-wider">
                Tareas completadas
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  {completedTasks.length}
                </span>
                <span className="text-xs text-[#777169]">
                  de {projectTasks.length} totales
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
              <span className="text-[12px] text-[#777169] dark:text-[#a8a29e] font-medium uppercase tracking-wider">
                Tareas pendientes
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  {pendingTasks.length}
                </span>
                <span className="text-xs text-[#777169]">en curso</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
              <span className="text-[12px] text-[#777169] dark:text-[#a8a29e] font-medium uppercase tracking-wider">
                Tareas vencidas
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  {overdueTasks.length}
                </span>
                <span className="text-xs text-[#777169]">atención</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
              <span className="text-[12px] text-[#777169] dark:text-[#a8a29e] font-medium uppercase tracking-wider">
                Miembros asignados
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-editorial text-3xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  {project.team.length}
                </span>
                <span className="text-xs text-[#777169]">personas</span>
              </div>
            </div>
          </div>

          {/* Milestones & Team Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <ProjectMilestones
                milestones={project.milestones}
                projectId={project.id}
              />
            </div>

            <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-4">
              <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight pb-3 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
                Equipo asignado
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
                        <p className="font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-[#777169] dark:text-[#a8a29e]">{member.role}</p>
                      </div>
                    </div>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169]">
                      {projectTasks.filter((t) => t.assignee.id === member.id).length} tareas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tareas */}
      {activeTab === 'tareas' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Buscar en tareas del proyecto..."
              className="max-w-xs w-full h-10 px-4 text-xs bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-lg text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#292524]"
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
            <div className="rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] divide-y divide-[#e7e5e4] dark:divide-[#2e2a27] overflow-hidden">
              {filteredProjectTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a8a29e]">
                  No hay tareas registradas con los filtros actuales.
                </div>
              ) : (
                filteredProjectTasks.map((task) => {
                  const pMeta = getPriorityMeta(task.priority);
                  const sMeta = getTaskStatusMeta(task.status);

                  return (
                    <div
                      key={task.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[#fafafa] dark:hover:bg-[#292524]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="shrink-0 cursor-pointer"
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
                          <h4
                            className={cn(
                              'text-xs font-medium truncate group-hover:underline',
                              task.completed && 'line-through text-[#a8a29e]'
                            )}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[11px] text-[#a8a29e]">
                            Entrega: {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${sMeta.bg}`}
                        >
                          {sMeta.label}
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${pMeta.bg}`}
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
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-5">
          <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight pb-3 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
            Registro cronológico del proyecto
          </h3>

          <div className="space-y-4">
            {projectActivities.length === 0 ? (
              <p className="text-xs text-[#a8a29e] italic">
                Aún no hay registros de actividad específicos para este proyecto.
              </p>
            ) : (
              projectActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <Avatar src={act.user.avatar} name={act.user.name} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#4e4e4e] dark:text-[#d6d3d1]">
                      <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
                        {act.user.name}
                      </span>{' '}
                      {act.action}{' '}
                      <span className="font-medium">&ldquo;{act.entity}&rdquo;</span>
                    </p>
                    <span className="text-[11px] text-[#a8a29e] mt-0.5 block">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {project.team.map((member) => (
            <div
              key={member.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-4"
            >
              <div className="flex items-start justify-between">
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  size="md"
                  status={member.status}
                />
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium capitalize bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                  {member.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {member.name}
                </h4>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e]">{member.role}</p>
                <p className="text-[11px] text-[#a8a29e] mt-0.5">{member.department}</p>
              </div>

              <div className="pt-3 border-t border-[#e7e5e4] dark:border-[#2e2a27] text-xs flex justify-between text-[#777169]">
                <span>Tareas asignadas:</span>
                <span className="font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  {projectTasks.filter((t) => t.assignee.id === member.id).length}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
