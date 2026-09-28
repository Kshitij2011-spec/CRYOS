import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import type { InventoryTransaction } from '../../lib/types/api';

interface Props {
  transactions: InventoryTransaction[];
  isLoading?: boolean;
}

export function InventoryTransactionsTable({ transactions, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-foreground-muted text-sm">
        Loading transaction ledger...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center text-foreground-muted text-sm border border-border rounded bg-surface-muted">
        No transaction ledger entries recorded for this lot.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-border bg-surface">
      <table className="w-full text-left text-xs" role="table" aria-label="Transaction ledger">
        <thead className="bg-surface-muted text-xs font-semibold text-foreground-secondary uppercase tracking-[0.05em] border-b border-border">
          <tr>
            <th className="px-3 py-2">Timestamp</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2 text-right">Quantity</th>
            <th className="px-3 py-2 text-right">Balance After</th>
            <th className="px-3 py-2">Reference</th>
            <th className="px-3 py-2">Provenance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-sm">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-surface-elevated transition-colors">
              <td className="px-3 py-2 text-foreground-secondary whitespace-nowrap">
                {new Date(tx.created_at).toLocaleString()}
              </td>
              <td className="px-3 py-2 font-semibold text-cyan-700 dark:text-cyan-300">
                {tx.transaction_type}
              </td>
              <td className="px-3 py-2 text-right font-semibold text-foreground">
                {tx.quantity}
              </td>
              <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                {tx.balance_after}
              </td>
              <td className="px-3 py-2 text-foreground-secondary truncate max-w-[120px]" title={tx.reference_id ?? ''}>
                {tx.reference_id ? (tx.reference_id.length > 8 ? `${tx.reference_id.slice(0, 8)}...` : tx.reference_id) : '-'}
              </td>
              <td className="px-3 py-2">
                <ProvenanceTag provenance={tx.data_provenance} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
