'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Priority, ProjectStatus } from '@/lib/types';
import { Calendar, UserCheck, AlertCircle } from 'lucide-react';

export function CreateProjectModal() {
  const {
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    addProject,
    users,
    currentUser,
  } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientOrArea, setClientOrArea] = useState('');
  const [managerId, setManagerId] = useState(currentUser.id);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([currentUser.id]);
  const [priority, setPriority] = useState<Priority>('alta');
  const [startDate, setStartDate] = useState('2026-09-02');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [status, setStatus] = useState<ProjectStatus>('activo');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setClientOrArea('');
    setManagerId(currentUser.id);
    setSelectedTeamIds([currentUser.id]);
    setPriority('alta');
    setStartDate('2026-09-02');
    setDueDate('2026-10-15');
    setStatus('activo');
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'El nombre del proyecto es obligatorio.';
    } else if (name.trim().length < 3) {
      errs.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!managerId) {
      errs.managerId = 'Debes asignar un responsable para el proyecto.';
    }

    if (!startDate) {
      errs.startDate = 'La fecha de inicio es requerida.';
    }

    if (!dueDate) {
      errs.dueDate = 'La fecha límite es requerida.';
    } else if (startDate && new Date(dueDate) <= new Date(startDate)) {
      errs.dueDate = 'La fecha límite debe ser posterior a la fecha de inicio.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addProject({
        name: name.trim(),
        description: description.trim(),
        clientOrArea: clientOrArea.trim() || 'Operaciones',
        managerId,
        teamIds: selectedTeamIds,
        priority,
        startDate,
        dueDate,
        status,
      });

      setIsSubmitting(false);
      setIsCreateProjectOpen(false);
      resetForm();
    }, 400);
  };

  const toggleTeamMember = (userId: string) => {
    if (selectedTeamIds.includes(userId)) {
      if (selectedTeamIds.length > 1) {
        setSelectedTeamIds(selectedTeamIds.filter((id) => id !== userId));
      }
    } else {
      setSelectedTeamIds([...selectedTeamIds, userId]);
    }
  };

  return (
    <Modal
      isOpen={isCreateProjectOpen}
      onClose={() => {
        setIsCreateProjectOpen(false);
        resetForm();
      }}
      title="Crear nuevo proyecto"
      description="Define los parámetros iniciales, el equipo responsable y las fechas clave."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <Input
          label="Nombre del proyecto"
          placeholder="Ej. Rediseño del Portal de Clientes"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
          required
        />

        {/* Client or Area */}
        <Input
          label="Cliente o Área de negocio"
          placeholder="Ej. Marketing, Tecnología, Finanzas"
          value={clientOrArea}
          onChange={(e) => setClientOrArea(e.target.value)}
          helperText="Permite agrupar y filtrar los proyectos en el dashboard."
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Descripción del proyecto
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Objetivo principal, alcance y consideraciones clave..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
          />
        </div>

        {/* Manager & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Responsable del proyecto"
            value={managerId}
            onChange={(e) => {
              setManagerId(e.target.value);
              if (errors.managerId) setErrors({ ...errors, managerId: '' });
            }}
            error={errors.managerId}
            required
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {user.role}
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

        {/* Dates Row with Cross-Validation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Fecha de inicio"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (errors.startDate) setErrors({ ...errors, startDate: '' });
            }}
            error={errors.startDate}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <Input
            type="date"
            label="Fecha límite"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
            }}
            error={errors.dueDate}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* Status */}
        <Select
          label="Estado inicial"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        >
          <option value="activo">Activo</option>
          <option value="planificacion">Planificación</option>
          <option value="en_pausa">En pausa</option>
        </Select>

        {/* Team Multi-select */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Asignar integrantes del equipo
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {users.map((u) => {
              const isSelected = selectedTeamIds.includes(u.id);
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => toggleTeamMember(u.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateProjectOpen(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Crear proyecto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
