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
        bg: 'bg-[#e8b8c4]/30 text-[#0c0a09] border-[#e8b8c4]/60 dark:bg-[#e8b8c4]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#e8b8c4]',
      };
    case 'alta':
      return {
        label: 'Alta',
        bg: 'bg-[#f4c5a8]/35 text-[#0c0a09] border-[#f4c5a8]/70 dark:bg-[#f4c5a8]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#f4c5a8]',
      };
    case 'media':
      return {
        label: 'Media',
        bg: 'bg-[#a8c8e8]/30 text-[#0c0a09] border-[#a8c8e8]/60 dark:bg-[#a8c8e8]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#a8c8e8]',
      };
    case 'baja':
    default:
      return {
        label: 'Baja',
        bg: 'bg-[#f0efed] text-[#4e4e4e] border-[#e7e5e4] dark:bg-[#292524] dark:text-[#a8a29e] dark:border-[#44403c]',
        dot: 'bg-[#a8a29e]',
      };
  }
}

export function getProjectStatusMeta(status: ProjectStatus) {
  switch (status) {
    case 'activo':
      return {
        label: 'Activo',
        bg: 'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/70 dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#a7e5d3]',
      };
    case 'en_pausa':
      return {
        label: 'En pausa',
        bg: 'bg-[#f4c5a8]/35 text-[#0c0a09] border-[#f4c5a8]/70 dark:bg-[#f4c5a8]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#f4c5a8]',
      };
    case 'planificacion':
      return {
        label: 'Planificación',
        bg: 'bg-[#c8b8e0]/35 text-[#0c0a09] border-[#c8b8e0]/70 dark:bg-[#c8b8e0]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#c8b8e0]',
      };
    case 'completado':
      return {
        label: 'Completado',
        bg: 'bg-[#f0efed] text-[#292524] border-[#d6d3d1] dark:bg-[#292524] dark:text-[#f5f5f5]',
        dot: 'bg-[#0c0a09] dark:bg-[#f5f5f5]',
      };
    case 'archivado':
    default:
      return {
        label: 'Archivado',
        bg: 'bg-[#f0efed] text-[#777169] border-[#e7e5e4] dark:bg-[#1c1917] dark:text-[#a8a29e] dark:border-[#2e2a27]',
        dot: 'bg-[#a8a29e]',
      };
  }
}

export function getTaskStatusMeta(status: TaskStatus) {
  switch (status) {
    case 'pendiente':
      return {
        label: 'Pendiente',
        bg: 'bg-[#f0efed] text-[#4e4e4e] border-[#e7e5e4] dark:bg-[#292524] dark:text-[#a8a29e]',
        dot: 'bg-[#a8a29e]',
      };
    case 'en_progreso':
      return {
        label: 'En progreso',
        bg: 'bg-[#a8c8e8]/35 text-[#0c0a09] border-[#a8c8e8]/60 dark:bg-[#a8c8e8]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#a8c8e8]',
      };
    case 'en_revision':
      return {
        label: 'En revisión',
        bg: 'bg-[#c8b8e0]/35 text-[#0c0a09] border-[#c8b8e0]/60 dark:bg-[#c8b8e0]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#c8b8e0]',
      };
    case 'completada':
    default:
      return {
        label: 'Completada',
        bg: 'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/70 dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]',
        dot: 'bg-[#a7e5d3]',
      };
  }
}

export function getMemberStatusMeta(status: MemberStatus) {
  switch (status) {
    case 'disponible':
      return {
        label: 'Disponible',
        color: 'text-[#0c0a09] dark:text-[#f5f5f5]',
        dot: 'bg-[#a7e5d3]',
      };
    case 'ocupado':
      return {
        label: 'Ocupado',
        color: 'text-[#4e4e4e] dark:text-[#d6d3d1]',
        dot: 'bg-[#f4c5a8]',
      };
    case 'ausente':
    default:
      return {
        label: 'Ausente',
        color: 'text-[#a8a29e]',
        dot: 'bg-[#a8a29e]',
      };
  }
}
