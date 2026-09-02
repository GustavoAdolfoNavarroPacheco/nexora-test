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
    <div className="rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e7e5e4] dark:border-[#2e2a27] bg-[#fafafa] dark:bg-[#292524]/60 text-[#777169] dark:text-[#a8a29e] font-medium uppercase tracking-wider text-[11px]">
              <th className="py-4 px-5">Proyecto</th>
              <th className="py-4 px-5">Responsable</th>
              <th className="py-4 px-5">Estado</th>
              <th className="py-4 px-5">Progreso</th>
              <th className="py-4 px-5">Prioridad</th>
              <th className="py-4 px-5">Fecha límite</th>
              <th className="py-4 px-5">Tareas</th>
              <th className="py-4 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27]">
            {projects.map((project) => {
              const priorityMeta = getPriorityMeta(project.priority);
              const statusMeta = getProjectStatusMeta(project.status);
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const isMenuOpen = activeMenuId === project.id;

              return (
                <tr
                  key={project.id}
                  className="hover:bg-[#fafafa] dark:hover:bg-[#292524]/30 transition-colors"
                >
                  {/* Proyecto */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <Link
                        href={`/proyectos/${project.id}`}
                        className="font-medium text-[#0c0a09] dark:text-[#f5f5f5] hover:underline transition-colors line-clamp-1 text-sm"
                      >
                        {project.name}
                      </Link>
                      <span className="text-[11px] text-[#a8a29e]">
                        {project.clientOrArea}
                      </span>
                    </div>
                  </td>

                  {/* Responsable */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={project.manager.avatar}
                        name={project.manager.name}
                        size="xs"
                      />
                      <span className="text-[#292524] dark:text-[#f5f5f5] font-normal">
                        {project.manager.name}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                  </td>

                  {/* Progreso */}
                  <td className="py-4 px-5 w-36">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-[#0c0a09] dark:text-[#f5f5f5]">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                        <div
                          className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Prioridad */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityMeta.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                      {priorityMeta.label}
                    </span>
                  </td>

                  {/* Fecha límite */}
                  <td className="py-4 px-5 text-[#4e4e4e] dark:text-[#a8a29e] font-normal whitespace-nowrap">
                    {formatDate(project.dueDate)}
                  </td>

                  {/* Tareas */}
                  <td className="py-4 px-5 text-[#4e4e4e] dark:text-[#a8a29e] font-medium">
                    {projectTasks.length}
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-5 text-right relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(isMenuOpen ? null : project.id)
                      }
                      className="p-1.5 rounded-full text-[#a8a29e] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:hover:text-white dark:hover:bg-[#292524] transition-colors cursor-pointer"
                      aria-label="Opciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="absolute right-5 top-11 w-40 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-xl shadow-lg z-20 py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                        onMouseLeave={() => setActiveMenuId(null)}
                      >
                        <Link
                          href={`/proyectos/${project.id}`}
                          className="flex items-center gap-2 px-3.5 py-2 text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver proyecto
                        </Link>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(project);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524] text-left cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDuplicate(project)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524] text-left cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicar
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            archiveProject(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#292524] text-left cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archivar
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            deleteProject(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-[#0c0a09] hover:bg-[#f0efed] dark:text-white dark:hover:bg-[#292524] text-left cursor-pointer"
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

      {/* Mobile Responsive List */}
      <div className="md:hidden divide-y divide-[#e7e5e4] dark:divide-[#2e2a27]">
        {projects.map((project) => {
          const statusMeta = getProjectStatusMeta(project.status);
          const projectTasks = tasks.filter((t) => t.projectId === project.id);

          return (
            <div key={project.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/proyectos/${project.id}`}
                    className="font-medium text-[#0c0a09] dark:text-[#f5f5f5] text-sm hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs text-[#a8a29e] mt-0.5">{project.clientOrArea}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusMeta.bg}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#777169] dark:text-[#a8a29e]">
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
                  <span className="text-[#a8a29e]">Avance</span>
                  <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
                    {project.progress}% ({projectTasks.length} tareas)
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
                  <div
                    className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => onEdit(project)}
                  className="px-3 py-1 rounded-full text-xs text-[#292524] dark:text-[#f5f5f5] hover:bg-[#f0efed] dark:hover:bg-[#292524] cursor-pointer"
                >
                  Editar
                </button>
                <Link
                  href={`/proyectos/${project.id}`}
                  className="px-3 py-1 rounded-full text-xs bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] font-medium"
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
