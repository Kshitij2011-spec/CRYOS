import {
  Radar, Network, GitFork, Cpu, CheckSquare, History,
} from 'lucide-react';

export function HowCryosThinksSection() {
  const stages = [
    {
      step: '01',
      title: 'Detect',
      desc: 'Ingests immutable operational events from station logs, weather updates, and transport reports.',
      icon: Radar,
    },
    {
      step: '02',
      title: 'Contextualize',
      desc: 'Binds incoming anomalies to specific stations, consignments, assets, and scientific missions.',
      icon: Network,
    },
    {
      step: '03',
      title: 'Trace Impact',
      desc: 'Traverses the semantic dependency graph to compute downstream runway and scheduling vulnerabilities.',
      icon: GitFork,
    },
    {
      step: '04',
      title: 'Predict & Simulate',
      desc: 'Evaluates deterministic what-if alternatives against hard expedition safety and fuel constraints.',
      icon: Cpu,
    },
    {
      step: '05',
      title: 'Decide',
      desc: 'Packages transparent mitigation proposals for mandatory, auditable human-operator review.',
      icon: CheckSquare,
    },
    {
      step: '06',
      title: 'Act & Learn',
      desc: 'Emits consequential audit events, updates state, and reconciles outbox updates upon reconnect.',
      icon: History,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-surface/40 border-y border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            Operational Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            From event to decision.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            CRYOS replaces ad-hoc spreadsheets with a continuous deterministic operational loop.
            Every operational anomaly is caught, contextualized, and presented with transparent options.
          </p>
        </div>

        {/* Stepped Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="relative p-6 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border text-accent flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground-muted px-2 py-0.5 rounded bg-surface-elevated border border-border">
                    {stage.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2">
                  {stage.title}
                </h3>
                <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Philosophy Callout */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs text-foreground-secondary shadow-theme-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span className="font-semibold text-foreground">Deterministic Core:</span>
            <span>Deterministic rules and constraints lead; AI remains strictly advisory and secondary.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
