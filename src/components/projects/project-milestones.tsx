'use client';

import React, { useState } from 'react';
import { Milestone } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import { Check, Circle, Calendar, Flag, Plus } from 'lucide-react';
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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4] dark:border-[#2e2a27]">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-[#777169]" />
          <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5] tracking-tight">
            Próximos hitos estratégicos
          </h3>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1 text-xs text-[#0c0a09] dark:text-[#f5f5f5] font-medium hover:underline cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo hito
        </button>
      </div>

      {/* Add milestone mini form */}
      {isAdding && (
        <form onSubmit={handleAddMilestone} className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del hito..."
            className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5]"
            required
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#44403c] rounded-lg text-[#292524] dark:text-[#f5f5f5]"
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" variant="primary">Guardar</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Milestones timeline */}
      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#e7e5e4] dark:before:bg-[#44403c]">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => handleToggle(milestone.id)}
            className="flex items-start gap-3.5 pl-0.5 cursor-pointer group select-none"
          >
            <div className="z-10 bg-white dark:bg-[#1c1917] p-0.5 rounded-full">
              {milestone.completed ? (
                <div className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-[#f5f5f5] text-white dark:text-[#0c0a09] flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-[#d6d3d1] dark:text-[#777169] group-hover:text-[#0c0a09] transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0 p-3 rounded-xl border border-transparent group-hover:border-[#e7e5e4] dark:group-hover:border-[#2e2a27] group-hover:bg-[#fafafa] dark:group-hover:bg-[#292524]/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    'text-xs font-medium',
                    milestone.completed
                      ? 'line-through text-[#a8a29e]'
                      : 'text-[#0c0a09] dark:text-[#f5f5f5]'
                  )}
                >
                  {milestone.title}
                </h4>
                <span
                  className={cn(
                    'text-[10px] px-2.5 py-0.5 rounded-full font-medium border shrink-0',
                    milestone.completed
                      ? 'bg-[#a7e5d3]/35 text-[#0c0a09] border-[#a7e5d3]/70 dark:bg-[#a7e5d3]/20 dark:text-[#f5f5f5]'
                      : 'bg-[#f0efed] text-[#777169] border-[#e7e5e4] dark:bg-[#292524] dark:text-[#a8a29e]'
                  )}
                >
                  {milestone.completed ? 'Completado' : 'Pendiente'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#777169] dark:text-[#a8a29e]">
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
