import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ArrowRight,
  User,
  Hash,
  ChevronDown,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';
import { EntityCode } from '../../../components/shared/EntityCode';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { useOperationalEventsFeed } from '../hooks/useControlTower';
import type { OperationalEventFeedItem } from '../../../lib/types/api';

export interface OperationalEventsFeedProps {
  expeditionId: string;
}

const ENTITY_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Entity Types', value: '' },
  { label: 'Mission', value: 'MISSION' },
  { label: 'Expedition', value: 'EXPEDITION' },
  { label: 'Transport Leg', value: 'TRANSPORT_LEG' },
  { label: 'Cargo Consignment', value: 'CARGO_CONSIGNMENT' },
  { label: 'Asset', value: 'ASSET' },
  { label: 'Incident', value: 'INCIDENT' },
  { label: 'Replan', value: 'REPLAN' },
];

export function OperationalEventsFeed({ expeditionId }: OperationalEventsFeedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [entityType, setEntityType] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  // Compute ISO time boundaries from date range filter
  const { fromTime, toTime } = (() => {
    if (dateRange === 'TODAY') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { fromTime: start.toISOString(), toTime: undefined };
    }
    if (dateRange === '24H') {
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return { fromTime: start.toISOString(), toTime: undefined };
    }
    if (dateRange === '7D') {
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return { fromTime: start.toISOString(), toTime: undefined };
    }
    return { fromTime: undefined, toTime: undefined };
  })();

  const {
    data: events,
    isLoading,
    error,
  } = useOperationalEventsFeed(expeditionId, {
    entity_type: entityType || undefined,
    event_type: eventType.trim() || undefined,
    from_time: fromTime,
    to_time: toTime,
    page,
    page_size: pageSize,
  });

  // ESC key closes expanded overlay
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Click outside closes expanded overlay
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
      setIsExpanded(false);
    }
  };

  const toggleEvidence = (eventId: string) => {
    setExpandedEvidenceIds((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleEntityTypeChange = (val: string) => {
    setEntityType(val);
    setPage(1);
  };

  const handleEventTypeChange = (val: string) => {
    setEventType(val);
    setPage(1);
  };

  const clearFilters = () => {
    setEntityType('');
    setEventType('');
    setDateRange('ALL');
    setPage(1);
  };

  const items = events ?? [];
  const previewItems = items.slice(0, 4);
  const hasActiveFilters = Boolean(entityType || eventType || dateRange !== 'ALL');

  const formatShortTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  const formatFullDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC`;
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* ── Compact Default Activity Card (Requirement 8 & 10) ─────────── */}
      <section
        aria-label="Activity"
        className="rounded-lg bg-surface border border-border shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                className="text-sm font-bold text-foreground leading-tight"
                aria-label="Operational Events Feed"
              >
                Activity
              </h2>
              <p className="text-[11px] text-foreground-muted">Recent operational changes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-expanded={isExpanded}
            aria-label="View activity"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-foreground hover:bg-surface-elevated hover:border-accent/40 transition-colors shadow-sm"
          >
            <span>View activity</span>
            <ChevronDown className="w-3.5 h-3.5 text-foreground-muted" />
          </button>
        </div>

        {/* Compact Content: newest 3–5 events */}
        <div className="p-3">
          {isLoading ? (
            <div className="py-2">
              <LoadingSkeleton lines={3} />
            </div>
          ) : error ? (
            <div className="py-2 text-xs">
              <ErrorDisplay error={error} title="Failed to load operational events" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center">
              <EmptyState
                title="No operational events recorded"
                message="Operational mutations will be logged here."
              />
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {previewItems.map((event: OperationalEventFeedItem) => (
                <div
                  key={event.event_id}
                  className="py-2.5 px-2 hover:bg-surface-elevated/60 rounded-md transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] text-foreground-muted font-medium shrink-0">
                      {formatShortTime(event.occurred_at || (event as any).timestamp)}
                    </span>
                    <EntityCode code={`${event.entity_type}:${event.entity_id}`} />
                    <span className="font-semibold text-foreground truncate">
                      {event.event_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {event.previous_state && event.new_state && (
                      <span className="font-mono text-[10px] text-foreground-muted flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-surface-elevated border border-border">
                          {event.previous_state}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-foreground-muted" />
                        <span className="px-1.5 py-0.2 rounded bg-accent/10 border border-accent/25 text-accent font-semibold">
                          {event.new_state}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Expanded Activity Overlay Modal/Drawer (Requirement 9-11) ──── */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-activity-title"
        >
          <div
            ref={overlayRef}
            className="w-full max-w-3xl max-h-[85vh] bg-surface border border-border rounded-2xl shadow-theme-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-elevated flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-accent/15 text-accent">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="expanded-activity-title" className="text-base font-bold text-foreground">
                    Activity & Operational Event Log
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Complete immutable operational ledger &bull; {items.length} records on current page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close activity log"
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Filter Row (Requirement 11) */}
            <div className="p-4 border-b border-border bg-surface space-y-3 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {/* Search / Event Type */}
                <div className="sm:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                  <input
                    type="text"
                    aria-label="Filter events by event type"
                    placeholder="Search event type (e.g. MissionApproved)..."
                    value={eventType}
                    onChange={(e) => handleEventTypeChange(e.target.value)}
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>

                {/* Entity Dropdown */}
                <div>
                  <select
                    aria-label="Filter events by entity type"
                    value={entityType}
                    onChange={(e) => handleEntityTypeChange(e.target.value)}
                    className="w-full h-8 text-xs bg-surface border border-border text-foreground rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer"
                  >
                    {ENTITY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label="Filter events by date"
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-8 text-xs bg-surface border border-border text-foreground rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer"
                  >
                    <option value="ALL">All Dates</option>
                    <option value="TODAY">Today</option>
                    <option value="24H">Last 24 Hours</option>
                    <option value="7D">Last 7 Days</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      title="Clear filters"
                      aria-label="Clear active filters"
                      className="p-1.5 rounded-lg border border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-elevated shrink-0 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Event Records List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="py-4">
                  <LoadingSkeleton lines={5} />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  title="No operational events match criteria"
                  message="Try clearing your filters or changing date ranges."
                />
              ) : (
                items.map((event: OperationalEventFeedItem) => {
                  const isEvidenceExpanded = Boolean(expandedEvidenceIds[event.event_id]);
                  return (
                    <div
                      key={event.event_id}
                      className="p-3.5 rounded-xl bg-surface-elevated border border-border hover:border-accent/40 transition-colors space-y-2.5"
                    >
                      {/* Top Bar: Event Type, Entity, Timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">
                            {event.event_type}
                          </span>
                          <EntityCode code={`${event.entity_type}:${event.entity_id}`} />
                        </div>
                        <span className="font-mono text-[11px] text-foreground-muted">
                          {formatFullDate(event.occurred_at || (event as any).timestamp)}
                        </span>
                      </div>

                      {/* State Transition */}
                      {event.previous_state && event.new_state && (
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-foreground-muted">State:</span>
                          <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-foreground font-semibold">
                            {event.previous_state}
                          </span>
                          <ArrowRight className="w-3 h-3 text-foreground-muted" />
                          <span className="px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent font-bold">
                            {event.new_state}
                          </span>
                        </div>
                      )}

                      {/* Expandable Technical Audit Details (Requirement 10) */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] font-mono text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-foreground-muted" />
                            <span>{event.actor_id || event.actor_type || (event as any).actor || 'System'}</span>
                          </span>
                          <span>&bull;</span>
                          <span>Source: {event.source}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleEvidence(event.event_id)}
                          aria-expanded={isEvidenceExpanded}
                          aria-label={`Show evidence & details for event ${event.event_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                        >
                          <span>{isEvidenceExpanded ? 'Hide details' : 'Show evidence & details'}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isEvidenceExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Deep Audit Inspection Panel */}
                      {isEvidenceExpanded && (
                        <div className="mt-2.5 p-3 rounded-lg bg-surface border border-border text-xs font-mono space-y-2 animate-in fade-in duration-100">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-border/50 text-[11px]">
                            <span className="text-foreground-muted flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>Correlation: {event.correlation_id || 'None'}</span>
                            </span>
                            <ProvenanceTag provenance={event.data_provenance || 'DERIVED'} />
                          </div>

                          {event.evidence && Object.keys(event.evidence).length > 0 ? (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase font-bold text-foreground-muted">
                                Evidence Payload:
                              </div>
                              <div className="space-y-1 pl-1">
                                {Object.entries(event.evidence).map(([key, val]) => (
                                  <div key={key} className="text-[11px] text-foreground-secondary flex gap-2">
                                    <span className="text-foreground-muted">{key}:</span>
                                    <span className="text-foreground">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-foreground-muted italic">
                              No additional structured evidence recorded.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-3 border-t border-border bg-surface flex items-center justify-between text-xs text-foreground-muted shrink-0">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous events page"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground font-medium hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-mono font-medium">Page {page}</span>

              <button
                type="button"
                disabled={items.length < pageSize || isLoading}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next events page"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground font-medium hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
