import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useDelayTransportLeg } from './hooks/useDelayTransportLeg';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { EntityCode } from '../../components/shared/EntityCode';
import { RiskBadge } from '../cargo/RiskBadge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import type { TransportLeg, TransportDelayImpact, CargoRiskLevel } from '../../lib/types/api';

interface Props {
  leg: TransportLeg;
  onSuccess?: (impact: TransportDelayImpact) => void;
  onCancel: () => void;
}

export function DelayWorkflow({ leg, onSuccess, onCancel }: Props) {
  const delayMutation = useDelayTransportLeg();

  const [newEstimatedArrival, setNewEstimatedArrival] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [impactResult, setImpactResult] = useState<TransportDelayImpact | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newEstimatedArrival) {
      setErrorMsg('Please specify a new estimated arrival timestamp.');
      return;
    }

    if (!delayReason.trim()) {
      setErrorMsg('A delay reason/justification is required.');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmDelay = async () => {
    try {
      const impact = await delayMutation.mutateAsync({
        legId: leg.id,
        data: {
          new_estimated_arrival_at: new Date(newEstimatedArrival).toISOString(),
          delay_reason: delayReason.trim(),
        },
      });
      setShowConfirm(false);
      setImpactResult(impact);
      if (onSuccess) onSuccess(impact);
    } catch (err) {
      setShowConfirm(false);
      setErrorMsg((err as Error).message || 'Failed to record transport delay.');
    }
  };

  if (impactResult) {
    return (
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Delay Propagated Successfully</span>
        </div>

        <p className="text-foreground">{impactResult.summary}</p>

        {impactResult.affected_cargo_consignments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800/40">
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300/90 uppercase tracking-[0.05em]">
              Affected Manifested Consignments ({impactResult.affected_cargo_consignments.length})
            </p>
            <div className="space-y-1.5">
              {impactResult.affected_cargo_consignments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded bg-surface border border-border"
                >
                  <EntityCode code={c.code} />
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <RiskBadge level={c.risk_level as CargoRiskLevel} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-muted text-foreground border border-border font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" aria-hidden="true" />
        <h4 className="text-xs font-semibold text-foreground">
          Record Transport Leg Operational Delay
        </h4>
      </div>

      <p className="text-xs text-foreground-secondary">
        Delaying this transport leg will automatically propagate arrival adjustments and recalculate schedule risk across all manifested cargo consignments.
      </p>

      {errorMsg && (
        <div className="text-xs text-rose-700 dark:text-rose-300 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block eyebrow mb-1.5">
              Current Scheduled Arrival
            </span>
            <div className="px-3 py-2 rounded bg-surface-muted border border-border text-sm tabular-nums text-foreground">
              {leg.estimated_arrival_at
                ? new Date(leg.estimated_arrival_at).toLocaleString()
                : leg.planned_arrival_at
                ? new Date(leg.planned_arrival_at).toLocaleString()
                : 'Not scheduled'}
            </div>
          </div>

          <div>
            <label className="block eyebrow mb-1.5">
              New Estimated Arrival *
            </label>
            <input
              type="datetime-local"
              value={newEstimatedArrival}
              onChange={(e) => setNewEstimatedArrival(e.target.value)}
              className="w-full px-3 py-2 rounded bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-cyan-600"
              required
            />
          </div>
        </div>

        <div>
          <label className="block eyebrow mb-1.5">
            Operational Delay Reason / Justification *
          </label>
          <textarea
            rows={3}
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            placeholder="Severe katabatic winds, sea-ice barrier blockage, mechanical hold..."
            className="w-full px-3 py-2 rounded bg-surface-elevated border border-border text-foreground text-xs focus:outline-none focus:border-cyan-600"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-foreground-secondary hover:text-foreground text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={delayMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            <span>Review & Delay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Operational Delay"
        message={`Are you sure you want to delay transport leg ${leg.code}? This will record a DELAYED operational event and recalculate downstream consignment timelines.`}
        confirmLabel="Confirm Transport Delay"
        isDestructive={false}
        onConfirm={handleConfirmDelay}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
