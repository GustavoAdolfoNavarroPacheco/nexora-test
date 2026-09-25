'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Laptop, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useStore } from '@/lib/store';
import { formatRelative } from '@/lib/time';
import { easeApple } from '@/lib/motion';
import { AppleLogo, GoogleLogo } from './brand-icons';
import { useSignOut } from './use-sign-out';

interface SessionRow {
  id: string;
  token: string;
  userAgent?: string | null;
  updatedAt: Date | string;
}

interface AccountRow {
  id: string;
  providerId: string;
  createdAt: Date | string;
}

function describeDevice(ua?: string | null) {
  const s = ua ?? '';
  const device = /iPhone/.test(s)
    ? 'iPhone'
    : /iPad/.test(s)
      ? 'iPad'
      : /Android/.test(s)
        ? 'Android'
        : /Macintosh|Mac OS X/.test(s)
          ? 'Mac'
          : /Windows/.test(s)
            ? 'Windows'
            : /Linux/.test(s)
              ? 'Linux'
              : 'Dispositivo';
  const browser = /Edg\//.test(s)
    ? 'Edge'
    : /OPR\//.test(s)
      ? 'Opera'
      : /Firefox\//.test(s)
        ? 'Firefox'
        : /Chrome\//.test(s)
          ? 'Chrome'
          : /Safari\//.test(s)
            ? 'Safari'
            : 'navegador';
  const Icon = device === 'iPhone' || device === 'Android' ? Smartphone : device === 'iPad' ? Tablet : device === 'Mac' ? Laptop : Monitor;
  const label = device === 'Dispositivo' && browser === 'navegador' ? 'Dispositivo sin identificar' : `${browser} en ${device}`;
  return { label, Icon };
}

const PROVIDERS = [
  { id: 'apple', name: 'Apple', Logo: AppleLogo },
  { id: 'google', name: 'Google', Logo: GoogleLogo },
] as const;

function Group({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 pl-4 text-[13px] font-semibold text-ink">{title}</h3>
      <div className="surface divide-y divide-line overflow-hidden">{children}</div>
      {footer && <p className="mt-2 px-4 text-[12px] text-ink-2">{footer}</p>}
    </div>
  );
}

/** Settings → Seguridad: linked sign-in providers, open sessions and sign-out. */
export function SecuritySettings() {
  const { currentUser, addToast } = useStore();
  const { data: current } = authClient.useSession();
  const { signOut, signingOut } = useSignOut();
  const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([authClient.listAccounts(), authClient.listSessions()]);
    setAccounts((a.data as AccountRow[] | null) ?? []);
    setSessions(((s.data as SessionRow[] | null) ?? []).sort((x, y) => +new Date(y.updatedAt) - +new Date(x.updatedAt)));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    void load();
  }, [load]);

  const revoke = async (token: string) => {
    setBusy(token);
    const { error } = await authClient.revokeSession({ token });
    setBusy(null);
    if (error) return addToast({ title: 'No se pudo cerrar esa sesión', type: 'error' });
    setSessions((prev) => prev?.filter((s) => s.token !== token) ?? null);
    addToast({ title: 'Sesión cerrada', description: 'Ese dispositivo saldrá en unos minutos.', type: 'success' });
  };

  const revokeOthers = async () => {
    setBusy('others');
    const { error } = await authClient.revokeOtherSessions();
    setBusy(null);
    if (error) return addToast({ title: 'No se pudieron cerrar las sesiones', type: 'error' });
    setSessions((prev) => prev?.filter((s) => s.id === current?.session.id) ?? null);
    addToast({ title: 'Cerraste las demás sesiones', type: 'success' });
  };

  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const others = sessions?.filter((s) => s.id !== current?.session.id).length ?? 0;

  return (
    <>
      <Group title="Inicio de sesión" footer="Nexora no guarda contraseñas: Apple o Google confirman tu identidad cada vez que entras.">
        {PROVIDERS.map(({ id, name, Logo }) => {
          const linked = accounts?.find((a) => a.providerId === id);
          return (
            <div key={id} className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fill-2 text-ink">
                <Logo className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-ink">{name}</p>
                <p className="truncate text-[12px] text-ink-2">
                  {accounts === null ? '…' : linked ? currentUser.email : 'No vinculada'}
                </p>
              </div>
              {linked && (
                <span className="rounded-full bg-green-soft px-2.5 py-1 text-[11px] font-medium text-green-ink">Conectada</span>
              )}
            </div>
          );
        })}
      </Group>

      <Group
        title="Dispositivos con sesión abierta"
        footer="Las sesiones duran 30 días desde el último uso. Al cerrar una, ese dispositivo sale en unos minutos."
      >
        {sessions === null ? (
          <div className="space-y-2 px-4 py-4 sm:px-5">
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sessions.map((s) => {
              const { label, Icon } = describeDevice(s.userAgent);
              const isCurrent = s.id === current?.session.id;
              return (
                <motion.div
                  key={s.id}
                  layout
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: easeApple } }}
                  className="flex items-center gap-3.5 overflow-hidden px-4 py-3.5 sm:px-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-ink">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-ink">{label}</p>
                    <p className="text-[12px] text-ink-2">
                      {isCurrent ? 'Este dispositivo' : `Activa ${formatRelative(new Date(s.updatedAt), now, timeZone).toLowerCase()}`}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-ink">
                      <span className="animate-breathe h-2 w-2 rounded-full bg-green" />
                      Ahora
                    </span>
                  ) : (
                    <Button variant="ghost" size="sm" isLoading={busy === s.token} onClick={() => void revoke(s.token)}>
                      Cerrar
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {others > 0 && (
          <div className="px-4 py-3 sm:px-5">
            <Button variant="plain" size="sm" className="-ml-3.5" isLoading={busy === 'others'} onClick={() => void revokeOthers()}>
              Cerrar las demás sesiones
            </Button>
          </div>
        )}
      </Group>

      <div className="flex justify-end">
        <Button variant="danger" isLoading={signingOut} onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </>
  );
}
