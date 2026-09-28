import { useState } from 'react';
import { X, Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useConsignment } from './hooks/useConsignment';
import { useUpdateConsignment } from './hooks/useUpdateConsignment';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { RiskBadge } from './RiskBadge';
import { EntityCode } from '../../components/shared/EntityCode';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ConsignmentTimeline } from './ConsignmentTimeline';
import { ConsignmentPackagesTable } from './ConsignmentPackagesTable';
import { OperationalTimeline } from '../../components/shared/OperationalTimeline';
import type { CargoStatus } from '../../lib/types/api';

interface Props {
  consignmentId: string | null;
  onClose: () => void;
}

const CARGO_STATUSES: CargoStatus[] = [
  'REQUESTED', 'DECLARED', 'APPROVED', 'PACKED', 'READY',
  'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED',
  'HELD', 'DELAYED', 'DAMAGED', 'LOST', 'REJECTED',
];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-foreground-muted text-xs w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-foreground text-sm break-all">{value ?? <span className="text-foreground-muted italic">—</span>}</span>
    </div>
  );
}

export function ConsignmentDetailPanel({ consignmentId, onClose }: Props) {
  const { data: consignment, isLoading, error } = useConsignment(consignmentId);
  const updateMutation = useUpdateConsignment();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'packages' | 'actions'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<CargoStatus | ''>('');
  const [transportPlan, setTransportPlan] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [confirmPending, setConfirmPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync initial state when consignment loads
  const handleOpenActions = () => {
    if (consignment) {
      setSelectedStatus(consignment.status);
      setTransportPlan(consignment.transport_plan_summary ?? '');
      setPriority(consignment.priority);
    }
    setActiveTab('actions');
  };

  const handleApplyUpdate = async () => {
    if (!consignment) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: consignment.id,
        data: {
          status: (selectedStatus as CargoStatus) || consignment.status,
          priority: Number(priority),
          transport_plan_summary: transportPlan.trim() || undefined,
        },
      });
      setConfirmPending(false);
      setActiveTab('overview');
    } catch (err) {
      setConfirmPending(false);
      setActionError((err as Error).message || 'Failed to update consignment');
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full max-w-xl flex flex-col bg-surface border-l border-border shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Consignment details"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface backdrop-blur-sm">
        <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h2 className="text-foreground font-semibold text-sm truncate">
            {isLoading ? 'Loading…' : (consignment?.code ?? 'Consignment Details')}
          </h2>
        </div>
        {consignment && <ProvenanceTag provenance={consignment.data_provenance} />}
        <button
          type="button"
          onClick={onClose}
          className="text-foreground-muted hover:text-foreground transition-colors ml-2"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation tabs */}
      {consignment && (
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
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'packages'
                ? 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Packages
          </button>
          <button
            type="button"
            onClick={handleOpenActions}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'actions'
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
        {error && <ErrorDisplay error={error} title="Failed to load consignment" />}

        {consignment && (
          <>
            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <EntityCode code={consignment.code} />
                  <StatusBadge status={consignment.status} />
                  <RiskBadge level={consignment.risk_level} />
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-muted text-foreground-secondary border border-border">
                    P{consignment.priority}
                  </span>
                </div>

                <div className="divide-y divide-border">
                  <DetailRow label="Consignment ID" value={<span className="entity-id">{consignment.id}</span>} />
                  <DetailRow label="Expedition ID" value={<span className="entity-id">{consignment.expedition_id}</span>} />
                  <DetailRow label="Origin Location" value={<span className="entity-id">{consignment.origin_location_id}</span>} />
                  <DetailRow label="Destination" value={<span className="entity-id">{consignment.destination_location_id}</span>} />
                  <DetailRow
                    label="Compliance"
                    value={
                      <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{consignment.compliance_status}</span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Handling"
                    value={consignment.handling_classification ?? 'Standard polar freight'}
                  />
                  <DetailRow
                    label="Transport Plan"
                    value={consignment.transport_plan_summary}
                  />
                  {consignment.exception_reason && (
                    <DetailRow
                      label="Exception"
                      value={
                        <span className="text-rose-600 dark:text-rose-400 font-medium">{consignment.exception_reason}</span>
                      }
                    />
                  )}
                  <DetailRow
                    label="Created"
                    value={new Date(consignment.created_at).toLocaleString()}
                  />
                  <DetailRow
                    label="Last Updated"
                    value={new Date(consignment.updated_at).toLocaleString()}
                  />
                </div>
              </div>
            )}

            {/* Tab: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <ConsignmentTimeline consignmentId={consignment.id} />
                <OperationalTimeline
                  entityType="CARGO_CONSIGNMENT"
                  entityId={consignment.id}
                  title="Consignment Operational Event History"
                  defaultIncludeRelated={true}
                />
              </div>
            )}

            {/* Tab: Packages */}
            {activeTab === 'packages' && (
              <ConsignmentPackagesTable consignmentId={consignment.id} />
            )}

            {/* Tab: Operational Actions */}
            {activeTab === 'actions' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg border border-border bg-surface-muted space-y-4">
                  <h4 className="text-xs font-semibold text-foreground">Update Operational State</h4>

                  {actionError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block eyebrow mb-1.5">
                        Consignment Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as CargoStatus)}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      >
                        {CARGO_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block eyebrow mb-1.5">
                        Operational Priority (1 = highest)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block eyebrow mb-1.5">
                        Transport Plan Summary
                      </label>
                      <textarea
                        rows={3}
                        value={transportPlan}
                        onChange={(e) => setTransportPlan(e.target.value)}
                        placeholder="Routing notes, vessel assignment, etc."
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmPending(true)}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {updateMutation.isPending ? 'Updating…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <ConfirmDialog
                  isOpen={confirmPending}
                  title="Confirm Consignment Mutation"
                  message={`Are you sure you want to update consignment ${consignment.code} to status ${selectedStatus}? This state change will be committed as an immutable operational event.`}
                  confirmLabel="Apply Mutation"
                  isDestructive={selectedStatus === 'DAMAGED' || selectedStatus === 'LOST' || selectedStatus === 'REJECTED'}
                  onConfirm={handleApplyUpdate}
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
