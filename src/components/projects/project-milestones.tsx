'use client';

import React, { useState } from 'react';
import { Milestone } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import { CheckCircle2, Circle, Calendar, Flag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectMilestonesProps {
  milestones: Milestone[];
  projectId: string;
  onToggleMilestone?: (milestoneId: string) => void;
}

export function ProjectMilestones({
  milestones: initialMilestones,
  projectId,
}: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-01');
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      completed: false,
    };

    setMilestones([...milestones, newM]);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Próximos hitos estratégicos
          </h3>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo hito
        </button>
      </div>

      {/* Add milestone mini form */}
      {isAdding && (
        <form onSubmit={handleAddMilestone} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del hito..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            required
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            required
          />
          <div className="flex items-center gap-1">
            <Button type="submit" size="sm" variant="primary">Guardar</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Milestones list timeline */}
      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => handleToggle(milestone.id)}
            className="flex items-start gap-3.5 pl-1 cursor-pointer group select-none"
          >
            <div className="z-10 bg-white dark:bg-slate-900 p-0.5 rounded-full">
              {milestone.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0 p-2.5 rounded-xl border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    'text-xs font-semibold',
                    milestone.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100'
                  )}
                >
                  {milestone.title}
                </h4>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0',
                    milestone.completed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  )}
                >
                  {milestone.completed ? 'Completado' : 'Pendiente'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Fecha estimada: {formatDate(milestone.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
