'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, UsersRound } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PageHeader, EmptyState } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/badge';
import { SegmentedBar } from '@/components/ui/progress-bar';
import { SearchField } from '@/components/projects/project-filters';
import { spring, easeApple } from '@/lib/motion';
import { cn, getMemberStatusMeta, isOverdue, normalizeText, toneClasses } from '@/lib/utils';
import type { MemberStatus } from '@/lib/types';

const STATUS_ORDER: MemberStatus[] = ['disponible', 'ocupado', 'ausente'];

export default function TeamPage() {
  const { users, projects, tasks } = useStore();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const departments = Array.from(new Set(users.map((u) => u.department)));
  const q = normalizeText(search);
  const visible = users.filter(
    (u) =>
      (!q || [u.name, u.role, u.email, u.department].some((f) => normalizeText(f).includes(q))) &&
      (!department || u.department === department)
  );

  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader title="Equipo" subtitle={`${users.length} personas en ${departments.length} áreas.`} />

      {/* Who's around right now */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeApple, delay: 0.1 }}
        className="surface grid gap-5 p-5 sm:grid-cols-3 sm:p-6"
      >
        {STATUS_ORDER.map((status) => {
          const meta = getMemberStatusMeta(status);
          const people = users.filter((u) => u.status === status);
          return (
            <div key={status} className="flex items-center justify-between gap-3 sm:block">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', toneClasses[meta.tone].dot, status === 'disponible' && 'animate-breathe')} />
                <span className="text-[13px] font-medium text-ink">{meta.label}</span>
                <span className="tabular text-[13px] text-ink-3">{people.length}</span>
              </div>
              <div className="flex -space-x-2 sm:mt-3">
                {people.map((u) => (
                  <Avatar key={u.id} src={u.avatar} name={u.name} size="sm" className="rounded-full ring-2 ring-card" title={u.name} />
                ))}
                {people.length === 0 && <span className="text-[12px] text-ink-3">Nadie</span>}
              </div>
            </div>
          );
        })}
      </motion.section>

      <div className="space-y-3">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre, rol o correo" />
        <div role="radiogroup" aria-label="Área" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {['', ...departments].map((d) => {
            const selected = department === d;
            return (
              <button
                key={d || 'all'}
                role="radio"
                aria-checked={selected}
                onClick={() => setDepartment(d)}
                className={cn(
                  'relative inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors',
                  selected ? 'text-canvas' : 'text-ink-2 hover:bg-fill-2 hover:text-ink'
                )}
              >
                {selected && <motion.span layoutId="team-dept-chip" transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
                <span className="relative">{d || 'Todas las áreas'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={UsersRound} title="Nadie coincide" description="Prueba con otro nombre o cambia de área." />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {visible.map((user, i) => {
              const status = getMemberStatusMeta(user.status);
              const own = tasks.filter((t) => t.assignee.id === user.id);
              const done = own.filter((t) => t.completed).length;
              const late = own.filter(isOverdue).length;
              const active = own.length - done - late;
              const projectCount = projects.filter((p) => p.team.some((m) => m.id === user.id) && p.status !== 'archivado').length;

              return (
                <motion.article
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: easeApple, delay: Math.min(i, 6) * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="surface flex flex-col p-5 transition-shadow duration-300 hover:shadow-lift sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <Avatar src={user.avatar} name={user.name} size="lg" status={user.status} />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-headline truncate text-ink">{user.name}</h2>
                      <p className="truncate text-[13px] text-ink-2">{user.role}</p>
                      <Pill tone={status.tone} className="mt-2">
                        {status.label}
                      </Pill>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-baseline justify-between text-[12px]">
                      <span className="font-medium text-ink">Carga de trabajo</span>
                      <span className="text-ink-2">
                        {done} de {own.length} cerradas
                      </span>
                    </div>
                    {own.length > 0 ? (
                      <SegmentedBar
                        height={8}
                        segments={[
                          { value: done, tone: 'green', label: 'Cerradas' },
                          { value: active, tone: 'blue', label: 'En curso' },
                          { value: late, tone: 'red', label: 'Vencidas' },
                        ]}
                      />
                    ) : (
                      <div className="h-2 rounded-full bg-fill-2" />
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <Link href="/proyectos" className="text-[12px] text-ink-2 hover:text-accent-ink">
                      {projectCount === 1 ? '1 proyecto' : `${projectCount} proyectos`} · {user.department}
                    </Link>
                    <a
                      href={`mailto:${user.email}`}
                      aria-label={`Escribir a ${user.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent-ink transition-transform hover:scale-110 active:scale-95"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
