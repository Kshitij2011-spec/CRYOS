import { useState } from 'react';
import { X, Truck, AlertTriangle } from 'lucide-react';
import { useTransportLeg } from './hooks/useTransportLeg';
import { useUpdateTransportLeg } from './hooks/useUpdateTransportLeg';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EntityCode } from '../../components/shared/EntityCode';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { TransportLegCargo } from './TransportLegCargo';
import { DelayWorkflow } from './DelayWorkflow';
import { OperationalTimeline } from '../../components/shared/OperationalTimeline';
import type { TransportStatus } from '../../lib/types/api';

interface Props {
  legId: string | null;
  onClose: () => void;
  onSelectConsignment?: (consignmentId: string) => void;
}

const TRANSPORT_STATUSES: TransportStatus[] = [
  'PLANNED', 'BOOKED', 'READY', 'DEPARTED', 'IN_TRANSIT',
  'ARRIVED', 'CLOSED', 'DELAYED', 'DIVERTED', 'CANCELLED',
];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-foreground-muted text-xs w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-foreground text-sm break-all">{value ?? <span className="text-foreground-muted italic">—</span>}</span>
    </div>
  );
}

export function TransportLegDetailPanel({ legId, onClose, onSelectConsignment }: Props) {
  const { data: leg, isLoading, error } = useTransportLeg(legId);
  const updateMutation = useUpdateTransportLeg();

  const [activeTab, setActiveTab] = useState<'overview' | 'cargo' | 'operations'>('overview');
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TransportStatus | ''>('');
  const [confirmPending, setConfirmPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const handleUpdateStatus = async () => {
    if (!leg || !newStatus) return;
    setActionError(null);

    try {
      await updateMutation.mutateAsync({
        id: leg.id,
        data: {
          status: newStatus,
        },
      });
      setConfirmPending(false);
      setActiveTab('overview');
    } catch (err) {
      setConfirmPending(false);
      setActionError((err as Error).message || 'Failed to update transport status.');
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full max-w-xl flex flex-col bg-surface border-l border-border shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Transport leg details"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface backdrop-blur-sm">
        <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h2 className="text-foreground font-semibold text-sm truncate">
            {isLoading ? 'Loading…' : (leg?.code ?? 'Transport Leg')}
          </h2>
        </div>
        {leg && <ProvenanceTag provenance={leg.data_provenance} />}
        <button
          type="button"
          onClick={onClose}
          className="text-foreground-muted hover:text-foreground transition-colors ml-2"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      {leg && (
        <div className="flex border-b border-border bg-surface-muted/40 px-6 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cargo')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'cargo'
                ? 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Cargo Manifest
          </button>
          <button
            type="button"
            onClick={() => {
              setNewStatus(leg.status);
              setActiveTab('operations');
            }}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'operations'
                ? 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Operations
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {isLoading && <LoadingSkeleton lines={8} />}
        {error && <ErrorDisplay error={error} title="Failed to load transport leg" />}

        {leg && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <EntityCode code={leg.code} />
                  <StatusBadge status={leg.status} />
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/15 text-cyan-700 border border-cyan-400/50 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/80">
                    {leg.mode}
                  </span>
                </div>

                {leg.delay_reason && (
                  <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300">Operational Delay Logged</p>
                      <p className="mt-0.5 text-amber-700 dark:text-amber-200/90">{leg.delay_reason}</p>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-border">
                  <DetailRow label="Leg ID" value={<span className="entity-id">{leg.id}</span>} />
                  <DetailRow label="Expedition" value={<span className="entity-id">{leg.expedition_id}</span>} />
                  <DetailRow label="Origin Location" value={<span className="entity-id">{leg.origin_location_id}</span>} />
                  <DetailRow label="Destination" value={<span className="entity-id">{leg.destination_location_id}</span>} />
                  <DetailRow
                    label="Capacity"
                    value={
                      leg.capacity
                        ? `${leg.capacity} ${leg.capacity_unit ?? 'units'}`
                        : null
                    }
                  />
                  <DetailRow label="Planned Departure" value={formatDate(leg.planned_departure_at)} />
                  <DetailRow label="Planned Arrival" value={formatDate(leg.planned_arrival_at)} />
                  <DetailRow label="Estimated Departure" value={formatDate(leg.estimated_departure_at)} />
                  <DetailRow
                    label="Estimated Arrival"
                    value={
                      <span className={leg.status === 'DELAYED' ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                        {formatDate(leg.estimated_arrival_at)}
                      </span>
                    }
                  />
                  <DetailRow label="Actual Departure" value={formatDate(leg.actual_departure_at)} />
                  <DetailRow label="Actual Arrival" value={formatDate(leg.actual_arrival_at)} />
                  <DetailRow label="Created" value={formatDate(leg.created_at)} />
                  <DetailRow label="Last Updated" value={formatDate(leg.updated_at)} />
                </div>
              </div>
            )}

            {/* Cargo Manifest Tab */}
            {activeTab === 'cargo' && (
              <TransportLegCargo
                legId={leg.id}
                onSelectConsignment={onSelectConsignment}
              />
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <div className="space-y-6">
                {/* Quick Delay Workflow */}
                {showDelayModal ? (
                  <DelayWorkflow
                    leg={leg}
                    onSuccess={() => setShowDelayModal(false)}
                    onCancel={() => setShowDelayModal(false)}
                  />
                ) : (
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Operational Delay Propagation
                      </h4>
                      <p className="text-[11px] text-foreground-muted mt-1">
                        Record weather/logistics delays and recalculate cargo arrival timelines.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDelayModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shrink-0 ml-3 transition-colors shadow-sm"
                    >
                      Record Delay
                    </button>
                  </div>
                )}

                {/* Status Transition Form */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted space-y-4 shadow-sm">
                  <h4 className="text-xs font-semibold text-foreground">
                    Leg Lifecycle State Transition
                  </h4>

                  {actionError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block eyebrow mb-1.5">
                        Target Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TransportStatus)}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      >
                        {TRANSPORT_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmPending(true)}
                      disabled={updateMutation.isPending || newStatus === leg.status}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {updateMutation.isPending ? 'Updating…' : 'Execute State Transition'}
                    </button>
                  </div>
                </div>

                {/* Operational History & Event Journal */}
                <OperationalTimeline
                  entityType="TRANSPORT_LEG"
                  entityId={leg.id}
                  title="Transport Leg Operational History"
                  defaultIncludeRelated={true}
                />

                <ConfirmDialog
                  isOpen={confirmPending}
                  title="Confirm Transport State Transition"
                  message={`Are you sure you want to transition transport leg ${leg.code} to ${newStatus}? This will be recorded as an immutable operational event.`}
                  confirmLabel="Confirm Transition"
                  isDestructive={newStatus === 'CANCELLED' || newStatus === 'DIVERTED'}
                  onConfirm={handleUpdateStatus}
                  onCancel={() => setConfirmPending(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
