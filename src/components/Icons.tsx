/* A few functional glyphs: status, theme and disclosure. No decorative icons. */

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CrossIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DotIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} aria-hidden="true">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function MarkIcon() {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={3} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function StatusIcon({ status }: { status?: 'solved' | 'attempted' }) {
  if (status === 'solved')
    return (
      <span className="status-dot status-solved" title="Solved">
        <CheckIcon />
        <span className="sr-only">Solved</span>
      </span>
    );
  if (status === 'attempted')
    return (
      <span className="status-dot status-attempted" title="Attempted">
        <DotIcon />
        <span className="sr-only">Attempted</span>
      </span>
    );
  return <span className="status-dot" aria-hidden="true" />;
}
