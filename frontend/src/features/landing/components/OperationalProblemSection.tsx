import {
  CloudSnow, Clock, PackageX, BatteryWarning, AlertTriangle, UserCheck,
  ArrowRight,
} from 'lucide-react';

export function OperationalProblemSection() {
  const cascadeSteps = [
    {
      step: '01',
      title: 'Weather Event',
      desc: 'Blizzard ground flight window for 72 hrs',
      icon: CloudSnow,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      badge: 'Signal',
    },
    {
      step: '02',
      title: 'Transport Delay',
      desc: 'LC-130 flight leg to Bharati postponed',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: 'Disruption',
    },
    {
      step: '03',
      title: 'Cargo Held',
      desc: 'Generator G-02 spare parts stranded in Cape Town',
      icon: PackageX,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      badge: 'Bottleneck',
    },
    {
      step: '04',
      title: 'Station Resource Risk',
      desc: 'Fuel & power safety buffer drops below 18 days',
      icon: BatteryWarning,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      badge: 'Constraint',
    },
    {
      step: '05',
      title: 'Mission Impact',
      desc: 'Atmospheric sampling mission infeasible',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      badge: 'Feasibility',
    },
    {
      step: '06',
      title: 'Operator Decision',
      desc: 'Re-route overland traverse with human approval',
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      badge: 'Resolution',
    },
  ];

  return (
    <section id="problem" className="py-20 lg:py-28 bg-canvas relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            The Core Operational Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Antarctic operations are connected by dependencies.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            In extreme polar environments, no incident happens in isolation. A single weather disruption
            or equipment failure ripples across transport corridors, station inventories, and scientific missions.
          </p>
        </div>

        {/* Visual Cascading Dependency Chain */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
            {cascadeSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="relative group p-4 rounded-xl bg-surface border border-border hover:border-accent/40 hover:shadow-theme-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-foreground-muted">
                        {item.step}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted font-medium">
                        {item.badge}
                      </span>
                    </div>

                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${item.color}`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-snug">
                      {item.desc}
                    </p>
                  </div>

                  {idx < cascadeSteps.length - 1 && (
                    <div className="hidden lg:flex justify-end pt-3 text-foreground-muted">
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-accent transition-all" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Underline Summary Callout */}
          <div className="mt-8 p-4 rounded-xl bg-surface-elevated border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-foreground-secondary">
              <strong className="text-foreground font-semibold">The CRYOS Advantage: </strong>
              Deterministic tracking traces each link across the dependency graph in real time, preventing blind spots before hard constraints fail.
            </div>
            <a
              href="#how-it-thinks"
              className="text-xs font-semibold text-accent hover:underline shrink-0 flex items-center gap-1"
            >
              <span>See how CRYOS traces impact</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
