import { useState } from 'react';
import {
  AlertOctagon,
  Plane,
  Zap,
  ThermometerSnowflake,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { EntityCode } from '../../../components/shared/EntityCode';
import { useInjectScenario } from '../hooks/useControlTower';
import type { BenchmarkScenarioKey, ScenarioInjectResult } from '../../../lib/types/api';

export interface ScenarioCockpitBannerProps {
  expeditionId: string;
}

interface ScenarioButtonConfig {
  key: BenchmarkScenarioKey;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClasses: string;
  hoverClasses: string;
  ringClass: string;
}

const SCENARIOS: ScenarioButtonConfig[] = [
  {
    key: 'FLIGHT_GROUNDING',
    label: 'Flight Grounding',
    sublabel: 'Air transport delay (+5d blizzard grounding)',
    icon: Plane,
    colorClasses: 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/70 dark:border-indigo-700/60 dark:text-indigo-200',
    hoverClasses: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/80 dark:hover:border-indigo-500',
    ringClass: 'focus:ring-indigo-500',
  },
  {
    key: 'GENERATOR_FAILURE',
    label: 'Generator Failure',
    sublabel: 'Life-support generator engine seizure (DAMAGED)',
    icon: Zap,
    colorClasses: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/70 dark:border-amber-700/60 dark:text-amber-200',
    hoverClasses: 'hover:bg-amber-100 dark:hover:bg-amber-900/80 dark:hover:border-amber-500',
    ringClass: 'focus:ring-amber-500',
  },
  {
    key: 'COLD_CHAIN_EXCURSION',
    label: 'Cold-Chain Excursion',
    sublabel: 'Thermal breach (+8.2°C) → quarantine hold',
    icon: ThermometerSnowflake,
    colorClasses: 'bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/70 dark:border-cyan-700/60 dark:text-cyan-200',
    hoverClasses: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/80 dark:hover:border-cyan-500',
    ringClass: 'focus:ring-cyan-500',
  },
];

export function ScenarioCockpitBanner({ expeditionId }: ScenarioCockpitBannerProps) {
  const [lastResult, setLastResult] = useState<ScenarioInjectResult | null>(null);
  const [activeScenarioKey, setActiveScenarioKey] = useState<BenchmarkScenarioKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const injectMutation = useInjectScenario(expeditionId);

  const handleInject = (scenarioKey: BenchmarkScenarioKey) => {
    setActiveScenarioKey(scenarioKey);
    setErrorMessage(null);

    injectMutation.mutate(
      {
        scenario_key: scenarioKey,
        expedition_id: expeditionId,
      },
      {
        onSuccess: (result) => {
          setLastResult(result);
          setActiveScenarioKey(null);
        },
        onError: (err) => {
          setErrorMessage(err instanceof Error ? err.message : 'Scenario injection failed');
          setActiveScenarioKey(null);
        },
      },
    );
  };

  return (
    <section
      aria-label="Polar Disruption Scenario Cockpit"
      className="rounded-lg bg-surface border border-border shadow-sm overflow-hidden"
    >
      <div className="p-3.5 sm:p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800/60 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow">SIMULATION</span>
                <h2 className="text-sm font-bold text-foreground">
                  Scenario Simulator
                  <span className="sr-only">Polar Disruption Simulation Cockpit</span>
                </h2>
                <ProvenanceTag provenance="SYNTHETIC_DEMO" />
              </div>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Inject benchmark polar disruptions into operational digital twin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted bg-surface-muted px-2.5 py-1 rounded border border-border self-start sm:self-auto font-mono">
            <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>Autonomous Replanning Prohibited (Rule 4)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isInjecting = injectMutation.isPending && activeScenarioKey === sc.key;
            return (
              <button
                key={sc.key}
                type="button"
                data-testid={`scenario-btn-${sc.key.toLowerCase()}`}
                disabled={injectMutation.isPending}
                onClick={() => handleInject(sc.key)}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all focus:outline-none focus:ring-1 ${sc.ringClass} ${sc.colorClasses} ${sc.hoverClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="mt-0.5 p-1 rounded bg-black/5 dark:bg-black/20 shrink-0">
                  {isInjecting ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin text-foreground-muted" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold tracking-tight flex items-center justify-between">
                    <span className="truncate">{sc.label}</span>
                    {isInjecting && (
                      <span className="text-[9px] uppercase font-medium text-cyan-600 dark:text-cyan-400 shrink-0">
                        ...
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-foreground-muted truncate mt-0.5 font-sans">
                    {sc.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Notification Banner */}
      {lastResult && (
        <div
          data-testid="scenario-result-banner"
          className="p-3.5 bg-cyan-50 border-t border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-900/60 flex items-start justify-between gap-3 text-xs text-cyan-900 dark:text-cyan-200 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span>Disruption Injected: {lastResult.scenario_key}</span>
                <span className="meta-text">
                  Affected: {lastResult.affected_entity_type} (<EntityCode code={lastResult.affected_entity_code} />)
                </span>
              </div>
              <p className="mt-0.5 text-cyan-800 dark:text-cyan-300/90 font-sans">{lastResult.summary}</p>
              <div className="mt-1 meta-text flex items-center gap-3">
                {lastResult.trigger_event_id && (
                  <span>Event ID: <span className="entity-id">{lastResult.trigger_event_id.slice(0, 8)}...</span></span>
                )}
                <span>Notice: Impact calculated; operator must initiate replan if required.</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastResult(null)}
            className="text-foreground-muted hover:text-foreground p-1 rounded hover:bg-surface-elevated transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div
          data-testid="scenario-error-banner"
          className="p-3.5 bg-rose-50 border-t border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60 flex items-start justify-between gap-3 text-xs text-rose-900 dark:text-rose-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Scenario Injection Warning: </span>
              <span className="font-sans">{errorMessage}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-foreground-muted hover:text-foreground p-1 rounded hover:bg-surface-elevated transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
