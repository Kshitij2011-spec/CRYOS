import {
  Wrench, Zap, ThermometerSnowflake, Home, AlertTriangle, CheckSquare,
  ArrowRight, GitBranch,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DependencyImpactSection() {
  const nodes = [
    {
      label: 'Asset Failure',
      name: 'Generator G-02',
      type: 'LIFE_SUPPORT',
      icon: Wrench,
      state: 'Damaged',
      color: 'border-status-critical text-status-critical bg-status-critical/10',
    },
    {
      label: 'Power Grid',
      name: 'Power Availability',
      type: 'CAPACITY',
      icon: Zap,
      state: '-45% Output',
      color: 'border-status-warning text-status-warning bg-status-warning/10',
    },
    {
      label: 'Thermal System',
      name: 'Heating Capacity',
      type: 'ENVIRONMENT',
      icon: ThermometerSnowflake,
      state: 'Auxiliary Only',
      color: 'border-status-warning text-status-warning bg-status-warning/10',
    },
    {
      label: 'Facility Posture',
      name: 'Station Readiness',
      type: 'STATION_STATE',
      icon: Home,
      state: 'Degraded',
      color: 'border-status-warning text-status-warning bg-status-warning/10',
    },
    {
      label: 'Operations',
      name: 'Mission Risk',
      type: 'FEASIBILITY',
      icon: AlertTriangle,
      state: 'High Risk',
      color: 'border-status-critical text-status-critical bg-status-critical/10',
    },
    {
      label: 'Human Decision',
      name: 'Replan Action',
      type: 'APPROVAL_QUEUE',
      icon: CheckSquare,
      state: 'Air-Bridge Spares',
      color: 'border-accent text-accent bg-accent/10',
    },
  ];

  return (
    <section id="propagation" className="py-20 lg:py-28 bg-canvas relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-foreground-secondary text-xs font-medium tracking-wide mb-3">
            <GitBranch className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
              Deterministic Propagation Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            One change can propagate across the entire mission.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            In CRYOS, operational entities are bound by strict semantic relations (<code>REQUIRES</code>, <code>SUPPORTS</code>, <code>DEPENDS_ON</code>).
            When an asset degrades, the system computes the exact ripple effect across the dependency graph.
          </p>
        </div>

        {/* Visual Dependency Graph */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-theme-md">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-status-critical animate-ping" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground">
                Live Scenario: Maitri Power Station G-02 Disruption Chain
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted">
              Semantic Trace
            </span>
          </div>

          {/* Graph Nodes Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div key={node.name} className="relative flex flex-col justify-between">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border relative z-10 hover:border-accent/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-foreground-muted">
                        {node.label}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${node.color}`}>
                        {node.state}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center text-foreground">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground truncate">
                        {node.name}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-foreground-muted">
                      TYPE: {node.type}
                    </div>
                  </div>

                  {/* Connecting Arrow for Desktop */}
                  {index < nodes.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-accent">
                      <ArrowRight className="w-5 h-5 drop-shadow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Graph Footnote */}
          <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <span className="text-foreground-secondary">
              Resulting Recommendation: <strong>Proposal REC-MTR-014</strong> generated with +3 days fuel runway preservation.
            </span>
            <Link
              to="/control-tower"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0"
            >
              <span>Inspect in Decision Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
