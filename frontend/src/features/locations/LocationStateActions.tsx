import { useState } from 'react';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';
import { LOCATION_TRANSITIONS } from '../../lib/types/api';
import type { Location, LocationStatus } from '../../lib/types/api';
import { useLocationStateTransition } from './hooks/useLocationStateTransition';

interface Props {
  location: Location;
}

const CONSEQUENTIAL: LocationStatus[] = ['INACCESSIBLE', 'CLOSED', 'RESTRICTED'];

export function LocationStateActions({ location }: Props) {
  const [pending, setPending] = useState<LocationStatus | null>(null);
  const transition = useLocationStateTransition();

  const allowed = LOCATION_TRANSITIONS[location.status] ?? [];
  if (allowed.length === 0) {
    return (
      <p className="text-foreground-muted text-sm italic">
        No state transitions available from <span className="font-semibold">{location.status}</span>.
      </p>
    );
  }

  const handleClick = (target: LocationStatus) => {
    if (CONSEQUENTIAL.includes(target)) {
      setPending(target);
    } else {
      doTransition(target);
    }
  };

  const doTransition = (target: LocationStatus) => {
    transition.mutate({ id: location.id, body: { status: target } });
    setPending(null);
  };

  const STYLE: Record<string, string> = {
    AVAILABLE:    'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30 dark:bg-emerald-950/40',
    RESTRICTED:   'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 dark:bg-amber-950/40',
    INACCESSIBLE: 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30 dark:bg-rose-950/40',
    CLOSED:       'border-border bg-surface-muted text-foreground-secondary hover:bg-surface-elevated hover:text-foreground',
  };

  return (
    <div className="space-y-2">
      <p className="eyebrow mb-2">Transition State</p>
      <div className="flex flex-wrap gap-2">
        {allowed.map((target: LocationStatus) => (
          <button
            key={target}
            type="button"
            disabled={transition.isPending}
            onClick={() => handleClick(target)}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors disabled:opacity-50 ${STYLE[target] ?? 'border-border text-foreground-secondary hover:bg-surface-elevated'}`}
            aria-label={`Transition location to ${target}`}
          >
            → {target}
          </button>
        ))}
      </div>

      {transition.isError && (
        <ErrorDisplay error={transition.error} title="Transition failed" />
      )}

      <ConfirmDialog
        open={!!pending}
        title={`Confirm: ${pending}`}
        message={`This will mark location "${location.name}" as ${pending}. This is a consequential operational change. Are you sure?`}
        confirmLabel={`Set ${pending}`}
        confirmVariant="danger"
        isLoading={transition.isPending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && doTransition(pending)}
      />
    </div>
  );
}
