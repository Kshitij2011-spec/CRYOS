import {
  Cpu, UserCheck, CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function HumanDecisionSection() {
  const systemRoles = [
    { title: 'Detects', desc: 'Monitors raw signals, telemetry fluctuations, and logistical delays continuously.' },
    { title: 'Contextualize', desc: 'Binds anomalies directly to affected missions, assets, and environmental limits.' },
    { title: 'Simulates', desc: 'Computes downstream consequence paths and tests alternative routes deterministically.' },
    { title: 'Recommends', desc: 'Generates transparent mitigation proposals with explicit justification and rationale.' },
  ];

  const humanRoles = [
    { title: 'Reviews', desc: 'Considers operational feasibility, field conditions, and team safety factors.' },
    { title: 'Approves / Modifies', desc: 'Explicitly commits to a proposed mitigation or adjusts operational parameters.' },
    { title: 'Rejects', desc: 'Dismisses unsuitable automated recommendations with required justification logs.' },
    { title: 'Executes', desc: 'Triggers downstream state mutations only after formal human confirmation.' },
  ];

  return (
    <section id="human-decision" className="py-20 lg:py-28 bg-surface/50 border-y border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-foreground-secondary text-xs font-medium tracking-wide mb-3">
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
              Constitutional Governance
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            AI supports. Humans decide.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            Autonomous execution of high-consequence polar logistics is dangerous.
            CRYOS strictly enforces human-in-the-loop governance: the system evaluates options, but the expedition coordinator always commands.
          </p>
        </div>

        {/* Side-by-Side Split Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* SYSTEM SIDE */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-theme-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">SYSTEM (CRYOS)</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-foreground-muted">
                      Analytical & Advisory Engine
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-accent">
                  Deterministic
                </span>
              </div>

              <div className="space-y-4">
                {systemRoles.map((role) => (
                  <div key={role.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-surface-elevated border border-border flex items-center justify-center text-accent shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{role.title}</div>
                      <div className="text-xs text-foreground-secondary leading-snug">{role.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/80 text-[11px] font-mono text-foreground-muted">
              INVARIANT: System never auto-diverts flights, reallocates assets, or overrides human decisions.
            </div>
          </div>

          {/* HUMAN OPERATOR SIDE */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border-2 border-accent/40 shadow-theme-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-status-success/15 border border-status-success/30 flex items-center justify-center text-status-success">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">OPERATOR (HUMAN)</h3>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-foreground-muted">
                      Expedition Operations Command
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success/15 border border-status-success/30 text-status-success font-semibold">
                  Full Authority
                </span>
              </div>

              <div className="space-y-4">
                {humanRoles.map((role) => (
                  <div key={role.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-surface-elevated border border-border flex items-center justify-center text-status-success shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{role.title}</div>
                      <div className="text-xs text-foreground-secondary leading-snug">{role.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/80 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-foreground-secondary">
                Two-Step Workflow: Approve &ne; Apply
              </span>
              <Link
                to="/control-tower"
                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
              >
                <span>View Decision Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
