import { Eye, Network, Cpu, ShieldCheck, WifiOff } from 'lucide-react';

export function ProductImpactSection() {
  const pillars = [
    {
      title: 'Single Operational View',
      desc: 'Replaces fractured station spreadsheets with a synchronized operational picture of all campaigns.',
      icon: Eye,
    },
    {
      title: 'Dependency-Aware Planning',
      desc: 'Binds weather, flights, cargo packages, and field teams into strict semantic relationship graphs.',
      icon: Network,
    },
    {
      title: 'Deterministic Scenario Analysis',
      desc: 'Evaluates hard physical safety constraints with zero hallucination or black-box guesswork.',
      icon: Cpu,
    },
    {
      title: 'Human-Approved Actions',
      desc: 'Prohibits autonomous execution of high-consequence decisions; enforces clear accountability.',
      icon: ShieldCheck,
    },
    {
      title: 'Offline-Resilient Workflows',
      desc: 'Preserves full local operational capability during extreme polar communications blackouts.',
      icon: WifiOff,
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-surface/40 border-y border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            Operational Posture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Reliability defined by architectural principles, not marketing claims.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground-secondary leading-relaxed">
            Polar operations require absolute data integrity and proven deterministic safety envelopes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors shadow-theme-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-elevated text-accent border border-border flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
