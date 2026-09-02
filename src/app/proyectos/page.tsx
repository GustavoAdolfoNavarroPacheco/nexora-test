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

  const filteredProjects = projects.filter((project) => {
    if (filters.search) {
      const q = normalizeText(filters.search);
      const matchesName = normalizeText(project.name).includes(q);
      const matchesArea = normalizeText(project.clientOrArea).includes(q);
      if (!matchesName && !matchesArea) return false;
    }

    if (filters.status && project.status !== filters.status) {
      return false;
    }

    if (filters.priority && project.priority !== filters.priority) {
      return false;
    }

    if (filters.managerId && project.manager.id !== filters.managerId) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#e7e5e4]/80 dark:border-[#2e2a27]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-4xl sm:text-5xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
              Proyectos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0efed] text-[#777169] dark:bg-[#292524] dark:text-[#a8a29e]">
              {projects.length}
            </span>
          </div>
          <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
            Supervisión integral de iniciativas estratégicas y estado de entrega.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateProjectOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo proyecto
          </Button>
        </div>
      </div>

      {/* Simulated error banner */}
      {isErrorSimulated ? (
        <div className="p-8 rounded-2xl bg-[#e8b8c4]/20 border border-[#e8b8c4]/50 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#0c0a09] mx-auto" />
          <h3 className="text-base font-semibold text-[#0c0a09]">
            No pudimos cargar los proyectos en este momento
          </h3>
          <p className="text-xs text-[#4e4e4e] max-w-md mx-auto">
            Ocurrió un error inesperado al conectar con el servicio. Vuelve a intentar.
          </p>
          <Button
            variant="secondary"
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

          {/* Content */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] flex items-center justify-center mx-auto">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  No se encontraron proyectos
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] max-w-sm mx-auto">
                  Ningún proyecto coincide con los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="secondary"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {/* Edit Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
      />
    </div>
  );
}
