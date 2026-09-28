import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EntityCode } from '../../components/shared/EntityCode';
import type { InventoryStockLot } from '../../lib/types/api';

interface Props {
  lots: InventoryStockLot[];
  selectedLotId?: string | null;
  onSelectLot: (lot: InventoryStockLot) => void;
}

export function StockLotsTable({ lots, selectedLotId, onSelectLot }: Props) {
  if (lots.length === 0) {
    return (
      <div className="p-8 text-center text-foreground-muted text-sm border border-border rounded-lg bg-surface-muted">
        No stock lots found for this item.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm" role="table" aria-label="Stock lots table">
        <thead className="bg-surface-muted text-xs font-semibold text-foreground-secondary uppercase tracking-[0.05em] border-b border-border">
          <tr>
            <th className="px-4 py-3">Lot Number</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">On Hand</th>
            <th className="px-4 py-3 text-right">Available</th>
            <th className="px-4 py-3 text-right">Reserved</th>
            <th className="px-4 py-3 text-center">Deficit</th>
            <th className="px-4 py-3">Expiry</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-sm">
          {lots.map((lot) => {
            const isSelected = selectedLotId === lot.id;
            return (
              <tr
                key={lot.id}
                className={`transition-colors hover:bg-surface-elevated ${
                  isSelected ? 'bg-cyan-50/70 dark:bg-cyan-950/30' : ''
                }`}
              >
                <td className="px-4 py-3 font-semibold text-foreground">
                  <EntityCode code={lot.lot_number} />
                </td>
                <td className="px-4 py-3 text-foreground-secondary truncate max-w-[120px]" title={lot.location_id}>
                  {lot.location_id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lot.status} />
                </td>
                <td className="px-4 py-3 text-right text-foreground">
                  {lot.on_hand_quantity}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {lot.available_quantity}
                </td>
                <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-300">
                  {lot.reserved_quantity}
                </td>
                <td className="px-4 py-3 text-center">
                  {lot.is_deficit ? (
                    <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-bold" title="Deficit: Available below reorder threshold">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="text-foreground-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground-secondary">
                  {lot.expiry_date ? new Date(lot.expiry_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectLot(lot)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors font-medium border ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-600 text-white dark:bg-cyan-700 dark:border-cyan-600 dark:text-cyan-100'
                        : 'bg-surface-elevated hover:bg-surface-muted text-foreground border-border'
                    }`}
                    aria-label={`Select lot ${lot.lot_number}`}
                  >
                    {isSelected ? 'Active' : 'Manage'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
