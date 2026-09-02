'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Building,
  User,
  Bell,
  Shield,
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, theme, setTheme, addToast } = useStore();
  const [activeSection, setActiveSection] = useState<'general' | 'perfil' | 'notificaciones' | 'seguridad' | 'apariencia'>('general');

  // Form states
  const [workspaceName, setWorkspaceName] = useState('Acme Corp • Producción');
  const [userName, setUserName] = useState(currentUser.name);
  const [userEmail, setUserEmail] = useState(currentUser.email);
  const [userRole, setUserRole] = useState(currentUser.role);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Configuración guardada',
      description: 'Tus preferencias han sido actualizadas en el espacio de trabajo.',
      type: 'success',
    });
  };

  const navItems = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="pb-2 border-b border-[#e7e5e4]/80 dark:border-[#2e2a27]">
        <h1 className="font-editorial text-4xl sm:text-5xl font-light tracking-tight text-[#0c0a09] dark:text-[#f5f5f5]">
          Configuración
        </h1>
        <p className="text-sm text-[#777169] dark:text-[#a8a29e] mt-1">
          Administra tu espacio de trabajo, datos de perfil, seguridad y preferencias de interfaz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="md:col-span-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-medium text-left transition-all cursor-pointer',
                  active
                    ? 'bg-[#292524] text-white dark:bg-[#f5f5f5] dark:text-[#0c0a09] shadow-xs'
                    : 'text-[#777169] hover:text-[#0c0a09] hover:bg-[#f0efed] dark:text-[#a8a29e] dark:hover:bg-[#292524]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content Area */}
        <div className="md:col-span-9 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#2e2a27] shadow-none">
          {/* General */}
          {activeSection === 'general' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  Espacio de trabajo
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                  Información pública y configuración general de la organización.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <Input
                  label="Nombre de la organización"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
                <Input
                  label="Dominio corporativo"
                  defaultValue="acmecorp.nexora.app"
                  disabled
                  helperText="El subdominio principal está vinculado al plan Enterprise."
                />
              </div>

              <div className="pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
                <Button type="submit" variant="primary">
                  Guardar cambios
                </Button>
              </div>
            </form>
          )}

          {/* Perfil */}
          {activeSection === 'perfil' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  Perfil de usuario
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                  Actualiza tu información personal y cómo te ven tus compañeros.
                </p>
              </div>

              <div className="flex items-center gap-4 py-2">
                <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" />
                <div>
                  <Button type="button" variant="secondary" size="sm">
                    Cambiar fotografía
                  </Button>
                  <p className="text-[11px] text-[#a8a29e] mt-1.5">
                    Formatos admitidos: JPG, PNG o WebP hasta 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <Input
                  label="Nombre completo"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <Input
                  label="Correo electrónico"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <Input
                  label="Cargo o rol"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
                <Button type="submit" variant="primary">
                  Actualizar perfil
                </Button>
              </div>
            </form>
          )}

          {/* Notificaciones */}
          {activeSection === 'notificaciones' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  Preferencias de notificación
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                  Elige qué eventos activan alertas y correos informativos.
                </p>
              </div>

              <div className="space-y-3 divide-y divide-[#e7e5e4]/60 dark:divide-[#2e2a27]">
                {[
                  {
                    title: 'Asignación de tareas',
                    desc: 'Notificar cuando se me asigne una nueva tarea en cualquier proyecto.',
                    defaultChecked: true,
                  },
                  {
                    title: 'Menciones en comentarios',
                    desc: 'Notificar cuando un compañero mencione mi usuario en el hilo de una tarea.',
                    defaultChecked: true,
                  },
                  {
                    title: 'Vencimiento de plazos',
                    desc: 'Recibir un aviso preventivo 24 horas antes del vencimiento de tareas.',
                    defaultChecked: true,
                  },
                  {
                    title: 'Resumen semanal por correo',
                    desc: 'Envío automático los lunes con las métricas y progreso acumulado.',
                    defaultChecked: false,
                  },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start justify-between gap-4 pt-3 cursor-pointer select-none"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="mt-1 w-4 h-4 rounded border-[#d6d3d1] accent-[#292524] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seguridad */}
          {activeSection === 'seguridad' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  Seguridad y credenciales
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                  Protege el acceso a tu cuenta mediante autenticación segura.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#292524]/50 border border-[#e7e5e4] dark:border-[#44403c] space-y-2 max-w-lg">
                <h4 className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                  Autenticación en dos pasos (2FA)
                </h4>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
                  Añade una capa extra de protección solicitando un código temporal en cada inicio de sesión.
                </p>
                <div className="pt-2">
                  <Button variant="secondary" size="sm">
                    Configurar autenticador
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-w-lg pt-2">
                <Input type="password" label="Contraseña actual" />
                <Input type="password" label="Nueva contraseña" />
                <Input type="password" label="Confirmar nueva contraseña" />
              </div>

              <div className="pt-4 border-t border-[#e7e5e4] dark:border-[#2e2a27]">
                <Button variant="primary">Actualizar contraseña</Button>
              </div>
            </div>
          )}

          {/* Apariencia */}
          {activeSection === 'apariencia' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-editorial text-2xl font-light text-[#0c0a09] dark:text-[#f5f5f5]">
                  Tema y modo visual
                </h3>
                <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-0.5">
                  Selecciona la apariencia preferida para tu sesión en Nexora.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                {[
                  { id: 'light', label: 'Claro', icon: Sun },
                  { id: 'dark', label: 'Oscuro', icon: Moon },
                  { id: 'system', label: 'Sistema', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id as 'light' | 'dark' | 'system')}
                      className={cn(
                        'flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer',
                        isSelected
                          ? 'border-[#292524] dark:border-[#f5f5f5] bg-[#fafafa] dark:bg-[#292524]'
                          : 'border-[#e7e5e4] dark:border-[#44403c] bg-white dark:bg-[#1c1917] hover:border-[#a8a29e]'
                      )}
                    >
                      <Icon className="w-5 h-5 mb-2 text-[#292524] dark:text-[#f5f5f5]" />
                      <span className="text-xs font-semibold text-[#0c0a09] dark:text-[#f5f5f5]">
                        {item.label}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#292524] dark:text-[#f5f5f5] mt-1.5 font-medium">
                          <Check className="w-3 h-3" /> Activo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
