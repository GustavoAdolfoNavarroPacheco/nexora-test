'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  getPriorityMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import { Check, Calendar, ArrowRight } from 'lucide-react';

export function MyTasksWidget() {
  const { tasks, currentUser, toggleTaskComplete, setSelectedTaskId } = useStore();

  const myTasks = tasks
    .filter((t) => t.assignee.id === currentUser.id || !t.completed)
    .slice(0, 5);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
              Mis tareas pendientes
            </h3>
          </div>
          <Link
            href="/tareas"
            className="text-xs text-[#292524] hover:text-[#0c0a09] dark:text-[#f5f5f5] font-medium hover:underline"
          >
            Ver todas ({tasks.filter((t) => !t.completed).length})
          </Link>
        </div>

        <div className="divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27] mt-1">
          {myTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#a8a29e]">
              ¡Estás al día! No tienes tareas pendientes.
            </div>
          ) : (
            myTasks.map((task) => {
              const priorityMeta = getPriorityMeta(task.priority);

              return (
                <div
                  key={task.id}
                  className="py-3 flex items-start gap-3 group px-1 rounded-xl hover:bg-[#fafafa] dark:hover:bg-[#292524]/40 transition-colors"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className="mt-0.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                    title={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
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
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={cn(
                          'text-xs font-medium truncate transition-colors group-hover:underline',
                          task.completed
                            ? 'line-through text-[#a8a29e]'
                            : 'text-[#0c0a09] dark:text-[#f5f5f5]'
                        )}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium shrink-0 border ${priorityMeta.bg}`}
                      >
                        {priorityMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#777169] dark:text-[#a8a29e]">
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

      <div className="pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27] text-center">
        <Link
          href="/tareas"
          className="inline-flex items-center gap-1 text-xs text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white font-medium"
        >
          Gestionar lista completa de tareas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
