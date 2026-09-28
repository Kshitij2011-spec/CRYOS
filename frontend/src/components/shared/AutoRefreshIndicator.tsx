import { useState, useEffect } from 'react';

interface Props {
  dataUpdatedAt?: number;
  intervalSeconds?: number;
  isFetching?: boolean;
}

export function AutoRefreshIndicator({ dataUpdatedAt, intervalSeconds, isFetching }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!dataUpdatedAt) return null;

  const secondsAgo = Math.max(0, Math.floor((now - dataUpdatedAt) / 1000));
  const timeString = new Date(dataUpdatedAt).toLocaleTimeString([], { hour12: false });

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border-color)] bg-surface text-foreground-muted"
      title={`Last authoritative backend sync at ${timeString}${intervalSeconds ? ` · Polling interval: ${intervalSeconds}s` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
      <span>AUTO-REFRESH</span>
      <span className="text-foreground-secondary">·</span>
      <span>{secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}</span>
    </div>
  );
}
