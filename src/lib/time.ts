const DAY_MS = 86_400_000;

/** Calendar day (YYYY-MM-DD) for an instant, in the given IANA time zone. */
export function dayIn(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function addDays(isoDay: string, days: number): string {
  const d = new Date(`${isoDay}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round((Date.parse(`${toDay}T12:00:00Z`) - Date.parse(`${fromDay}T12:00:00Z`)) / DAY_MS);
}

/** "Justo ahora", "Hace 5 min", "Hace 2 horas", "Ayer a las 17:30", "Hace 3 días", "12 sept". */
export function formatRelative(instant: Date, now: Date, timeZone: string): string {
  const diffMin = Math.floor((now.getTime() - instant.getTime()) / 60_000);
  if (diffMin < 1) return 'Justo ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const days = daysBetween(dayIn(instant, timeZone), dayIn(now, timeZone));
  if (days === 0) {
    const hours = Math.floor(diffMin / 60);
    return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
  }
  if (days === 1) {
    const time = new Intl.DateTimeFormat('es-ES', { timeZone, hour: '2-digit', minute: '2-digit' }).format(instant);
    return `Ayer a las ${time}`;
  }
  if (days < 7) return `Hace ${days} días`;
  return new Intl.DateTimeFormat('es-ES', { timeZone, day: 'numeric', month: 'short' }).format(instant).replace('.', '');
}
