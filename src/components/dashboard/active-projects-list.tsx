'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Proyectos activos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supervisión directa de iniciativas clave en curso
          </p>
        </div>

        <Link
          href="/proyectos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
        >
          Ver todos ({projects.length})
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {activeProjects.map((project) => {
          const priorityMeta = getPriorityMeta(project.priority);
          const statusMeta = getProjectStatusMeta(project.status);
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const totalTasks = projectTasks.length;

          return (
            <div
              key={project.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <FolderKanban className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/proyectos/${project.id}`}
                      className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
                    >
                      {project.name}
                    </Link>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {project.clientOrArea}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityMeta.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                      {priorityMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        src={project.manager.avatar}
                        name={project.manager.name}
                        size="xs"
                      />
                      <span className="truncate">{project.manager.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalTasks} tareas</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(project.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Progress */}
              <div className="sm:w-44 shrink-0 flex flex-col items-end justify-center">
                <div className="flex items-center justify-between w-full text-xs font-semibold mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Avance</span>
                  <span className="text-slate-900 dark:text-slate-100">{project.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
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
