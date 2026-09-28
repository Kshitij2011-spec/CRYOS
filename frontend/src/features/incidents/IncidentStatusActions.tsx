import { useState } from 'react';
import { CheckCircle2, Shield, Play, Ban } from 'lucide-react';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import {
  useAcknowledgeIncident,
  useMitigateIncident,
  useResolveIncident,
  useCloseIncident,
} from './hooks/useIncidentMutations';
import { useOfflineSync } from '../../lib/sync';
import type { Incident } from '../../lib/types/api';

interface Props {
  incident: Incident;
  onSuccess?: () => void;
}

export function IncidentStatusActions({ incident, onSuccess }: Props) {
  const { operations } = useOfflineSync();
  const queuedOp = operations.find(
    (op) => op.entity_type === 'INCIDENT' && op.entity_id === incident.id && op.local_status === 'LOCAL_QUEUED'
  );
  const isLocalQueued = Boolean((incident as { _is_local_queued?: boolean })._is_local_queued || queuedOp);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<unknown>) | null>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ackMutation = useAcknowledgeIncident(incident.id);
  const mitMutation = useMitigateIncident(incident.id);
  const resMutation = useResolveIncident(incident.id);
  const closeMutation = useCloseIncident(incident.id);

  const isSubmitting =
    ackMutation.isPending ||
    mitMutation.isPending ||
    resMutation.isPending ||
    closeMutation.isPending;

  const handleAcknowledge = () => {
    setErrorMessage(null);
    setDialogTitle('Acknowledge Incident');
    setDialogMessage(`Acknowledge operational incident ${incident.code}?`);
    setPendingAction(() => () => ackMutation.mutateAsync());
    setConfirmOpen(true);
  };

  const handleMitigate = () => {
    setErrorMessage(null);
    setDialogTitle('Start Mitigation');
    setDialogMessage(`Transition incident ${incident.code} to MITIGATING status?`);
    setPendingAction(() => () => mitMutation.mutateAsync());
    setConfirmOpen(true);
  };

  const handleResolve = () => {
    setErrorMessage(null);
    setDialogTitle('Resolve Incident');
    setDialogMessage(`Mark incident ${incident.code} as RESOLVED?`);
    setPendingAction(() => () => resMutation.mutateAsync());
    setConfirmOpen(true);
  };

  const handleClose = () => {
    setErrorMessage(null);
    setDialogTitle('Close Incident');
    setDialogMessage(`Close incident ${incident.code}? This will transition the incident to terminal CLOSED status.`);
    setPendingAction(() => () => closeMutation.mutateAsync());
    setConfirmOpen(true);
  };

  const executeConfirmed = async () => {
    if (!pendingAction) return;
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      onSuccess?.();
    } catch (err) {
      setConfirmOpen(false);
      setErrorMessage(err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  if (incident.status === 'CLOSED') {
    return (
      <div className="p-4 rounded-lg bg-surface-muted border border-border text-foreground-muted text-sm">
        Incident is in terminal state <span className="font-bold text-foreground">CLOSED</span>. No further lifecycle actions or transitions are permitted.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="eyebrow">
          Lifecycle Transitions
        </span>
        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Current: {incident.status}</span>
      </div>

      {isLocalQueued && (
        <div
          data-testid="local-queued-status-banner"
          className="p-2.5 rounded bg-amber-50 border border-amber-400 text-amber-800 dark:bg-amber-950/70 dark:border-amber-500/80 dark:text-amber-300 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">LOCAL_QUEUED — FIELD BUFFERED [SYNTHETIC/DEMO]</span>
          </div>
          {queuedOp && (
            <span className="entity-id text-amber-700 dark:text-amber-400/80">
              OP: {queuedOp.client_operation_id.slice(0, 8)}...
            </span>
          )}
        </div>
      )}

      {errorMessage && (
        <ErrorDisplay error={new Error(errorMessage)} title="Lifecycle Action Failed" />
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {incident.status === 'OPEN' && (
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            Acknowledge
          </button>
        )}

        {incident.status === 'ACKNOWLEDGED' && (
          <button
            type="button"
            onClick={handleMitigate}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            Start Mitigation
          </button>
        )}

        {(incident.status === 'OPEN' || incident.status === 'ACKNOWLEDGED' || incident.status === 'MITIGATING') && (
          <button
            type="button"
            onClick={handleResolve}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Resolve Incident
          </button>
        )}

        {(incident.status === 'OPEN' || incident.status === 'ACKNOWLEDGED' || incident.status === 'RESOLVED') && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated hover:bg-surface-muted border border-border disabled:opacity-50 text-foreground transition-colors font-medium"
          >
            <Ban className="w-3.5 h-3.5" aria-hidden="true" />
            Close Incident
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel="Confirm"
        onConfirm={executeConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
