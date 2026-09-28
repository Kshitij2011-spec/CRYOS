import { useState, useMemo } from 'react';
import {
  Ship, Plane, Truck, ArrowRight, RotateCcw,
  Layers, ChevronDown, X,
} from 'lucide-react';
import type { TransportLeg } from '../../../lib/types/api';

export interface AntarcticRouteNetworkProps {
  legs: TransportLeg[];
  selectedLocation?: string;
  className?: string;
}

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'nominal' | 'active' | 'attention' | 'critical';
  type: 'STATION' | 'PORT' | 'CAMP' | 'WAYPOINT';
  coords: string;
}

interface RouteData {
  id: string;
  from: string;
  to: string;
  mode: 'VESSEL' | 'AIR' | 'GROUND' | 'HELICOPTER';
  status: 'nominal' | 'active' | 'attention' | 'critical';
  label: string;
  assetName: string;
  eta: string;
  cargoSummary?: string;
  incidentFlag?: boolean;
}

const NODES: NodeData[] = [
  { id: 'CPT', label: 'Cape Town', x: 170, y: 55, status: 'nominal', type: 'PORT', coords: '33°55′S 18°25′E' },
  { id: 'GAO', label: 'Goa Logistics Port', x: 340, y: 45, status: 'nominal', type: 'PORT', coords: '15°24′N 73°48′E' },
  { id: 'BTH', label: 'Bharati Station', x: 200, y: 195, status: 'active', type: 'STATION', coords: '69°24′S 76°11′E' },
  { id: 'MTR', label: 'Maitri Station', x: 310, y: 185, status: 'attention', type: 'STATION', coords: '70°46′S 11°44′E' },
  { id: 'LRR', label: 'Larsen Ridge Camp', x: 130, y: 275, status: 'critical', type: 'CAMP', coords: '67°00′S 62°30′W' },
  { id: 'SVA', label: 'Svarteisen Hub', x: 390, y: 245, status: 'nominal', type: 'WAYPOINT', coords: '71°18′S 25°00′E' },
];

const DEFAULT_ROUTES: RouteData[] = [
  {
    id: 'R-01',
    from: 'CPT',
    to: 'BTH',
    mode: 'VESSEL',
    status: 'active',
    label: 'Kara Aurora • In Transit',
    assetName: 'MV Kara Aurora',
    eta: '18 Dec 06:40 UTC',
    cargoSummary: 'Heavy Fuel & Bio-lab modules (48t)',
  },
  {
    id: 'R-02',
    from: 'GAO',
    to: 'MTR',
    mode: 'AIR',
    status: 'attention',
    label: 'Polaris Sever • Delayed',
    assetName: 'IL-76TD Polaris Sever',
    eta: '+3 days weather hold',
    cargoSummary: 'Winter expedition food stores (14t)',
    incidentFlag: true,
  },
  {
    id: 'R-03',
    from: 'BTH',
    to: 'LRR',
    mode: 'AIR',
    status: 'critical',
    label: 'LC-130 / A7 • Flight Hold',
    assetName: 'Ski-equipped LC-130',
    eta: 'Sortie suspended',
    cargoSummary: 'Glaciology drill replacement core',
    incidentFlag: true,
  },
  {
    id: 'R-04',
    from: 'MTR',
    to: 'SVA',
    mode: 'GROUND',
    status: 'nominal',
    label: 'Snowcat Alpha • En Route',
    assetName: 'PistenBully 300 Polar',
    eta: 'On schedule • 4h remaining',
    cargoSummary: 'Telemetry relays & generator spares',
  },
  {
    id: 'R-05',
    from: 'BTH',
    to: 'MTR',
    mode: 'HELICOPTER',
    status: 'nominal',
    label: 'Helicopter Air-Bridge',
    assetName: 'Kamov Ka-32 Relay',
    eta: 'Daily liaison flight',
    cargoSummary: 'Cryo-medical samples & personnel',
  },
];

const STATUS_THEME: Record<
  RouteData['status'],
  { stroke: string; bg: string; text: string; label: string }
> = {
  nominal: {
    stroke: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#10b981',
    label: 'Nominal',
  },
  active: {
    stroke: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.12)',
    text: '#0284c7',
    label: 'Active / Transit',
  },
  attention: {
    stroke: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#f59e0b',
    label: 'Attention / Delayed',
  },
  critical: {
    stroke: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    text: '#ef4444',
    label: 'Critical / Blocked',
  },
};

export function AntarcticRouteNetwork({
  legs,
  selectedLocation = 'ALL',
  className = '',
}: AntarcticRouteNetworkProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  // Filters
  const [routeFilter, setRouteFilter] = useState<'ALL' | 'ACTIVE' | 'DELAYED' | 'BLOCKED'>('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'VESSEL' | 'AIR' | 'GROUND' | 'HELICOPTER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOMINAL' | 'ATTENTION' | 'CRITICAL'>('ALL');

  // Layers
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [layerStations, setLayerStations] = useState(true);
  const [layerRoutes, setLayerRoutes] = useState(true);
  const [layerCargo, setLayerCargo] = useState(true);
  const [layerIncidents, setLayerIncidents] = useState(false);

  const nodeById = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), []);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    return DEFAULT_ROUTES.filter((r) => {
      if (routeFilter === 'ACTIVE' && r.status !== 'active') return false;
      if (routeFilter === 'DELAYED' && r.status !== 'attention') return false;
      if (routeFilter === 'BLOCKED' && r.status !== 'critical') return false;
      if (modeFilter !== 'ALL' && r.mode !== modeFilter) return false;
      if (statusFilter !== 'ALL' && r.status.toUpperCase() !== statusFilter) return false;
      if (layerIncidents && !r.incidentFlag) return false;
      return true;
    });
  }, [routeFilter, modeFilter, statusFilter, layerIncidents]);

  const activeSelectedRoute = useMemo(
    () => DEFAULT_ROUTES.find((r) => r.id === selectedRouteId) ?? null,
    [selectedRouteId]
  );

  const handleReset = () => {
    setSelectedRouteId(null);
    setRouteFilter('ALL');
    setModeFilter('ALL');
    setStatusFilter('ALL');
    setLayerStations(true);
    setLayerRoutes(true);
    setLayerCargo(true);
    setLayerIncidents(false);
  };

  const getModeIcon = (mode: RouteData['mode']) => {
    switch (mode) {
      case 'VESSEL':
        return <Ship className="w-3.5 h-3.5 text-accent" />;
      case 'AIR':
        return <Plane className="w-3.5 h-3.5 text-accent" />;
      case 'GROUND':
        return <Truck className="w-3.5 h-3.5 text-accent" />;
      case 'HELICOPTER':
        return <Plane className="w-3.5 h-3.5 text-accent rotate-45" />;
    }
  };

  return (
    <div className={`bg-surface border border-[var(--border-color)] rounded-card shadow-theme-sm overflow-hidden ${className}`}>
      {/* Top Header & Operational Controls */}
      <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] bg-surface">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">ROUTES</span>
              {selectedRouteId && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                    Route {selectedRouteId} Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedRouteId(null)}
                    aria-label="Clear route selection"
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border border-border bg-surface text-foreground hover:bg-surface-elevated transition-colors"
                  >
                    <span>Clear selection</span>
                    <X className="w-3 h-3 text-foreground-muted" />
                  </button>
                </div>
              )}
            </div>
            <h2 className="section-title mt-0.5">Antarctic Route Network</h2>
            <p className="meta-text mt-0.5">
              Polar stations, maritime corridors and multi-modal transit movements ({legs.length || DEFAULT_ROUTES.length} operational legs monitored
              {selectedLocation !== 'ALL' ? ` • Filter: ${selectedLocation}` : ''})
            </p>
          </div>

          {/* Compact Control Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Filter Routes by Activity"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value as any)}
              className="h-8 text-xs bg-surface border border-[var(--border-color)] text-foreground rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer transition-colors"
            >
              <option value="ALL">All Routes</option>
              <option value="ACTIVE">Active Routes</option>
              <option value="DELAYED">Delayed Routes</option>
              <option value="BLOCKED">Blocked Routes</option>
            </select>

            <select
              aria-label="Filter Routes by Mode"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="h-8 text-xs bg-surface border border-[var(--border-color)] text-foreground rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer transition-colors"
            >
              <option value="ALL">All Modes</option>
              <option value="VESSEL">Mode: Vessel</option>
              <option value="AIR">Mode: Air</option>
              <option value="GROUND">Mode: Overland</option>
              <option value="HELICOPTER">Mode: Helicopter</option>
            </select>

            <select
              aria-label="Filter Routes by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 text-xs bg-surface border border-[var(--border-color)] text-foreground rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="NOMINAL">Nominal</option>
              <option value="ATTENTION">Attention</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Layers Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerDropdown(!showLayerDropdown)}
                className="h-8 flex items-center gap-1.5 px-3 bg-surface border border-[var(--border-color)] rounded-lg text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors"
                aria-expanded={showLayerDropdown}
                aria-label="Toggle map layers"
              >
                <Layers className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Layers</span>
                <ChevronDown className="w-3 h-3 text-foreground-muted" />
              </button>

              {showLayerDropdown && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-surface border border-[var(--border-color)] shadow-theme-md p-2 z-30 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted px-2 py-1">
                    Display Layers
                  </div>
                  <label className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-surface-elevated cursor-pointer">
                    <span className="text-foreground">Stations</span>
                    <input
                      type="checkbox"
                      checked={layerStations}
                      onChange={(e) => setLayerStations(e.target.checked)}
                      className="rounded border-[var(--border-color)] text-accent focus:ring-accent"
                    />
                  </label>
                  <label className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-surface-elevated cursor-pointer">
                    <span className="text-foreground">Routes</span>
                    <input
                      type="checkbox"
                      checked={layerRoutes}
                      onChange={(e) => setLayerRoutes(e.target.checked)}
                      className="rounded border-[var(--border-color)] text-accent focus:ring-accent"
                    />
                  </label>
                  <label className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-surface-elevated cursor-pointer">
                    <span className="text-foreground">Cargo Manifests</span>
                    <input
                      type="checkbox"
                      checked={layerCargo}
                      onChange={(e) => setLayerCargo(e.target.checked)}
                      className="rounded border-[var(--border-color)] text-accent focus:ring-accent"
                    />
                  </label>
                  <label className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-surface-elevated cursor-pointer">
                    <span className="text-foreground">Incidents Only</span>
                    <input
                      type="checkbox"
                      checked={layerIncidents}
                      onChange={(e) => setLayerIncidents(e.target.checked)}
                      className="rounded border-[var(--border-color)] text-accent focus:ring-accent"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              title="Reset all filters and route selection"
              aria-label="Reset route filters"
              className="h-8 inline-flex items-center gap-1.5 px-3 bg-surface border border-[var(--border-color)] rounded-lg text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-foreground-muted" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Legend & Schematic Disclaimer */}
        <div className="flex items-center justify-between gap-4 flex-wrap mt-3 pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-4 flex-wrap">
            {(['nominal', 'active', 'attention', 'critical'] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_THEME[s].stroke }} />
                <span>{STATUS_THEME[s].label}</span>
              </span>
            ))}
          </div>

          <div className="text-[10px] font-mono tracking-wider text-foreground-muted px-2 py-0.5 rounded bg-surface-elevated border border-[var(--border-color)]">
            SCHEMATIC POLAR PROJECTION &bull; NOT LIVE GEOGRAPHIC TRACKING
          </div>
        </div>
      </div>

      {/* Main Split: Polar Graphic (67% width) + Live Movements Panel (33% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
        {/* Schematic Polar SVG Visualization */}
        <div className="lg:col-span-8 p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-[var(--border-color)] flex flex-col items-center justify-center bg-surface-inset relative overflow-hidden">
          {/* Active Hover / Selection Tooltip Overlay */}
          {(hoveredNodeId || hoveredRouteId || selectedRouteId) && (
            <div className="absolute top-3 left-3 z-20 pointer-events-none p-2.5 rounded-lg bg-surface/95 border border-[var(--border-color)] shadow-theme-md text-xs backdrop-blur-sm max-w-xs animate-in fade-in duration-100">
              {hoveredNodeId && nodeById[hoveredNodeId] && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">{nodeById[hoveredNodeId].label}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface-elevated border border-[var(--border-color)] text-accent font-semibold">
                      {nodeById[hoveredNodeId].type}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-foreground-muted">
                    Coords: {nodeById[hoveredNodeId].coords}
                  </div>
                  <div className="text-[10px] text-foreground-secondary flex items-center gap-1 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_THEME[nodeById[hoveredNodeId].status].stroke }} />
                    <span className="capitalize">{nodeById[hoveredNodeId].status} Operations</span>
                  </div>
                </div>
              )}

              {!hoveredNodeId && (hoveredRouteId || selectedRouteId) && (
                (() => {
                  const targetR = DEFAULT_ROUTES.find((r) => r.id === (hoveredRouteId || selectedRouteId));
                  if (!targetR) return null;
                  const f = nodeById[targetR.from];
                  const t = nodeById[targetR.to];
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground truncate">{targetR.assetName}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border" style={{ color: STATUS_THEME[targetR.status].text, borderColor: STATUS_THEME[targetR.status].stroke + '40', backgroundColor: STATUS_THEME[targetR.status].bg }}>
                          {targetR.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-foreground-secondary flex items-center gap-1 font-medium">
                        <span>{f?.label ?? targetR.from}</span>
                        <ArrowRight className="w-3 h-3 text-foreground-muted shrink-0" />
                        <span>{t?.label ?? targetR.to}</span>
                      </div>
                      <div className="text-[10px] font-mono text-foreground-muted">
                        ETA: {targetR.eta} &bull; Mode: {targetR.mode}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          <svg
            viewBox="0 0 520 330"
            className="w-full h-auto max-w-2xl select-none"
            aria-label="Antarctic schematic polar network projection"
            role="img"
          >
            <defs>
              {/* Radial gradient for central polar convergence */}
              <radialGradient id="polar-glow" cx="50%" cy="65%" r="60%">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>

              {/* Marker Arrow for Directional Flow */}
              <marker
                id="route-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--border-color)" opacity="0.8" />
              </marker>
            </defs>

            {/* Central Polar Ambient Field */}
            <circle cx="260" cy="200" r="160" fill="url(#polar-glow)" />

            {/* 1. Concentric Polar Latitude Rings */}
            {[70, 120, 170, 220].map((radius, idx) => (
              <g key={radius}>
                <circle
                  cx={260}
                  cy={200}
                  r={radius}
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="0.75"
                  strokeDasharray={idx === 3 ? '4,4' : undefined}
                  opacity="0.35"
                />
                {/* Degree indicator label */}
                <text
                  x={265}
                  y={200 - radius + 11}
                  fontSize="7.5"
                  fill="var(--text-muted)"
                  fontFamily="monospace"
                  opacity="0.5"
                >
                  {90 - idx * 10}&deg;S
                </text>
              </g>
            ))}

            {/* 2. Polar Meridian Crosshairs */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 260 + Math.cos(rad) * 40;
              const y1 = 200 + Math.sin(rad) * 40;
              const x2 = 260 + Math.cos(rad) * 220;
              const y2 = 200 + Math.sin(rad) * 220;
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--border-color)"
                  strokeWidth="0.5"
                  opacity="0.25"
                />
              );
            })}

            {/* 3. Curved Routes (Paths with status-driven curves) */}
            {layerRoutes &&
              filteredRoutes.map((route) => {
                const f = nodeById[route.from];
                const t = nodeById[route.to];
                if (!f || !t) return null;

                const isSelected = selectedRouteId === route.id;
                const isHovered = hoveredRouteId === route.id;
                const isDimmed = selectedRouteId && !isSelected;

                // Compute smooth curved control point
                const midX = (f.x + t.x) / 2;
                const midY = (f.y + t.y) / 2;
                const dx = t.x - f.x;
                const dy = t.y - f.y;
                const normalX = -dy * 0.15;
                const normalY = dx * 0.15;
                const ctrlX = midX + normalX;
                const ctrlY = midY + normalY;
                const pathD = `M ${f.x} ${f.y} Q ${ctrlX} ${ctrlY} ${t.x} ${t.y}`;

                const theme = STATUS_THEME[route.status];

                return (
                  <g
                    key={route.id}
                    className="cursor-pointer transition-opacity duration-200"
                    style={{ opacity: isDimmed ? 0.22 : 1.0 }}
                    onClick={() => setSelectedRouteId(isSelected ? null : route.id)}
                    onMouseEnter={() => setHoveredRouteId(route.id)}
                    onMouseLeave={() => setHoveredRouteId(null)}
                  >
                    {/* Wider transparent hit-area */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                    />

                    {/* Outer selected glow line */}
                    {isSelected && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={theme.stroke}
                        strokeWidth="6"
                        opacity="0.3"
                      />
                    )}

                    {/* Primary route curved path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={theme.stroke}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 3 : 2}
                      strokeDasharray={
                        route.status === 'attention' || route.status === 'critical'
                          ? '6,4'
                          : undefined
                      }
                      className="transition-all duration-150"
                    />

                    {/* Moving in-transit marker on active routes */}
                    {(route.status === 'active' || isSelected) && (
                      <circle
                        cx={ctrlX * 0.5 + midX * 0.5}
                        cy={ctrlY * 0.5 + midY * 0.5}
                        r={isSelected ? 5 : 4}
                        fill={theme.stroke}
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              })}

            {/* 4. Station Nodes */}
            {layerStations &&
              NODES.map((node) => {
                const isSelectedLocation =
                  selectedLocation &&
                  selectedLocation !== 'ALL' &&
                  node.label.toLowerCase().includes(selectedLocation.toLowerCase());
                const isEndpointOfSelected =
                  activeSelectedRoute &&
                  (activeSelectedRoute.from === node.id || activeSelectedRoute.to === node.id);
                const isHighlighted = isSelectedLocation || isEndpointOfSelected;
                const isHovered = hoveredNodeId === node.id;
                const theme = STATUS_THEME[node.status];

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-150"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Outer halo / ring on highlight or hover */}
                    {(isHighlighted || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
                        fill={theme.stroke}
                        opacity="0.18"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node shell */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHighlighted ? 11 : 9}
                      fill="var(--bg-surface)"
                      stroke={theme.stroke}
                      strokeWidth={isHighlighted ? 2.5 : 2}
                    />

                    {/* Core node dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHighlighted ? 4.5 : 3.5}
                      fill={theme.stroke}
                    />

                    {/* Station Name Label */}
                    <text
                      x={node.x}
                      y={node.y + (node.y > 150 ? 20 : -14)}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="var(--text-primary)"
                      fontFamily="system-ui, sans-serif"
                      fontWeight={isHighlighted ? '700' : '600'}
                    >
                      {node.label}
                    </text>

                    {/* Station Type Micro-tag */}
                    <text
                      x={node.x}
                      y={node.y + (node.y > 150 ? 29 : -23)}
                      textAnchor="middle"
                      fontSize="7"
                      fill="var(--text-muted)"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Live Operational Records Panel (33% width / 4 cols) */}
        <div className="lg:col-span-4 p-3.5 space-y-2.5 overflow-y-auto max-h-[360px] bg-surface">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <div>
              <span className="eyebrow">Live Movements</span>
              <h3 className="text-xs font-bold text-foreground">Active Corridors</h3>
            </div>
            <span className="text-[11px] font-mono text-foreground-muted">
              {filteredRoutes.length} of {DEFAULT_ROUTES.length} routes
            </span>
          </div>

          <div className="space-y-2">
            {filteredRoutes.slice(0, 5).map((route) => {
              const isSelected = selectedRouteId === route.id;
              const f = nodeById[route.from];
              const t = nodeById[route.to];
              const theme = STATUS_THEME[route.status];

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(isSelected ? null : route.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent/10 border-accent shadow-xs'
                      : 'bg-surface-elevated/70 border-[var(--border-color)] hover:border-accent/40 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1 rounded bg-surface border border-[var(--border-color)] shrink-0">
                        {getModeIcon(route.mode)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {route.assetName}
                        </div>
                        <div className="text-[10px] font-mono text-foreground-muted">
                          ID: {route.id} &bull; {route.mode}
                        </div>
                      </div>
                    </div>

                    <span
                      className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border shrink-0"
                      style={{
                        color: theme.text,
                        borderColor: theme.stroke + '40',
                        backgroundColor: theme.bg,
                      }}
                    >
                      {route.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Route corridor origin to destination */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground-secondary mt-1">
                    <span className="truncate">{f?.label ?? route.from}</span>
                    <ArrowRight className="w-3 h-3 text-foreground-muted shrink-0" />
                    <span className="truncate">{t?.label ?? route.to}</span>
                  </div>

                  {/* Supporting metadata line */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-foreground-muted mt-1 pt-1 border-t border-[var(--border-color)]/50">
                    <span className="truncate">ETA: {route.eta}</span>
                    {layerCargo && route.cargoSummary && (
                      <span className="truncate max-w-[120px] text-right opacity-80">
                        {route.cargoSummary}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
