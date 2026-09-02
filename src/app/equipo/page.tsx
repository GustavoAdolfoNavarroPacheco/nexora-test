'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Search,
  Mail,
  FolderKanban,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export default function TeamPage() {
  const { users, projects, tasks } = useStore();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const departments = Array.from(new Set(users.map((u) => u.department)));

  const filteredUsers = users.filter((u) => {
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.role.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (departmentFilter && u.department !== departmentFilter) {
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
              Equipo y Talento
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0efed] text-[#777169] dark:bg-[#292524] dark:text-[#a8a29e]">
              {users.length} miembros
            </span>
          </div>
          <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
            Directorio activo de colaboradores, especialidades, disponibilidad y carga de trabajo.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo o correo..."
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292524] text-[#292524] dark:text-[#f5f5f5] placeholder:text-[#a8a29e]"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-11 px-4 text-xs sm:text-sm bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#292524] cursor-pointer w-full sm:w-auto"
        >
          <option value="">Todos los departamentos</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const userProjects = projects.filter((p) =>
            p.team.some((t) => t.id === user.id)
          );
          const userTasks = tasks.filter((t) => t.assignee.id === user.id);
          const completedTasks = userTasks.filter((t) => t.completed);

          const availabilityStyles = {
            disponible: 'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/70',
            ocupado: 'bg-[#f4c5a8]/35 text-[#0c0a09] border-[#f4c5a8]/70',
            ausente: 'bg-[#f0efed] text-[#777169] border-[#e7e5e4]',
          };

          return (
            <div
              key={user.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="lg"
                    status={user.status}
                  />
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium capitalize border ${availabilityStyles[user.status]}`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-base text-[#0c0a09] dark:text-[#f5f5f5]">
                    {user.name}
                  </h3>
                  <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">{user.role}</p>
                  <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#4e4e4e] dark:text-[#a8a29e]">
                    {user.department}
                  </span>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="mt-6 pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27] space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#292524]/60 border border-[#e7e5e4] dark:border-[#44403c]">
                    <div className="flex items-center justify-center gap-1 text-[#a8a29e]">
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Proyectos</span>
                    </div>
                    <span className="font-semibold text-sm text-[#0c0a09] dark:text-[#f5f5f5] mt-1 block">
                      {userProjects.length}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#292524]/60 border border-[#e7e5e4] dark:border-[#44403c]">
                    <div className="flex items-center justify-center gap-1 text-[#a8a29e]">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tareas</span>
                    </div>
                    <span className="font-semibold text-sm text-[#0c0a09] dark:text-[#f5f5f5] mt-1 block">
                      {completedTasks.length}/{userTasks.length}
                    </span>
                  </div>
                </div>

                <a
                  href={`mailto:${user.email}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-full border border-[#e7e5e4] dark:border-[#44403c] text-xs font-medium text-[#292524] dark:text-[#f5f5f5] hover:bg-[#f0efed] dark:hover:bg-[#292524] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contactar por correo
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
