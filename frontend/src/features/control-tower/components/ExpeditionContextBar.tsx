import { Compass, AlertOctagon, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { EntityCode } from '../../../components/shared/EntityCode';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { useExpeditionSummary } from '../hooks/useControlTower';
import type { ExpeditionControlSummary, ReadinessState } from '../../../lib/types/api';

export interface ExpeditionContextBarProps {
  selectedExpeditionId: string;
  onSelectExpedition: (id: string) => void;
  expeditions: ExpeditionControlSummary[];
  isLoadingExpeditions?: boolean;
}

const READINESS_CONFIG: Record<
  ReadinessState | string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  READY: {
    label: 'READY',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  AT_RISK: {
    label: 'AT RISK',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-600',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
  },
  BLOCKED: {
    label: 'BLOCKED',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-600',
    dotClass: 'bg-rose-500 dark:bg-rose-400',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    badgeClass: 'bg-surface-elevated text-foreground-muted border-[var(--border-color)]',
    dotClass: 'bg-foreground-muted',
  },
};

export function ExpeditionContextBar({
  selectedExpeditionId,
  onSelectExpedition,
  expeditions,
  isLoadingExpeditions = false,
}: ExpeditionContextBarProps) {
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error,
  } = useExpeditionSummary(selectedExpeditionId);

  if (isLoadingExpeditions) {
    return (
      <div className="p-4 rounded-lg bg-surface border border-[var(--border-color)]" aria-busy="true">
        <LoadingSkeleton lines={3} />
      </div>
    );
  }

  return (
    <section
      aria-label="Expedition Operational Context"
      className="p-4 rounded-lg bg-surface border border-[var(--border-color)] shadow-theme-sm"
    >
      {/* ─── Top Control Row ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        {/* Expedition Selector & Basic Identifiers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
            <label
              htmlFor="expedition-select"
              className="eyebrow"
            >
              Expedition:
            </label>
            <select
              id="expedition-select"
              aria-label="Select Expedition Campaign"
              value={selectedExpeditionId}
              onChange={(e) => onSelectExpedition(e.target.value)}
              className="bg-surface text-foreground text-sm rounded border border-[var(--border-color)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {expeditions.map((exp) => (
                <option key={exp.expedition_id} value={exp.expedition_id}>
                  {exp.code} — {exp.name}
                </option>
              ))}
            </select>
          </div>

          {summary && (
            <>
              <EntityCode code={summary.code} />
              <span className="font-semibold text-foreground text-sm lg:text-base">
                {summary.name}
              </span>
              {summary.season && (
                <span className="text-xs text-foreground-muted px-2 py-0.5 rounded bg-surface-elevated border border-[var(--border-color)]">
                  {summary.season}
                </span>
              )}
              {summary.lifecycle_status && (
                <StatusBadge status={summary.lifecycle_status} />
              )}
            </>
          )}
        </div>

        {/* Operational Readiness Posture & Provenance */}
        {summary && (
          <div className="flex items-center gap-3 shrink-0">
            {(() => {
              const rConf = READINESS_CONFIG[summary.readiness_state] ?? READINESS_CONFIG.UNKNOWN;
              return (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-semibold tracking-wide ${rConf.badgeClass}`}
                  role="status"
                  aria-label={`Overall expedition readiness state: ${rConf.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${rConf.dotClass} animate-pulse`} aria-hidden="true" />
                  <span>{rConf.label}</span>
                </div>
              );
            })()}

            <ProvenanceTag provenance={summary.data_provenance} />
          </div>
        )}
      </div>

      {/* ─── Body Details: Loading / Error / Metrics ─── */}
      {isLoadingSummary && (
        <div className="pt-4" aria-busy="true">
          <LoadingSkeleton lines={2} />
        </div>
      )}

      {error && (
        <div className="pt-4">
          <ErrorDisplay error={error} title="Failed to load expedition summary" />
        </div>
      )}

      {summary && !isLoadingSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {/* Tile 1: Missions Breakdown */}
          <div className="p-3 rounded bg-surface-elevated border border-[var(--border-color)]">
            <span className="block eyebrow mb-1">
              Missions
            </span>
            <span className="data-value text-xl">
              {summary.total_missions}
            </span>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
              <span className="text-status-success">{summary.ready_missions_count} ready</span>
              <span className="text-status-warning">{summary.at_risk_missions_count} risk</span>
              <span className="text-status-critical">{summary.blocked_missions_count} blocked</span>
            </div>
          </div>

          {/* Tile 2: Active Incidents */}
          <div
            className={`p-3 rounded border transition-colors ${
              summary.active_incidents_count > 0
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/60'
                : 'bg-surface-elevated border-[var(--border-color)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="block eyebrow mb-1">
                Incidents
              </span>
              {summary.active_incidents_count > 0 && (
                <AlertOctagon className="w-3.5 h-3.5 text-status-critical" aria-hidden="true" />
              )}
            </div>
            <span
              className={`data-value text-xl ${
                summary.active_incidents_count > 0 ? 'text-status-critical' : 'text-foreground'
              }`}
            >
              {summary.active_incidents_count}
            </span>
            <span className="block mt-1 text-[11px] text-foreground-muted">active open</span>
          </div>

          {/* Tile 3: Hard Constraint Violations */}
          <div
            className={`p-3 rounded border transition-colors ${
              summary.active_hard_constraint_violations_count > 0
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/60'
                : 'bg-surface-elevated border-[var(--border-color)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="block eyebrow mb-1">
                Hard Violations
              </span>
              {summary.active_hard_constraint_violations_count > 0 && (
                <ShieldAlert className="w-3.5 h-3.5 text-status-critical" aria-hidden="true" />
              )}
            </div>
            <span
              className={`data-value text-xl ${
                summary.active_hard_constraint_violations_count > 0
                  ? 'text-status-critical'
                  : 'text-foreground'
              }`}
            >
              {summary.active_hard_constraint_violations_count}
            </span>
            <span className="block mt-1 text-[11px] text-foreground-muted">critical constraints</span>
          </div>

          {/* Tile 4: Pending Replans */}
          <div
            className={`p-3 rounded border transition-colors ${
              summary.pending_replans_count > 0
                ? 'bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/60'
                : 'bg-surface-elevated border-[var(--border-color)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="block eyebrow mb-1">
                Replans
              </span>
              {summary.pending_replans_count > 0 && (
                <RefreshCw className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              )}
            </div>
            <span
              className={`data-value text-xl ${
                summary.pending_replans_count > 0 ? 'text-accent' : 'text-foreground'
              }`}
            >
              {summary.pending_replans_count}
            </span>
            <span className="block mt-1 text-[11px] text-foreground-muted">cycles active</span>
          </div>

          {/* Tile 5: Pending Approvals */}
          <div
            className={`p-3 rounded border transition-colors ${
              summary.pending_approvals_count > 0
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60'
                : 'bg-surface-elevated border-[var(--border-color)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="block eyebrow mb-1">
                Approvals
              </span>
              {summary.pending_approvals_count > 0 && (
                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" aria-hidden="true" />
              )}
            </div>
            <span
              className={`data-value text-xl ${
                summary.pending_approvals_count > 0 ? 'text-status-warning' : 'text-foreground'
              }`}
            >
              {summary.pending_approvals_count}
            </span>
            <span className="block mt-1 text-[11px] text-foreground-muted">awaiting operator</span>
          </div>

          {/* Tile 6: Blockers & Warnings */}
          <div className="p-3 rounded bg-surface-elevated border border-[var(--border-color)]">
            <span className="block eyebrow mb-1">
              Blockers / Warnings
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`data-value text-xl ${
                  (summary.blockers?.length ?? 0) > 0 ? 'text-status-critical' : 'text-foreground'
                }`}
              >
                {summary.blockers?.length ?? 0}
              </span>
              <span className="text-foreground-muted text-sm">/</span>
              <span
                className={`data-value text-xl ${
                  (summary.warnings?.length ?? 0) > 0 ? 'text-status-warning' : 'text-foreground-muted'
                }`}
              >
                {summary.warnings?.length ?? 0}
              </span>
            </div>
            <span className="block mt-1 text-[11px] text-foreground-muted">
              {(summary.blockers?.length ?? 0) === 0 ? 'no blockers active' : 'readiness issues'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
