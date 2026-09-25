import Link from 'next/link';
import { Clock, Gauge, MoveRight } from 'lucide-react';
import type { Machine } from '@/types/telemetry';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';

export function FleetGrid({ machines }: { machines: Machine[] }) {
  if (machines.length === 0) {
    return (
      <EmptyState
        title="Nenhuma máquina cadastrada ainda."
        message="Assim que a API listar máquinas, elas aparecem aqui."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {machines.map((machine) => (
        <article
          key={machine.id}
          className="metric-card transition-all duration-200 hover:border-[color:var(--ui-accent)]/25 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass)]"
        >
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[var(--text-1)]">
                {machine.modelo.nome}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-3)]">
                {machine.modelo.marca.nome}
              </p>
            </div>
            <StatusBadge tone={machine.status_de_operacao.em_operacao ? 'normal' : 'muted'}>
              {machine.status_de_operacao.em_operacao ? 'Ativo' : 'Inativo'}
            </StatusBadge>
          </div>

          {/* Dados */}
          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <div className="data-tile border p-3">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                ID
              </dt>
              <dd className="mt-1 truncate font-mono font-semibold text-[var(--text-1)]">
                {machine.maquina_id || machine.id}
              </dd>
            </div>
            <div className="data-tile border p-3">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                Operário
              </dt>
              <dd className="mt-1 truncate font-semibold text-[var(--text-1)]">
                {machine.operario.nome}
              </dd>
            </div>
            <div className="data-tile border p-3">
              <dt className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                <Gauge size={9} aria-hidden="true" /> Velocidade
              </dt>
              <dd className="mt-1 font-semibold text-[var(--text-1)]">
                {machine.estado_de_movimento.velocidade} km/h
              </dd>
            </div>
            <div className="data-tile border p-3">
              <dt className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                <Clock size={9} aria-hidden="true" /> Horas
              </dt>
              <dd className="mt-1 font-semibold text-[var(--text-1)]">
                {machine.status_de_operacao.tempo_de_operacao}h
              </dd>
            </div>
          </dl>

          {/* Ações */}
          {machine.maquina_id && (
            <div className="mt-4">
              <Link
                href={`/maquinas/${machine.maquina_id}/prescricao`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--ui-accent)]/20 bg-[color:var(--ui-accent)]/8 px-3 py-2 text-xs font-semibold text-[color:var(--ui-accent)] transition hover:border-[color:var(--ui-accent)]/35 hover:bg-[color:var(--ui-accent)]/12"
              >
                Ver Prescrição
                <MoveRight size={12} aria-hidden="true" />
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
