'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Pencil, Copy, Archive, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import type { MenuItem } from '@/components/ui/menu';

/** Shared context-menu actions for a project (cards, table rows). */
export function useProjectMenu(onEdit: (project: Project) => void, onDelete: (project: Project) => void) {
  const router = useRouter();
  const { addProject, archiveProject } = useStore();

  return (project: Project): MenuItem[] => [
    { label: 'Abrir', icon: ExternalLink, onSelect: () => router.push(`/proyectos/${project.id}`) },
    { label: 'Editar', icon: Pencil, onSelect: () => onEdit(project) },
    {
      label: 'Duplicar',
      icon: Copy,
      onSelect: () =>
        addProject({
          name: `${project.name} (copia)`,
          description: project.description,
          clientOrArea: project.clientOrArea,
          managerId: project.manager.id,
          teamIds: project.team.map((t) => t.id),
          priority: project.priority,
          startDate: project.startDate,
          dueDate: project.dueDate,
          status: 'planificacion',
        }),
    },
    { label: 'Archivar', icon: Archive, onSelect: () => archiveProject(project.id) },
    { label: 'Eliminar', icon: Trash2, destructive: true, separatorBefore: true, onSelect: () => onDelete(project) },
  ];
}
