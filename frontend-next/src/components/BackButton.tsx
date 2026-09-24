'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Botão de voltar — sempre navega para /dashboard.
 * Renderizado dentro do header (fluxo normal), nunca com position:fixed,
 * para não sobrepor o título em qualquer zoom.
 */
export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard')}
      aria-label="Voltar para o dashboard"
      title="Voltar ao dashboard"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] text-[var(--text-3)] transition hover:border-[color:var(--ui-accent)]/30 hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95"
    >
      <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
    </button>
  );
}
