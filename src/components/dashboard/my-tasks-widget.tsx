'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  getPriorityMeta,
  getTaskStatusMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import { CheckCircle2, Calendar, ArrowRight, CheckSquare } from 'lucide-react';

export function MyTasksWidget() {
  const { tasks, currentUser, toggleTaskComplete, setSelectedTaskId } = useStore();

  // Tasks assigned to current user or pending
  const myTasks = tasks
    .filter((t) => t.assignee.id === currentUser.id || !t.completed)
    .slice(0, 5);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Mis tareas pendientes
            </h3>
          </div>
          <Link
            href="/tareas"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline"
          >
            Ver todas ({tasks.filter((t) => !t.completed).length})
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
          {myTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              ¡Estás al día! No tienes tareas pendientes.
            </div>
          ) : (
            myTasks.map((task) => {
              const priorityMeta = getPriorityMeta(task.priority);

              return (
                <div
                  key={task.id}
                  className="py-3 flex items-start gap-3 group px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    title={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 group-hover:border-blue-500 transition-colors" />
                    )}
                  </button>

                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={cn(
                          'text-xs font-semibold truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400',
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        )}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 border ${priorityMeta.bg}`}
                      >
                        {priorityMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="truncate max-w-[150px]">{task.projectName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/tareas"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
        >
          Gestionar lista completa de tareas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
