'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Building2, UserRound, Bell, Lock, SunMoon, Check as CheckIcon } from 'lucide-react';
import { useStore, type ThemeMode } from '@/lib/store';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { SecuritySettings } from '@/components/auth/security-settings';
import { NexoraMark } from '@/components/ui/nexora-mark';
import { spring, easeApple } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Section = 'general' | 'perfil' | 'notificaciones' | 'seguridad' | 'apariencia';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'general', label: 'General', icon: Building2, color: 'bg-[#8e8e93]' },
  { id: 'perfil', label: 'Perfil', icon: UserRound, color: 'bg-[#0a84ff]' },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell, color: 'bg-[#ff3b30]' },
  { id: 'seguridad', label: 'Seguridad', icon: Lock, color: 'bg-[#636366]' },
  { id: 'apariencia', label: 'Apariencia', icon: SunMoon, color: 'bg-[#5e5ce6]' },
];

function Group({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <h3 className="mb-2 pl-4 text-[13px] font-semibold text-ink">{title}</h3>}
      <div className="surface divide-y divide-line overflow-hidden">{children}</div>
      {footer && <p className="mt-2 px-4 text-[12px] text-ink-2">{footer}</p>}
    </div>
  );
}

function ToggleRow({ title, detail, checked, onChange }: { title: string; detail: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <p className="text-[14px] text-ink">{title}</p>
        <p className="text-[12px] text-ink-2">{detail}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

/** Miniature window used as a theme preview, like macOS Appearance settings. */
function ThemePreview({ mode }: { mode: ThemeMode }) {
  const pane = (dark: boolean) => (
    <div className={cn('flex h-full flex-1 gap-1 p-1.5', dark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f7]')}>
      <div className={cn('w-1/3 rounded-[4px]', dark ? 'bg-[#2c2c2e]' : 'bg-[#e5e5ea]')} />
      <div className="flex flex-1 flex-col gap-1">
        <div className={cn('h-2 w-3/4 rounded-full', dark ? 'bg-[#3a3a3c]' : 'bg-white')} />
        <div className={cn('flex-1 rounded-[4px]', dark ? 'bg-[#2c2c2e]' : 'bg-white')} />
        <div className="h-2 w-1/3 rounded-full bg-[#0a84ff]" />
      </div>
    </div>
  );
  return (
    <div className="flex h-[76px] w-full overflow-hidden rounded-[10px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)]">
      {mode === 'light' && pane(false)}
      {mode === 'dark' && pane(true)}
      {mode === 'system' && (
        <>
          {pane(false)}
          {pane(true)}
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, theme, setTheme, addToast } = useStore();
  const [section, setSection] = useState<Section>('general');

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [prefs, setPrefs] = useState({ tasks: true, mentions: true, deadlines: true, weekly: false });

  const save = (e: React.FormEvent, what: string) => {
    e.preventDefault();
    addToast({ title: `${what} guardado`, type: 'success' });
  };

  const setPref = (key: keyof typeof prefs) => (value: boolean) => setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Configuración" subtitle="Tu espacio de trabajo, tu perfil y cómo se ve Nexora." />

      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-10">
        {/* Section list */}
        <nav aria-label="Secciones" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex shrink-0 items-center gap-3 rounded-[10px] py-1.5 pr-4 pl-1.5 text-left text-[14px] transition-colors',
                  active ? 'font-medium text-white' : 'text-ink hover:bg-fill-2'
                )}
              >
                {active && <motion.span layoutId="settings-active" transition={spring} className="absolute inset-0 rounded-[10px] bg-accent" />}
                <span className={cn('relative flex h-7 w-7 items-center justify-center rounded-[7px] text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)]', s.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3, ease: easeApple }}
            className="min-w-0 space-y-7"
          >
            {section === 'general' && (
              <>
                <Group
                  title="Tu espacio de trabajo"
                  footer="Los proyectos, tareas, comentarios y actividad que creas solo los ves tú. Otras cuentas tienen su propio espacio."
                >
                  <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
                    <NexoraMark className="h-9 w-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-ink">Espacio de {currentUser.name.split(/\s+/)[0]}</p>
                      <p className="truncate text-[12px] text-ink-2">{currentUser.email}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-fill-2 px-2.5 py-1 text-[11px] font-medium text-ink-2">
                      <Lock className="h-3 w-3" />
                      Privado
                    </span>
                  </div>
                </Group>

              </>
            )}

            {section === 'perfil' && (
              <form onSubmit={(e) => save(e, 'Perfil')} className="space-y-3">
                <div className="surface flex flex-col items-center p-6 text-center">
                  <Avatar src={currentUser.avatar} name={name} size="xl" status={currentUser.status} />
                  <p className="text-title-2 mt-3 text-ink">{name}</p>
                  <p className="text-[13px] text-ink-2">{role}</p>
                </div>
                <Group title="Datos personales">
                  <div className="space-y-4 p-4 sm:p-5">
                    <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <Input label="Correo" type="email" value={currentUser.email} disabled helperText="Es el correo de la cuenta con la que inicias sesión." />
                    <Input label="Cargo" value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                </Group>
                <div className="flex justify-end">
                  <Button type="submit">Guardar perfil</Button>
                </div>
              </form>
            )}

            {section === 'notificaciones' && (
              <>
                <Group title="Avisarme cuando…">
                  <ToggleRow title="Me asignan una tarea" detail="En cualquier proyecto del espacio" checked={prefs.tasks} onChange={setPref('tasks')} />
                  <ToggleRow title="Alguien me menciona" detail="En comentarios de tareas" checked={prefs.mentions} onChange={setPref('mentions')} />
                  <ToggleRow title="Una tarea vence mañana" detail="Un aviso 24 horas antes" checked={prefs.deadlines} onChange={setPref('deadlines')} />
                </Group>
                <Group title="Correo" footer="Se envía los lunes a primera hora.">
                  <ToggleRow title="Resumen semanal" detail="Avance de tus proyectos y lo que vence esa semana" checked={prefs.weekly} onChange={setPref('weekly')} />
                </Group>
              </>
            )}

            {section === 'seguridad' && <SecuritySettings />}

            {section === 'apariencia' && (
              <Group title="Apariencia" footer="«Automático» sigue el modo claro u oscuro de tu dispositivo.">
                <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-3 p-4 sm:gap-5 sm:p-6">
                  {(
                    [
                      { id: 'light', label: 'Claro' },
                      { id: 'dark', label: 'Oscuro' },
                      { id: 'system', label: 'Automático' },
                    ] as const
                  ).map((opt) => {
                    const selected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setTheme(opt.id)}
                        className="group flex flex-col items-center gap-2.5"
                      >
                        <span
                          className={cn(
                            'relative block w-full rounded-[13px] p-[3px] transition-shadow duration-300',
                            selected ? 'shadow-[0_0_0_3px_var(--accent)]' : 'group-hover:shadow-[0_0_0_3px_var(--fill-2)]'
                          )}
                        >
                          <ThemePreview mode={opt.id} />
                          <AnimatePresence>
                            {selected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={spring}
                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white ring-2 ring-card"
                              >
                                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        <span className={cn('text-[13px]', selected ? 'font-semibold text-ink' : 'text-ink-2')}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Group>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
