import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority, ProjectStatus, TaskStatus, MemberStatus, Project, Task } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The demo workspace lives on this day; every "due in" / "overdue" calculation is relative to it. */
export const REFERENCE_DATE = new Date('2026-09-02T12:00:00');

export type Tone = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple';

export const toneClasses: Record<Tone, { soft: string; ink: string; dot: string; bar: string }> = {
  gray: { soft: 'bg-gray-soft text-gray-ink', ink: 'text-gray-ink', dot: 'bg-gray', bar: 'bg-gray' },
  blue: { soft: 'bg-accent-soft text-accent-ink', ink: 'text-accent-ink', dot: 'bg-accent', bar: 'bg-accent' },
  green: { soft: 'bg-green-soft text-green-ink', ink: 'text-green-ink', dot: 'bg-green', bar: 'bg-green' },
  orange: { soft: 'bg-orange-soft text-orange-ink', ink: 'text-orange-ink', dot: 'bg-orange', bar: 'bg-orange' },
  red: { soft: 'bg-red-soft text-red-ink', ink: 'text-red-ink', dot: 'bg-red', bar: 'bg-red' },
  purple: { soft: 'bg-purple-soft text-purple-ink', ink: 'text-purple-ink', dot: 'bg-purple', bar: 'bg-purple' },
};

/** CSS color value for a tone — used by SVG strokes and inline styles. */
export const toneColor: Record<Tone, string> = {
  gray: 'var(--gray)',
  blue: 'var(--accent)',
  green: 'var(--green)',
  orange: 'var(--orange)',
  red: 'var(--red)',
  purple: 'var(--purple)',
};

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function parseDay(dateString: string): Date {
  // Treat bare YYYY-MM-DD as local noon so time zones never shift the day.
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(`${dateString}T12:00:00`)
    : new Date(dateString);
}

export function formatDate(dateString: string): string {
  const date = parseDay(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '');
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function daysUntil(dateString: string, from: Date = REFERENCE_DATE): number {
  const target = parseDay(dateString);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function describeDue(dateString: string, done = false): { label: string; tone: Tone } {
  const d = daysUntil(dateString);
  if (done) return { label: formatDate(dateString), tone: 'gray' };
  if (d < -1) return { label: `Venció hace ${Math.abs(d)} días`, tone: 'red' };
  if (d === -1) return { label: 'Venció ayer', tone: 'red' };
  if (d === 0) return { label: 'Vence hoy', tone: 'orange' };
  if (d === 1) return { label: 'Vence mañana', tone: 'orange' };
  if (d <= 7) return { label: `En ${d} días`, tone: 'gray' };
  return { label: formatDate(dateString), tone: 'gray' };
}

export function isOverdue(task: Pick<Task, 'dueDate' | 'completed'>): boolean {
  return !task.completed && daysUntil(task.dueDate) < 0;
}

export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

/** Share of the calendar already consumed by a project, 0–100. */
export function elapsedShare(project: Pick<Project, 'startDate' | 'dueDate'>): number {
  const total = daysUntil(project.dueDate, parseDay(project.startDate));
  if (total <= 0) return 100;
  const used = total - daysUntil(project.dueDate);
  return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
}

/** A project is at risk when its progress trails the time already spent by more than 15 points. */
export function isAtRisk(project: Project): boolean {
  if (project.status !== 'activo') return false;
  return elapsedShare(project) - project.progress > 15 || daysUntil(project.dueDate) < 0;
}

export function getPriorityMeta(priority: Priority): { label: string; tone: Tone; marks: string } {
  switch (priority) {
    case 'critica':
      return { label: 'Crítica', tone: 'red', marks: '!!!' };
    case 'alta':
      return { label: 'Alta', tone: 'orange', marks: '!!' };
    case 'media':
      return { label: 'Media', tone: 'blue', marks: '!' };
    default:
      return { label: 'Baja', tone: 'gray', marks: '' };
  }
}

export function getProjectStatusMeta(status: ProjectStatus): { label: string; tone: Tone } {
  switch (status) {
    case 'activo':
      return { label: 'Activo', tone: 'green' };
    case 'en_pausa':
      return { label: 'En pausa', tone: 'orange' };
    case 'planificacion':
      return { label: 'Planificación', tone: 'purple' };
    case 'completado':
      return { label: 'Completado', tone: 'blue' };
    default:
      return { label: 'Archivado', tone: 'gray' };
  }
}

export function getTaskStatusMeta(status: TaskStatus): { label: string; tone: Tone } {
  switch (status) {
    case 'pendiente':
      return { label: 'Pendiente', tone: 'gray' };
    case 'en_progreso':
      return { label: 'En progreso', tone: 'blue' };
    case 'en_revision':
      return { label: 'En revisión', tone: 'purple' };
    default:
      return { label: 'Completada', tone: 'green' };
  }
}

export function getMemberStatusMeta(status: MemberStatus): { label: string; tone: Tone } {
  switch (status) {
    case 'disponible':
      return { label: 'Disponible', tone: 'green' };
    case 'ocupado':
      return { label: 'Ocupado', tone: 'orange' };
    default:
      return { label: 'Ausente', tone: 'gray' };
  }
}

export const TASK_STATUSES: TaskStatus[] = ['pendiente', 'en_progreso', 'en_revision', 'completada'];

export function pluralize(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
