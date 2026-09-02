'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Drawer } from '@/components/ui/drawer';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  getPriorityMeta,
  getTaskStatusMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  Send,
  MessageSquare,
  ListTodo,
  FolderKanban,
  Check,
} from 'lucide-react';
import { TaskStatus, Priority } from '@/lib/types';
import Link from 'next/link';

export function TaskDetailDrawer() {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    toggleTaskComplete,
    toggleSubtask,
    addCommentToTask,
  } = useStore();

  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const task = tasks.find((t) => t.id === selectedTaskId);

  if (!task) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToTask(task.id, commentText);
    setCommentText('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    updateTask(task.id, {
      subtasks: [...task.subtasks, newSubtask],
    });
    setNewSubtaskTitle('');
  };

  return (
    <Drawer
      isOpen={!!selectedTaskId}
      onClose={() => setSelectedTaskId(null)}
      title="Detalle de la tarea"
      description={`ID: ${task.id} • Creada recientemente`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header Action: Checkbox & Title */}
        <div className="flex items-start gap-3.5">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className="mt-1 p-0.5 rounded cursor-pointer"
            title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
          >
            {task.completed ? (
              <div className="w-5 h-5 rounded bg-[#0c0a09] dark:bg-[#f5f5f5] text-white dark:text-[#0c0a09] flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded border border-[#d6d3d1] hover:border-[#0c0a09] dark:border-[#44403c] transition-colors" />
            )}
          </button>

          <div className="flex-1">
            <h2
              className={cn(
                'font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] leading-snug',
                task.completed && 'line-through text-[#a8a29e]'
              )}
            >
              {task.title}
            </h2>
            <Link
              href={`/proyectos/${task.projectId}`}
              onClick={() => setSelectedTaskId(null)}
              className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-[#777169] hover:text-[#0c0a09] dark:text-[#a8a29e] dark:hover:text-white font-medium hover:underline"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              {task.projectName}
            </Link>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#fafafa] dark:bg-[#292524]/50 border border-[#e7e5e4] dark:border-[#44403c] text-xs">
          <div>
            <span className="text-[#a8a29e] block mb-1">Estado</span>
            <select
              value={task.status}
              onChange={(e) =>
                updateTask(task.id, { status: e.target.value as TaskStatus })
              }
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] font-medium text-[#0c0a09] dark:text-[#f5f5f5] focus:outline-none cursor-pointer"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="en_revision">En revisión</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div>
            <span className="text-[#a8a29e] block mb-1">Prioridad</span>
            <select
              value={task.priority}
              onChange={(e) =>
                updateTask(task.id, { priority: e.target.value as Priority })
              }
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] font-medium text-[#0c0a09] dark:text-[#f5f5f5] focus:outline-none cursor-pointer"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <span className="text-[#a8a29e] block mb-1">Responsable</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
              <span className="font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
                {task.assignee.name}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[#a8a29e] block mb-1">Fecha límite</span>
            <div className="flex items-center gap-1.5 mt-1 font-medium text-[#0c0a09] dark:text-[#f5f5f5]">
              <Calendar className="w-3.5 h-3.5 text-[#a8a29e]" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Descripción
          </h4>
          <p className="text-sm text-[#4e4e4e] dark:text-[#d6d3d1] leading-relaxed whitespace-pre-line p-4 rounded-xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27]">
            {task.description || 'Sin descripción detallada.'}
          </p>
        </div>

        {/* Subtasks Checklist */}
        <div className="space-y-3">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e] flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-[#777169]" />
            Checklist (
            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
          </h4>

          <div className="space-y-2">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => toggleSubtask(task.id, st.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#fafafa] dark:hover:bg-[#292524] cursor-pointer border border-transparent hover:border-[#e7e5e4] dark:hover:border-[#44403c] transition-colors"
              >
                <div className="w-4 h-4 rounded border border-[#d6d3d1] flex items-center justify-center shrink-0">
                  {st.completed && <Check className="w-3 h-3 text-[#0c0a09] dark:text-white" />}
                </div>
                <span
                  className={cn(
                    'text-xs text-[#292524] dark:text-[#f5f5f5] select-none',
                    st.completed && 'line-through text-[#a8a29e]'
                  )}
                >
                  {st.title}
                </span>
              </div>
            ))}

            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Añadir elemento a la checklist..."
                className="flex-1 h-10 px-3.5 text-xs bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] text-[#292524] dark:text-[#f5f5f5]"
              />
              <Button type="submit" size="sm" variant="secondary">
                Agregar
              </Button>
            </form>
          </div>
        </div>

        {/* Comments Stream */}
        <div className="space-y-4 pt-3 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#777169]" />
            Comentarios ({task.comments.length})
          </h4>

          <div className="space-y-3">
            {task.comments.length === 0 ? (
              <p className="text-xs text-[#a8a29e] italic">
                Aún no hay comentarios en esta tarea. Sé el primero en escribir uno.
              </p>
            ) : (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#292524]/60 border border-[#e7e5e4] dark:border-[#44403c] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={comment.author.avatar}
                        name={comment.author.name}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                        {comment.author.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#a8a29e]">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#4e4e4e] dark:text-[#d6d3d1] pl-7 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 h-11 px-4 text-xs bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
            />
            <Button type="submit" size="sm" variant="primary" disabled={!commentText.trim()}>
              <Send className="w-3.5 h-3.5 mr-1" />
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
}
