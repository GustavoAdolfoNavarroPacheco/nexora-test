import {
  House,
  FolderClosed,
  ListChecks,
  Users,
  Clock3,
  ChartColumnBig,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { name: 'Inicio', href: '/', icon: House },
  { name: 'Proyectos', href: '/proyectos', icon: FolderClosed },
  { name: 'Tareas', href: '/tareas', icon: ListChecks },
];

export const teamNav: NavItem[] = [
  { name: 'Equipo', href: '/equipo', icon: Users },
  { name: 'Actividad', href: '/actividad', icon: Clock3 },
  { name: 'Reportes', href: '/reportes', icon: ChartColumnBig },
];

export const systemNav: NavItem[] = [{ name: 'Configuración', href: '/configuracion', icon: Settings }];

export const allNav = [...primaryNav, ...teamNav, ...systemNav];

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForPath(pathname: string): string {
  const match = allNav.find((n) => isActivePath(pathname, n.href));
  return match?.name ?? 'Nexora';
}
