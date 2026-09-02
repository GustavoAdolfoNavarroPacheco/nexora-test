'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Priority, TaskStatus } from '@/lib/types';
import { Calendar } from 'lucide-react';

interface CreateTaskModalProps {
  defaultProjectId?: string;
}

export function CreateTaskModal({ defaultProjectId }: CreateTaskModalProps) {
  const {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    addTask,
    projects,
    users,
    currentUser,
  } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''));
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [priority, setPriority] = useState<Priority>('alta');
  const [status, setStatus] = useState<TaskStatus>('pendiente');
  const [dueDate, setDueDate] = useState('2026-09-15');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectId(defaultProjectId || (projects[0]?.id ?? ''));
    setAssigneeId(currentUser.id);
    setPriority('alta');
    setStatus('pendiente');
    setDueDate('2026-09-15');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la tarea es obligatorio.');
      return;
    }

    if (!projectId) {
      setError('Debes asociar la tarea a un proyecto.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeId,
        priority,
        dueDate,
        status,
      });

      setIsSubmitting(false);
      setIsCreateTaskOpen(false);
      resetForm();
    }, 300);
  };

  return (
    <Modal
      isOpen={isCreateTaskOpen}
      onClose={() => {
        setIsCreateTaskOpen(false);
        resetForm();
      }}
      title="Crear nueva tarea"
      description="Asigna responsables, fechas de entrega y prioridades operativas."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título de la tarea"
          placeholder="Ej. Revisión de seguridad de tokens JWT"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <Select
          label="Proyecto asociado"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <div className="space-y-1.5">
          <label className="block text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Descripción y notas
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detalles sobre entregables y criterios de aceptación..."
            className="w-full px-4 py-3 text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#292524] text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Responsable"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            required
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>

          <Select
            label="Prioridad"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Estado inicial"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="en_revision">En revisión</option>
            <option value="completada">Completada</option>
          </Select>

          <Input
            type="date"
            label="Fecha límite"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsCreateTaskOpen(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Crear tarea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
