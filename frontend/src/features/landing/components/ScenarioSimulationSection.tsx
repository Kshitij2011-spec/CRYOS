import { useState } from 'react';
import {
  PlaneTakeoff, Wrench, ThermometerSnowflake, ArrowRight,
  ShieldCheck, AlertTriangle, Play, Sparkles, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ScenarioSimulationSection() {
  const [activeScenario, setActiveScenario] = useState<'FLIGHT' | 'GENERATOR' | 'COLD_CHAIN'>('FLIGHT');

  const scenarios = {
    FLIGHT: {
      id: 'FLIGHT',
      name: 'Flight Grounding (Catastrophic Blizzard)',
      icon: PlaneTakeoff,
      description: 'Severe 72-hour polar storm restricts all air transit between Bharati skiway and inland field camps.',
      disruption: 'LC-130 Hercules sortie cancelled due to zero-visibility whiteout conditions.',
      impact: 'Field Science Team Alpha stranded at Ridge Camp; emergency rations buffer reduced from 14 to 11 days.',
      constraint: 'HARD CONSTRAINT: Personnel safety margin violates minimum 12-day emergency provision threshold.',
      recommendation: 'Deploy Snowcat overland tracked convoy from Maitri with priority auxiliary fuel and survival shelter.',
      mitigationId: 'REC-BLZ-091',
    },
    GENERATOR: {
      id: 'GENERATOR',
      name: 'Generator Failure (G-02 Diesel Unit)',
      icon: Wrench,
      description: 'Main diesel generator G-02 suffers catastrophic piston seizure, reducing station power capacity by 45%.',
      disruption: 'Bharati main power station loses redundancy; non-essential science modules load-shedded.',
      impact: 'Cold storage laboratory warming risk; secondary heating grid operating on emergency battery reserves.',
      constraint: 'CRITICAL CONSTRAINT: Station life support heating capacity below Arctic ISO-2026 survival baseline.',
      recommendation: 'Divert spare turbine generator from MV Kara Aurora during upcoming resupply berthing.',
      mitigationId: 'REC-PWR-042',
    },
    COLD_CHAIN: {
      id: 'COLD_CHAIN',
      name: 'Cold-Chain Excursion (Bio-Samples)',
      icon: ThermometerSnowflake,
      description: 'Telemetry sensor on cryogenic specimen container CS-09 alerts temperature rise above -20°C target.',
      disruption: 'Auxiliary cooling compressor power connector intermittent during inter-station helicopter transfer.',
      impact: '48 ice-core and atmospheric biological samples at risk of thermal degradation within 6 hours.',
      constraint: 'SCIENTIFIC INTEGRITY CONSTRAINT: Ice core temperature excursion limit exceeded >4 hours.',
      recommendation: 'Emergency transfer to Maitri cryo-vault; dispatch replacement dry-ice module immediately.',
      mitigationId: 'REC-COLD-018',
    },
  };

  const current = scenarios[activeScenario];

  return (
    <section id="simulation" className="py-20 lg:py-28 bg-surface/50 border-y border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-foreground-secondary text-xs font-medium tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
              Scenario Cockpit & Simulation
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            What happens next?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            Test operational resilience before disaster strikes. CRYOS runs deterministic what-if simulations
            to project consequences and draft actionable replanning alternatives.
          </p>
        </div>

        {/* Interactive Scenario Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Scenario Tabs (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground-muted block mb-1">
              Select Benchmark Disruption
            </span>
            {(['FLIGHT', 'GENERATOR', 'COLD_CHAIN'] as const).map((key) => {
              const sc = scenarios[key];
              const Icon = sc.icon;
              const isSelected = activeScenario === key;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenario(key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-surface border-accent shadow-theme-sm ring-1 ring-accent'
                      : 'bg-surface/60 border-border hover:bg-surface hover:border-accent/30'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-accent text-canvas border-accent'
                        : 'bg-surface-elevated text-foreground-secondary border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${isSelected ? 'text-foreground' : 'text-foreground-secondary'}`}>
                      {sc.name}
                    </h3>
                    <p className="text-[11px] text-foreground-muted line-clamp-2 mt-1">
                      {sc.description}
                    </p>
                  </div>
                </button>
              );
            })}

            <div className="pt-2">
              <Link
                to="/control-tower"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>Open Scenario Simulator in Control Tower</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Consequence Path Display (Right 8 cols) */}
          <div className="lg:col-span-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-theme-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    Consequence Path Analysis
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-accent font-semibold">
                  {current.mitigationId}
                </span>
              </div>

              {/* Consequence Flow Steps */}
              <div className="space-y-4">
                {/* 1. Disruption */}
                <div className="p-3.5 rounded-xl bg-status-critical/10 border border-status-critical/30">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-status-critical mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>01. Operational Disruption</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-medium">
                    {current.disruption}
                  </p>
                </div>

                {/* 2. Impact */}
                <div className="p-3.5 rounded-xl bg-status-warning/10 border border-status-warning/30">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-status-warning mb-1">
                    <span>02. Cascade Impact</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-medium">
                    {current.impact}
                  </p>
                </div>

                {/* 3. Constraint */}
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-foreground-muted mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>03. Constraint Evaluation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-mono">
                    {current.constraint}
                  </p>
                </div>

                {/* 4. Recommendation */}
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/40">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-accent">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>04. Generated Mitigation Proposal</span>
                    </div>
                    <span className="text-[10px] font-mono text-foreground-muted">
                      Requires Operator Approval
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-semibold">
                    {current.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
