'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { FolderSearch } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProjectFiltersState, Project } from '@/lib/types';
import { normalizeText, pluralize } from '@/lib/utils';
import { PageHeader, EmptyState } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectTable } from '@/components/projects/project-table';
import { EditProjectModal } from '@/components/projects/edit-project-modal';

const VIEW_KEY = 'nexora_project_view_mode';
const emptyFilters: ProjectFiltersState = { search: '', status: '', priority: '', managerId: '' };

export default function ProjectsPage() {
  const { projects, users, setIsCreateProjectOpen, deleteProject } = useStore();
  const [filters, setFilters] = useState<ProjectFiltersState>(emptyFilters);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const askDelete = (p: Project) => {
    setDeleting(p);
    setConfirmOpen(true);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'grid' || saved === 'table') setViewMode(saved);
    } catch {}
  }, []);

  const changeView = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch {}
  };

  const q = normalizeText(filters.search);
  const visible = projects.filter((p) => {
    if (q && !normalizeText(p.name).includes(q) && !normalizeText(p.clientOrArea).includes(q)) return false;
    // Archived projects only show up when explicitly requested.
    if (filters.status ? p.status !== filters.status : p.status === 'archivado') return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (filters.managerId && p.manager.id !== filters.managerId) return false;
    return true;
  });

  const active = projects.filter((p) => p.status === 'activo').length;

  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        title="Proyectos"
        subtitle={`${pluralize(active, 'proyecto activo', 'proyectos activos')} de ${projects.length} en el espacio de trabajo.`}
      />

      <ProjectFilters
        filters={filters}
        onFilterChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={changeView}
        users={users}
        projects={projects}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="Ningún proyecto coincide"
          description="Prueba con otra palabra o quita alguno de los filtros."
          action={
            <>
              <Button variant="secondary" onClick={() => setFilters(emptyFilters)}>
                Quitar filtros
              </Button>
              <Button onClick={() => setIsCreateProjectOpen(true)}>Nuevo proyecto</Button>
            </>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {visible.map((project, i) => (
              <ProjectCard key={project.id} project={project} onEdit={setEditing} onDelete={askDelete} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <ProjectTable projects={visible} onEdit={setEditing} onDelete={askDelete} />
      )}

      <EditProjectModal project={editing} onClose={() => setEditing(null)} />
      <AlertDialog
        isOpen={confirmOpen}
        title={`¿Eliminar «${deleting?.name ?? ''}»?`}
        message="También se eliminarán sus tareas. No se puede deshacer."
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (deleting) deleteProject(deleting.id);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
