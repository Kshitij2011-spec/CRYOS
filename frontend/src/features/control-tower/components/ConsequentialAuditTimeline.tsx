import { useState } from 'react';
import {
  FileCheck2,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useConsequentialAudit } from '../hooks/useControlTower';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { EmptyState } from '../../../components/shared/EmptyState';
import type { ConsequentialActionItem } from '../../../lib/types/api';

export interface ConsequentialAuditTimelineProps {
  expeditionId: string;
}

export function ConsequentialAuditTimeline({
  expeditionId,
}: ConsequentialAuditTimelineProps) {
  const [page, setPage] = useState(1);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useConsequentialAudit(expeditionId, page);

  const items: ConsequentialActionItem[] = Array.isArray(data) ? data : [];

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
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
    <section
      aria-labelledby="consequential-audit-heading"
      className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-border flex flex-wrap items-center justify-between gap-2.5 bg-surface">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <div>
            <span className="eyebrow">AUDIT</span>
            <h2
              id="consequential-audit-heading"
              className="text-base font-bold text-foreground tracking-wide flex items-center gap-2"
            >
              <span>Audit Trail</span>
              <span className="sr-only">Consequential Audit Timeline</span>
              {items.length > 0 && (
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-surface-muted text-foreground-muted border border-border">
                  {items.length} {items.length === 1 ? 'record' : 'records'}
                </span>
              )}
            </h2>
            <p className="text-xs text-foreground-muted">
              Permanent record of operational changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvenanceTag
            provenance={items[0]?.data_provenance ?? 'DERIVED'}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4">
        {/* Loading State */}
        {isLoading && (
          <div aria-busy="true" className="space-y-3">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={4} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorDisplay
            error={error}
            title="Failed to load consequential audit trail"
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            title="No consequential audit records"
            message="No approved decisions or operational changes have been executed for this expedition yet."
          />
        )}

        {/* Loaded Timeline */}
        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-3">
            <div className="relative pl-6 space-y-3 max-h-[290px] overflow-y-auto pr-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {items.map((item: ConsequentialActionItem) => {
                const key = item.approval_id;
                const isExpanded = !!expandedEntries[key];
                const hasAppliedChanges =
                  item.applied_changes && item.applied_changes.length > 0;
                const isApproved = item.decision === 'APPROVED';

                return (
                  <div key={key} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-6 top-2 w-4 h-4 rounded-full bg-surface border-2 ${
                        isApproved
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-rose-500 text-rose-600 dark:text-rose-400'
                      } flex items-center justify-center shadow-xs`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-90" />
                    </div>

                    {/* Timeline Card */}
                    <div className="p-3 sm:p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong transition-colors space-y-2.5 shadow-xs">
                      {/* Row 1: Decision, Action Summary, Timestamp */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={item.decision ?? 'APPROVED'} />
                          <h3 className="text-sm font-semibold text-foreground">
                            {item.action_summary}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted">
                          <Clock className="w-3.5 h-3.5 text-foreground-muted" />
                          <span>{formatDate(item.decided_at ?? item.created_at)}</span>
                        </div>
                      </div>

                      {/* Row 2: Human Governance Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2.5 rounded bg-surface-muted border border-border text-xs font-mono text-foreground-secondary">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="text-foreground-muted">Operator:</span>
                          <span className="text-foreground font-semibold truncate">
                            {item.approver_person_id}
                          </span>
                        </div>

                        {item.approver_role && (
                          <div>
                            <span className="text-foreground-muted">Role: </span>
                            <span className="text-foreground-secondary">{item.approver_role}</span>
                          </div>
                        )}

                        {item.resulting_event_id && (
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-foreground-muted">Event ID: </span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold truncate">
                              {item.resulting_event_id}
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] text-foreground-muted truncate">
                          <span>Rec: </span>
                          <span className="text-foreground-secondary">{item.recommendation_id}</span>
                        </div>

                        {item.replan_id && (
                          <div className="text-[11px] text-foreground-muted truncate">
                            <span>Replan: </span>
                            <span className="text-foreground-secondary">{item.replan_id}</span>
                          </div>
                        )}

                        {item.correlation_id && (
                          <div className="text-[11px] text-foreground-muted truncate">
                            <span>Correlation: </span>
                            <span className="text-foreground-secondary">{item.correlation_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Row 3: Human Operator Comment / Justification */}
                      {item.comment && (
                        <div className="text-xs text-foreground bg-surface-muted p-2.5 rounded border border-border italic">
                          <span className="not-italic text-foreground-muted font-mono block text-[11px] mb-0.5">
                            Operator Justification:
                          </span>
                          "{item.comment}"
                        </div>
                      )}

                      {/* Row 4: Expandable Applied Operational Changes */}
                      {hasAppliedChanges && (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleExpand(key)}
                            aria-expanded={isExpanded}
                            className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent rounded"
                          >
                            <span>
                              {isExpanded
                                ? 'Hide Executed Operational Changes'
                                : `Show Executed Operational Changes (${item.applied_changes.length})`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-cyan-500">
                              {item.applied_changes.map((ch, chIdx) => (
                                <div
                                  key={chIdx}
                                  className="p-2 rounded bg-surface-muted border border-border text-xs font-mono space-y-0.5"
                                >
                                  {typeof ch === 'object' && ch !== null ? (
                                    Object.entries(ch as Record<string, unknown>).map(
                                      ([k, v]) => (
                                        <div key={k} className="flex gap-2">
                                          <span className="text-cyan-600 dark:text-cyan-400">{k}:</span>
                                          <span className="text-foreground">{String(v)}</span>
                                        </div>
                                      ),
                                    )
                                  ) : (
                                    <span>{String(ch)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs font-mono text-foreground-muted">
              <span>Page {page}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-muted text-foreground border border-border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < 20}
                  className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-muted text-foreground border border-border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
