import 'server-only';
import { z } from 'zod';

// Ids are generated on the client (optimistic UI) and checked here.
const id = z.string().regex(/^[a-z]+-[A-Za-z0-9-]{1,64}$/, 'Identificador no válido');
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida (AAAA-MM-DD)');
const title = z.string().trim().min(1, 'No puede estar vacío').max(200);
const longText = z.string().trim().max(4000);

export const priority = z.enum(['baja', 'media', 'alta', 'critica']);
export const projectStatus = z.enum(['activo', 'en_pausa', 'planificacion', 'completado', 'archivado']);
export const taskStatus = z.enum(['pendiente', 'en_progreso', 'en_revision', 'completada']);

export const createProjectSchema = z
  .object({
    id,
    name: z.string().trim().min(3, 'El nombre necesita al menos 3 caracteres').max(120),
    description: longText.default(''),
    clientOrArea: z.string().trim().min(1).max(120),
    managerId: id,
    teamIds: z.array(id).max(50).default([]),
    priority,
    status: projectStatus,
    startDate: day,
    dueDate: day,
    milestones: z.array(z.object({ id, title, date: day, completed: z.boolean() })).max(50).default([]),
  })
  .refine((p) => p.dueDate > p.startDate, { message: 'La entrega debe ser posterior al inicio', path: ['dueDate'] });

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    description: longText,
    clientOrArea: z.string().trim().min(1).max(120),
    priority,
    status: projectStatus,
    startDate: day,
    dueDate: day,
  })
  .partial()
  .refine((p) => !p.startDate || !p.dueDate || p.dueDate > p.startDate, {
    message: 'La entrega debe ser posterior al inicio',
    path: ['dueDate'],
  });

export const createMilestoneSchema = z.object({ id, title, date: day });
export const updateMilestoneSchema = z.object({ completed: z.boolean() });

export const createTaskSchema = z.object({
  id,
  projectId: id,
  title,
  description: longText.default(''),
  assigneeId: id,
  priority,
  status: taskStatus,
  dueDate: day,
});

export const updateTaskSchema = z
  .object({ title, description: longText, assigneeId: id, priority, status: taskStatus, dueDate: day })
  .partial();

export const createSubtaskSchema = z.object({ id, title });
export const updateSubtaskSchema = z.object({ completed: z.boolean() });
export const createCommentSchema = z.object({ id, content: z.string().trim().min(1).max(2000) });
export const updateNotificationSchema = z.object({ read: z.boolean() });
