import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { IncidentSeverity } from '../../lib/types/api';

interface Props {
  severity: IncidentSeverity;
  className?: string;
}

export function IncidentSeverityBadge({ severity, className = '' }: Props) {
  let icon = <Info className="w-3.5 h-3.5 text-foreground-muted" aria-hidden="true" />;
  let style = 'bg-surface-muted text-foreground-muted border-border';

  switch (severity) {
    case 'CRITICAL':
      icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
      style = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-600 font-bold';
      break;
    case 'HIGH':
      icon = <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />;
      style = 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-600 font-semibold';
      break;
    case 'MEDIUM':
      icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
      style = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600';
      break;
    case 'LOW':
      icon = <Info className="w-3.5 h-3.5 text-foreground-muted" aria-hidden="true" />;
      style = 'bg-surface-muted text-foreground-muted border-border';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${style} ${className}`}
      role="status"
      aria-label={`Severity: ${severity}`}
    >
      {icon}
      <span>{severity}</span>
    </span>
  );
}
