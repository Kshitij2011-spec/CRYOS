interface Props {
  provenance?: string;
  className?: string;
}

const PROVENANCE_STYLES: Record<string, string> = {
  SYNTHETIC_DEMO: 'text-foreground-muted border-[var(--border-color)]',
  MEASURED:       'text-status-success border-green-400/40 dark:border-green-700',
  DERIVED:        'text-accent border-[var(--accent-cyan)]/40',
  FORECAST:       'text-violet-600 border-violet-400/40 dark:text-violet-400 dark:border-violet-700',
  SCENARIO:       'text-status-warning border-amber-400/40 dark:border-amber-700',
  ADVISORY:       'text-accent border-[var(--accent-cyan)]/40',
};

export function ProvenanceTag({ provenance = 'SYNTHETIC_DEMO', className = '' }: Props) {
  const key = provenance.replace('/', '_');
  const style = PROVENANCE_STYLES[key] ?? PROVENANCE_STYLES.SYNTHETIC_DEMO;
  const label = provenance === 'SYNTHETIC_DEMO' ? 'SYNTHETIC/DEMO' : provenance;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border bg-surface-elevated ${style} ${className}`}
      title={`Data provenance: ${label}`}
      aria-label={`Data provenance: ${label}`}
    >
      [{label}]
    </span>
  );
}
