import { Clock } from 'lucide-react';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import type { IncidentTimelineEntry } from '../../lib/types/api';

interface Props {
  entries: IncidentTimelineEntry[];
  isLoading?: boolean;
}

export function IncidentTimeline({ entries, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-foreground-muted text-sm">
        Loading incident timeline...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-foreground-muted text-sm border border-border rounded bg-surface-muted">
        No timeline entries recorded for this incident.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {entries.map((entry) => (
        <div key={entry.id} className="relative group text-sm">
          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-surface border-2 border-rose-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
          </div>

          <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-rose-700 dark:text-rose-300">{entry.event_type}</span>
              <div className="flex items-center gap-1.5 text-foreground-muted text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-foreground">{entry.summary}</p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-foreground-muted border-t border-border/60">
              <span>Actor: {entry.actor ?? 'SYSTEM'}</span>
              <ProvenanceTag provenance={entry.provenance} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
