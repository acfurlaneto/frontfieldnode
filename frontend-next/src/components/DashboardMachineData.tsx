'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MetricTrendChart } from '@/components/MetricTrendChart';
import { SparklineCard } from '@/components/SparklineCard';
import { telemetryService } from '@/services/telemetryService';
import {
  METRIC_META,
  METRIC_ORDER,
  buildPoints,
  statusOf,
  summarize,
  type MetricStatus,
} from '@/lib/metrics';
import type { Machine, Telemetry } from '@/types/telemetry';
import { mockRpmSeries, mockTemperaturaSeries, mockVibracaoSeries } from '@/data/mockData';

/* ──────────────────────────────────────────────────────────────────────────
   DashboardMachineData — o bloco de telemetria do dashboard.

   Estrutura: seletor de máquina → gráfico principal de tendência → KPIs
   compactos com mini-sparkline → distribuição operacional por faixa.

   A regra de leitura (série, média e classificação por status) NÃO mora mais
   aqui: veio de `@/lib/metrics`, para os três gráficos do app usarem a mesma
   classificação e não existirem duas verdades sobre "o que é uma leitura boa".
   ────────────────────────────────────────────────────────────────────────── */

const DEMO_SERIES: Record<string, { valor: number; label: string }[]> = {
  rpm: mockRpmSeries,
  temperatura: mockTemperaturaSeries,
  vibracao: mockVibracaoSeries,
};

/** Classifica cada leitura e conta quantas ficaram em cada faixa operacional.
 *  Retorna dados prontos para o BarChart: uma barra por métrica, empilhada por faixa. */
function buildOperationalBands(readings: Telemetry[]) {
  const bands = METRIC_ORDER.map((metric) => {
    const counts = { metrica: METRIC_META[metric].short, normal: 0, atencao: 0, critico: 0 };
    for (const point of buildPoints(readings, metric)) {
      counts[point.status] += 1;
    }
    return counts;
  });
  return bands;
}

function BandTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="liquid-glass--subtle min-w-32 rounded-xl px-3 py-2 text-[var(--text-1)] shadow-xl">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="capitalize">{item.name}</span>
          </span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
      <div className="mt-1.5 flex justify-between border-t border-[var(--border-subtle)] pt-1.5 text-[10px] text-[var(--text-3)]">
        <span>Total</span>
        <span className="font-semibold text-[var(--text-2)]">{total}</span>
      </div>
    </div>
  );
}

/** Gráfico de colunas empilhadas: distribuição de leituras por faixa operacional.
 *  Responde a: "quantas leituras ficaram dentro/fora do limite em cada métrica?" */
function OperationalBandsChart({ readings }: { readings: Telemetry[] }) {
  const data = useMemo(() => buildOperationalBands(readings), [readings]);
  const hasData = readings.length > 0;

  return (
    <section aria-label="Distribuição operacional por faixa" className="data-tile">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ui-accent)]">
            Distribuição operacional
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-3)]">
            Leituras por faixa — normal · atenção · crítico
          </p>
        </div>
      </div>

      {!hasData ? (
        <p className="flex h-28 items-center justify-center text-xs text-[var(--text-3)]">
          Sem leituras disponíveis para esta máquina.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} barSize={26} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="metrica"
              tick={{ fill: 'var(--text-3)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--text-3)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BandTooltip />} cursor={{ fill: 'var(--chart-surface)', radius: 6 }} />
            <Bar dataKey="normal" name="Normal" stackId="a">
              {data.map((_, index) => (
                <Cell key={index} fill="var(--chart-normal-stroke)" fillOpacity={0.82} />
              ))}
            </Bar>
            <Bar dataKey="atencao" name="Atenção" stackId="a">
              {data.map((_, index) => (
                <Cell key={index} fill="var(--chart-atencao-stroke)" fillOpacity={0.82} />
              ))}
            </Bar>
            <Bar dataKey="critico" name="Crítico" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill="var(--chart-critico-stroke)" fillOpacity={0.82} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-2 flex flex-wrap gap-3" aria-label="Legenda do gráfico">
        {[
          { label: 'Normal', color: 'var(--chart-normal-stroke)' },
          { label: 'Atenção', color: 'var(--chart-atencao-stroke)' },
          { label: 'Crítico', color: 'var(--chart-critico-stroke)' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-[var(--text-3)]">
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function DashboardMachineData({
  machines,
  initialReadings,
}: {
  machines: Machine[];
  initialReadings: Telemetry[];
}) {
  const options = machines.filter((machine) => Boolean(machine.maquina_id));
  const [selectedMachineId, setSelectedMachineId] = useState(options[0]?.maquina_id ?? '');
  const [readings, setReadings] = useState(() =>
    initialReadings.filter((reading) => reading.maquina_id === options[0]?.maquina_id),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMachineId) {
      setReadings([]);
      return;
    }

    // A leitura mais recente já chega pronta do servidor e entra como estado
    // imediato, para o número aparecer sem espera. A JANELA COMPLETA vem em
    // seguida porque o gráfico de tendência precisa da série inteira — com uma
    // leitura só ele viraria um ponto solto num eixo vazio.
    const initial = initialReadings.filter((reading) => reading.maquina_id === selectedMachineId);
    setReadings(initial);

    let cancelled = false;
    setLoading(true);
    setError(null);

    telemetryService
      .getMachineReadings(selectedMachineId)
      .then((data) => {
        if (!cancelled && data.length) setReadings(data);
      })
      .catch((err: unknown) => {
        // Só reporta falha se não houver nada para mostrar — se a leitura
        // recente já veio no SSR, o painel continua útil.
        if (!cancelled && initial.length === 0) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar a máquina.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialReadings, selectedMachineId]);

  const machine = options.find((item) => item.maquina_id === selectedMachineId);
  const hasReadings = readings.length > 0;

  /** Um KPI por métrica, já com série ordenada, média e status resolvidos. */
  const kpis = useMemo(
    () =>
      METRIC_ORDER.map((metric) => {
        const points = buildPoints(readings, metric);
        const summary = summarize(points);
        const meta = METRIC_META[metric];
        const demo = !hasReadings;
        const dados = demo ? DEMO_SERIES[metric] : points.map((point) => ({ valor: point.valor, label: point.label }));
        const valor = demo ? summary.avg : summary.avg;
        const status: MetricStatus = statusOf(valor, metric);

        return { metric, meta, dados, valor, status, demo };
      }),
    [readings, hasReadings],
  );

  return (
    <section aria-label="Indicadores da máquina selecionada" className="space-y-4">
      {/* Seletor de máquina */}
      <div className="fleet-summary flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="section-heading">Máquina selecionada</p>
            <p className="text-sm font-semibold text-[var(--text-1)]">
              {machine?.maquina_id ?? 'Nenhuma máquina disponível'}
            </p>
          </div>
          {loading ? (
            <LoaderCircle
              size={15}
              className="animate-spin text-[color:var(--ui-accent)]"
              aria-label="Atualizando dados"
            />
          ) : null}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Selecionar máquina</span>
          <select
            value={selectedMachineId}
            onChange={(event) => setSelectedMachineId(event.target.value)}
            className="data-tile h-11 w-full appearance-none border px-3 pr-9 text-sm font-medium text-[var(--text-1)] outline-none focus:border-[color:var(--ui-accent)] focus:ring-2 focus:ring-[color:var(--ui-accent)]/20"
          >
            {options.map((item) => (
              <option key={item.maquina_id} value={item.maquina_id}>
                {item.maquina_id} · {item.modelo.nome}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]"
            aria-hidden="true"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-xl border border-[color:var(--status-critico)]/30 bg-[color:var(--status-critico)]/10 p-3 text-xs text-[var(--text-2)]">
          {error}
        </p>
      ) : null}

      {/* Gráfico principal de telemetria */}
      <MetricTrendChart key={`trend-${selectedMachineId}`} readings={readings} initialMetric="rpm" />

      {/* Médias por métrica — um painel só, com três colunas divididas por fios.
          O título "Valores médios" existe porque os três números são MÉDIAS do
          período: sem ele, "1839 rpm" é lido como a leitura atual, o que confunde
          quem acabou de ver 1.627 rpm no gráfico acima. */}
      <section aria-label="Valores médios por métrica" className="kpi-group">
        <div className="kpi-group__head">
          <div>
            <p className="kpi-group__title">Valores médios</p>
            <p className="kpi-group__sub">
              {hasReadings
                ? `Média de ${readings.length} leituras de ${machine?.maquina_id ?? '—'}`
                : 'Sem leitura registrada — série demonstrativa'}
            </p>
          </div>
          {kpis.some((kpi) => kpi.demo) ? (
            <span className="kpi-group__badge">demonstrativo</span>
          ) : null}
        </div>

        <div className="kpi-group__grid">
          {kpis.map(({ metric, meta, dados, valor, status, demo }) => (
            <SparklineCard
              key={`${selectedMachineId}-${metric}`}
              titulo={meta.label}
              valor={demo ? valor : (meta.digits === 0 ? Math.round(valor) : valor.toFixed(meta.digits))}
              unidade={meta.unit}
              dados={dados}
              status={status}
              metric={metric}
              compact
            />
          ))}
        </div>
      </section>

      {/* Distribuição por faixa */}
      <OperationalBandsChart readings={readings} />
    </section>
  );
}
