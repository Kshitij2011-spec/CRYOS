import { AlertTriangle } from 'lucide-react';
import type { ApiError } from '../../lib/api/client';

interface Props {
  error: Error | ApiError | unknown;
  title?: string;
}

export function ErrorDisplay({ error, title = 'Request failed' }: Props) {
  const msg =
    error instanceof Error ? error.message : 'An unexpected error occurred.';
  const code = (error as ApiError)?.code;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60"
    >
      <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0 dark:text-rose-400" aria-hidden="true" />
      <div>
        <p className="text-rose-700 font-medium text-sm dark:text-rose-300">{title}</p>
        <p className="text-rose-600 text-sm mt-0.5 dark:text-rose-400">{msg}</p>
        {code && (
          <p className="text-rose-500 text-xs font-mono mt-1">code: {code}</p>
        )}
      </div>
    </div>
  );
}
