'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Priority, ProjectStatus, Project } from '@/lib/types';
import { Calendar } from 'lucide-react';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { updateProject } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientOrArea, setClientOrArea] = useState('');
  const [priority, setPriority] = useState<Priority>('alta');
  const [status, setStatus] = useState<ProjectStatus>('activo');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setClientOrArea(project.clientOrArea);
      setPriority(project.priority);
      setStatus(project.status);
      setStartDate(project.startDate);
      setDueDate(project.dueDate);
      setError('');
    }
  }, [project]);

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }

    if (startDate && dueDate && new Date(dueDate) <= new Date(startDate)) {
      setError('La fecha límite debe ser posterior a la fecha de inicio.');
      return;
    }

    updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
      clientOrArea: clientOrArea.trim(),
      priority,
      status,
      startDate,
      dueDate,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar proyecto"
      description={`Modifica los detalles de "${project.name}"`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del proyecto"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <Input
          label="Cliente o Área"
          value={clientOrArea}
          onChange={(e) => setClientOrArea(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-[12px] font-medium uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#292524] text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="activo">Activo</option>
            <option value="en_pausa">En pausa</option>
            <option value="planificacion">Planificación</option>
            <option value="completado">Completado</option>
            <option value="archivado">Archivado</option>
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
          <Input
            type="date"
            label="Fecha de inicio"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            type="date"
            label="Fecha límite"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
