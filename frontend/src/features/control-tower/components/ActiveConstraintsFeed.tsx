import { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../../components/shared/EmptyState';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { useControlTowerConstraints } from '../hooks/useControlTower';
import type { ControlTowerConstraintItem, ConstraintState } from '../../../lib/types/api';

export interface ActiveConstraintsFeedProps {
  expeditionId: string;
  onInitiateReplanForConstraint?: (constraint: ControlTowerConstraintItem) => void;
}

const STATE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All States', value: '' },
  { label: 'Violated', value: 'VIOLATED' },
  { label: 'Not Evaluable', value: 'NOT_EVALUABLE' },
  { label: 'Satisfied', value: 'SATISFIED' },
];

const SEVERITY_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Severities', value: '' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

const RIGIDITY_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Rigidity', value: '' },
  { label: 'Hard Only', value: 'HARD' },
  { label: 'Soft Only', value: 'SOFT' },
];

export function ActiveConstraintsFeed({
  expeditionId,
  onInitiateReplanForConstraint,
}: ActiveConstraintsFeedProps) {
  const [stateFilter, setStateFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [hardOrSoftFilter, setHardOrSoftFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});

  const {
    data: constraints,
    isLoading,
    error,
  } = useControlTowerConstraints(expeditionId, {
    state: (stateFilter as ConstraintState) || undefined,
    hard_or_soft: hardOrSoftFilter || undefined,
    page,
    page_size: pageSize,
  });

  const toggleEvidence = (constraintId: string) => {
    setExpandedEvidenceIds((prev) => ({
      ...prev,
      [constraintId]: !prev[constraintId],
    }));
  };

  const handleStateChange = (value: string) => {
    setStateFilter(value);
    setPage(1);
  };

  const handleSeverityChange = (value: string) => {
    setSeverityFilter(value);
    setPage(1);
  };

  const handleRigidityChange = (value: string) => {
    setHardOrSoftFilter(value);
    setPage(1);
  };

  const rawItems = constraints ?? [];
  const items = rawItems.filter((c) => {
    if (severityFilter && c.severity !== severityFilter) return false;
    return true;
  });

  const violatedCount = items.filter((c) => c.state === 'VIOLATED').length;
  const hasFiltersActive = Boolean(stateFilter || severityFilter || hardOrSoftFilter);

  return (
    <section
      aria-label="Active Constraints & Invariants"
      className="rounded-lg bg-surface border border-border shadow-sm"
    >
      {/* ─── Header & Filters Toolbar ─── */}
      <div className="p-3.5 sm:p-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <p className="eyebrow mb-1">CONSTRAINTS</p>
            <h2
              className="text-base font-semibold text-foreground"
              aria-label="Active Constraints & Invariants"
            >
              Active Constraints
            </h2>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Rules affecting current operations
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono text-foreground-muted">
            <span>{items.length} monitored</span>
            {violatedCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 font-semibold">
                {violatedCount} VIOLATED
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls Row (Requirement 13: State, Severity, Rigidity) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* State Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-foreground-muted" aria-hidden="true" />
            <label
              htmlFor="constraint-state-filter"
              className="text-xs font-mono text-foreground-muted uppercase tracking-wider"
            >
              State:
            </label>
            <select
              id="constraint-state-filter"
              aria-label="Filter by constraint evaluation state"
              value={stateFilter}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-surface text-foreground text-xs font-mono rounded border border-border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {STATE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="constraint-severity-filter"
              className="text-xs font-mono text-foreground-muted uppercase tracking-wider"
            >
              Severity:
            </label>
            <select
              id="constraint-severity-filter"
              aria-label="Filter by constraint severity"
              value={severityFilter}
              onChange={(e) => handleSeverityChange(e.target.value)}
              className="bg-surface text-foreground text-xs font-mono rounded border border-border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {SEVERITY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rigidity Filter (Hard / Soft) */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="constraint-rigidity-filter"
              className="text-xs font-mono text-foreground-muted uppercase tracking-wider"
            >
              Rigidity:
            </label>
            <select
              id="constraint-rigidity-filter"
              aria-label="Filter by constraint rigidity"
              value={hardOrSoftFilter}
              onChange={(e) => handleRigidityChange(e.target.value)}
              className="bg-surface text-foreground text-xs font-mono rounded border border-border px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {RIGIDITY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Content Area: Loading / Error / Empty / Constraints List ─── */}
      <div className="p-4">
        {isLoading && (
          <div aria-busy="true" className="py-4">
            <LoadingSkeleton lines={5} />
          </div>
        )}

        {error && (
          <div className="py-4">
            <ErrorDisplay error={error} title="Failed to load active constraints" />
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            title={hasFiltersActive ? 'No matching constraints' : 'No active constraints found'}
            message={
              hasFiltersActive
                ? 'No constraints match the selected state, severity, or rigidity filters.'
                : 'There are no active constraints configured for this expedition.'
            }
          />
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((c: ControlTowerConstraintItem) => {
              const isViolated = c.state === 'VIOLATED';
              const isSatisfied = c.state === 'SATISFIED';
              const isExpanded = Boolean(expandedEvidenceIds[c.constraint_id]);
              const hasEvidence = c.evidence && Object.keys(c.evidence).length > 0;

              // Format subject to avoid exposing raw UUIDs in primary view (Requirement 6)
              const subjectDisplay =
                c.subject_code ??
                (c.subject_id && c.subject_id.length > 20
                  ? `${c.subject_type || 'Subject'} ${c.subject_id.slice(-6)}`
                  : c.subject_id);

              return (
                <article
                  key={c.constraint_id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isViolated
                      ? 'border-l-4 border-l-rose-500 bg-rose-50/25 border-rose-200 dark:bg-rose-950/15 dark:border-rose-900/60'
                      : isSatisfied
                      ? 'border-l-2 border-l-emerald-500/40 bg-surface border-border opacity-90 hover:opacity-100'
                      : 'border-l-4 border-l-amber-500 bg-amber-50/20 border-amber-200 dark:bg-amber-950/15 dark:border-amber-900/60'
                  }`}
                  aria-label={`Constraint ${c.code}: ${c.name}`}
                >
                  {/* Top Bar: Primary State Badge + Secondary Muted Line (Requirement 7 & 9) */}
                  <div className="flex items-center justify-between gap-2 pb-1.5">
                    {/* Primary State Dominates */}
                    {isViolated ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-sans text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700 shadow-xs"
                        role="status"
                        aria-label="Constraint state: VIOLATED"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                        <span>Violated</span>
                      </span>
                    ) : isSatisfied ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-sans text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        role="status"
                        aria-label="Constraint state: SATISFIED"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span>Satisfied</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-sans text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        role="status"
                        aria-label="Constraint state: NOT EVALUABLE"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span>Not Evaluable</span>
                      </span>
                    )}

                    {/* Muted Secondary Line (Hard · Critical · Derived) */}
                    <div className="flex items-center gap-2 text-xs text-foreground-muted font-sans">
                      <span>
                        {[
                          c.hard_or_soft ? (c.hard_or_soft.charAt(0).toUpperCase() + c.hard_or_soft.slice(1).toLowerCase()) : null,
                          c.severity ? (c.severity.charAt(0).toUpperCase() + c.severity.slice(1).toLowerCase()) : null,
                          c.data_provenance ? (c.data_provenance.charAt(0).toUpperCase() + c.data_provenance.slice(1).toLowerCase()) : null,
                        ].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>

                  {/* Constraint Title & Code */}
                  <div className="mt-1 flex items-baseline gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {c.name}
                    </h3>
                    <span className="text-xs font-mono text-foreground-muted">
                      {c.code}
                    </span>
                  </div>

                  {/* Operational Consequence */}
                  <p className="mt-1 text-xs text-foreground-secondary leading-relaxed font-sans">
                    {c.reason}
                  </p>

                  {/* Actions Row */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => toggleEvidence(c.constraint_id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline focus:outline-none"
                      aria-expanded={isExpanded}
                      aria-controls={`evidence-${c.constraint_id}`}
                      aria-label={isExpanded ? 'Hide evidence & diagnostics' : 'Show evidence & diagnostics'}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true" />
                      <span>
                        {isExpanded ? 'Hide evidence & diagnostics' : 'View evidence & diagnostics →'}
                      </span>
                    </button>

                    {isViolated && onInitiateReplanForConstraint && (
                      <button
                        type="button"
                        data-testid={`initiate-replan-constraint-${c.code.toLowerCase()}`}
                        onClick={() => onInitiateReplanForConstraint(c)}
                        className="px-2.5 py-1 text-xs font-sans font-medium text-amber-800 dark:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 rounded-md flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <RotateCcw className="w-3 h-3" aria-hidden="true" />
                        <span>Initiate replan</span>
                      </button>
                    )}
                  </div>

                  {/* Expandable Technical Evidence & Diagnostics (Requirement 8) */}
                  {isExpanded && (
                    <div
                      id={`evidence-${c.constraint_id}`}
                      className="mt-2.5 p-3 rounded-lg bg-surface-muted border border-border font-mono text-xs space-y-2.5"
                    >
                      {/* Technical Binding Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pb-2 border-b border-border/60">
                        <div>
                          <span className="text-foreground-muted">Rule: </span>
                          <span className="text-foreground font-semibold">{c.rule_code || '—'}</span>
                        </div>
                        <div>
                          <span className="text-foreground-muted">Subject: </span>
                          <span className="text-accent font-semibold">{c.subject_type}: {subjectDisplay}</span>
                        </div>
                        {c.type && (
                          <div>
                            <span className="text-foreground-muted">Type: </span>
                            <span className="text-foreground">{c.type}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-foreground-muted">Subject ID: </span>
                          <span className="text-foreground-muted truncate block">{c.subject_id}</span>
                        </div>
                      </div>

                      {/* Structured Key-Value Evidence Payload */}
                      {hasEvidence ? (
                        <div>
                          <div className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 font-sans">
                            Diagnostic Evidence Payload
                          </div>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                            {Object.entries(c.evidence).map(([k, v]) => (
                              <div key={k} className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-1">
                                <dt className="text-foreground-muted text-[11px] truncate max-w-[150px]">
                                  {k}:
                                </dt>
                                <dd className="text-foreground text-[11px] font-semibold truncate max-w-[200px]">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ) : (
                        <div className="text-foreground-muted text-xs italic">
                          No raw diagnostic payload recorded.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs font-mono text-foreground-muted">
              <span>Page {page}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-surface-elevated text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted"
                  aria-label="Previous constraints page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < pageSize}
                  className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-surface-elevated text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted"
                  aria-label="Next constraints page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
