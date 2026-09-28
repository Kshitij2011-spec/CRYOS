import { useState } from 'react';
import {
  ShieldAlert,
  GitPullRequest,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useDecisionQueue } from '../hooks/useControlTower';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { EntityCode } from '../../../components/shared/EntityCode';
import { ProvenanceTag } from '../../../components/shared/ProvenanceTag';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../../components/shared/ErrorDisplay';
import { ApprovalModal } from './ApprovalModal';
import type {
  DecisionApprovalItem,
  DecisionRecommendationItem,
  DecisionReplanItem,
} from '../../../lib/types/api';

export interface DecisionQueuePanelProps {
  expeditionId: string;
  onSelectRecommendation?: (recommendationId: string) => void;
  onViewReplanOptions?: (replanId: string) => void;
}

type TabKey = 'approvals' | 'recommendations' | 'replans';

export function DecisionQueuePanel({
  expeditionId,
  onSelectRecommendation,
  onViewReplanOptions,
}: DecisionQueuePanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('approvals');
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);

  const { data, isLoading, error } = useDecisionQueue(expeditionId);

  const handleOpenReview = (recommendationId: string) => {
    setSelectedRecommendationId(recommendationId);
    onSelectRecommendation?.(recommendationId);
  };

  const handleCloseReview = () => {
    setSelectedRecommendationId(null);
  };

  const pendingApprovals = data?.pending_approvals ?? [];
  const pendingRecommendations = data?.pending_recommendations ?? [];
  const pendingReplans = data?.pending_replans ?? [];

  return (
    <section
      aria-labelledby="decision-queue-heading"
      className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-surface-elevated">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          <div>
            <span className="eyebrow">DECISIONS</span>
            <h2
              id="decision-queue-heading"
              className="text-base font-bold text-foreground tracking-wide flex items-center gap-2"
            >
              <span>Decision Queue</span>
              <span className="sr-only">Decision Queue & Human Governance</span>
            </h2>
            <p className="text-xs text-foreground-secondary">
              Requires operator review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvenanceTag provenance={data?.data_provenance ?? 'DERIVED'} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3.5 border-b border-border bg-surface-muted/30">
        <div role="tablist" aria-label="Decision queue views" className="flex gap-1.5">
          <button
            type="button"
            role="tab"
            id="tab-approvals"
            aria-label="Pending Approvals"
            aria-selected={activeTab === 'approvals'}
            aria-controls="tabpanel-approvals"
            data-testid="tab-approvals"
            onClick={() => setActiveTab('approvals')}
            className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent ${
              activeTab === 'approvals'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
            }`}
          >
            <span>Pending</span>
            <span className="sr-only"> Approvals</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pendingApprovals.length > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-bold'
                  : 'bg-surface-muted text-foreground-muted'
              }`}
            >
              {pendingApprovals.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-recommendations"
            aria-selected={activeTab === 'recommendations'}
            aria-controls="tabpanel-recommendations"
            data-testid="tab-recommendations"
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent ${
              activeTab === 'recommendations'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
            }`}
          >
            <span>Recommendations</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pendingRecommendations.length > 0
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 font-bold'
                  : 'bg-surface-muted text-foreground-muted'
              }`}
            >
              {pendingRecommendations.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-replans"
            aria-selected={activeTab === 'replans'}
            aria-controls="tabpanel-replans"
            data-testid="tab-replans"
            onClick={() => setActiveTab('replans')}
            className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-accent ${
              activeTab === 'replans'
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
            }`}
          >
            <span>Replans</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pendingReplans.length > 0
                  ? 'bg-surface-elevated text-foreground font-bold'
                  : 'bg-surface-muted text-foreground-muted'
              }`}
            >
              {pendingReplans.length}
            </span>
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-3.5 sm:p-4">
        {/* Loading State */}
        {isLoading && (
          <div aria-busy="true" className="space-y-3">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={4} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorDisplay
            error={error}
            title="Failed to load operational decision queue"
          />
        )}

        {/* Loaded State */}
        {!isLoading && !error && (
          <div>
            {/* 1. Approvals Tab */}
            {activeTab === 'approvals' && (
              <div
                role="tabpanel"
                id="tabpanel-approvals"
                aria-labelledby="tab-approvals"
                className="space-y-2.5"
              >
                {pendingApprovals.length === 0 ? (
                  <div className="py-3.5 px-4 text-center rounded-lg bg-surface-muted/40 border border-dashed border-border/80 flex items-center justify-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">No pending approvals</p>
                      <p className="text-[11px] text-foreground-muted">Nothing requires operator approval right now.</p>
                      <span className="sr-only">There are no operator approvals currently waiting for review.</span>
                    </div>
                  </div>
                ) : (
                  pendingApprovals.map((item: DecisionApprovalItem) => (
                    <div
                      key={item.approval_id}
                      className="p-3 sm:p-3.5 bg-surface border border-border rounded-lg hover:border-border-strong transition-colors space-y-2.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-accent font-semibold">
                              APPROVAL
                            </span>
                            <h3 className="text-sm font-semibold text-foreground">
                              {item.recommendation_title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted mt-0.5">
                            <span>Role Required: {item.required_approver_role}</span>
                            <span>•</span>
                            <span>Options: {item.available_options_count}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item.recommendation_id)}
                            className="px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 rounded flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <span>Review & Decide</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs font-mono bg-surface-muted p-2 rounded border border-border">
                        <div>
                          <span className="text-foreground-muted">What Changed: </span>
                          <span className="text-foreground">{item.what_changed}</span>
                        </div>
                        <div>
                          <span className="text-foreground-muted">Why It Matters: </span>
                          <span className="text-foreground">{item.why_it_matters}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-amber-500 dark:text-amber-400">Constraint Involved: </span>
                          <span className="text-foreground-secondary">{item.what_constraint_is_involved}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-foreground-muted pt-1 border-t border-border/60">
                        <span>Approval ID: {item.approval_id}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div
                role="tabpanel"
                id="tabpanel-recommendations"
                aria-labelledby="tab-recommendations"
                className="space-y-2.5"
              >
                {pendingRecommendations.length === 0 ? (
                  <div className="py-3.5 px-4 text-center rounded-lg bg-surface-muted/40 border border-dashed border-border/80 flex items-center justify-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" aria-hidden="true" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">No pending recommendations</p>
                      <p className="text-[11px] text-foreground-muted">No candidate recommendations requiring evaluation.</p>
                    </div>
                  </div>
                ) : (
                  pendingRecommendations.map((item: DecisionRecommendationItem) => (
                    <div
                      key={item.recommendation_id}
                      className="p-3 sm:p-3.5 bg-surface border border-border rounded-lg hover:border-border-strong transition-colors space-y-2.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-semibold text-foreground">
                              {item.title}
                            </h3>
                          </div>
                          {item.summary && (
                            <p className="text-xs text-foreground-secondary mt-0.5 max-w-2xl leading-relaxed">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <StatusBadge status={item.approval_state} />
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item.recommendation_id)}
                            className="px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 rounded flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <span>Review Recommendation</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.rationale && item.rationale.length > 0 && (
                        <div className="text-xs text-foreground-secondary bg-surface-muted p-2 rounded border border-border">
                          <span className="text-foreground-muted font-mono block mb-1">Rationale:</span>
                          <ul className="list-disc list-inside space-y-0.5">
                            {item.rationale.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-foreground-muted pt-1 border-t border-border">
                        <span>Affected entities: {item.what_is_affected.length}</span>
                        <span>Proposed changes: {item.proposed_changes.length}</span>
                        <div className="flex items-center gap-1 text-foreground-muted">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Replans Tab */}
            {activeTab === 'replans' && (
              <div
                role="tabpanel"
                id="tabpanel-replans"
                aria-labelledby="tab-replans"
                className="space-y-2.5"
              >
                {pendingReplans.length === 0 ? (
                  <div className="py-3.5 px-4 text-center rounded-lg bg-surface-muted/40 border border-dashed border-border/80 flex items-center justify-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" aria-hidden="true" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">No pending replans</p>
                      <p className="text-[11px] text-foreground-muted">No active replanning workflows currently processing.</p>
                    </div>
                  </div>
                ) : (
                  pendingReplans.map((item: DecisionReplanItem) => (
                    <div
                      key={item.replan_id}
                      className="p-3 sm:p-3.5 bg-surface border border-border rounded-lg hover:border-border-strong transition-colors space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          <EntityCode code={item.replan_code} />
                          <span className="text-xs font-mono text-foreground-muted">
                            Mode: {item.trigger_mode}
                          </span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="text-xs text-foreground-secondary bg-surface-muted p-2 rounded border border-border space-y-1">
                        <div>
                          <span className="text-foreground-muted font-mono">What Changed: </span>
                          <span>{item.what_changed}</span>
                        </div>
                        {item.trigger_reason && (
                          <div>
                            <span className="text-foreground-muted font-mono">Trigger: </span>
                            <span>{item.trigger_reason}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-foreground-muted pt-1 border-t border-border">
                        <span>Affected entities: {item.affected_entities_count}</span>
                        <span className={item.violated_constraints_count > 0 ? 'text-amber-500 dark:text-amber-400' : ''}>
                          Violated constraints: {item.violated_constraints_count}
                        </span>
                        {onViewReplanOptions && (
                          <button
                            type="button"
                            data-testid={`explore-replan-${item.replan_code.toLowerCase()}`}
                            onClick={() => onViewReplanOptions(item.replan_id)}
                            className="px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 rounded flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                          >
                            <span>Explore / Generate Options</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="flex items-center gap-1 text-foreground-muted">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRecommendationId && (
        <ApprovalModal
          recommendationId={selectedRecommendationId}
          onClose={handleCloseReview}
          expeditionId={expeditionId}
        />
      )}
    </section>
  );
}
