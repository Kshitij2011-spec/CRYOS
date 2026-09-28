import { useState } from 'react';
import { Package, Plus, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { useConsignmentPackages } from './hooks/useConsignmentPackages';
import { useCreatePackage } from './hooks/useCreatePackage';
import { useUpdatePackage } from './hooks/useUpdatePackage';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EntityCode } from '../../components/shared/EntityCode';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import type { CargoPackage, CargoPackageStatus } from '../../lib/types/api';

interface Props {
  consignmentId: string;
}

const PACKAGE_STATUSES: CargoPackageStatus[] = [
  'PACKED', 'LOADED', 'IN_TRANSIT', 'RECEIVED', 'ISSUED', 'RETURNED', 'HELD', 'DAMAGED', 'LOST',
];

export function ConsignmentPackagesTable({ consignmentId }: Props) {
  const { data: packages, isLoading, error } = useConsignmentPackages(consignmentId);
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newWeight, setNewWeight] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick editing package ID
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<CargoPackageStatus>('PACKED');
  const [editCondition, setEditCondition] = useState('SERVICEABLE');

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newCode.trim()) {
      setFormError('Package code is required');
      return;
    }

    try {
      await createPackageMutation.mutateAsync({
        consignmentId,
        data: {
          code: newCode.trim(),
          contents_summary: newSummary.trim() || undefined,
          quantity: Number(newQty) || 1,
          weight_kg: newWeight ? Number(newWeight) : undefined,
          condition: 'SERVICEABLE',
        },
      });
      setNewCode('');
      setNewSummary('');
      setNewQty('1');
      setNewWeight('');
      setShowAddForm(false);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to create package');
    }
  };

  const handleStartEdit = (pkg: CargoPackage) => {
    setEditingPkgId(pkg.id);
    setEditStatus(pkg.status);
    setEditCondition(pkg.condition || 'SERVICEABLE');
  };

  const handleSaveEdit = async (pkgId: string) => {
    try {
      await updatePackageMutation.mutateAsync({
        id: pkgId,
        data: {
          status: editStatus,
          condition: editCondition,
        },
      });
      setEditingPkgId(null);
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return <LoadingSkeleton lines={3} />;
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load packages" />;
  }

  const pkgList = packages ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
          <h4 className="text-xs font-semibold text-foreground">
            Packages ({pkgList.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-500/15 text-cyan-700 border border-cyan-400/50 hover:bg-cyan-500/25 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/80 dark:hover:bg-cyan-900/60 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          {showAddForm ? 'Cancel' : 'Add Package'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreatePackage}
          className="p-3.5 rounded-lg border border-border bg-surface-muted space-y-3 shadow-sm"
        >
          <p className="text-xs font-medium text-foreground">New Package Specification</p>
          {formError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-foreground-muted mb-1">
                Package Code *
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="PKG-2026-001"
                className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-foreground-muted mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-foreground-muted mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Optional"
                className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-foreground-muted mb-1">
                Summary / Contents
              </label>
              <input
                type="text"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Medical supplies, etc."
                className="w-full px-2.5 py-1.5 rounded bg-surface border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 rounded text-xs text-foreground-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPackageMutation.isPending}
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium disabled:opacity-50 shadow-sm"
            >
              {createPackageMutation.isPending ? 'Adding…' : 'Save Package'}
            </button>
          </div>
        </form>
      )}

      {/* Package List */}
      {pkgList.length === 0 ? (
        <div className="p-4 text-center rounded-lg border border-dashed border-border text-foreground-muted bg-surface-muted/30 text-xs">
          No packages recorded for this consignment.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-surface shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-foreground-muted font-medium">
                <th className="py-2 px-3 font-mono">Code</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Condition</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Weight (kg)</th>
                <th className="py-2 px-3">Contents</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pkgList.map((pkg) => {
                const isEditing = editingPkgId === pkg.id;

                return (
                  <tr key={pkg.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-2 px-3">
                      <EntityCode code={pkg.code} />
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as CargoPackageStatus)}
                          className="px-1.5 py-1 rounded bg-surface border border-border text-foreground text-xs font-mono focus:ring-1 focus:ring-accent"
                        >
                          {PACKAGE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={pkg.status} />
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCondition}
                          onChange={(e) => setEditCondition(e.target.value)}
                          className="px-1.5 py-1 rounded bg-surface border border-border text-foreground text-xs w-28 focus:ring-1 focus:ring-accent"
                        />
                      ) : (
                        <span className="text-foreground-secondary font-mono text-[11px]">{pkg.condition}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-foreground-secondary">
                      {pkg.quantity}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-foreground-muted">
                      {pkg.weight_kg ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-foreground-secondary max-w-[140px] truncate">
                      {pkg.contents_summary ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(pkg.id)}
                            disabled={updatePackageMutation.isPending}
                            className="p-1 rounded text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                            aria-label="Save package edits"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPkgId(null)}
                            className="p-1 rounded text-foreground-muted hover:text-foreground"
                            aria-label="Cancel package edits"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pkg)}
                          className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated"
                          aria-label={`Edit package ${pkg.code}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
