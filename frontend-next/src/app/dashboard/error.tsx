'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[FieldNode] Falha no dashboard:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--status-critico)]/20 bg-[color:var(--status-critico)]/8 text-[color:var(--status-critico)]">
          <AlertTriangle size={24} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--status-critico)]">
          API indisponível
        </p>
        <h1 className="mt-2 text-xl font-bold text-[var(--text-1)]">
          O dashboard perdeu a conexão
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-3)]">
          Não foi possível buscar os dados da frota. Verifique se a API Django está
          rodando e tente novamente.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] px-5 py-2.5 text-sm font-semibold text-[var(--text-1)] transition hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--panel-glass-strong)] active:scale-95"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
