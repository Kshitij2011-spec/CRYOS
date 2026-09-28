import {
  Wifi, WifiOff, HardDrive, RefreshCw, CheckCircle2, Shield,
  Layers, ArrowRight,
} from 'lucide-react';

export function OfflineResilienceSection() {
  const steps = [
    {
      label: 'Online Baseline',
      desc: 'Synchronized with central server; real-time event updates stream across active nodes.',
      icon: Wifi,
      status: 'Active',
    },
    {
      label: 'Local State Cache',
      desc: 'IndexedDB persists operational state, catalog items, and active expedition topologies locally.',
      icon: HardDrive,
      status: 'Local Replica',
    },
    {
      label: 'Outbox Queue',
      desc: 'Mutations (status transitions, incident logs) buffered locally when satellite uplink fails.',
      icon: Layers,
      status: 'Store & Forward',
    },
    {
      label: 'Satellite Reconnect',
      desc: 'Automatic heartbeat detects restored Iridium or Starlink connection without manual intervention.',
      icon: RefreshCw,
      status: 'Auto Detect',
    },
    {
      label: 'Replay & Reconcile',
      desc: 'Buffered transactions replayed sequentially with causal ordering and server acknowledgment.',
      icon: CheckCircle2,
      status: 'Reconciled',
    },
  ];

  return (
    <section id="resilience" className="py-20 lg:py-28 bg-canvas relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-foreground-secondary text-xs font-medium tracking-wide mb-3">
            <WifiOff className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
              Polar Network Resilience
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Designed for imperfect connectivity.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            In Antarctica, satellite communications drop during severe solar storms and blizzards.
            CRYOS is architected local-first with transactional store-and-forward queues, keeping station crews functional even during complete network blackouts.
          </p>
        </div>

        {/* Resilience Flow Architecture Visual */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-theme-md">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-8">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                Store-and-Forward Transactional Architecture
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted">
              Local-First Protocol
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={st.label} className="relative flex flex-col justify-between p-4 rounded-xl bg-surface-elevated border border-border hover:border-accent/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-accent">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                        {st.status}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                      {st.label}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-foreground-muted">
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Honest Technical Note */}
          <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-foreground-muted">
            <div>
              <strong className="text-foreground font-semibold">Honest Engineering: </strong>
              CRYOS does not pretend satellite networks are always available. It queues mutations locally and preserves causality upon reconnect.
            </div>
            <span className="font-mono text-[11px] text-accent shrink-0">
              IndexedDB Outbox Store
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
