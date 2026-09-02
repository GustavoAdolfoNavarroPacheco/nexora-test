'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Drawer } from '@/components/ui/drawer';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getPriorityMeta,
  getTaskStatusMeta,
  formatDate,
  cn,
} from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  ListTodo,
  FolderKanban,
  CheckSquare,
  Trash2,
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
    currentUser,
    users,
  } = useStore();

  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const task = tasks.find((t) => t.id === selectedTaskId);

  if (!task) return null;

  const priorityMeta = getPriorityMeta(task.priority);
  const statusMeta = getTaskStatusMeta(task.status);

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
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className="mt-1 p-0.5 rounded text-slate-400 hover:text-emerald-600 transition-colors"
            title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
            ) : (
              <div className="w-6 h-6 rounded-md border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors" />
            )}
          </button>

          <div className="flex-1">
            <h2
              className={cn(
                'text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug',
                task.completed && 'line-through text-slate-400 dark:text-slate-500'
              )}
            >
              {task.title}
            </h2>
            <Link
              href={`/proyectos/${task.projectId}`}
              onClick={() => setSelectedTaskId(null)}
              className="inline-flex items-center gap-1.5 mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              {task.projectName}
            </Link>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Estado</span>
            <select
              value={task.status}
              onChange={(e) =>
                updateTask(task.id, { status: e.target.value as TaskStatus })
              }
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="en_revision">En revisión</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Prioridad</span>
            <select
              value={task.priority}
              onChange={(e) =>
                updateTask(task.id, { priority: e.target.value as Priority })
              }
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Responsable</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Avatar src={task.assignee.avatar} name={task.assignee.name} size="xs" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {task.assignee.name}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-1">Fecha límite</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 dark:text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Descripción
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {task.description || 'Sin descripción detallada.'}
          </p>
        </div>

        {/* Subtasks Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-blue-500" />
              Checklist / Subtareas (
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </h4>
          </div>

          <div className="space-y-1.5">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => toggleSubtask(task.id, st.id)}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => {}} // Handled by parent div
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span
                  className={cn(
                    'text-xs text-slate-800 dark:text-slate-200 select-none',
                    st.completed && 'line-through text-slate-400 dark:text-slate-500'
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
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
              <Button type="submit" size="sm" variant="secondary">
                Agregar
              </Button>
            </form>
          </div>
        </div>

        {/* Comments Stream */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Comentarios ({task.comments.length})
          </h4>

          {/* Comment list */}
          <div className="space-y-3">
            {task.comments.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Aún no hay comentarios en esta tarea. Sé el primero en escribir uno.
              </p>
            ) : (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={comment.author.avatar}
                        name={comment.author.name}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {comment.author.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
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
