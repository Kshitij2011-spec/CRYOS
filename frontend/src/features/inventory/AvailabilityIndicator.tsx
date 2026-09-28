import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StockAvailability } from '../../lib/types/api';

interface Props {
  availability: StockAvailability | null | undefined;
  className?: string;
}

export function AvailabilityIndicator({ availability, className = '' }: Props) {
  if (!availability) {
    return (
      <div className={`p-4 rounded-lg bg-surface border border-border text-foreground-secondary text-sm ${className}`}>
        No availability metrics recorded.
      </div>
    );
  }

  const {
    on_hand_quantity,
    reserved_quantity,
    quarantined_quantity,
    damaged_quantity,
    available_quantity,
    reorder_point,
    is_deficit,
  } = availability;

  const availableNum = parseFloat(available_quantity) || 0;
  const isZero = availableNum <= 0;

  return (
    <div className={`p-4 rounded-lg border ${is_deficit ? 'border-rose-300 bg-rose-50/70 dark:border-rose-700/60 dark:bg-rose-950/20' : 'border-border bg-surface'} ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="eyebrow">
            Authoritative Availability
          </span>
          {is_deficit ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-600">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              DEFICIT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              STOCKED
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="meta-text mr-2">Available:</span>
          <span className={`data-value text-xl ${isZero ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {available_quantity}
          </span>
        </div>
      </div>

      {/* Grid of stock components */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="p-2 rounded bg-surface-elevated border border-border">
          <div className="text-foreground-muted text-[11px]">On-Hand</div>
          <div className="text-foreground font-semibold text-sm mt-0.5">{on_hand_quantity}</div>
        </div>
        <div className="p-2 rounded bg-surface-elevated border border-border">
          <div className="text-foreground-muted text-[11px]">Reserved</div>
          <div className="text-amber-600 dark:text-amber-300 font-semibold text-sm mt-0.5">{reserved_quantity}</div>
        </div>
        <div className="p-2 rounded bg-surface-elevated border border-border">
          <div className="text-foreground-muted text-[11px]">Quarantined</div>
          <div className="text-orange-600 dark:text-orange-400 font-semibold text-sm mt-0.5">{quarantined_quantity}</div>
        </div>
        <div className="p-2 rounded bg-surface-elevated border border-border">
          <div className="text-foreground-muted text-[11px]">Damaged</div>
          <div className="text-rose-600 dark:text-rose-400 font-semibold text-sm mt-0.5">{damaged_quantity}</div>
        </div>
      </div>

      {reorder_point && (
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-foreground-secondary">
          <span>Reorder Threshold:</span>
          <span className="font-semibold text-foreground">{reorder_point}</span>
        </div>
      )}

      <p className="meta-text mt-2">
        Backend formula: available = on_hand - reserved - quarantined - damaged
      </p>
    </div>
  );
}
