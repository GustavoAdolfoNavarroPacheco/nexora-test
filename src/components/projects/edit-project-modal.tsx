'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/sheet';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Priority, ProjectStatus, Project } from '@/lib/types';

const FORM_ID = 'edit-project-form';

function EditProjectForm({ project, onDone }: { project: Project; onDone: () => void }) {
  const { updateProject } = useStore();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [clientOrArea, setClientOrArea] = useState(project.clientOrArea);
  const [priority, setPriority] = useState<Priority>(project.priority);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(project.startDate);
  const [dueDate, setDueDate] = useState(project.dueDate);
  const [error, setError] = useState<{ field: 'name' | 'dueDate'; message: string } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return setError({ field: 'name', message: 'Escribe un nombre de al menos 3 caracteres.' });
    if (startDate && dueDate && dueDate <= startDate)
      return setError({ field: 'dueDate', message: 'La entrega debe ser posterior al inicio.' });

    updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
      clientOrArea: clientOrArea.trim(),
      priority,
      status,
      startDate,
      dueDate,
    });
    onDone();
  };

  return (
    <form id={FORM_ID} onSubmit={submit} noValidate className="space-y-4 pt-1">
      <Input
        data-autofocus
        label="Nombre"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        error={error?.field === 'name' ? error.message : undefined}
        required
      />
      <Input label="Cliente o área" value={clientOrArea} onChange={(e) => setClientOrArea(e.target.value)} />
      <Textarea label="Objetivo" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="Estado" value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
          <option value="activo">Activo</option>
          <option value="planificacion">Planificación</option>
          <option value="en_pausa">En pausa</option>
          <option value="completado">Completado</option>
          <option value="archivado">Archivado</option>
        </Select>
        <Select label="Prioridad" value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </Select>
        <Input type="date" label="Inicio" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input
          type="date"
          label="Entrega"
          value={dueDate}
          onChange={(e) => {
            setDueDate(e.target.value);
            setError(null);
          }}
          error={error?.field === 'dueDate' ? error.message : undefined}
        />
      </div>
    </form>
  );
}

export function EditProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  // Keep showing the last project while the sheet animates closed.
  const [shown, setShown] = useState<Project | null>(project);
  if (project && project !== shown) setShown(project);

  return (
    <Modal
      isOpen={Boolean(project)}
      onClose={onClose}
      title="Editar proyecto"
      description={shown?.name}
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Guardar cambios
          </Button>
        </>
      }
    >
      {shown && <EditProjectForm key={shown.id} project={shown} onDone={onClose} />}
    </Modal>
  );
}
