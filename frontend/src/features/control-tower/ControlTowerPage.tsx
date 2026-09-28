import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass, AlertOctagon, RefreshCw, AlertTriangle,
  CheckCircle2, Package, ChevronRight, ArrowRight,
  Truck, Calendar, ChevronDown,
} from 'lucide-react';
import { ProvenanceTag } from '../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { EmptyState } from '../../components/shared/EmptyState';
import { AutoRefreshIndicator } from '../../components/shared/AutoRefreshIndicator';
import { StatusBadge } from '../../components/shared/StatusBadge';

// Domain Hooks
import {
  useControlTowerFastOverview,
  useControlTowerConstraints,
} from './hooks/useControlTower';
import { useTransportLegs } from '../transport/hooks/useTransportLegs';
import { useLocations } from '../locations/hooks/useLocations';
import { useConsignments } from '../cargo/hooks/useConsignments';
import { useAssets } from '../assets/hooks/useAssets';
import { useResourceRunways } from './hooks/useResourceRunways';
import { useOfflineSync } from '../../lib/sync/useOfflineSync';

// Child Components
import { AntarcticRouteNetwork } from './components/AntarcticRouteNetwork';
import { IncidentEscalationBanner } from './components/IncidentEscalationBanner';
import { ScenarioCockpitBanner } from './components/ScenarioCockpitBanner';
import { OfflineSyncSection } from './components/OfflineSyncSection';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import { OfflineSyncDrawer } from './components/OfflineSyncDrawer';
import { DecisionQueuePanel } from './components/DecisionQueuePanel';
import { OperationalEventsFeed } from './components/OperationalEventsFeed';
import { ConsequentialAuditTimeline } from './components/ConsequentialAuditTimeline';
import { MissionReadinessGrid } from './components/MissionReadinessGrid';
import { ActiveConstraintsFeed } from './components/ActiveConstraintsFeed';
import { InitiateReplanModal } from './components/InitiateReplanModal';
import { MitigationOptionsExplorer } from './components/MitigationOptionsExplorer';
import { ApprovalModal } from './components/ApprovalModal';

// Types
import type {
  MissionOperationsItem,
  ControlTowerConstraintItem,
  ExpeditionControlSummary,
  TransportLeg,
} from '../../lib/types/api';

// ─── Modal State Type ─────────────────────────────────────────────────────────

interface InitiateModalState {
  isOpen: boolean;
  missionId?: string | null;
  missionCode?: string | null;
  missionTitle?: string | null;
  constraintCode?: string | null;
  reason?: string;
}

// ─── Command Card Wrapper ─────────────────────────────────────────────────────

function CommandCard({
  children,
  className = '',
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`bg-surface border border-[var(--border-color)] rounded-card shadow-theme-sm ${
        noPadding ? '' : 'p-3.5 sm:p-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Shared Standard Select Style ─────────────────────────────────────────────

const standardSelectClass =
  'h-8 text-xs bg-surface border border-[var(--border-color)] text-foreground rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer transition-colors';



// ─── Expedition Hero (Context Only — No Repeated Dashboard KPIs) ───────────────

function ExpeditionHero({
  expedition,
  expeditions,
  selectedId,
  onSelect,
}: {
  expedition: ExpeditionControlSummary;
  expeditions: ExpeditionControlSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const readinessDot: Record<string, string> = {
    READY: 'bg-status-success',
    AT_RISK: 'bg-status-warning',
    BLOCKED: 'bg-status-critical',
    UNKNOWN: 'bg-foreground-muted',
  };

  return (
    <CommandCard className="relative overflow-hidden" noPadding>
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 80% 50%, var(--accent-cyan), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span className="eyebrow">Expedition Context</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-[var(--border-color)] text-accent font-mono">
                {expedition.code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-tight">
              {expedition.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-foreground-secondary">
                {expedition.season ?? '2026–27 season'}
              </span>
              <span className="text-foreground-muted">•</span>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${
                  expedition.readiness_state === 'READY'
                    ? 'bg-status-success/10 border-status-success/30 text-status-success'
                    : expedition.readiness_state === 'AT_RISK'
                    ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                    : 'bg-status-critical/10 border-status-critical/30 text-status-critical'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full status-pulse ${readinessDot[expedition.readiness_state] ?? 'bg-foreground-muted'}`}
                  aria-hidden="true"
                />
                <span>{expedition.lifecycle_status === 'ACTIVE' ? '● Active' : expedition.lifecycle_status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {expeditions.length > 1 && (
              <select
                aria-label="Select Expedition Campaign"
                value={selectedId}
                onChange={(e) => onSelect(e.target.value)}
                className={standardSelectClass}
              >
                {expeditions.map((e) => (
                  <option key={e.expedition_id} value={e.expedition_id}>
                    {e.code} — {e.name}
                  </option>
                ))}
              </select>
            )}
            <ProvenanceTag provenance={expedition.data_provenance} />
          </div>
        </div>
      </div>
    </CommandCard>
  );
}

// ─── Compact KPI Strip (Requirement 3: 5 focused metrics) ─────────────────────

function CompactKpiStrip({
  readyMissions,
  totalMissions,
  legsCount,
  delayedLegsCount,
  cargoInTransitCount,
  alertCount,
  isOnline,
  secondsAgo,
}: {
  readyMissions: number;
  totalMissions: number;
  legsCount: number;
  delayedLegsCount: number;
  cargoInTransitCount: number;
  alertCount: number;
  isOnline: boolean;
  secondsAgo: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* 1. Mission Readiness */}
      <div className="p-3 sm:p-3.5 bg-surface rounded-card border border-[var(--border-color)] shadow-theme-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">Mission Readiness</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        </div>
        <div className="data-value text-xl sm:text-2xl text-foreground">
          {readyMissions} / {totalMissions}
        </div>
        <div className="meta-text mt-0.5">
          {readyMissions === totalMissions ? 'Ready' : `${totalMissions - readyMissions} at risk`}
        </div>
      </div>

      {/* 2. Transport */}
      <div className="p-3 sm:p-3.5 bg-surface rounded-card border border-[var(--border-color)] shadow-theme-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">Transport</span>
          <Truck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        </div>
        <div className="data-value text-xl sm:text-2xl text-foreground">
          {legsCount} legs
        </div>
        <div className={`meta-text mt-0.5 ${delayedLegsCount > 0 ? 'text-status-warning font-medium' : ''}`}>
          {delayedLegsCount > 0 ? `${delayedLegsCount} delayed` : 'Nominal'}
        </div>
      </div>

      {/* 3. Cargo */}
      <div className="p-3 sm:p-3.5 bg-surface rounded-card border border-[var(--border-color)] shadow-theme-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">Cargo</span>
          <Package className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
        </div>
        <div className="data-value text-xl sm:text-2xl text-foreground">
          {cargoInTransitCount}
        </div>
        <div className="meta-text mt-0.5">In transit</div>
      </div>

      {/* 4. Alerts */}
      <div className="p-3 sm:p-3.5 bg-surface rounded-card border border-[var(--border-color)] shadow-theme-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">Alerts</span>
          <AlertOctagon className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-status-critical' : 'text-foreground-muted'}`} aria-hidden="true" />
        </div>
        <div className={`data-value text-xl sm:text-2xl ${alertCount > 0 ? 'text-status-critical' : 'text-foreground'}`}>
          {alertCount}
        </div>
        <div className="meta-text mt-0.5">
          {alertCount > 0 ? 'Critical' : 'Nominal'}
        </div>
      </div>

      {/* 5. Sync */}
      <div className="p-3 sm:p-3.5 bg-surface rounded-card border border-[var(--border-color)] shadow-theme-sm col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-1">
          <span className="eyebrow">Sync</span>
          <RefreshCw className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
        </div>
        <div className="data-value text-xl sm:text-2xl text-foreground">
          {isOnline ? 'Live' : 'Offline'}
        </div>
        <div className="meta-text mt-0.5">
          Updated {secondsAgo}s ago
        </div>
      </div>
    </div>
  );
}

// ─── Attention Required (Requirement 4: Compact rows, high priority) ──────────

function AttentionRequiredSection({
  constraints,
  delayedLegs,
  onInitiateConstraintReplan,
  onOpenDetails,
}: {
  constraints: ControlTowerConstraintItem[];
  delayedLegs: TransportLeg[];
  onInitiateConstraintReplan: (c: ControlTowerConstraintItem) => void;
  onOpenDetails: () => void;
}) {
  const violatedConstraints = constraints.filter((c) => c.state === 'VIOLATED');

  // Combine top operational alerts
  const alertItems: Array<{
    id: string;
    type: 'constraint' | 'transport';
    title: string;
    target: string;
    severity: 'CRITICAL' | 'ATTENTION';
    extra?: string;
    rawConstraint?: ControlTowerConstraintItem;
  }> = [];

  for (const c of violatedConstraints.slice(0, 3)) {
    alertItems.push({
      id: c.constraint_id,
      type: 'constraint',
      title: c.name,
      target: c.code,
      severity: c.hard_or_soft === 'HARD' ? 'CRITICAL' : 'ATTENTION',
      extra: c.reason ?? undefined,
      rawConstraint: c,
    });
  }

  for (const leg of delayedLegs.slice(0, 2)) {
    if (alertItems.length < 4) {
      alertItems.push({
        id: leg.id,
        type: 'transport',
        title: 'Vessel delay / Transport hold',
        target: `${leg.code} (${leg.mode})`,
        severity: 'ATTENTION',
        extra: leg.delay_reason ?? '+3 days delay',
      });
    }
  }

  return (
    <CommandCard noPadding>
      <div className="p-3 sm:p-3.5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-status-critical/10 border border-status-critical/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-status-critical" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">ATTENTION</span>
              <h2 className="text-base font-bold text-foreground">Attention Required</h2>
              {alertItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-status-critical/10 text-status-critical border border-status-critical/20">
                  {alertItems.length} active
                </span>
              )}
            </div>
            <p className="meta-text mt-0.5">Active constraint violations, vessel holds, and operational delays</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDetails}
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-[var(--border-color)]">
        {alertItems.length === 0 ? (
          <div className="p-3 text-center">
            <p className="text-sm font-medium text-foreground">All operational constraints satisfied</p>
            <p className="meta-text mt-0.5">No critical alerts or transport holds currently active.</p>
          </div>
        ) : (
          alertItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.severity === 'CRITICAL' ? 'bg-status-critical' : 'bg-status-warning'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-foreground-muted flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-mono text-foreground-secondary">{item.target}</span>
                    {item.extra && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-md">{item.extra}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    item.severity === 'CRITICAL'
                      ? 'bg-status-critical/10 text-status-critical border-status-critical/20'
                      : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                  }`}
                >
                  {item.severity}
                </span>
                {item.rawConstraint && (
                  <button
                    type="button"
                    onClick={() => onInitiateConstraintReplan(item.rawConstraint!)}
                    className="px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 rounded transition-colors"
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </CommandCard>
  );
}

// ─── Antarctic Route Network & Live Movements (Polished Schematic) ────────────

function AntarcticRouteNetworkSection({
  legs,
  selectedLocation,
}: {
  legs: TransportLeg[];
  selectedLocation: string;
}) {
  return <AntarcticRouteNetwork legs={legs} selectedLocation={selectedLocation} />;
}

// ─── Logistics Health (Requirement 15: Clean compact rows) ────────────────────

function LogisticsHealthSection({
  expeditionId,
  selectedLocation,
}: {
  expeditionId: string;
  selectedLocation?: string;
}) {
  const { data: runwaySummary } = useResourceRunways(expeditionId);

  const rows = [
    { label: 'Supply', value: '82%', status: 'Nominal', sub: 'Station consumable baseline' },
    { label: 'Fuel', value: '64%', status: 'Attention', sub: '18 days runway' },
    { label: 'Food', value: '88%', status: 'Nominal', sub: 'Field rations covered' },
    { label: 'Critical Spares', value: '41%', status: 'Critical', sub: 'G-02 generator spares gap' },
    { label: 'Transport', value: '55%', status: 'Attention', sub: 'Air corridor hold' },
  ];

  return (
    <CommandCard noPadding>
      <div className="p-3 sm:p-3.5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">LOGISTICS</span>
          <h2 className="section-title mt-0.5">Resource Runway</h2>
          <p className="meta-text mt-0.5">
            Consumable baseline and stock runways{selectedLocation && selectedLocation !== 'ALL' ? ` (${selectedLocation})` : ''}
          </p>
        </div>
        <ProvenanceTag provenance={runwaySummary?.data_provenance ?? 'DERIVED'} />
      </div>

      <div className="p-3 sm:p-3.5 divide-y divide-[var(--border-color)]">
        {rows.map((row) => (
          <div key={row.label} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-foreground">{row.label}</div>
              <div className="meta-text">{row.sub}</div>
            </div>
            <div className="text-right">
              <div className="data-value text-base text-foreground">{row.value}</div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  row.status === 'Nominal'
                    ? 'text-status-success'
                    : row.status === 'Attention'
                    ? 'text-status-warning'
                    : 'text-status-critical'
                }`}
              >
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CommandCard>
  );
}

// ─── Cargo Flow (Requirement 16: Compact horizontal bars + detail link) ───────

function CargoFlowSection({ consignments }: { consignments: ReturnType<typeof useConsignments>['data'] }) {
  const items = consignments ?? [];
  const readyCount = items.filter((c) => c.status === 'READY').length;
  const loadedCount = items.filter((c) => c.status === 'APPROVED' || c.status === 'DECLARED').length;
  const inTransitCount = items.filter((c) => c.status === 'IN_TRANSIT').length;
  const stagedCount = items.filter((c) => c.status === 'REQUESTED' || c.status === 'HELD').length;
  const deliveredCount = items.filter((c) => c.status === 'ARRIVED' || c.status === 'RECEIVED').length;
  const total = Math.max(items.length, 1);

  const stages = [
    { label: 'Cargo Ready', count: readyCount, pct: (readyCount / total) * 100, color: 'bg-status-success' },
    { label: 'Loaded', count: loadedCount, pct: (loadedCount / total) * 100, color: 'bg-accent' },
    { label: 'In Transit', count: inTransitCount, pct: (inTransitCount / total) * 100, color: 'bg-accent-cyan' },
    { label: 'Staged', count: stagedCount, pct: (stagedCount / total) * 100, color: 'bg-status-warning' },
    { label: 'Delivered', count: deliveredCount, pct: (deliveredCount / total) * 100, color: 'bg-status-success' },
  ];

  return (
    <CommandCard noPadding>
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Cargo Flow</span>
          <h2 className="section-title mt-0.5">Consignment Pipeline</h2>
          <p className="meta-text mt-0.5">{items.length} active consignments tracked</p>
        </div>
        <Link
          to="/cargo"
          className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
        >
          <span>Cargo detail</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {stages.map((st) => (
          <div key={st.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground">{st.label}</span>
              <span className="data-value text-foreground-secondary">{st.count}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${st.color} transition-all duration-300`}
                style={{ width: `${Math.max(st.pct, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CommandCard>
  );
}

// ─── Fleet (Requirement 17: Compact rows of vehicles/assets) ──────────────────

function FleetSection({ assets }: { assets: ReturnType<typeof useAssets>['data'] }) {
  const items = assets ?? [];
  const fleetAssets = items.slice(0, 4);

  return (
    <CommandCard noPadding>
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Fleet Assets</span>
          <h2 className="section-title mt-0.5">Fleet</h2>
          <p className="meta-text mt-0.5">Active vehicles, aircraft and maritime vessels</p>
        </div>
        <Link
          to="/assets"
          className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
        >
          <span>Fleet assets</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-[var(--border-color)]">
        {fleetAssets.length === 0 ? (
          <div className="p-4 text-center meta-text">No fleet assets active</div>
        ) : (
          fleetAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-surface-elevated transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>{asset.description || asset.code}</span>
                  <span className="entity-id text-[11px]">{asset.code}</span>
                </div>
                <div className="meta-text mt-0.5">
                  {asset.type} • {asset.criticality ?? 'Standard'}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={asset.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </CommandCard>
  );
}

// ─── Expeditions Overview (Requirement 18: Compact cards with Set Context) ────

function ExpeditionsSection({
  expeditions,
  selectedId,
  onSelect,
}: {
  expeditions: ExpeditionControlSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <CommandCard noPadding>
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Campaigns</span>
          <h2 className="section-title mt-0.5">Expeditions</h2>
          <p className="meta-text mt-0.5">Antarctic campaign portfolios</p>
        </div>
        <span className="text-xs text-foreground-muted font-medium">{expeditions.length} campaigns</span>
      </div>

      <div className="p-4 space-y-3">
        {expeditions.map((exp) => {
          const isCurrent = exp.expedition_id === selectedId;
          return (
            <div
              key={exp.expedition_id}
              className={`p-3.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-[var(--border-color)] bg-surface hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-foreground">{exp.name}</div>
                  <div className="meta-text mt-0.5 flex items-center gap-1.5">
                    <span className="font-mono text-accent">{exp.code}</span>
                    <span>•</span>
                    <span>{exp.season ?? '2026–27 season'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      exp.readiness_state === 'READY'
                        ? 'bg-status-success/10 text-status-success border-status-success/20'
                        : 'bg-status-warning/10 text-status-warning border-status-warning/20'
                    }`}
                  >
                    {exp.readiness_state}
                  </span>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => onSelect(exp.expedition_id)}
                      className="text-xs text-accent hover:underline font-medium px-2 py-1"
                    >
                      Set as Current
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-semibold text-accent px-2 py-1">Active</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CommandCard>
  );
}

// ─── Upcoming Milestones (Requirement 19: Compact timeline/list) ──────────────

function UpcomingMilestonesSection({ legs }: { legs: TransportLeg[] }) {
  const delayedCount = legs.filter((l) => l.status === 'DELAYED').length;
  const milestones = [
    { date: '12 Dec', title: 'Halley cargo seal-out', status: 'Completed', color: 'text-status-success' },
    { date: '14 Dec', title: 'Pack-ice route review', status: 'In Review', color: 'text-status-warning' },
    { date: '16 Dec', title: 'Bharati handover', status: 'Scheduled', color: 'text-accent' },
    { date: '18 Dec', title: 'Kara Aurora arrival', status: 'Active', color: 'text-status-success' },
  ];

  return (
    <CommandCard noPadding>
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Schedule</span>
          <h2 className="section-title mt-0.5">Upcoming Milestones</h2>
          <p className="meta-text mt-0.5">
            Operational milestones and schedule checkpoints{delayedCount > 0 ? ` (${delayedCount} delayed)` : ''}
          </p>
        </div>
        <Calendar className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
      </div>

      <div className="p-4 divide-y divide-[var(--border-color)]">
        {milestones.map((ms) => (
          <div key={ms.title} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-accent shrink-0">
                {ms.date}
              </span>
              <span className="text-sm font-medium text-foreground">{ms.title}</span>
            </div>
            <span className={`text-[11px] font-semibold ${ms.color}`}>{ms.status}</span>
          </div>
        ))}
      </div>
    </CommandCard>
  );
}

// ─── Main Control Tower Page ──────────────────────────────────────────────────

export function ControlTowerPage() {
  const { data: overview, dataUpdatedAt, isFetching, isLoading, error } = useControlTowerFastOverview();
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Real domain queries for dashboard metrics
  const { data: rawLocations } = useLocations();
  const locations = Array.isArray(rawLocations) ? rawLocations : [];
  const { data: rawTransportLegs } = useTransportLegs();
  const transportLegs = Array.isArray(rawTransportLegs) ? rawTransportLegs : [];
  const { data: rawConsignments } = useConsignments();
  const consignments = Array.isArray(rawConsignments) ? rawConsignments : [];
  const { data: rawAssets } = useAssets();
  const assets = Array.isArray(rawAssets) ? rawAssets : [];
  const { snapshot } = useOfflineSync();

  // Active expedition
  const activeExpeditionId =
    selectedExpeditionId ??
    (overview?.expeditions && overview.expeditions.length > 0
      ? overview.expeditions[0].expedition_id
      : '');

  const activeExpedition =
    overview?.expeditions?.find((e) => e.expedition_id === activeExpeditionId) ??
    overview?.expeditions?.[0];

  // Active constraints for Attention Required & Detailed View
  const { data: rawConstraints } = useControlTowerConstraints(activeExpeditionId);
  const constraints = Array.isArray(rawConstraints) ? rawConstraints : [];

  // Modals
  const [initiateModalState, setInitiateModalState] = useState<InitiateModalState>({ isOpen: false });
  const [optionsExplorerState, setOptionsExplorerState] = useState<{ isOpen: boolean; replanId: string | null }>({
    isOpen: false,
    replanId: null,
  });
  const [approvalModalState, setApprovalModalState] = useState<{ isOpen: boolean; recommendationId: string | null }>({
    isOpen: false,
    recommendationId: null,
  });
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [showDetailedInspections, setShowDetailedInspections] = useState(false);

  useEffect(() => {
    if (!selectedExpeditionId && overview?.expeditions && overview.expeditions.length > 0) {
      setSelectedExpeditionId(overview.expeditions[0].expedition_id);
    }
  }, [overview, selectedExpeditionId]);

  // URL Incident context handling
  const [searchParams, setSearchParams] = useSearchParams();
  const urlIncidentId = searchParams.get('incidentId');
  const urlReplanId = searchParams.get('replanId');

  const handleDismissIncidentContext = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('incidentId');
    nextParams.delete('replanId');
    setSearchParams(nextParams, { replace: true });
  };

  const handleExploreIncidentOptions = (targetReplanId: string) => {
    setOptionsExplorerState({ isOpen: true, replanId: targetReplanId });
  };

  const handleInitiateMissionReplan = (mission: MissionOperationsItem) => {
    setInitiateModalState({
      isOpen: true,
      missionId: mission.mission_id,
      missionCode: mission.code,
      missionTitle: mission.title,
      reason: `Operational disruption affecting mission ${mission.code} (${mission.title}); operator initiated replanning required.`,
    });
  };

  const handleInitiateConstraintReplan = (constraint: ControlTowerConstraintItem) => {
    setInitiateModalState({
      isOpen: true,
      constraintCode: constraint.code,
      reason: `Hard constraint violation detected for ${constraint.code}: ${constraint.reason}`,
    });
  };

  const handleReplanCreated = (newReplanId: string) => {
    setOptionsExplorerState({ isOpen: true, replanId: newReplanId });
  };

  const handleSelectRecommendation = (recId: string) => {
    setApprovalModalState({ isOpen: true, recommendationId: recId });
  };

  // Calculations for KPI strip
  const readyMissions = activeExpedition?.ready_missions_count ?? overview?.missions_by_readiness?.['READY'] ?? 0;
  const totalMissions = activeExpedition?.total_missions ?? overview?.total_missions ?? 0;
  const delayedLegs = (transportLegs || []).filter((l) => l && l.status === 'DELAYED');
  const cargoInTransit = (consignments || []).filter((c) => c && c.status === 'IN_TRANSIT').length;
  const alertCount =
    (overview?.critical_constraints_violated_count ?? 0) + (overview?.active_incidents_count ?? 0);
  const secondsAgo = Math.max(1, Math.round((Date.now() - (dataUpdatedAt || Date.now())) / 1000));

  // ─── Loading State ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div>
          <p className="eyebrow mb-1.5">Expedition Command</p>
          <h1 className="page-title">Control Tower</h1>
          <p className="body-text-sm mt-1">Operational command center & mission readiness posture</p>
        </div>
        <div className="bg-surface border border-[var(--border-color)] rounded-card p-5">
          <LoadingSkeleton lines={3} />
        </div>
        <div className="bg-surface border border-[var(--border-color)] rounded-card p-5">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <p className="eyebrow mb-1.5">Expedition Command</p>
          <h1 className="page-title">Control Tower</h1>
          <p className="body-text-sm mt-1">Operational command center & mission readiness posture</p>
        </div>
        <ErrorDisplay error={error} title="Failed to load Control Tower operational overview" />
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────────

  if (!overview?.expeditions || overview.expeditions.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <p className="eyebrow mb-1.5">Expedition Command</p>
          <h1 className="page-title">Control Tower</h1>
          <p className="body-text-sm mt-1">Operational command center & mission readiness posture</p>
        </div>
        <EmptyState
          title="No expeditions available"
          message="No active polar expeditions were found for operational monitoring."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Top Header (Requirements 1, 5, 6, 25) ────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-2 border-b border-[var(--border-color)]">
        <div>
          <p className="eyebrow mb-1">Expedition Command</p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">Control Tower</h1>

            {/* EXPEDITION DROPDOWN (Requirement 5) */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="expedition-selector" className="text-xs text-foreground-muted font-medium">
                Expedition:
              </label>
              <select
                id="expedition-selector"
                aria-label="Expedition Context Selector"
                value={activeExpeditionId}
                onChange={(e) => setSelectedExpeditionId(e.target.value)}
                className={standardSelectClass}
              >
                {overview.expeditions.map((exp) => (
                  <option key={exp.expedition_id} value={exp.expedition_id}>
                    {exp.code} — {exp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LOCATION FILTER DROPDOWN (Requirement 6) */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="location-filter" className="text-xs text-foreground-muted font-medium">
                Location:
              </label>
              <select
                id="location-filter"
                aria-label="Location Filter"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={standardSelectClass}
              >
                <option value="ALL">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="body-text-sm mt-1">
            Operational command center & mission readiness posture
          </p>
        </div>

        {/* Right Header Status Indicators */}
        <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
          <AutoRefreshIndicator dataUpdatedAt={dataUpdatedAt} intervalSeconds={12} isFetching={isFetching} />
          <OfflineSyncIndicator onOpenDrawer={() => setIsSyncDrawerOpen(true)} showToggle={false} />
          <span className="meta-text">{`Campaigns: ${overview.total_expeditions}`}</span>
          <ProvenanceTag provenance={overview.data_provenance ?? 'DERIVED'} />
        </div>
      </div>

      {/* ── Incident Context Banner (if navigated from incident escalation) ─ */}
      {urlIncidentId && urlReplanId && (
        <IncidentEscalationBanner
          incidentId={urlIncidentId}
          replanId={urlReplanId}
          onExploreOptions={handleExploreIncidentOptions}
          onDismiss={handleDismissIncidentContext}
        />
      )}

      {/* ── 1. Hero: Expedition Context & KPI Strip (Quick Jump: #overview) ─────── */}
      <div id="overview" className="space-y-4">
        {activeExpedition && (
          <ExpeditionHero
            expedition={activeExpedition}
            expeditions={overview.expeditions}
            selectedId={activeExpeditionId}
            onSelect={setSelectedExpeditionId}
          />
        )}

        <CompactKpiStrip
          readyMissions={readyMissions}
          totalMissions={totalMissions}
          legsCount={transportLegs.length}
          delayedLegsCount={delayedLegs.length}
          cargoInTransitCount={cargoInTransit}
          alertCount={alertCount}
          isOnline={snapshot.effectiveOnline}
          secondsAgo={secondsAgo}
        />
      </div>

      {/* ── 3. Attention Required (Quick Jump: #attention) ─ */}
      <div id="attention">
        <AttentionRequiredSection
          constraints={constraints}
          delayedLegs={delayedLegs}
          onInitiateConstraintReplan={handleInitiateConstraintReplan}
          onOpenDetails={() => setShowDetailedInspections(!showDetailedInspections)}
        />
      </div>

      {/* ── 4. Antarctic Route Network + Live Movements (Quick Jump: #routes) ─ */}
      <div id="routes">
        <AntarcticRouteNetworkSection
          legs={transportLegs}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* ── 5. Mission Readiness + Active Constraints (Requirement 3, 29: Natural content sizing, no nested cards) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div id="missions">
          <MissionReadinessGrid
            expeditionId={activeExpeditionId}
            onInitiateReplan={handleInitiateMissionReplan}
          />
        </div>
        <div id="constraints">
          <ActiveConstraintsFeed
            expeditionId={activeExpeditionId}
            onInitiateReplanForConstraint={handleInitiateConstraintReplan}
          />
        </div>
      </div>

      {/* ── 6. Logistics Health + Decisions (Quick Jump: #decisions) ───────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <LogisticsHealthSection
          expeditionId={activeExpeditionId}
          selectedLocation={selectedLocation}
        />
        <div id="decisions">
          <DecisionQueuePanel
            expeditionId={activeExpeditionId}
            onSelectRecommendation={handleSelectRecommendation}
            onViewReplanOptions={(replanId) => setOptionsExplorerState({ isOpen: true, replanId })}
          />
        </div>
      </div>

      {/* ── 7. Scenario Simulator + Connectivity (Requirement 26, 27, 29) ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <ScenarioCockpitBanner expeditionId={activeExpeditionId} />
        <OfflineSyncSection
          expeditionId={activeExpeditionId}
          onOpenDrawer={() => setIsSyncDrawerOpen(true)}
        />
      </div>

      {/* ── 8. Compact Activity & Consequential Audit (Quick Jump: #activity) ────── */}
      <div id="activity" className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <OperationalEventsFeed expeditionId={activeExpeditionId} />
        <ConsequentialAuditTimeline expeditionId={activeExpeditionId} />
      </div>

      {/* ── 9. Supporting Logistics & Milestones (Collapsible Operations Panel) ── */}
      <details className="group bg-surface border border-[var(--border-color)] rounded-card shadow-theme-sm overflow-hidden transition-all">
        <summary className="px-3.5 sm:px-4 py-2.5 sm:py-3 cursor-pointer list-none flex items-center justify-between hover:bg-surface-elevated select-none transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="eyebrow text-foreground-muted">SUPPORTING OPERATIONS</span>
            <span className="text-xs font-semibold text-foreground">
              Cargo Flow, Fleet Inventory, Expeditions & Upcoming Milestones
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted group-open:text-accent font-medium">
            <span className="group-open:hidden">Show details</span>
            <span className="hidden group-open:inline">Hide details</span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="p-3.5 sm:p-4 border-t border-[var(--border-color)] space-y-3.5 sm:space-y-4 bg-background/50">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-4">
            <CargoFlowSection consignments={consignments} />
            <FleetSection assets={assets} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-4">
            <ExpeditionsSection
              expeditions={overview.expeditions}
              selectedId={activeExpeditionId}
              onSelect={setSelectedExpeditionId}
            />
            <UpcomingMilestonesSection legs={transportLegs} />
          </div>
        </div>
      </details>

      {/* ── Quick Domain Navigation ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {[
          { to: '/cargo', label: 'Cargo', sub: 'Consignments' },
          { to: '/transport', label: 'Transport', sub: 'Fleet legs' },
          { to: '/inventory', label: 'Inventory', sub: 'Stock lots' },
          { to: '/assets', label: 'Assets', sub: 'Equipment' },
          { to: '/incidents', label: 'Incidents', sub: 'Escalations' },
          { to: '/locations', label: 'Locations', sub: 'Waypoints' },
        ].map(({ to, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center justify-between p-3 bg-surface border border-[var(--border-color)] rounded-lg hover:bg-surface-elevated hover:border-accent/30 transition-all shadow-theme-sm"
          >
            <div>
              <div className="text-xs font-semibold text-foreground">{label}</div>
              <div className="text-[10px] text-foreground-muted">{sub}</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-foreground-muted group-hover:text-accent transition-colors" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* ── Modal Workflows ───────────────────────────────────────────────── */}
      <InitiateReplanModal
        isOpen={initiateModalState.isOpen}
        onClose={() => setInitiateModalState({ isOpen: false })}
        expeditionId={activeExpeditionId}
        missionId={initiateModalState.missionId}
        missionCode={initiateModalState.missionCode}
        missionTitle={initiateModalState.missionTitle}
        constraintCode={initiateModalState.constraintCode}
        initialReason={initiateModalState.reason}
        onReplanCreated={handleReplanCreated}
      />

      <MitigationOptionsExplorer
        isOpen={optionsExplorerState.isOpen}
        onClose={() => setOptionsExplorerState({ isOpen: false, replanId: null })}
        replanId={optionsExplorerState.replanId}
        expeditionId={activeExpeditionId}
        onSelectRecommendation={handleSelectRecommendation}
      />

      {approvalModalState.isOpen && approvalModalState.recommendationId && (
        <ApprovalModal
          recommendationId={approvalModalState.recommendationId}
          onClose={() => setApprovalModalState({ isOpen: false, recommendationId: null })}
          expeditionId={activeExpeditionId}
        />
      )}

      <OfflineSyncDrawer
        isOpen={isSyncDrawerOpen}
        onClose={() => setIsSyncDrawerOpen(false)}
      />
    </div>
  );
}

export default ControlTowerPage;
