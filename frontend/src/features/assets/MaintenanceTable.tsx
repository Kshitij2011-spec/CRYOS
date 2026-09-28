import { StatusBadge } from '../../components/shared/StatusBadge';
import type { MaintenanceRecord } from '../../lib/types/api';

interface Props {
  records: MaintenanceRecord[];
  selectedRecordId?: string | null;
  onSelectRecord: (record: MaintenanceRecord) => void;
  isLoading?: boolean;
}

export function MaintenanceTable({
  records,
  selectedRecordId,
  onSelectRecord,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Loading maintenance records...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-6 text-center text-foreground-muted text-sm border border-border rounded bg-surface-muted">
        No maintenance records found for this asset.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-border bg-surface">
      <table className="w-full text-left text-xs" role="table" aria-label="Maintenance records table">
        <thead className="bg-surface-muted text-xs font-semibold text-foreground-secondary uppercase tracking-[0.05em] border-b border-border">
          <tr>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-center">Priority</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Technician</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-sm">
          {records.map((rec) => {
            const isSelected = selectedRecordId === rec.id;
            return (
              <tr
                key={rec.id}
                className={`transition-colors hover:bg-surface-elevated ${
                  isSelected ? 'bg-cyan-50/70 dark:bg-cyan-950/30' : ''
                }`}
              >
                <td className="px-3 py-2 font-semibold text-foreground">
                  {rec.maintenance_type}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold border ${
                      rec.priority === 1
                        ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700'
                        : rec.priority === 2
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700'
                        : 'bg-surface-muted text-foreground-secondary border-border'
                    }`}
                  >
                    P{rec.priority}
                  </span>
                </td>
                <td className="px-3 py-2 text-foreground-secondary whitespace-nowrap">
                  {new Date(rec.scheduled_start_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-foreground">
                  {rec.technician_name ?? '-'}
                </td>
                <td className="px-3 py-2 text-foreground-secondary max-w-[180px] truncate" title={rec.description}>
                  {rec.description}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectRecord(rec)}
                    className={`px-2 py-1 rounded text-xs transition-colors font-medium border ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white dark:bg-cyan-700 dark:border-cyan-600 dark:text-cyan-100'
                        : 'bg-surface-elevated hover:bg-surface-muted text-foreground border-border'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Action'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
