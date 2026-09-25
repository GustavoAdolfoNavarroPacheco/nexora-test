/** The app icon. Two offset capsules — a project handed from one teammate to the next. */
export function NexoraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <rect x="7" y="9" width="12" height="6" rx="3" fill="white" />
      <rect x="13" y="17" width="12" height="6" rx="3" fill="white" fillOpacity="0.72" />
    </svg>
  );
}
