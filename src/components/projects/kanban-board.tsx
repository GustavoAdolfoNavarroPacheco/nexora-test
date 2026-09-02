'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import {
  getPriorityMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  MoveRight,
  ListTodo,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const { updateTaskStatus, setSelectedTaskId, setIsCreateTaskOpen } = useStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'pendiente', title: 'Pendiente', color: 'border-slate-300 dark:border-slate-700' },
    { status: 'en_progreso', title: 'En progreso', color: 'border-blue-400 dark:border-blue-700' },
    { status: 'en_revision', title: 'En revisión', color: 'border-purple-400 dark:border-purple-700' },
    { status: 'completada', title: 'Completada', color: 'border-emerald-400 dark:border-emerald-700' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
            className="flex flex-col bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {col.title}
                </h4>
                <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                title="Añadir tarea a esta columna"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-2.5 pt-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic p-4 text-center">
                  Arrastra tarjetas aquí
                </div>
              ) : (
                columnTasks.map((task) => {
                  const priorityMeta = getPriorityMeta(task.priority);
                  const isDragging = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        'p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group select-none relative',
                        isDragging && 'opacity-40 border-blue-500'
                      )}
                    >
                      {/* Priority and Actions */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priorityMeta.bg}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${priorityMeta.dot}`} />
                          {priorityMeta.label}
                        </span>

                        {/* Move Column Shortcut for accessibility / mobile */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            title="Mover a otra columna"
                            className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-600 dark:text-slate-400 focus:outline-none"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="en_revision">En revisión</option>
                            <option value="completada">Completada</option>
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {task.title}
                      </h5>

                      {/* Subtasks counter if any */}
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <ListTodo className="w-3 h-3 text-slate-400" />
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length}
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Assignee and Date */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            src={task.assignee.avatar}
                            name={task.assignee.name}
                            size="xs"
                          />
                          <span className="truncate max-w-[80px]">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
