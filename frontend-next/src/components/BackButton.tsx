'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard')}
      aria-label="Voltar para o dashboard"
      title="Voltar ao dashboard"
      className="fixed left-4 top-4 z-40 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel)]/90 text-[var(--text-3)] shadow-[var(--shadow-card)] backdrop-blur-xl transition hover:border-[rgba(255,255,255,0.18)] hover:text-[var(--text-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95 lg:left-[5.75rem]"
    >
      <ArrowLeft aria-hidden="true" size={17} strokeWidth={1.8} />
    </button>
  );
}
