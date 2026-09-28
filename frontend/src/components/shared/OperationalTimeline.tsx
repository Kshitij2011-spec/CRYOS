import { useState } from 'react';
import {
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Radio,
  FileText,
  Share2,
  WifiOff,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useOperationalTimeline } from '../../features/operations/hooks/useOperationalTimeline';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorDisplay } from './ErrorDisplay';
import { ProvenanceTag } from './ProvenanceTag';
import type { TimelineEntry, TimelineEntryType } from '../../lib/types/api';

interface Props {
  entityType: string;
  entityId: string;
  title?: string;
  defaultIncludeRelated?: boolean;
  showIncludeRelatedToggle?: boolean;
}

function getEntryTypeBadge(type: TimelineEntryType) {
  switch (type) {
    case 'OPERATIONAL_EVENT':
      return {
        label: 'EVENT',
        icon: Radio,
        color: 'text-cyan-700 border-cyan-200 bg-cyan-50 dark:text-cyan-400 dark:border-cyan-800 dark:bg-cyan-950/60',
        dot: 'border-cyan-500 bg-cyan-400',
      };
    case 'AUDIT_RECORD':
      return {
        label: 'AUDIT',
        icon: FileText,
        color: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/60',
        dot: 'border-amber-500 bg-amber-400',
      };
    case 'PROPAGATION_RECORD':
      return {
        label: 'PROPAGATION',
        icon: Share2,
        color: 'text-purple-700 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-950/60',
        dot: 'border-purple-500 bg-purple-400',
      };
    case 'OFFLINE_SYNC':
      return {
        label: 'SYNC',
        icon: WifiOff,
        color: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60',
        dot: 'border-emerald-500 bg-emerald-400',
      };
    default:
      return {
        label: 'RECORD',
        icon: Radio,
        color: 'text-foreground-muted border-border bg-surface-muted',
        dot: 'border-border bg-foreground-muted',
      };
  }
}

export function OperationalTimeline({
  entityType,
  entityId,
  title = 'Operational History & Event Journal',
  defaultIncludeRelated = false,
  showIncludeRelatedToggle = true,
}: Props) {
  const [includeRelated, setIncludeRelated] = useState(defaultIncludeRelated);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useOperationalTimeline(entityType, entityId, {
    includeRelated,
    order,
    page,
    pageSize: 20,
  });

  const entries: TimelineEntry[] = Array.isArray(data?.entries) ? data.entries : [];
  const totalEntries = data?.total_entries ?? entries.length;

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-foreground tracking-wide">{title}</h4>
          {data && (
            <span className="px-2 py-0.5 rounded-full bg-surface-muted text-foreground-muted text-[10px]">
              {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Include Related Toggle */}
          {showIncludeRelatedToggle && (
            <label className="flex items-center gap-1.5 cursor-pointer text-foreground-muted hover:text-foreground select-none text-[11px]">
              <input
                type="checkbox"
                checked={includeRelated}
                onChange={(e) => {
                  setIncludeRelated(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-border bg-surface text-accent focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Include Related</span>
            </label>
          )}

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-elevated hover:bg-surface-muted border border-border text-foreground text-[11px] transition-colors"
            title="Toggle chronological order"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{order === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading && <LoadingSkeleton lines={4} />}

      {error && <ErrorDisplay error={error} />}

      {!isLoading && !error && data && entries.length === 0 && (
        <div className="p-6 text-center text-foreground-muted border border-border rounded-lg bg-surface-muted/50">
          No operational history or events recorded for this entity.
        </div>
      )}

      {!isLoading && !error && data && entries.length > 0 && (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {entries.map((entry: TimelineEntry) => {
            const typeInfo = getEntryTypeBadge(entry.entry_type);
            const Icon = typeInfo.icon;
            const isExpanded = !!expandedEntries[entry.id];
            const hasDetails = entry.details && Object.keys(entry.details).length > 0;

            return (
              <div key={entry.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-surface border-2 ${typeInfo.dot} flex items-center justify-center`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                </div>

                {/* Timeline Item Card */}
                <div className="p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong space-y-2 transition-colors">
                  {/* Row 1: Header (Badge, Action Name, Timestamp) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${typeInfo.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {typeInfo.label}
                      </span>
                      <span className="font-semibold text-foreground">
                        {entry.event_or_action}
                      </span>
                      {entry.audit_action && entry.audit_action !== entry.event_or_action && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px]">
                          Audit: {entry.audit_action}
                        </span>
                      )}
                      {entry.related_entity_type && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-[10px]">
                          Related: {entry.related_entity_type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-foreground-muted text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>

                  {/* Row 2: State Transitions / Description */}
                  {entry.previous_state && entry.new_state ? (
                    <div className="flex items-center gap-2 py-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-surface-muted text-foreground-muted border border-border">
                        {entry.previous_state}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-foreground-muted" />
                      <span className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/30 font-medium">
                        {entry.new_state}
                      </span>
                    </div>
                  ) : entry.description ? (
                    <p className="text-foreground-secondary text-[11px] leading-relaxed">
                      {entry.description}
                    </p>
                  ) : null}

                  {/* Row 3: Footer Metadata (Actor, CID, Provenance, Expand Toggle) */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-foreground-muted border-t border-border">
                    <div className="flex items-center gap-3">
                      <span>
                        Actor:{' '}
                        <span className="text-foreground">
                          {entry.actor_id ? entry.actor_id.slice(0, 8) : entry.actor_type ?? 'SYSTEM'}
                        </span>
                      </span>

                      {entry.correlation_id && (
                        <span title={`Correlation ID: ${entry.correlation_id}`}>
                          CID:{' '}
                          <span className="text-foreground font-mono">
                            {entry.correlation_id.slice(0, 8)}…
                          </span>
                        </span>
                      )}

                      <ProvenanceTag provenance={entry.data_provenance} />
                    </div>

                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(entry.id)}
                        className="flex items-center gap-1 text-accent hover:underline transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && hasDetails && (
                    <div className="mt-2 p-2.5 rounded bg-surface-muted border border-border text-[11px] text-foreground overflow-x-auto">
                      <pre className="font-mono whitespace-pre-wrap break-all">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && data && data.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-foreground-muted">
          <span>
            Page {data.page} of {data.total_pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-surface-elevated hover:bg-surface-muted border border-border disabled:opacity-40 disabled:cursor-not-allowed text-foreground transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= data.total_pages}
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              className="p-1 rounded bg-surface-elevated hover:bg-surface-muted border border-border disabled:opacity-40 disabled:cursor-not-allowed text-foreground transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
