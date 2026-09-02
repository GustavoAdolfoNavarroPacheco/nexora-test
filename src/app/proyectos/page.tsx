'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectTable } from '@/components/projects/project-table';
import { EditProjectModal } from '@/components/projects/edit-project-modal';
import { ProjectFiltersState, Project } from '@/lib/types';
import { Plus, FolderKanban, RotateCcw, AlertTriangle } from 'lucide-react';

import { normalizeText } from '@/lib/utils';

export default function ProjectsPage() {
  const { projects, users, setIsCreateProjectOpen } = useStore();

  const [filters, setFilters] = useState<ProjectFiltersState>({
    search: '',
    status: '',
    priority: '',
    managerId: '',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('nexora_project_view_mode') as 'grid' | 'table' | null;
      if (savedMode) setViewMode(savedMode);
    } catch {}
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('nexora_project_view_mode', mode);
    } catch {}
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Search
    if (filters.search) {
      const q = normalizeText(filters.search);
      const matchesName = normalizeText(project.name).includes(q);
      const matchesArea = normalizeText(project.clientOrArea).includes(q);
      if (!matchesName && !matchesArea) return false;
    }

    // Status
    if (filters.status && project.status !== filters.status) {
      return false;
    }

    // Priority
    if (filters.priority && project.priority !== filters.priority) {
      return false;
    }

    // Manager
    if (filters.managerId && project.manager.id !== filters.managerId) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Proyectos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {projects.length} totales
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra y supervisa todos los proyectos e iniciativas estratégicas del equipo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateProjectOpen(true)}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo proyecto
          </Button>
        </div>
      </div>

      {/* Error state simulation banner if triggered */}
      {isErrorSimulated ? (
        <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-red-900 dark:text-red-200">
            No pudimos cargar los proyectos en este momento
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400 max-w-md mx-auto">
            Ocurrió un error inesperado al conectar con el servicio. Verifica tu conexión de red o vuelve a intentar.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsErrorSimulated(false)}
            className="mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Intentar nuevamente
          </Button>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <ProjectFilters
            filters={filters}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            users={users}
            totalResults={filteredProjects.length}
          />

          {/* Projects Content: Grid vs Table vs Empty State */}
          {filteredProjects.length === 0 ? (
            /* Empty state (requirement 37) */
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  No se encontraron proyectos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Ningún proyecto coincide con los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({ search: '', status: '', priority: '', managerId: '' })
                  }
                >
                  Limpiar filtros
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear proyecto
                </Button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={setEditingProject}
                />
              ))}
            </div>
          ) : (
            <ProjectTable
              projects={filteredProjects}
              onEdit={setEditingProject}
            />
          )}
        </>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
      />
    </div>
  );
}
