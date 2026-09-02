'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getMemberStatusMeta, cn } from '@/lib/utils';
import { Users, Search, Mail, FolderKanban, CheckSquare, Plus, ExternalLink } from 'lucide-react';

export default function EquipoPage() {
  const { users, projects, tasks, addToast } = useStore();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const departments = Array.from(new Set(users.map((u) => u.department)));

  const filteredUsers = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.role.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (departmentFilter && u.department !== departmentFilter) {
      return false;
    }
    return true;
  });

  const handleContact = (email: string) => {
    addToast({
      title: 'Enlace de correo copiado',
      description: `Listo para contactar a ${email}`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Equipo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {users.length} integrantes
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directorio de profesionales, roles técnicos, disponibilidad y distribución de carga operativa.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() =>
            addToast({
              title: 'Invitación a nuevo miembro',
              description: 'El enlace de invitación al workspace fue generado.',
              type: 'info',
            })
          }
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Invitar miembro
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo o especialidad..."
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((member) => {
          const statusMeta = getMemberStatusMeta(member.status);
          const memberProjects = projects.filter((p) =>
            p.team.some((u) => u.id === member.id)
          );
          const memberTasks = tasks.filter(
            (t) => t.assignee.id === member.id && !t.completed
          );

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="lg"
                      status={member.status}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {member.role}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {member.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                      member.status === 'disponible'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                        : member.status === 'ocupado'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full', statusMeta.dot)} />
                    {statusMeta.label}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Proyectos activos</span>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {memberProjects.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Tareas pendientes</span>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {memberTasks.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Email contact button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500 truncate max-w-[170px]">
                  {member.email}
                </span>

                <button
                  onClick={() => handleContact(member.email)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Copiar email de contacto"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
