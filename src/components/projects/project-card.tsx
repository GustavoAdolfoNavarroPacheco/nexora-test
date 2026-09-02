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
  Calendar,
  CheckSquare,
  MoreVertical,
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { tasks, deleteProject, archiveProject, addProject } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const priorityMeta = getPriorityMeta(project.priority);
  const statusMeta = getProjectStatusMeta(project.status);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col justify-between group relative transition-colors">
      <div>
        {/* Top row: Area & Menu */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
            {project.clientOrArea}
          </span>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full text-[#a8a29e] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:hover:text-white dark:hover:bg-[#292524] transition-colors cursor-pointer"
              aria-label="Opciones del proyecto"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-xl shadow-lg z-20 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setIsMenuOpen(false)}
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
                    setIsMenuOpen(false);
                    onEdit(project);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524] text-left cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-[#4e4e4e] dark:text-[#a8a29e] hover:bg-[#fafafa] dark:hover:bg-[#292524] text-left cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicar
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    archiveProject(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-[#777169] hover:bg-[#f0efed] dark:hover:bg-[#292524] text-left cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archivar
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteProject(project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-[#0c0a09] hover:bg-[#f0efed] dark:text-white dark:hover:bg-[#292524] text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Title & Description */}
        <div className="mt-3">
          <Link
            href={`/proyectos/${project.id}`}
            className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] hover:underline transition-all line-clamp-1"
          >
            {project.name}
          </Link>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-4">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
            {statusMeta.label}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${priorityMeta.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            {priorityMeta.label}
          </span>
        </div>
      </div>

      {/* Footer Area: Progress & Meta */}
      <div className="mt-6 pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27] space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#a8a29e] text-[11px]">Avance</span>
            <span className="text-[#0c0a09] dark:text-[#f5f5f5] font-medium">{project.progress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#f0efed] dark:bg-[#292524] overflow-hidden">
            <div
              className="h-full bg-[#292524] dark:bg-[#f5f5f5] rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-[#777169] dark:text-[#a8a29e] pt-1">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {project.team.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                src={member.avatar}
                name={member.name}
                size="xs"
                className="ring-2 ring-white dark:ring-[#1c1917]"
              />
            ))}
            {project.team.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] text-[10px] font-medium flex items-center justify-center ring-2 ring-white dark:ring-[#1c1917]">
                +{project.team.length - 3}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-[#a8a29e]" />
              <span>{projectTasks.length}</span>
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#a8a29e]" />
              <span>{formatDate(project.dueDate)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
