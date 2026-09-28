import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useConsignmentTimeline } from './hooks/useConsignmentTimeline';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { RiskBadge } from './RiskBadge';

interface Props {
  consignmentId: string;
}

export function ConsignmentTimeline({ consignmentId }: Props) {
  const { data: timeline, isLoading, error } = useConsignmentTimeline(consignmentId);

  if (isLoading) {
    return <LoadingSkeleton lines={4} />;
  }

  if (error) {
    return <ErrorDisplay error={error} title="Failed to load timeline" />;
  }

  if (!timeline) {
    return null;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const bufferHours = timeline.buffer_hours;
  const isNegativeBuffer = bufferHours !== null && bufferHours < 0;

  return (
    <div className="space-y-4">
      {/* Alert Banner if delayed */}
      {timeline.is_delayed && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-200 text-xs shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-800 dark:text-rose-300">Operational Delay Detected</p>
            {timeline.exception_reason ? (
              <p className="text-rose-700 dark:text-rose-300/90">{timeline.exception_reason}</p>
            ) : (
              <p className="text-rose-700 dark:text-rose-300/80">Estimated arrival exceeds deadline.</p>
            )}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-border bg-surface shadow-sm">
          <p className="text-[10px] font-mono uppercase text-foreground-muted">Risk Assessment</p>
          <div className="mt-1.5">
            <RiskBadge level={timeline.risk_level} />
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-surface shadow-sm">
          <p className="text-[10px] font-mono uppercase text-foreground-muted">Buffer Remaining</p>
          <p
            className={`text-sm font-mono font-medium mt-1 ${
              isNegativeBuffer
                ? 'text-rose-600 dark:text-rose-400'
                : bufferHours !== null && bufferHours <= 24
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {bufferHours !== null ? `${bufferHours > 0 ? '+' : ''}${bufferHours.toFixed(1)} hrs` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Timeline Milestones */}
      <div className="p-3.5 rounded-lg border border-border bg-surface-muted/50 space-y-3 shadow-sm">
        <p className="text-xs font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
          Schedule Milestones
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-border">
            <span className="text-foreground-muted">Required By (Deadline)</span>
            <span className="font-mono text-foreground">{formatDate(timeline.required_by_at)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-border">
            <span className="text-foreground-muted">Planned Arrival</span>
            <span className="font-mono text-foreground-secondary">{formatDate(timeline.planned_arrival_at)}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-foreground-muted">Estimated Arrival</span>
            <span
              className={`font-mono ${
                timeline.is_delayed ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-foreground'
              }`}
            >
              {formatDate(timeline.estimated_arrival_at)}
            </span>
          </div>
        </div>
      </div>

      {!timeline.is_delayed && bufferHours !== null && bufferHours >= 0 && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 px-1">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Consignment is on schedule within operational buffer.</span>
        </div>
      )}
    </div>
  );
}
