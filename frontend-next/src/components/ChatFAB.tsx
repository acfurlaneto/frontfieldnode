'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles, Tractor, X } from 'lucide-react';
import { PrescricaoModal } from '@/components/PrescricaoModal';

type ChatMachine = {
  maquina_id?: string | null;
  modelo?: { nome?: string };
};

type ChatFABProps = {
  machines: ChatMachine[];
};

export function ChatFAB({ machines }: ChatFABProps) {
  const machineOptions = machines.filter(
    (m): m is ChatMachine & { maquina_id: string } => Boolean(m.maquina_id),
  );
  const [open, setOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(machineOptions[0]?.maquina_id ?? '');
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    if (!machineOptions.some((machine) => machine.maquina_id === selectedMachine)) {
      setSelectedMachine(machineOptions[0]?.maquina_id ?? '');
    }
  }, [machineOptions, selectedMachine]);

  return (
    <>
      {open && (
        <section
          className="chat-panel liquid-glass--elevated fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] right-3 z-[80] max-h-[min(32rem,calc(100dvh-8rem))] w-[min(26rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:right-6 sm:p-5 lg:bottom-20 lg:right-6"
          aria-label="Assistente de campo"
          role="dialog"
          aria-modal="false"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--ui-accent)]/10 text-[color:var(--ui-accent)]">
                <Sparkles size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ui-accent)]">
                  Assistente de campo
                </p>
                <h2 className="mt-0.5 text-sm font-bold text-[var(--text-1)]">
                  O que merece atenção?
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar assistente"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] text-[var(--text-3)] transition hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)] active:scale-95"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {machineOptions.length > 0 ? (
            <>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-3)]">
                Selecione uma máquina para consultar a prescrição operacional gerada a partir da telemetria disponível.
              </p>

              <label className="mt-4 grid gap-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                  <Tractor size={11} aria-hidden="true" /> Máquina
                </span>
                <span className="relative">
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="min-h-10 w-full appearance-none rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] px-3 pr-8 text-sm font-medium text-[var(--text-1)] outline-none transition hover:border-[var(--glass-border-top)] focus:border-[color:var(--ui-accent)]/60"
                  >
                    {machineOptions.map((m) => (
                      <option key={m.maquina_id} value={m.maquina_id}>
                        {m.maquina_id}{m.modelo?.nome ? ` · ${m.modelo.nome}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                    aria-hidden="true"
                  />
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowPrescription(true)}
                disabled={!selectedMachine}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--ui-accent)] px-4 text-sm font-bold text-slate-950 shadow-[0_0_20px_var(--glow-normal)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]"
              >
                <Sparkles size={15} aria-hidden="true" />
                Analisar máquina
              </button>
            </>
          ) : (
            <p className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] p-3 text-xs leading-relaxed text-[var(--text-2)]">
              A frota ainda não está disponível. A assistente continuará visível e poderá ser usada quando uma máquina for carregada.
            </p>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Abrir assistente de campo"
        className="chat-fab fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-[70] inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ui-accent)] px-4 text-sm font-bold text-slate-950 shadow-[0_0_24px_var(--glow-normal)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-[0.97] sm:right-6 lg:bottom-6"
      >
        <Sparkles size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Pergunte à IA</span>
        <span className="sm:hidden">IA</span>
      </button>

      <PrescricaoModal
        machineId={selectedMachine}
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
      />
    </>
  );
}
