'use client';

import { useEffect, useState } from 'react';
import { resolveApiUrl } from '@/services/telemetryService';

const API_URL = resolveApiUrl();

export function ApiStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch(`${API_URL}/health/`, {
          signal: AbortSignal.timeout(3000),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setIsOnline(data.status === 'ok');
      } catch {
        if (active) setIsOnline(false);
      }
    }

    check();
    const id = setInterval(check, 15000);
    return () => { active = false; clearInterval(id); };
  }, []);

  return (
    <div className="status-pill flex items-center gap-1.5 border px-2.5 py-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOnline
            ? 'bg-[color:var(--status-normal)] shadow-[0_0_6px_var(--glow-normal-strong)]'
            : 'animate-pulse bg-[color:var(--status-critico)]'
        }`}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
        API {isOnline ? 'online' : 'offline'}
      </span>
    </div>
  );
}
