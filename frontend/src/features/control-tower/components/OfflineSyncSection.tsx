/**
 * Offline Synchronization & Disruption Posture Section (A8).
 *
 * Operational card integrated into the Control Tower dashboard,
 * communicating connectivity posture, outbox queue metrics,
 * and quick field action during communications blackouts.
 * Provenance: SYNTHETIC/DEMO.
 */

import { Wifi, WifiOff, Radio, Layers, Shield } from 'lucide-react';
import { useOfflineSync } from '../../../lib/sync';
import { useIncidents } from '../../incidents/hooks/useIncidents';
import { useAcknowledgeIncident } from '../../incidents/hooks/useIncidentMutations';

interface Props {
  expeditionId: string;
  onOpenDrawer: () => void;
}

export function OfflineSyncSection({ onOpenDrawer }: Props) {
  const { snapshot, toggleSimulatedBlackout, operations } = useOfflineSync();
  const { effectiveOnline, isSimulatedBlackout, queuedCount, failedCount, appliedCount, lastSyncAt } = snapshot;

  // Retrieve open field incidents for hero action execution
  const { data: openIncidents = [], isLoading: isLoadingIncidents } = useIncidents({ status: 'OPEN' });
  const activeIncident = openIncidents.length > 0 ? openIncidents[0] : null;

  const ackMutation = useAcknowledgeIncident(activeIncident?.id ?? '');

  const isIncidentQueued = activeIncident
    ? operations.some(
        (op) => op.entity_type === 'INCIDENT' && op.entity_id === activeIncident.id && op.local_status === 'LOCAL_QUEUED'
      )
    : false;

  const handleQuickAcknowledge = async () => {
    if (!activeIncident) return;
    try {
      await ackMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to acknowledge incident:', err);
    }
  };

  return (
    <section
      data-testid="offline-sync-section"
      aria-label="Offline Synchronization & Disruption Resilience"
      className="p-3.5 sm:p-4 rounded-lg bg-surface border border-border space-y-3 font-mono text-xs shadow-sm"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">CONNECTIVITY</span>
              <h3 className="text-sm font-semibold text-foreground">
                Connectivity
                <span className="sr-only">Store-and-Forward Disruption Resilience</span>
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-muted border border-border text-foreground-muted">
                [SYNTHETIC/DEMO]
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted mt-0.5">
              Offline store-and-forward synchronization
            </p>
          </div>
        </div>

        {/* Connectivity Posture Badge & Blackout Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            data-testid="section-connectivity-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${
              effectiveOnline
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/70 dark:border-amber-500 dark:text-amber-300'
            }`}
          >
            {effectiveOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <Wifi className="w-3 h-3" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE — FIELD BUFFERING ACTIVE</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSimulatedBlackout}
            data-testid="section-blackout-toggle-btn"
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-colors ${
              isSimulatedBlackout
                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/70 dark:border-rose-600 dark:text-rose-200 dark:hover:bg-rose-900'
                : 'bg-surface-elevated border-border text-foreground-secondary hover:bg-surface-muted'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>
              {isSimulatedBlackout
                ? 'Restore Connectivity [SYNTHETIC/DEMO]'
                : 'Simulate Antarctic Blackout [SYNTHETIC/DEMO]'}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-muted border border-border">
          <span className="text-foreground-muted block text-[9px] uppercase tracking-wider">Queued Operations</span>
          <span
            data-testid="metric-queued-count"
            className={`text-sm font-bold ${queuedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}
          >
            {queuedCount}
          </span>
        </div>
        <div className="p-2 rounded bg-surface-muted border border-border">
          <span className="text-foreground-muted block text-[9px] uppercase tracking-wider">Replay Failures</span>
          <span
            data-testid="metric-failed-count"
            className={`text-sm font-bold ${failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}
          >
            {failedCount}
          </span>
        </div>
        <div className="p-2 rounded bg-surface-muted border border-border">
          <span className="text-foreground-muted block text-[9px] uppercase tracking-wider">Reconciled (Applied)</span>
          <span
            data-testid="metric-applied-count"
            className={`text-sm font-bold ${appliedCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
          >
            {appliedCount}
          </span>
        </div>
        <div className="p-2 rounded bg-surface-muted border border-border">
          <span className="text-foreground-muted block text-[9px] uppercase tracking-wider">Last Sync</span>
          <span className="text-[11px] text-foreground-secondary block truncate mt-0.5">
            {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'None'}
          </span>
        </div>
      </div>

      {/* Hero Operational Action Box: Incident Acknowledgement */}
      <div className="p-2.5 sm:p-3 rounded-lg bg-surface-muted border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-foreground-muted font-semibold uppercase text-[10px]">
              Field Hero Mutation:
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs">Incident Acknowledgement</span>
          </div>
          {activeIncident ? (
            <p className="text-foreground-secondary text-[11px] mt-0.5">
              Target: <strong className="text-foreground">{activeIncident.code}</strong> — {activeIncident.title} ({activeIncident.status})
            </p>
          ) : (
            <p className="text-foreground-muted text-[11px] mt-0.5">
              {isLoadingIncidents ? 'Checking field incidents...' : 'No OPEN incidents currently pending acknowledgement.'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeIncident && activeIncident.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => void handleQuickAcknowledge()}
              disabled={ackMutation.isPending || isIncidentQueued}
              data-testid="quick-acknowledge-incident-btn"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium transition-colors shadow-xs text-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isIncidentQueued ? 'LOCAL_QUEUED' : 'Acknowledge Incident'}</span>
            </button>
          )}

          {isIncidentQueued && (
            <span
              data-testid="hero-action-queued-badge"
              className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 dark:bg-amber-950/80 dark:border-amber-500/80 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              <span>LOCAL_QUEUED — FIELD BUFFERED</span>
            </span>
          )}

          <button
            type="button"
            onClick={onOpenDrawer}
            data-testid="open-outbox-drawer-btn"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-muted border border-border text-foreground transition-colors shadow-xs text-xs"
          >
            <span>Inspect Outbox ({queuedCount})</span>
          </button>
        </div>
      </div>
    </section>
  );
}
