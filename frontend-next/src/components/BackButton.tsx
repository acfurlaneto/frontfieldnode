'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard')}
      aria-label="Voltar para a tela anterior"
      title="Voltar"
      className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)]/90 text-[var(--text-3)] shadow-[var(--shadow-card)] backdrop-blur-xl transition hover:border-[rgba(255,255,255,0.18)] hover:text-[var(--text-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95 lg:left-[6rem]"
    >
      <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.8} />
    </button>
  );
}
