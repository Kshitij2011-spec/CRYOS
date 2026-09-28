import { Target, Truck, Home, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';

export function CredibilityStrip() {
  const pillars = [
    { label: 'Missions', sub: 'Field science windows', icon: Target },
    { label: 'Logistics', sub: 'Inter-station supply', icon: Truck },
    { label: 'Stations', sub: 'Bharati & Maitri state', icon: Home },
    { label: 'Assets', sub: 'Life-support & power', icon: Wrench },
    { label: 'Risk', sub: 'Constraint propagation', icon: ShieldAlert },
    { label: 'Decisions', sub: 'Human-approved replans', icon: CheckCircle },
  ];

  return (
    <section className="border-y border-border bg-surface/50 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="shrink-0 text-center md:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-foreground-muted block font-semibold">
              Built For Polar Expedition Operations
            </span>
            <span className="text-xs text-foreground-secondary mt-0.5 block">
              Architected for extreme environmental constraints & offline resilience
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full md:w-auto">
            {pillars.map(({ label, sub, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-surface border border-border/80 hover:border-accent/40 transition-colors shadow-theme-sm"
              >
                <div className="w-7 h-7 rounded-md bg-surface-elevated text-accent flex items-center justify-center shrink-0 border border-border">
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{label}</div>
                  <div className="text-[10px] text-foreground-muted truncate">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
