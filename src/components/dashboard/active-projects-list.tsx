'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import {
  getPriorityMeta,
  getProjectStatusMeta,
  formatDate,
} from '@/lib/utils';
import { Calendar, CheckSquare, ArrowRight, FolderKanban } from 'lucide-react';

export function ActiveProjectsList() {
  const { projects, tasks } = useStore();

  const activeProjects = projects.filter(
    (p) => p.status === 'activo' || p.status === 'planificacion' || p.status === 'en_pausa'
  ).slice(0, 6);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
        <div>
          <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
            Proyectos activos
          </h3>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
            Supervisión directa de iniciativas clave en curso
          </p>
        </div>

        <Link
          href="/proyectos"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#292524] hover:text-[#0c0a09] dark:text-[#f5f5f5] hover:underline"
        >
          Ver todos ({projects.length})
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27]">
        {activeProjects.map((project) => {
          const priorityMeta = getPriorityMeta(project.priority);
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const totalTasks = projectTasks.length;

          return (
            <div
              key={project.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#fafafa] dark:hover:bg-[#292524]/40 px-2 rounded-xl transition-colors"
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#292524] dark:text-[#f5f5f5] flex items-center justify-center shrink-0 mt-0.5">
                  <FolderKanban className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/proyectos/${project.id}`}
                    className="text-sm font-semibold text-[#0c0a09] dark:text-[#f5f5f5] hover:underline transition-colors line-clamp-1 block"
                  >
                    {project.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] font-medium">
                      {project.clientOrArea}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityMeta.bg}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${priorityMeta.dot}`} />
                      {priorityMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-1.5 text-xs text-[#777169] dark:text-[#a8a29e]">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        src={project.manager.avatar}
                        name={project.manager.name}
                        size="xs"
                      />
                      <span className="truncate">{project.manager.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" />
                      <span>{totalTasks} tareas</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Progress */}
              <div className="sm:w-36 shrink-0 flex flex-col items-end justify-center">
                <div className="flex items-center justify-between w-full text-xs mb-1">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
