import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority, ProjectStatus, TaskStatus, MemberStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFullDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getPriorityMeta(priority: Priority) {
  switch (priority) {
    case 'critica':
      return {
        label: 'Crítica',
        bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50',
        dot: 'bg-red-500',
      };
    case 'alta':
      return {
        label: 'Alta',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
        dot: 'bg-amber-500',
      };
    case 'media':
      return {
        label: 'Media',
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
        dot: 'bg-blue-500',
      };
    case 'baja':
    default:
      return {
        label: 'Baja',
        bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getProjectStatusMeta(status: ProjectStatus) {
  switch (status) {
    case 'activo':
      return {
        label: 'Activo',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
        dot: 'bg-emerald-500',
      };
    case 'en_pausa':
      return {
        label: 'En pausa',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
        dot: 'bg-amber-500',
      };
    case 'planificacion':
      return {
        label: 'Planificación',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50',
        dot: 'bg-indigo-500',
      };
    case 'completado':
      return {
        label: 'Completado',
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
        dot: 'bg-blue-500',
      };
    case 'archivado':
    default:
      return {
        label: 'Archivado',
        bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getTaskStatusMeta(status: TaskStatus) {
  switch (status) {
    case 'pendiente':
      return {
        label: 'Pendiente',
        bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
    case 'en_progreso':
      return {
        label: 'En progreso',
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
        dot: 'bg-blue-500',
      };
    case 'en_revision':
      return {
        label: 'En revisión',
        bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
        dot: 'bg-purple-500',
      };
    case 'completada':
    default:
      return {
        label: 'Completada',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
        dot: 'bg-emerald-500',
      };
  }
}

export function getMemberStatusMeta(status: MemberStatus) {
  switch (status) {
    case 'disponible':
      return {
        label: 'Disponible',
        color: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'ocupado':
      return {
        label: 'Ocupado',
        color: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'ausente':
    default:
      return {
        label: 'Ausente',
        color: 'text-slate-500 dark:text-slate-400',
        dot: 'bg-slate-400',
      };
  }
}
