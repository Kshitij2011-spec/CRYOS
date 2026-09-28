import { useState } from 'react';
import {
  Layers, MapPin, Ship, Plane,
  ShieldCheck, ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DigitalTwinSection() {
  const [selectedStation, setSelectedStation] = useState<string>('BHARATI');

  const stations = [
    {
      id: 'BHARATI',
      name: 'Bharati Station',
      sector: 'Larsemann Hills (69°24′S 76°11′E)',
      status: 'Nominal',
      personnel: '24 Wintering',
      fuelRunway: '184 Days',
      powerState: 'Main Grid Optimal',
      activeMissions: 2,
    },
    {
      id: 'MAITRI',
      name: 'Maitri Station',
      sector: 'Schirmacher Oasis (70°46′S 11°44′E)',
      status: 'Attention',
      personnel: '18 Wintering',
      fuelRunway: '92 Days',
      powerState: 'G-02 Spare Needed',
      activeMissions: 1,
    },
    {
      id: 'CAPE_TOWN',
      name: 'Cape Town Staging Port',
      sector: 'South Africa (33°55′S 18°25′E)',
      status: 'Nominal',
      personnel: 'Logistics Liaison',
      fuelRunway: 'Bunkering Ready',
      powerState: 'Standard',
      activeMissions: 0,
    },
  ];

  const currentStation = stations.find((s) => s.id === selectedStation) ?? stations[0];

  return (
    <section id="digital-twin" className="py-20 lg:py-28 bg-canvas relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Conceptual Overview */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block">
              Operational Digital Twin
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              A living operational picture of the mission.
            </h2>
            <p className="text-base text-foreground-secondary leading-relaxed">
              CRYOS models polar stations, overland routes, maritime vessels, inventory stock, and scientific personnel as a connected semantic state machine.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Full Object Topology', desc: 'Locations, legs, consignments, and assets bound by semantic links.' },
                { title: 'Live Health & Runways', desc: 'Continuous evaluation of fuel, consumable, and spares burn rates.' },
                { title: 'Constraint Boundaries', desc: 'Safety envelopes and environmental rules checked on every state change.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-foreground-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/locations"
                className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline group"
              >
                <span>Explore Station & Waypoint Topology</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Schematic Polar Digital Twin Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-theme-md relative overflow-hidden">
              {/* Header inside Panel */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                    Antarctic Topology Network
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted">
                    Schematic Polar View
                  </span>
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                </div>
              </div>

              {/* Station Selection Tabs */}
              <div className="flex gap-2 my-4 overflow-x-auto pb-1">
                {stations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStation(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedStation === st.id
                        ? 'bg-accent text-canvas shadow-sm'
                        : 'bg-surface-elevated text-foreground-secondary hover:text-foreground border border-border'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>

              {/* Schematic Map Canvas Mock */}
              <div className="relative aspect-[16/9] rounded-xl bg-canvas border border-border/70 p-4 flex flex-col justify-between overflow-hidden">
                {/* Polar Coordinates Watermark */}
                <div className="absolute top-3 left-3 text-[10px] font-mono text-foreground-muted opacity-60">
                  LAT: 70°00′S | LON: 40°00′E | DATUM: WGS84 SCHEMATIC
                </div>

                {/* Simplified Schematic Nodes & Edges SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Antarctica boundary schematic silhouette */}
                  <ellipse cx="50%" cy="55%" rx="42%" ry="38%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-border opacity-60" />
                  <ellipse cx="50%" cy="55%" rx="24%" ry="22%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-border opacity-40" />

                  {/* Route Corridors */}
                  {/* Cape Town (Top Right) to Bharati (Center Right) */}
                  <line x1="80%" y1="18%" x2="62%" y2="58%" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                  {/* Goa to Maitri */}
                  <line x1="45%" y1="12%" x2="38%" y2="54%" stroke="currentColor" strokeWidth="1.5" className="text-border-strong" />
                  {/* Bharati to Maitri Inter-station Air Bridge */}
                  <line x1="62%" y1="58%" x2="38%" y2="54%" stroke="var(--color-primary)" strokeWidth="2" />
                  {/* Bharati to Larsen Ridge */}
                  <line x1="62%" y1="58%" x2="70%" y2="76%" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="text-status-warning" />
                </svg>

                {/* Interactive Station Markers */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    {/* Cape Town Gateway */}
                    <div className="p-2 rounded-lg bg-surface/90 backdrop-blur-sm border border-border text-[11px] shadow-sm ml-auto mr-12">
                      <div className="flex items-center gap-1 text-foreground font-semibold">
                        <Ship className="w-3 h-3 text-cyan-500" />
                        <span>Cape Town Port</span>
                      </div>
                      <div className="text-[10px] text-foreground-muted">Vessel Departure Gateway</div>
                    </div>
                  </div>

                  <div className="flex justify-around items-center px-6">
                    {/* Maitri Node */}
                    <button
                      type="button"
                      onClick={() => setSelectedStation('MAITRI')}
                      className={`p-2 rounded-lg backdrop-blur-sm border text-[11px] transition-all text-left ${
                        selectedStation === 'MAITRI'
                          ? 'bg-accent/15 border-accent shadow-sm'
                          : 'bg-surface/90 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>Maitri</span>
                      </div>
                      <div className="text-[10px] text-status-warning font-medium">Attention Required</div>
                    </button>

                    {/* Bharati Node */}
                    <button
                      type="button"
                      onClick={() => setSelectedStation('BHARATI')}
                      className={`p-2 rounded-lg backdrop-blur-sm border text-[11px] transition-all text-left ${
                        selectedStation === 'BHARATI'
                          ? 'bg-accent/15 border-accent shadow-sm'
                          : 'bg-surface/90 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <MapPin className="w-3 h-3 text-cyan-500" />
                        <span>Bharati</span>
                      </div>
                      <div className="text-[10px] text-status-success font-medium">Optimal Baseline</div>
                    </button>
                  </div>

                  {/* Air-bridge status badge */}
                  <div className="self-center p-1 px-2.5 rounded-full bg-surface-elevated/90 border border-border text-[10px] font-mono text-foreground-secondary flex items-center gap-1.5 shadow-sm">
                    <Plane className="w-3 h-3 text-accent" />
                    <span>Inter-Station Helicopter Bridge: Scheduled Relay</span>
                  </div>
                </div>
              </div>

              {/* Station Detail Telemetry Card */}
              <div className="mt-4 p-4 rounded-xl bg-surface-elevated border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block">
                    Station Sector
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    {currentStation.name}
                  </span>
                  <span className="text-[10px] text-foreground-muted block truncate font-mono">
                    {currentStation.sector}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block">
                    Fuel Runway
                  </span>
                  <span className="font-semibold text-foreground font-mono">
                    {currentStation.fuelRunway}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block">
                    Power Integrity
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    {currentStation.powerState}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground-muted block">
                    Status
                  </span>
                  <span
                    className={`font-semibold ${
                      currentStation.status === 'Nominal' ? 'text-status-success' : 'text-status-warning'
                    }`}
                  >
                    {currentStation.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
