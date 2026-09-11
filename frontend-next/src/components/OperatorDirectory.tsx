'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
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

export function OperatorDirectory({ operators }: { operators: Operator[] }) {
  const [busca, setBusca] = useState('');
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
            <article key={operator.id} className="metric-card transition-all duration-200">
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
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
