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
  Plus,
  ListTodo,
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const { updateTaskStatus, setSelectedTaskId, setIsCreateTaskOpen } = useStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'pendiente', title: 'Pendiente' },
    { status: 'en_progreso', title: 'En progreso' },
    { status: 'en_revision', title: 'En revisión' },
    { status: 'completada', title: 'Completada' },
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
            className="flex flex-col bg-[#fafafa] dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] rounded-2xl p-4 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
              <div className="flex items-center gap-2">
                <h4 className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
                  {col.title}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] text-[#292524] dark:text-[#f5f5f5]">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="p-1 rounded-full text-[#a8a29e] hover:text-[#0c0a09] hover:bg-white dark:hover:bg-[#292524] transition-colors cursor-pointer"
                title="Añadir tarea a esta columna"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 pt-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-28 border border-dashed border-[#e7e5e4] dark:border-[#44403c] rounded-xl flex items-center justify-center text-xs text-[#a8a29e] italic p-4 text-center">
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
                        'p-4 rounded-xl bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] shadow-none hover:border-[#a8a29e] transition-all cursor-pointer group select-none relative',
                        isDragging && 'opacity-40 border-[#0c0a09]'
                      )}
                    >
                      {/* Priority and Actions */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${priorityMeta.bg}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${priorityMeta.dot}`} />
                          {priorityMeta.label}
                        </span>

                        {/* Move Column Selector */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            title="Mover de columna"
                            className="text-[10px] bg-[#fafafa] dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded px-1.5 py-0.5 text-[#777169] dark:text-[#a8a29e] focus:outline-none cursor-pointer"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="en_revision">En revisión</option>
                            <option value="completada">Completada</option>
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5] group-hover:underline transition-all line-clamp-2 leading-snug">
                        {task.title}
                      </h5>

                      {/* Subtasks counter */}
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-[#a8a29e]">
                          <ListTodo className="w-3 h-3" />
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length}
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Assignee and Date */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e7e5e4]/60 dark:border-[#44403c]/60 text-[11px] text-[#777169] dark:text-[#a8a29e]">
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
                          <Calendar className="w-3 h-3 text-[#a8a29e]" />
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
