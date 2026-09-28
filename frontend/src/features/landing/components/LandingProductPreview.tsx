import { Link } from 'react-router-dom';
import {
  Radio, AlertTriangle, ArrowRight,
  GitBranch, CheckCircle2, Clock, CheckSquare,
} from 'lucide-react';
import { useControlTowerFastOverview } from '../../control-tower/hooks/useControlTower';

export function LandingProductPreview() {
  const { data: overview, isLoading } = useControlTowerFastOverview();

  const totalExpeditions = overview?.total_expeditions ?? 1;
  const totalMissions = overview?.total_missions ?? 3;
  const readyMissions = overview?.missions_by_readiness?.['READY'] ?? 3;
  const activeIncidents = overview?.active_incidents_count ?? 1;
  const criticalConstraints = overview?.critical_constraints_violated_count ?? 5;
  const pendingReplans = overview?.pending_replans_count ?? 1;
  const pendingRecommendations = overview?.pending_recommendations_count ?? 2;
  const provenance = overview?.data_provenance ?? 'SYNTHETIC / DEMO';

  return (
    <section id="preview" className="py-20 lg:py-28 bg-surface/30 border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold block mb-2">
            Real Application Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Operational awareness in one view.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary leading-relaxed">
            Live preview of the Control Tower environment connected to the local FastAPI and SQLite operational pipeline.
          </p>
        </div>

        {/* Polished Control Tower Preview Card */}
        <div className="rounded-2xl border border-border bg-surface shadow-theme-md overflow-hidden transition-all">
          {/* Top Operational Bar */}
          <div className="px-6 py-4 border-b border-border bg-surface-elevated/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    44th Indian Scientific Expedition to Antarctica
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                    ISEA-44
                  </span>
                </div>
                <div className="text-xs text-foreground-muted">
                  Cape Town Gateway &bull; Maitri Station &bull; Bharati Station Sector
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-status-success/10 text-status-success border border-status-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                <span>LOCAL PIPELINE CONNECTED</span>
              </span>
            </div>
          </div>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border bg-surface">
            {/* Missions */}
            <div className="p-5">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-1 font-mono uppercase">
                <span>Missions</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `${readyMissions} / ${totalMissions}`}
              </div>
              <div className="text-[11px] text-foreground-muted mt-0.5">
                {readyMissions} Verified Ready
              </div>
            </div>

            {/* Constraints */}
            <div className="p-5">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-1 font-mono uppercase">
                <span>Constraints</span>
                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : criticalConstraints}
              </div>
              <div className="text-[11px] text-foreground-muted mt-0.5">
                Active & Monitored
              </div>
            </div>

            {/* Replans */}
            <div className="p-5">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-1 font-mono uppercase">
                <span>Replans</span>
                <GitBranch className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : pendingReplans}
              </div>
              <div className="text-[11px] text-foreground-muted mt-0.5">
                {pendingRecommendations} Mitigation Options
              </div>
            </div>

            {/* Incidents */}
            <div className="p-5">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-1 font-mono uppercase">
                <span>Incidents</span>
                <Clock className="w-3.5 h-3.5 text-status-danger" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : activeIncidents}
              </div>
              <div className="text-[11px] text-foreground-muted mt-0.5">
                Requiring Attention
              </div>
            </div>
          </div>

          {/* Operational Banner & Prompt to Enter Control Tower */}
          <div className="p-6 bg-surface-elevated/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-foreground">
                  Expeditions Active: {totalExpeditions}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs font-mono text-foreground-muted">
                  PROVENANCE: {provenance}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary">
                Follow live state changes, explore consequence timelines, and execute human approvals in the Control Tower.
              </p>
            </div>

            <Link
              to="/control-tower"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-accent text-canvas hover:bg-accent/90 transition-colors shrink-0 shadow-sm group"
            >
              <span>Launch Control Tower</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
