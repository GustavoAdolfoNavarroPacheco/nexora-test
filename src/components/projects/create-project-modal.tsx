'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/sheet';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Priority, ProjectStatus } from '@/lib/types';
import { spring } from '@/lib/motion';
import { cn, firstName } from '@/lib/utils';

const FORM_ID = 'create-project-form';

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 pl-1 text-[13px] font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

function CreateProjectForm({ onDone }: { onDone: () => void }) {
  const { addProject, users, currentUser } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientOrArea, setClientOrArea] = useState('');
  const [managerId, setManagerId] = useState(currentUser.id);
  const [teamIds, setTeamIds] = useState<string[]>([currentUser.id]);
  const [priority, setPriority] = useState<Priority>('alta');
  const [status, setStatus] = useState<ProjectStatus>('activo');
  const [startDate, setStartDate] = useState('2026-09-02');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => errors[key] && setErrors({ ...errors, [key]: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 3) errs.name = 'Escribe un nombre de al menos 3 caracteres.';
    if (!startDate) errs.startDate = 'Elige una fecha de inicio.';
    if (!dueDate) errs.dueDate = 'Elige una fecha de entrega.';
    else if (startDate && dueDate <= startDate) errs.dueDate = 'La entrega debe ser posterior al inicio.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    addProject({
      name: name.trim(),
      description: description.trim(),
      clientOrArea: clientOrArea.trim() || 'Operaciones',
      managerId,
      teamIds,
      priority,
      startDate,
      dueDate,
      status,
    });
    onDone();
  };

  const toggleMember = (id: string) =>
    setTeamIds((ids) => (ids.includes(id) ? (ids.length > 1 ? ids.filter((x) => x !== id) : ids) : [...ids, id]));

  return (
    <form id={FORM_ID} onSubmit={submit} noValidate className="space-y-7 pt-1">
      <FormGroup title="Qué es">
        <Input
          data-autofocus
          label="Nombre"
          placeholder="Rediseño del portal de clientes"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
          error={errors.name}
          required
        />
        <Input
          label="Cliente o área"
          placeholder="Marketing, Tecnología, Finanzas…"
          value={clientOrArea}
          onChange={(e) => setClientOrArea(e.target.value)}
        />
        <Textarea
          label="Objetivo"
          placeholder="Qué se entrega y cómo sabremos que salió bien."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormGroup>

      <FormGroup title="Quién">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select label="Responsable" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
          <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            <option value="activo">Activo</option>
            <option value="planificacion">Planificación</option>
            <option value="en_pausa">En pausa</option>
          </Select>
        </div>
        <div>
          <p className="mb-2 pl-1 text-[12px] font-medium text-ink-2">Equipo · {teamIds.length} personas</p>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => {
              const on = teamIds.includes(u.id);
              return (
                <motion.button
                  type="button"
                  key={u.id}
                  whileTap={{ scale: 0.94 }}
                  transition={spring}
                  aria-pressed={on}
                  onClick={() => toggleMember(u.id)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-full pr-3.5 pl-1 text-[13px] font-medium transition-colors duration-200',
                    on ? 'bg-accent text-white' : 'bg-fill-2 text-ink hover:bg-[color-mix(in_srgb,var(--fill-2)_100%,var(--ink)_6%)]'
                  )}
                >
                  <Avatar src={u.avatar} name={u.name} size="xs" className={cn('rounded-full', on && 'ring-2 ring-white/40')} />
                  {firstName(u.name)}
                </motion.button>
              );
            })}
          </div>
        </div>
      </FormGroup>

      <FormGroup title="Cuándo">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="date"
            label="Inicio"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              clearError('startDate');
            }}
            error={errors.startDate}
            required
          />
          <Input
            type="date"
            label="Entrega"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              clearError('dueDate');
            }}
            error={errors.dueDate}
            required
          />
        </div>
      </FormGroup>
    </form>
  );
}

export function CreateProjectModal() {
  const { isCreateProjectOpen, setIsCreateProjectOpen } = useStore();
  const close = () => setIsCreateProjectOpen(false);

  return (
    <Modal
      isOpen={isCreateProjectOpen}
      onClose={close}
      title="Nuevo proyecto"
      description="Dale un nombre, un equipo y una fecha de entrega."
      width="xl"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Crear proyecto
          </Button>
        </>
      }
    >
      <CreateProjectForm onDone={close} />
    </Modal>
  );
}
