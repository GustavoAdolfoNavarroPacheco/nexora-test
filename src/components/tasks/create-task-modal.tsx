'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/sheet';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Priority, TaskStatus } from '@/lib/types';
import { getTaskStatusMeta, TASK_STATUSES, todayISO } from '@/lib/utils';

const FORM_ID = 'create-task-form';

function CreateTaskForm({ onDone }: { onDone: () => void }) {
  const { addTask, projects, users, currentUser, createTaskDefaults } = useStore();
  const openProjects = projects.filter((p) => p.status !== 'archivado');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(createTaskDefaults.projectId ?? openProjects[0]?.id ?? '');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [priority, setPriority] = useState<Priority>('media');
  const [status, setStatus] = useState<TaskStatus>(createTaskDefaults.status ?? 'pendiente');
  const [dueDate, setDueDate] = useState(() => todayISO(7));
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Escribe qué hay que hacer.');
    if (!projectId) return setError('Primero crea un proyecto para esta tarea.');
    addTask({ title: title.trim(), description: description.trim(), projectId, assigneeId, priority, dueDate, status });
    onDone();
  };

  return (
    <form id={FORM_ID} onSubmit={submit} noValidate className="space-y-4 pt-1">
      <Input
        data-autofocus
        label="Qué hay que hacer"
        placeholder="Revisar el contrato con el proveedor"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError('');
        }}
        error={error}
        required
      />
      <Textarea
        label="Notas"
        placeholder="Criterios para darla por terminada, enlaces, contexto…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Select label="Proyecto" value={projectId} onValueChange={(v) => setProjectId(v)}>
        {openProjects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="Responsable" value={assigneeId} onValueChange={(v) => setAssigneeId(v)}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Input type="date" label="Fecha límite" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Select label="Prioridad" value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </Select>
        <Select label="Estado" value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getTaskStatusMeta(s).label}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}

export function CreateTaskModal() {
  const { isCreateTaskOpen, setIsCreateTaskOpen } = useStore();
  const close = () => setIsCreateTaskOpen(false);

  return (
    <Modal
      isOpen={isCreateTaskOpen}
      onClose={close}
      title="Nueva tarea"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Crear tarea
          </Button>
        </>
      }
    >
      <CreateTaskForm onDone={close} />
    </Modal>
  );
}
