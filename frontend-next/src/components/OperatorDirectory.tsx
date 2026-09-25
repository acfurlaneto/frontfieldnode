'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import type { Operator } from '@/types/telemetry';

const AVATAR_GRADIENTS = [
  'from-emerald-600 to-teal-700',
  'from-blue-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-cyan-600 to-sky-700',
];

function avatarGradient(index: number) {
  return AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
}

function OperatorDetails({ operator, onClose }: { operator: Operator; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="operator-details-title"
        className="liquid-glass--elevated w-full max-w-md p-5 shadow-[var(--shadow-elevated)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-base font-bold text-white shadow-[0_0_18px_var(--glow-normal)]" aria-hidden="true">
              {operator.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="section-heading">Perfil operacional</p>
              <h2 id="operator-details-title" className="mt-1 font-display text-lg font-bold text-[var(--text-1)]">
                {operator.nome}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do operário"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] text-[var(--text-3)] transition hover:text-[var(--text-1)] focus-visible:outline-2 active:scale-95"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="data-tile p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">Registro</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-[var(--text-1)]">#{operator.id}</dd>
          </div>
          <div className="data-tile p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">Tempo de serviço</dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--text-1)]">{operator.tempo_de_servico} {operator.tempo_de_servico === 1 ? 'ano' : 'anos'}</dd>
          </div>
          <div className="data-tile col-span-2 flex items-center justify-between gap-3 p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">Status em campo</dt>
            <dd><StatusBadge tone={operator.no_banco ? 'normal' : 'warning'}>{operator.no_banco ? 'No banco' : 'Fora'}</StatusBadge></dd>
          </div>
        </dl>
      </section>
    </div>,
    document.body,
  );
}

export function OperatorDirectory({ operators }: { operators: Operator[] }) {
  const [busca, setBusca] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const query = busca.trim().toLocaleLowerCase();
  const filteredOperators = operators.filter((operator) =>
    !query || [operator.nome, operator.id, operator.tempo_de_servico]
      .some((value) => String(value).toLocaleLowerCase().includes(query)),
  );
  const active = operators.filter((operator) => operator.no_banco).length;
  const avgYears = operators.length
    ? operators.reduce((sum, operator) => sum + operator.tempo_de_servico, 0) / operators.length
    : 0;

  return (
    <div className="space-y-6">
      <label className="relative block max-w-md">
        <span className="sr-only">Buscar operários</span>
        <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome ou registro" className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] pl-9 pr-3 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] focus:border-[color:var(--ui-accent)]/60" />
      </label>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Resumo da equipe">
        <MetricCard label="Cadastrados" value={operators.length} helper="operários no sistema" />
        <MetricCard label="No banco" value={active} helper={`${operators.length - active} fora do banco`} tone="emerald" />
        <MetricCard label="Tempo médio" value={`${avgYears.toFixed(1)}a`} helper="experiência da equipe" tone="amber" />
      </section>

      {filteredOperators.length === 0 ? (
        <EmptyState
          title={operators.length === 0 ? 'Nenhum operário cadastrado.' : 'Nenhum operário encontrado.'}
          message={operators.length === 0 ? 'Assim que o backend listar a equipe, os cards aparecem aqui.' : 'Ajuste o texto da busca para localizar outra pessoa.'}
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Lista de operários">
          {filteredOperators.map((operator, index) => (
            <button
              key={operator.id}
              type="button"
              onClick={() => setSelectedOperator(operator)}
              aria-label={`Ver detalhes de ${operator.nome}`}
              className="metric-card w-full text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--ui-accent)]/30 focus-visible:outline-2 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradient(index)} text-sm font-bold text-white shadow-sm`} aria-hidden="true">
                    {operator.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text-1)]">{operator.nome}</h2>
                    <p className="mt-0.5 text-xs text-[var(--text-3)]">{operator.tempo_de_servico} {operator.tempo_de_servico === 1 ? 'ano' : 'anos'} de serviço</p>
                  </div>
                </div>
                <StatusBadge tone={operator.no_banco ? 'normal' : 'warning'}>{operator.no_banco ? 'No banco' : 'Fora'}</StatusBadge>
              </div>
            </button>
          ))}
        </section>
      )}

      {selectedOperator ? <OperatorDetails operator={selectedOperator} onClose={() => setSelectedOperator(null)} /> : null}
    </div>
  );
}
