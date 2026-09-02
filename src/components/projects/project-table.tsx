'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import {
  getPriorityMeta,
  getProjectStatusMeta,
  formatDate,
} from '@/lib/utils';
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  Trash2,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export function ProjectTable({ projects, onEdit }: ProjectTableProps) {
  const { tasks, deleteProject, archiveProject, addProject } = useStore();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleDuplicate = (project: Project) => {
    addProject({
      name: `${project.name} (Copia)`,
      description: project.description,
      clientOrArea: project.clientOrArea,
      managerId: project.manager.id,
      teamIds: project.team.map((t) => t.id),
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
      status: 'planificacion',
    });
    setActiveMenuId(null);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Proyecto</th>
              <th className="py-3.5 px-4">Responsable</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Progreso</th>
              <th className="py-3.5 px-4">Prioridad</th>
              <th className="py-3.5 px-4">Fecha límite</th>
              <th className="py-3.5 px-4">Tareas</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {projects.map((project) => {
              const priorityMeta = getPriorityMeta(project.priority);
              const statusMeta = getProjectStatusMeta(project.status);
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const isMenuOpen = activeMenuId === project.id;

              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Proyecto */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/proyectos/${project.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {project.name}
                      </Link>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {project.clientOrArea}
                      </span>
                    </div>
                  </td>

                  {/* Responsable */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={project.manager.avatar}
                        name={project.manager.name}
                        size="xs"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {project.manager.name}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                  </td>

                  {/* Progreso */}
                  <td className="py-3.5 px-4 w-36">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Prioridad */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityMeta.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                      {priorityMeta.label}
                    </span>
                  </td>

                  {/* Fecha límite */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {formatDate(project.dueDate)}
                  </td>

                  {/* Tareas */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                    {projectTasks.length}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(isMenuOpen ? null : project.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Opciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="absolute right-4 top-10 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <Link
                          href={`/proyectos/${project.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver proyecto
                        </Link>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDuplicate(project)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            archiveProject(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archivar
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            deleteProject(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive List: Adapted as requested by prompt items 18, 41, 42 */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {projects.map((project) => {
          const priorityMeta = getPriorityMeta(project.priority);
          const statusMeta = getProjectStatusMeta(project.status);
          const projectTasks = tasks.filter((t) => t.projectId === project.id);

          return (
            <div key={project.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/proyectos/${project.id}`}
                    className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">{project.clientOrArea}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta.bg}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={project.manager.avatar}
                    name={project.manager.name}
                    size="xs"
                  />
                  <span>{project.manager.name}</span>
                </div>
                <span>{formatDate(project.dueDate)}</span>
              </div>

              {/* Progress */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Avance</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {project.progress}% ({projectTasks.length} tareas)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => onEdit(project)}
                  className="px-2.5 py-1 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Editar
                </button>
                <Link
                  href={`/proyectos/${project.id}`}
                  className="px-2.5 py-1 rounded text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                >
                  Ver detalles →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
