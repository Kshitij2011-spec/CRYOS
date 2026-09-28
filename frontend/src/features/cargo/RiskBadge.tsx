import type { CargoRiskLevel } from '../../lib/types/api';

interface Props {
  level: CargoRiskLevel;
  className?: string;
}

const RISK_STYLES: Record<CargoRiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  NOMINAL:  { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-300 dark:border-emerald-800/60', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  MODERATE: { bg: 'bg-amber-50 dark:bg-amber-950/50',     border: 'border-amber-300 dark:border-amber-800/60',     text: 'text-amber-800 dark:text-amber-300',     dot: 'bg-amber-500 dark:bg-amber-400'   },
  ELEVATED: { bg: 'bg-orange-50 dark:bg-orange-950/50',   border: 'border-orange-300 dark:border-orange-800/60',   text: 'text-orange-800 dark:text-orange-300',   dot: 'bg-orange-500 dark:bg-orange-400'  },
  CRITICAL: { bg: 'bg-rose-50 dark:bg-rose-950/50',       border: 'border-rose-300 dark:border-rose-800/60',       text: 'text-rose-800 dark:text-rose-300',       dot: 'bg-rose-500 dark:bg-rose-400'    },
};

export function RiskBadge({ level, className = '' }: Props) {
  const style = RISK_STYLES[level] ?? {
    bg: 'bg-surface-muted',
    border: 'border-border',
    text: 'text-foreground-muted',
    dot: 'bg-foreground-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.border} ${style.text} ${className}`}
      aria-label={`Risk level: ${level}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {level}
    </span>
  );
}
