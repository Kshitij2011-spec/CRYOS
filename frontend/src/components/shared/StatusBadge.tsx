import type { LocationStatus } from '../../lib/types/api';
import type { CargoStatus, CargoRiskLevel, CargoPackageStatus, TransportStatus } from '../../lib/types/api';

type AnyStatus = LocationStatus | CargoStatus | CargoRiskLevel | CargoPackageStatus | TransportStatus | string;

/**
 * Status badge styles use Tailwind's dark: variant so they adapt correctly
 * in both light and dark themes. Text is darker in light mode, lighter in dark.
 */
const STATUS_STYLES: Record<string, string> = {
  // Location
  AVAILABLE:    'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600',
  RESTRICTED:   'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-950/70   dark:text-amber-300   dark:border-amber-600',
  INACCESSIBLE: 'bg-rose-50     text-rose-800    border-rose-300    dark:bg-rose-950/70    dark:text-rose-300    dark:border-rose-600',
  CLOSED:       'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
  // Transport
  PLANNED:      'bg-sky-50      text-sky-800     border-sky-300     dark:bg-sky-900/50     dark:text-sky-300     dark:border-sky-700',
  BOOKED:       'bg-blue-50     text-blue-800    border-blue-300    dark:bg-blue-900/50    dark:text-blue-300    dark:border-blue-700',
  READY:        'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  DEPARTED:     'bg-cyan-50     text-cyan-800    border-cyan-300    dark:bg-cyan-900/50    dark:text-cyan-300    dark:border-cyan-700',
  IN_TRANSIT:   'bg-cyan-50     text-cyan-800    border-cyan-300    dark:bg-cyan-900/50    dark:text-cyan-300    dark:border-cyan-700',
  ARRIVED:      'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  DELAYED:      'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  DIVERTED:     'bg-orange-50   text-orange-800  border-orange-300  dark:bg-orange-900/50  dark:text-orange-300  dark:border-orange-700',
  CANCELLED:    'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
  // Cargo lifecycle
  REQUESTED:    'bg-sky-50      text-sky-800     border-sky-300     dark:bg-sky-900/50     dark:text-sky-300     dark:border-sky-700',
  DECLARED:     'bg-blue-50     text-blue-800    border-blue-300    dark:bg-blue-900/50    dark:text-blue-300    dark:border-blue-700',
  APPROVED:     'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  PACKED:       'bg-teal-50     text-teal-800    border-teal-300    dark:bg-teal-900/50    dark:text-teal-300    dark:border-teal-700',
  DISPATCHED:   'bg-cyan-50     text-cyan-800    border-cyan-300    dark:bg-cyan-900/50    dark:text-cyan-300    dark:border-cyan-700',
  RECEIVED:     'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  HELD:         'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  DAMAGED:      'bg-rose-50     text-rose-800    border-rose-300    dark:bg-rose-900/50    dark:text-rose-300    dark:border-rose-700',
  LOST:         'bg-rose-100    text-rose-900    border-rose-400    dark:bg-rose-900/60    dark:text-rose-200    dark:border-rose-600',
  REJECTED:     'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
  // Risk & Severity
  NOMINAL:      'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  MODERATE:     'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  ELEVATED:     'bg-orange-50   text-orange-800  border-orange-300  dark:bg-orange-900/50  dark:text-orange-300  dark:border-orange-700',
  LOW:          'bg-slate-100   text-slate-700   border-slate-300   dark:bg-slate-700/50   dark:text-slate-300   dark:border-slate-600',
  MEDIUM:       'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  HIGH:         'bg-orange-50   text-orange-800  border-orange-300  dark:bg-orange-900/50  dark:text-orange-300  dark:border-orange-700',
  CRITICAL:     'bg-rose-100    text-rose-900    border-rose-400    dark:bg-rose-900/60    dark:text-rose-200    dark:border-rose-600',
  // Package
  LOADED:       'bg-cyan-50     text-cyan-800    border-cyan-300    dark:bg-cyan-900/50    dark:text-cyan-300    dark:border-cyan-700',
  ISSUED:       'bg-teal-50     text-teal-800    border-teal-300    dark:bg-teal-900/50    dark:text-teal-300    dark:border-teal-700',
  RETURNED:     'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
  QUARANTINED:  'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  // Inventory
  ON_ORDER:     'bg-blue-50     text-blue-800    border-blue-300    dark:bg-blue-900/50    dark:text-blue-300    dark:border-blue-700',
  INBOUND:      'bg-cyan-50     text-cyan-800    border-cyan-300    dark:bg-cyan-900/50    dark:text-cyan-300    dark:border-cyan-700',
  RESERVED:     'bg-indigo-50   text-indigo-800  border-indigo-300  dark:bg-indigo-900/50  dark:text-indigo-300  dark:border-indigo-700',
  CONSUMED:     'bg-purple-50   text-purple-800  border-purple-300  dark:bg-purple-900/50  dark:text-purple-300  dark:border-purple-700',
  TRANSFERRED:  'bg-violet-50   text-violet-800  border-violet-300  dark:bg-violet-900/50  dark:text-violet-300  dark:border-violet-700',
  DISPOSED:     'bg-zinc-100    text-zinc-600    border-zinc-300    dark:bg-zinc-800       dark:text-zinc-400    dark:border-zinc-600',
  // Asset
  IN_USE:       'bg-blue-50     text-blue-800    border-blue-300    dark:bg-blue-900/50    dark:text-blue-300    dark:border-blue-700',
  MAINTENANCE:  'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  RETIRED:      'bg-zinc-100    text-zinc-600    border-zinc-300    dark:bg-zinc-800       dark:text-zinc-400    dark:border-zinc-600',
  OPERATIONAL:  'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  DEGRADED:     'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  INOPERABLE:   'bg-rose-100    text-rose-900    border-rose-400    dark:bg-rose-900/60    dark:text-rose-200    dark:border-rose-600',
  // Maintenance
  SCHEDULED:    'bg-sky-50      text-sky-800     border-sky-300     dark:bg-sky-900/50     dark:text-sky-300     dark:border-sky-700',
  IN_PROGRESS:  'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  OVERDUE:      'bg-rose-100    text-rose-900    border-rose-400    dark:bg-rose-900/60    dark:text-rose-200    dark:border-rose-600',
  COMPLETED:    'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  // Incident
  OPEN:         'bg-rose-50     text-rose-800    border-rose-300    dark:bg-rose-900/50    dark:text-rose-300    dark:border-rose-700',
  ACKNOWLEDGED: 'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  MITIGATING:   'bg-indigo-50   text-indigo-800  border-indigo-300  dark:bg-indigo-900/50  dark:text-indigo-300  dark:border-indigo-700',
  RESOLVED:     'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  // Mission readiness
  AT_RISK:      'bg-amber-50    text-amber-800   border-amber-300   dark:bg-amber-900/50   dark:text-amber-300   dark:border-amber-700',
  BLOCKED:      'bg-rose-100    text-rose-900    border-rose-400    dark:bg-rose-900/60    dark:text-rose-200    dark:border-rose-600',
  UNKNOWN:      'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
  ACTIVE:       'bg-emerald-50  text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
  PROPOSED:     'bg-sky-50      text-sky-800     border-sky-300     dark:bg-sky-900/50     dark:text-sky-300     dark:border-sky-700',
  DEFERRED:     'bg-slate-100   text-slate-600   border-slate-300   dark:bg-slate-700/50   dark:text-slate-400   dark:border-slate-600',
};

interface Props {
  status: AnyStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: Props) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-[0.02em] border ${style} ${className}`}
      role="status"
      aria-label={`Status: ${label ?? status}`}
    >
      {label ?? status}
    </span>
  );
}
