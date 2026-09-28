import { useState, useMemo } from 'react';
import { Boxes, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { AutoRefreshIndicator } from '../../components/shared/AutoRefreshIndicator';
import { EntityCode } from '../../components/shared/EntityCode';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { InventoryDetailPanel } from './InventoryDetailPanel';
import { useInventoryItems } from './hooks/useInventoryItems';
import type { InventoryItem, ItemCriticality } from '../../lib/types/api';

const CRITICALITY_OPTIONS: Array<ItemCriticality | 'ALL'> = [
  'ALL',
  'STANDARD',
  'MISSION_CRITICAL',
  'LIFE_SUPPORT',
  'SAFETY',
];

export function InventoryPage() {
  const [selectedCriticality, setSelectedCriticality] = useState<ItemCriticality | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const {
    data: items = [],
    dataUpdatedAt,
    isFetching,
    isLoading,
    error,
  } = useInventoryItems(
    selectedCriticality !== 'ALL' ? { criticality: selectedCriticality } : undefined
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item: InventoryItem) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Operations"
        subtitle="Authoritative expedition inventory tracking, stock lot balances, and operational requisition workflows"
        actions={
          <div className="flex items-center gap-3">
            <AutoRefreshIndicator dataUpdatedAt={dataUpdatedAt} intervalSeconds={25} isFetching={isFetching} />
            <div className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span className="text-slate-400 text-xs">{filteredItems.length} items</span>
            </div>
          </div>
        }
      />

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by code, item name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-cyan-500 transition-colors"
              aria-label="Search inventory items"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
            <label htmlFor="criticality-filter" className="sr-only">Filter by Criticality</label>
            <select
              id="criticality-filter"
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value as ItemCriticality | 'ALL')}
              className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {CRITICALITY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Criticalities' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-foreground-secondary self-center">
          Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main Content Area */}
      {isLoading && (
        <div className="p-6">
          <LoadingSkeleton lines={6} />
        </div>
      )}

      {error && (
        <div className="p-6">
          <ErrorDisplay error={error} title="Failed to load inventory items" />
        </div>
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <EmptyState
          icon={<Boxes className="w-12 h-12 text-foreground-muted" aria-hidden="true" />}
          title="No Inventory Items Found"
          message={
            searchQuery || selectedCriticality !== 'ALL'
              ? 'Try clearing or modifying the search filters.'
              : 'No items currently cataloged in the inventory system.'
          }
        />
      )}

      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm" role="table" aria-label="Inventory catalog">
            <thead className="bg-surface-muted text-xs font-semibold text-foreground-secondary uppercase tracking-[0.05em] border-b border-border">
              <tr>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Criticality</th>
                <th className="px-4 py-3">UOM</th>
                <th className="px-4 py-3">Storage Specs</th>
                <th className="px-4 py-3">Provenance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredItems.map((item: InventoryItem) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-elevated transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <EntityCode code={item.code} />
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {item.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.criticality === 'LIFE_SUPPORT' || item.criticality === 'SAFETY'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700/60'
                          : item.criticality === 'MISSION_CRITICAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/60'
                          : 'bg-surface-muted text-foreground-secondary border border-border'
                      }`}
                    >
                      {item.criticality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {item.unit_of_measure}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary text-[11px]">
                    {item.minimum_temperature_c && item.maximum_temperature_c
                      ? `${item.minimum_temperature_c}°C to ${item.maximum_temperature_c}°C`
                      : item.hazmat_class
                      ? `Hazmat: ${item.hazmat_class}`
                      : 'Standard'}
                  </td>
                  <td className="px-4 py-3">
                    <ProvenanceTag provenance={item.data_provenance} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1 rounded text-xs bg-surface-elevated hover:bg-surface-muted text-foreground border border-border transition-colors font-medium"
                      aria-label={`Inspect ${item.name}`}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Detail Panel */}
      {selectedItem && (
        <InventoryDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
