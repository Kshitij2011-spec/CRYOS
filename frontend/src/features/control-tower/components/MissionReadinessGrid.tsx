import { useState } from 'react';
import {
  Search,
  AlertCircle,
  RotateCcw,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { EntityCode } from '../../../components/shared/EntityCode';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { useMissionOperations } from '../hooks/useControlTower';
import type { ReadinessState, MissionOperationsItem } from '../../../lib/types/api';

export interface MissionReadinessGridProps {
  expeditionId: string;
  onInitiateReplan?: (mission: MissionOperationsItem) => void;
}

const READINESS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Readiness', value: '' },
  { label: 'Ready', value: 'READY' },
  { label: 'At Risk', value: 'AT_RISK' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Unknown', value: 'UNKNOWN' },
];

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Proposed', value: 'PROPOSED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Ready', value: 'READY' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Deferred', value: 'DEFERRED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const READINESS_BADGE_STYLES: Record<ReadinessState | string, string> = {
  READY: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600',
  AT_RISK: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-600',
  BLOCKED: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-600',
  UNKNOWN: 'bg-surface-muted text-foreground-muted border-border',
};

export function MissionReadinessGrid({
  expeditionId,
  onInitiateReplan,
}: MissionReadinessGridProps) {
  const [readinessFilter, setReadinessFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'priority' | 'code' | 'readiness'>('priority');

  const {
    data: missions,
    isLoading,
    error,
  } = useMissionOperations(expeditionId, {
    readiness: (readinessFilter as ReadinessState) || undefined,
    status: statusFilter || undefined,
    page,
    page_size: pageSize,
  });

  // Client-side search over currently loaded page of missions
  const filteredMissions = (missions ?? []).filter((m) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      m.code.toLowerCase().includes(query) ||
      m.title.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query)
    );
  });

  const sortedMissions = [...filteredMissions].sort((a, b) => {
    if (sortBy === 'priority') return a.priority - b.priority;
    if (sortBy === 'code') return a.code.localeCompare(b.code);
    if (sortBy === 'readiness') return a.readiness_state.localeCompare(b.readiness_state);
    return 0;
  });

  const selectedMission =
    sortedMissions.find((m) => m.mission_id === selectedMissionId) ??
    (missions ?? []).find((m) => m.mission_id === selectedMissionId);

  const handleReadinessChange = (value: string) => {
    setReadinessFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const hasFiltersActive = Boolean(readinessFilter || statusFilter || search);

  return (
    <section
      aria-label="Mission Operations & Readiness"
      className="rounded-lg bg-surface border border-border shadow-sm"
    >
      {/* ─── Header & Filters Toolbar ─── */}
      <div className="p-3.5 sm:p-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <p className="eyebrow mb-1">MISSIONS</p>
            <h2 className="text-base font-semibold text-foreground">
              Mission Readiness
            </h2>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {filteredMissions.length} polar missions tracked
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted">
            <span>Showing {filteredMissions.length} missions</span>
          </div>
        </div>

        {/* Filters Row (Requirement 13: Readiness, Status, Search, Sort) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Readiness Pills */}
          <div
            role="group"
            aria-label="Filter by mission readiness"
            className="flex items-center rounded border border-border bg-surface-muted p-0.5"
          >
            {READINESS_FILTER_OPTIONS.map((opt) => {
              const active = readinessFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleReadinessChange(opt.value)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    active
                      ? 'bg-accent/15 text-accent font-semibold border border-accent/40'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="mission-status-filter"
              className="text-xs font-mono text-foreground-muted uppercase tracking-wider"
            >
              Status:
            </label>
            <select
              id="mission-status-filter"
              aria-label="Filter by lifecycle status"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-surface text-foreground text-xs font-mono rounded border border-border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown (Requirement 13) */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="mission-sort-filter"
              className="text-xs font-mono text-foreground-muted uppercase tracking-wider"
            >
              Sort:
            </label>
            <select
              id="mission-sort-filter"
              aria-label="Sort missions"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'code' | 'readiness')}
              className="bg-surface text-foreground text-xs font-mono rounded border border-border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="priority">Priority</option>
              <option value="code">Code</option>
              <option value="readiness">Readiness</option>
            </select>
          </div>

          {/* Client-side Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search missions..."
              aria-label="Search current missions by code or title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface text-foreground text-xs rounded border border-border pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-foreground-muted font-sans"
            />
          </div>
        </div>
      </div>

      {/* ─── Content Area: Loading / Error / Table & Inspector ─── */}
      <div className="p-4">
        {isLoading && (
          <div aria-busy="true" className="py-4">
            <LoadingSkeleton lines={6} />
          </div>
        )}

        {error && (
          <div className="py-4">
            <ErrorDisplay error={error} title="Failed to load mission operations" />
          </div>
        )}

        {!isLoading && !error && sortedMissions.length === 0 && (
          <EmptyState
            title="No missions found"
            message="No missions match the selected operational filters for this expedition."
          />
        )}

        {!isLoading && !error && sortedMissions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Table Column (Requirement 4 & 14: Reduced to 5 clean columns, no horizontal scroll) */}
            <div className={selectedMission ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-sm text-left font-sans" role="table">
                  <thead className="bg-surface-elevated text-[11px] font-mono text-foreground-muted uppercase tracking-wider border-b border-border">
                    <tr>
                      <th scope="col" className="px-3 py-2.5">Mission</th>
                      <th scope="col" className="px-3 py-2.5">Readiness</th>
                      <th scope="col" className="px-3 py-2.5">Status</th>
                      <th scope="col" className="px-3 py-2.5">Priority</th>
                      <th scope="col" className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-xs">
                    {sortedMissions.map((m) => {
                      const isSelected = m.mission_id === selectedMissionId;
                      const rStyle =
                        READINESS_BADGE_STYLES[m.readiness_state] ??
                        READINESS_BADGE_STYLES.UNKNOWN;

                      return (
                        <tr
                          key={m.mission_id}
                          onClick={() =>
                            setSelectedMissionId(isSelected ? null : m.mission_id)
                          }
                          className={`group cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-accent/10 border-l-2 border-l-accent'
                              : 'hover:bg-surface-elevated'
                          }`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMissionId(isSelected ? null : m.mission_id);
                            }
                          }}
                          role="button"
                          aria-pressed={isSelected}
                          aria-label={`Select mission ${m.code}`}
                        >
                          {/* Mission Code, Title, and Type (Requirement 4) */}
                          <td className="px-3 py-2.5 font-sans">
                            <div className="flex items-center gap-2">
                              <EntityCode code={m.code} />
                              <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                                {m.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-foreground-muted block mt-0.5">
                              {m.type}
                            </span>
                          </td>

                          {/* Readiness State */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${rStyle}`}
                              role="status"
                              aria-label={`Readiness: ${m.readiness_state}`}
                            >
                              {m.readiness_state === 'AT_RISK' ? 'AT RISK' : m.readiness_state}
                            </span>
                          </td>

                          {/* Lifecycle Status */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={m.status} />
                          </td>

                          {/* Priority */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-surface-muted text-foreground border border-border">
                              P{m.priority}
                            </span>
                          </td>

                          {/* Action Arrow (Requirement 5: Entire row clickable + right arrow) */}
                          <td className="px-3 py-2.5 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMissionId(isSelected ? null : m.mission_id);
                              }}
                              className="p-1 rounded text-foreground-muted hover:text-accent group-hover:text-accent transition-colors"
                              aria-label={`${isSelected ? 'Close details for' : 'Inspect details for'} ${m.code}`}
                              title={`${isSelected ? 'Close details for' : 'Inspect details for'} ${m.code}`}
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-accent' : ''}`} aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls & View all missions (Requirement 3) */}
              <div className="flex items-center justify-between mt-3 text-xs font-mono text-foreground-muted">
                <div className="flex items-center gap-3">
                  <span>Page {page}</span>
                  {hasFiltersActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setReadinessFilter('');
                        setStatusFilter('');
                        setSearch('');
                        setPage(1);
                      }}
                      className="text-accent hover:underline font-sans text-xs"
                    >
                      View all missions →
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-surface-elevated text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(missions ?? []).length < pageSize}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-surface-elevated text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted"
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Mission Detail Inspector Column ─── */}
            {selectedMission && (
              <div
                className="lg:col-span-5 p-4 rounded-lg bg-surface border border-border space-y-4 shadow-sm"
                aria-label={`Mission inspection panel for ${selectedMission.code}`}
              >
                {/* Inspector Header */}
                <div className="flex items-start justify-between pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <EntityCode code={selectedMission.code} />
                      <span className="text-xs font-mono text-foreground-muted px-1.5 py-0.5 rounded bg-surface-muted border border-border">
                        {selectedMission.type}
                      </span>
                      <span className="text-xs font-mono text-foreground-muted px-1.5 py-0.5 rounded bg-surface-muted border border-border">
                        P{selectedMission.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {selectedMission.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMissionId(null)}
                    className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                    aria-label="Close mission inspection panel"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* State & Provenance */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground-muted font-mono">Status:</span>
                    <StatusBadge status={selectedMission.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground-muted font-mono">Readiness:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                        READINESS_BADGE_STYLES[selectedMission.readiness_state] ??
                        READINESS_BADGE_STYLES.UNKNOWN
                      }`}
                    >
                      {selectedMission.readiness_state}
                    </span>
                  </div>
                  <ProvenanceTag provenance={selectedMission.data_provenance} />
                </div>

                {/* Section 1: Readiness Blockers */}
                <div>
                  <h4 className="text-xs font-mono font-medium text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                    <span>Readiness Blockers ({(selectedMission.readiness_blockers ?? []).length})</span>
                  </h4>
                  {(selectedMission.readiness_blockers ?? []).length === 0 ? (
                    <p className="text-xs text-foreground-muted italic">No active readiness blockers.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedMission.readiness_blockers.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300 font-mono"
                        >
                          <div className="font-semibold text-[11px] text-rose-700 dark:text-rose-200">
                            {String(b.blocker_type ?? b.code ?? 'BLOCKER')}
                          </div>
                          <div className="mt-0.5 text-rose-600 dark:text-rose-300 font-sans">
                            {String(b.reason ?? b.message ?? JSON.stringify(b))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Violated Constraints */}
                <div>
                  <h4 className="text-xs font-mono font-medium text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
                    <span>Violated Constraints ({(selectedMission.violated_constraints ?? []).length})</span>
                  </h4>
                  {(selectedMission.violated_constraints ?? []).length === 0 ? (
                    <p className="text-xs text-foreground-muted italic">No active constraints violated.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedMission.violated_constraints.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300 font-mono"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-amber-700 dark:text-amber-200">
                              {String(c.code ?? c.rule_code ?? 'CONSTRAINT')}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              {String(c.hard_or_soft ?? 'HARD')}
                            </span>
                          </div>
                          <div className="mt-0.5 text-amber-800 dark:text-amber-300 font-sans">
                            {String(c.reason ?? c.message ?? JSON.stringify(c))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 3: Pending Replans */}
                <div>
                  <h4 className="text-xs font-mono font-medium text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>Pending Replans ({(selectedMission.pending_replans ?? []).length})</span>
                  </h4>
                  {(selectedMission.pending_replans ?? []).length === 0 ? (
                    <p className="text-xs text-foreground-muted italic">No active replan cycles.</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedMission.pending_replans.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-sky-50 border border-sky-200 text-xs font-mono text-sky-800 dark:bg-sky-950/20 dark:border-sky-900/40 dark:text-sky-300"
                        >
                          <span>{String(r.replan_code ?? r.replan_id)}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200">
                            {String(r.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 4: Latest Operational Event */}
                <div>
                  <h4 className="text-xs font-mono font-medium text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-foreground-muted" aria-hidden="true" />
                    <span>Latest Operational Event</span>
                  </h4>
                  {selectedMission.latest_event ? (
                    <div className="p-2.5 rounded bg-surface-muted border border-border text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {selectedMission.latest_event.event_type}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {new Date(selectedMission.latest_event.occurred_at).toLocaleString()}
                        </span>
                      </div>
                      {selectedMission.latest_event.previous_state && selectedMission.latest_event.new_state && (
                        <div className="text-foreground-secondary text-[11px]">
                          {selectedMission.latest_event.previous_state} →{' '}
                          <span className="text-foreground">
                            {selectedMission.latest_event.new_state}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-foreground-muted">
                        source: {selectedMission.latest_event.source}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">No operational events recorded.</p>
                  )}
                </div>

                {/* Section 5: Technical Details (Requirement 6: Collapsed by default) */}
                <details className="text-xs font-mono text-foreground-muted border-t border-border pt-2">
                  <summary className="cursor-pointer hover:text-foreground font-medium py-1">
                    Technical details
                  </summary>
                  <div className="mt-1 space-y-1 text-[11px] bg-surface-muted p-2 rounded border border-border">
                    <div>Mission ID: <span className="text-foreground">{selectedMission.mission_id}</span></div>
                    <div>Expedition ID: <span className="text-foreground">{expeditionId}</span></div>
                    <div>Provenance: <span className="text-foreground">{selectedMission.data_provenance}</span></div>
                  </div>
                </details>

                {/* Section 6: Operator Actions */}
                {onInitiateReplan && (
                  <div className="pt-2 border-t border-border">
                    <button
                      type="button"
                      data-testid={`initiate-replan-mission-${selectedMission.code.toLowerCase()}`}
                      onClick={() => onInitiateReplan(selectedMission)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wide transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Initiate Operational Replan</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
