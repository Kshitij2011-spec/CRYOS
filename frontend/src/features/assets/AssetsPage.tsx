import { useState, useMemo } from 'react';
import { Cpu, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { AutoRefreshIndicator } from '../../components/shared/AutoRefreshIndicator';
import { EntityCode } from '../../components/shared/EntityCode';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { AssetDetailPanel } from './AssetDetailPanel';
import { useAssets } from './hooks/useAssets';
import { useLocationsLookup } from '../locations/hooks/useLocations';
import type { Asset, AssetStatus, AssetCriticality } from '../../lib/types/api';

const STATUS_OPTIONS: Array<AssetStatus | 'ALL'> = [
  'ALL',
  'AVAILABLE',
  'RESERVED',
  'IN_USE',
  'MAINTENANCE',
  'QUARANTINED',
  'RETIRED',
];

const CRITICALITY_OPTIONS: Array<AssetCriticality | 'ALL'> = [
  'ALL',
  'STANDARD',
  'MISSION_CRITICAL',
  'LIFE_SUPPORT',
  'SAFETY',
];

export function AssetsPage() {
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState<AssetCriticality | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filters = useMemo(() => {
    const f: { status?: AssetStatus; criticality?: AssetCriticality } = {};
    if (statusFilter !== 'ALL') f.status = statusFilter;
    if (criticalityFilter !== 'ALL') f.criticality = criticalityFilter;
    return f;
  }, [statusFilter, criticalityFilter]);

  const {
    data: assets = [],
    dataUpdatedAt,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useAssets(filters);

  const locationsLookup = useLocationsLookup();

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a: Asset) =>
        a.code.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        (a.serial_number && a.serial_number.toLowerCase().includes(q))
    );
  }, [assets, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets & Maintenance"
        subtitle="Polar expedition equipment registry, readiness lifecycle, relocation, and maintenance tracking"
        actions={
          <div className="flex items-center gap-3">
            <AutoRefreshIndicator dataUpdatedAt={dataUpdatedAt} intervalSeconds={25} isFetching={isFetching} />
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span className="text-slate-400 text-xs">{filteredAssets.length} assets</span>
            </div>
          </div>
        }
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by code, type, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-cyan-500 transition-colors"
              aria-label="Search assets"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
            <label htmlFor="asset-status-filter" className="sr-only">Filter by Status</label>
            <select
              id="asset-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'ALL')}
              className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="asset-criticality-filter" className="sr-only">Filter by Criticality</label>
            <select
              id="asset-criticality-filter"
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value as AssetCriticality | 'ALL')}
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
          Showing {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main Content */}
      {isLoading && (
        <div className="p-6">
          <LoadingSkeleton lines={6} />
        </div>
      )}

      {error && (
        <div className="p-6">
          <ErrorDisplay error={error} title="Failed to load assets" />
        </div>
      )}

      {!isLoading && !error && filteredAssets.length === 0 && (
        <EmptyState
          icon={<Cpu className="w-12 h-12 text-foreground-muted" aria-hidden="true" />}
          title="No Assets Found"
          message={
            searchQuery || statusFilter !== 'ALL' || criticalityFilter !== 'ALL'
              ? 'Try modifying active filters or search terms.'
              : 'No operational equipment registered in the platform.'
          }
        />
      )}

      {!isLoading && !error && filteredAssets.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm" role="table" aria-label="Assets table">
            <thead className="bg-surface-muted text-xs font-semibold text-foreground-secondary uppercase tracking-[0.05em] border-b border-border">
              <tr>
                <th className="px-4 py-3">Asset Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Serial No</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Criticality</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Provenance</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredAssets.map((asset: Asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-surface-elevated transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">
                    <EntityCode code={asset.code} />
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    {asset.type}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {asset.serial_number ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        asset.condition === 'OPERATIONAL'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
                          : asset.condition === 'DEGRADED'
                          ? 'text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60'
                          : 'text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/60'
                      }`}
                    >
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {asset.criticality}
                  </td>
                  <td className="px-4 py-3 text-foreground truncate max-w-[140px]" title={asset.location_id}>
                    {asset.location_id ? (locationsLookup.get(asset.location_id)?.name ?? `${asset.location_id.slice(0, 8)}…`) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ProvenanceTag provenance={asset.data_provenance} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="px-3 py-1 rounded text-xs bg-surface-elevated hover:bg-surface-muted text-foreground border border-border transition-colors font-medium"
                      aria-label={`Inspect ${asset.code}`}
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

      {/* Detail Slide-over Panel */}
      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onRefreshAsset={refetch}
        />
      )}
    </div>
  );
}
