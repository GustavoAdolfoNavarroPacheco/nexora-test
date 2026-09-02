'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import {
  getPriorityMeta,
  getProjectStatusMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  CheckSquare,
  MoreVertical,
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { tasks, deleteProject, archiveProject, addProject, addToast } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const priorityMeta = getPriorityMeta(project.priority);
  const statusMeta = getProjectStatusMeta(project.status);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed).length;

  const handleDuplicate = () => {
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
    setIsMenuOpen(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative">
      <div>
        {/* Top bar: Area & Menu */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {project.clientOrArea}
          </span>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Opciones del proyecto"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsMenuOpen(false)}
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
                    setIsMenuOpen(false);
                    onEdit(project);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicar
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    archiveProject(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archivar
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteProject(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Name & Description */}
        <div className="mt-3">
          <Link
            href={`/proyectos/${project.id}`}
            className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
          >
            {project.name}
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Badges: Status & Priority */}
        <div className="flex items-center gap-2 mt-3.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
            {statusMeta.label}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityMeta.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            {priorityMeta.label}
          </span>
        </div>
      </div>

      {/* Footer Area: Progress & Meta */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Progreso</span>
            <span className="text-slate-900 dark:text-slate-100">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Meta info: Team stack, Tasks, Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          {/* Team stack */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {project.team.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                src={member.avatar}
                name={member.name}
                size="xs"
                className="ring-2 ring-white dark:ring-slate-900"
              />
            ))}
            {project.team.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                +{project.team.length - 3}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{projectTasks.length}</span>
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(project.dueDate)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
