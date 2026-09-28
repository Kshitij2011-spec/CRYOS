import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useLocations } from './hooks/useLocations';
import { LocationDetailPanel } from './LocationDetailPanel';
import { LocationStatusBadge } from './LocationStatusBadge';
import { EntityCode } from '../../components/shared/EntityCode';
import { OperationalTable } from '../../components/shared/OperationalTable';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { PageHeader } from '../../components/shared/PageHeader';
import { AutoRefreshIndicator } from '../../components/shared/AutoRefreshIndicator';
import type { Location, LocationStatus } from '../../lib/types/api';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Restricted', value: 'RESTRICTED' },
  { label: 'Inaccessible', value: 'INACCESSIBLE' },
  { label: 'Closed', value: 'CLOSED' },
];

export function LocationsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, dataUpdatedAt, isFetching, isLoading, error } = useLocations({ status: statusFilter || undefined });

  // Map for resolving parent location IDs to human-readable names
  const locationMap = (data ?? []).reduce<Record<string, Location>>((acc, l) => {
    acc[l.id] = l;
    return acc;
  }, {});

  // Client-side name search (API doesn't support search param)
  const filtered = (data ?? []).filter((loc) =>
    search
      ? loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.code.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (loc: Location) => (
        <EntityCode code={loc.code} onClick={() => setSelectedId(loc.id)} />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (loc: Location) => (
        <span className="font-medium text-foreground">{loc.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (loc: Location) => (
        <span className="text-foreground-secondary text-sm">{loc.type}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (loc: Location) => <LocationStatusBadge status={loc.status as LocationStatus} />,
    },
    {
      key: 'hierarchy',
      header: 'Parent',
      render: (loc: Location) => {
        if (!loc.parent_location_id) {
          return <span className="text-foreground-muted text-xs italic">root</span>;
        }
        const parent = locationMap[loc.parent_location_id];
        return (
          <span className="text-foreground-secondary text-sm">
            {parent ? `${parent.name} (${parent.code})` : `${loc.parent_location_id.slice(0, 8)}…`}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Operational facilities, field depots, and logistics nodes"
        actions={
          <div className="flex items-center gap-3">
            <AutoRefreshIndicator dataUpdatedAt={dataUpdatedAt} intervalSeconds={25} isFetching={isFetching} />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
              <span className="text-foreground-secondary text-xs">{filtered.length} locations</span>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search locations"
            className="pl-9 pr-4 py-2 rounded-lg bg-surface-elevated border border-border text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:border-cyan-600 w-60 transition-colors"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === f.value
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-900/60 dark:border-cyan-700 dark:text-cyan-300'
                  : 'bg-surface-elevated border-border text-foreground-secondary hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {isLoading && <div className="p-6"><LoadingSkeleton lines={8} /></div>}
        {error && <div className="p-6"><ErrorDisplay error={error} title="Failed to load locations" /></div>}
        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            title="No locations found"
            message="No locations match the current filters. Try adjusting the status filter or search."
            icon={<MapPin className="w-12 h-12" />}
          />
        )}
        {!isLoading && !error && filtered.length > 0 && (
          <OperationalTable
            columns={columns}
            data={filtered}
            getRowKey={(loc) => loc.id}
            onRowClick={(loc) => setSelectedId(loc.id)}
          />
        )}
      </div>

      {/* Detail panel */}
      {selectedId && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
            aria-hidden="true"
          />
          <LocationDetailPanel
            locationId={selectedId}
            onClose={() => setSelectedId(null)}
            onNavigate={(loc) => setSelectedId(loc.id)}
          />
        </>
      )}
    </div>
  );
}
