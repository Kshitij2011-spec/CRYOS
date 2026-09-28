/**
 * Offline Sync Indicator (A8).
 *
 * Communicates real/simulated polar connectivity posture, field buffering state,
 * and queued operation counts.
 * Provenance: SYNTHETIC/DEMO when blackout simulation is active.
 */

import { Wifi, WifiOff, RefreshCw, Radio } from 'lucide-react';
import { useOfflineSync } from '../../../lib/sync';

interface Props {
  onOpenDrawer?: () => void;
  showToggle?: boolean;
}

export function OfflineSyncIndicator({ onOpenDrawer, showToggle = true }: Props) {
  const { snapshot, toggleSimulatedBlackout } = useOfflineSync();
  const { effectiveOnline, isSimulatedBlackout, isSyncing, queuedCount, failedCount, lastSyncAt } = snapshot;

  const formattedLastSync = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div
      data-testid="offline-sync-indicator"
      className="flex items-center gap-2 text-xs font-mono"
    >
      {/* Connectivity Status Badge */}
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border transition-colors ${
          effectiveOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-300'
            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/70 dark:border-amber-500/80 dark:text-amber-300'
        }`}
      >
        {effectiveOnline ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <Wifi className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
            <span className="font-semibold tracking-wide">ONLINE</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse dark:bg-amber-400" />
            <WifiOff className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span className="font-semibold tracking-wide">
              OFFLINE — FIELD BUFFERING ACTIVE
            </span>
            {isSimulatedBlackout && (
              <span className="text-[10px] px-1 py-0.5 bg-amber-100 border border-amber-300 rounded text-amber-700 dark:bg-amber-900/60 dark:border-amber-600/60 dark:text-amber-200">
                [SYNTHETIC/DEMO]
              </span>
            )}
          </span>
        )}

        {/* Sync in progress indicator */}
        {isSyncing && (
          <span title="Syncing...">
            <RefreshCw className="w-3 h-3 text-accent animate-spin ml-1" />
          </span>
        )}
      </div>

      {/* Operation Counts & Last Sync */}
      <button
        type="button"
        onClick={onOpenDrawer}
        data-testid="sync-drawer-toggle-btn"
        className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-surface hover:bg-surface-elevated text-foreground-secondary transition-colors"
        title="Open Offline Synchronization Drawer"
      >
        <span>
          Queued: <strong className={queuedCount > 0 ? 'text-status-warning' : 'text-foreground'}>{queuedCount}</strong>
        </span>
        <span className="text-foreground-muted">|</span>
        <span>
          Failed: <strong className={failedCount > 0 ? 'text-status-critical' : 'text-foreground'}>{failedCount}</strong>
        </span>
        <span className="text-foreground-muted">|</span>
        <span>
          Last sync: <span className="text-foreground-secondary">{formattedLastSync}</span>
        </span>
      </button>

      {/* Blackout Simulation Toggle Switch */}
      {showToggle && (
        <button
          type="button"
          onClick={toggleSimulatedBlackout}
          data-testid="blackout-toggle-btn"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
            isSimulatedBlackout
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-900/70'
              : 'bg-surface border-[var(--border-color)] text-foreground-muted hover:bg-surface-elevated hover:text-foreground'
          }`}
          title="Simulate Antarctic Communications Blackout [SYNTHETIC/DEMO]"
        >
          <Radio className="w-3.5 h-3.5 text-current" aria-hidden="true" />
          <span>
            {isSimulatedBlackout
              ? 'Restore Connectivity [SYNTHETIC/DEMO]'
              : 'Simulate Antarctic Blackout [SYNTHETIC/DEMO]'}
          </span>
        </button>
      )}
    </div>
  );
}
