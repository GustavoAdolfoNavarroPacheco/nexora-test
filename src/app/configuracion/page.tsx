'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  CheckCircle2,
  Building2,
  Laptop,
  Smartphone,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'perfil' | 'notificaciones' | 'seguridad' | 'apariencia';

export default function ConfiguracionPage() {
  const { currentUser, theme, setTheme, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Workspace form state
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [workspaceSlug, setWorkspaceSlug] = useState('acme-corp');

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileRole, setProfileRole] = useState(currentUser.role);

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Configuración general guardada',
      description: 'El nombre y ajustes del workspace se actualizaron.',
      type: 'success',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Perfil actualizado',
      description: 'Tus datos de usuario han sido guardados.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Configuración
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Administra las preferencias de tu cuenta, equipo, seguridad y apariencia de Nexora.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar: 3 cols */}
        <div className="lg:col-span-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          {[
            { id: 'general', label: 'General', icon: Building2 },
            { id: 'perfil', label: 'Perfil de usuario', icon: User },
            { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
            { id: 'seguridad', label: 'Seguridad & Acceso', icon: Shield },
            { id: 'apariencia', label: 'Apariencia & Tema', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors',
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel: 9 cols */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {/* TAB: General */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Configuración del Workspace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Información principal visible para todos los miembros de la organización.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <Input
                  label="Nombre de la Organización / Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                />

                <Input
                  label="URL del Workspace"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  helperText={`https://app.nexora.io/${workspaceSlug}`}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Zona horaria predeterminada
                  </label>
                  <select className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100">
                    <option>América / Bogotá (GMT-5)</option>
                    <option>América / Ciudad de México (GMT-6)</option>
                    <option>América / Buenos Aires (GMT-3)</option>
                    <option>Europa / Madrid (GMT+1)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" variant="primary">
                  <Save className="w-4 h-4 mr-1.5" />
                  Guardar configuración
                </Button>
              </div>
            </form>
          )}

          {/* TAB: Perfil */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Perfil de usuario
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actualiza tu información personal y cómo te ven tus compañeros de equipo.
                </p>
              </div>

              {/* Avatar section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  size="lg"
                  status={currentUser.status}
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Foto de perfil
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Se recomienda un avatar nítido de al menos 200x200 píxeles.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <Input
                  label="Nombre completo"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />

                <Input
                  type="email"
                  label="Correo electrónico corporativo"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                />

                <Input
                  label="Cargo o Rol"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" variant="primary">
                  <Save className="w-4 h-4 mr-1.5" />
                  Actualizar perfil
                </Button>
              </div>
            </form>
          )}

          {/* TAB: Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Preferencias de notificaciones
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elige qué eventos quieres recibir por correo y en el navegador.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Resumen semanal por correo
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recibe los lunes un reporte consolidado con el estado de tus proyectos.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Notificaciones Push de escritorio
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Alertas en tiempo real cuando se actualice una tarea asignada a ti.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Menciones y comentarios directos
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Notifícame de inmediato cuando alguien me mencione en el feed.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={assignmentAlerts}
                    onChange={(e) => setAssignmentAlerts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  onClick={() =>
                    addToast({
                      title: 'Preferencias guardadas',
                      type: 'success',
                    })
                  }
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Guardar preferencias
                </Button>
              </div>
            </div>
          )}

          {/* TAB: Seguridad */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Seguridad & Sesiones Activas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona la autenticación de dos factores y tus dispositivos conectados.
                </p>
              </div>

              {/* 2FA Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Autenticación en Dos Pasos (2FA)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Añade una capa de seguridad adicional utilizando Google Authenticator o 1Password.
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    addToast({
                      title: twoFactorEnabled ? '2FA deshabilitado' : '2FA habilitado correctamente',
                      type: 'info',
                    });
                  }}
                >
                  {twoFactorEnabled ? 'Desactivar' : 'Configurar 2FA'}
                </Button>
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sesiones activas
                </h4>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Chrome en Windows 11 (Esta sesión)
                        </p>
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Activo ahora • IP 190.25.112.4
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Actual
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          App Nexora Móvil en iPhone 15 Pro
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Última actividad hace 4 horas
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        addToast({
                          title: 'Sesión cerrada',
                          description: 'Se revocó el token del dispositivo móvil.',
                          type: 'warning',
                        })
                      }
                      className="text-red-600 hover:underline"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Apariencia */}
          {activeTab === 'apariencia' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tema & Apariencia Visual
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personaliza cómo se visualiza la plataforma en tu pantalla.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Claro */}
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-3 cursor-pointer',
                    theme === 'light'
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  )}
                >
                  <div className="h-20 rounded-xl bg-slate-100 border border-slate-200 flex flex-col p-2 gap-1.5 overflow-hidden">
                    <div className="h-2 w-1/3 bg-slate-300 rounded" />
                    <div className="h-10 bg-white rounded shadow-2xs p-1 flex gap-1">
                      <div className="w-4 bg-blue-500 rounded-xs" />
                      <div className="flex-1 bg-slate-100 rounded-xs" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Modo Claro
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Fondo cálido y nítido para entornos iluminados.
                    </p>
                  </div>
                </button>

                {/* Oscuro */}
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-3 cursor-pointer',
                    theme === 'dark'
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  )}
                >
                  <div className="h-20 rounded-xl bg-slate-950 border border-slate-800 flex flex-col p-2 gap-1.5 overflow-hidden">
                    <div className="h-2 w-1/3 bg-slate-700 rounded" />
                    <div className="h-10 bg-slate-900 rounded border border-slate-800 p-1 flex gap-1">
                      <div className="w-4 bg-blue-600 rounded-xs" />
                      <div className="flex-1 bg-slate-800 rounded-xs" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Modo Oscuro
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Contraste refinado y descanso visual para sesiones prolongadas.
                    </p>
                  </div>
                </button>

                {/* Sistema */}
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-3 cursor-pointer',
                    theme === 'system'
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  )}
                >
                  <div className="h-20 rounded-xl bg-gradient-to-r from-slate-100 to-slate-950 border border-slate-300 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Tema del Sistema
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Se sincroniza automáticamente con el modo de tu sistema operativo.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
