'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';

type SparklineStatus = 'normal' | 'atencao' | 'critico';

const strokeHex: Record<SparklineStatus, string> = {
  normal:  '#0FD492',
  atencao: '#FBAD14',
  critico: '#F04F4F',
};

const fillStop0: Record<SparklineStatus, string> = {
  normal:  'rgba(15,212,146,0.62)',
  atencao: 'rgba(251,173,20,0.58)',
  critico: 'rgba(240,79,79,0.60)',
};

interface SparklineCardProps {
  titulo: string;
  valor: string | number;
  unidade?: string;
  dados: { valor: number; label?: string }[];
  status: SparklineStatus;
  tendencia?: string;
  isDemoData?: boolean;
}

function ChartTooltip({
  active,
  payload,
  label,
  unidade,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  unidade?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value);
  return (
    <div className="liquid-glass--subtle min-w-28 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">{label || 'Ponto'}</p>
      <p className="mt-1 text-sm font-bold text-[var(--text-1)]">{value.toLocaleString('pt-BR')}{unidade ? ` ${unidade}` : ''}</p>
    </div>
  );
}

export function SparklineCard({
  titulo,
  valor,
  unidade,
  dados,
  status,
  tendencia,
  isDemoData,
}: SparklineCardProps) {
  const stroke = strokeHex[status];
  const uid = `${status}-${titulo.replace(/\W/g, '')}`;
  const gradId = `area-${uid}`;
  const glowId = `glow-${uid}`;

  // Domínio dinâmico com margem de 12%
  const values = dados.map((d) => d.valor).filter(Number.isFinite);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 1;
  const range = maxVal - minVal;
  const margin = range * 0.12 || Math.max(Math.abs(maxVal) * 0.1, 1);
  const domain: [number, number] = [minVal - margin, maxVal + margin];

  return (
    <article
      aria-label={titulo}
      className={`metric-card metric-card--${status} transition-all duration-200`}
    >
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
        {titulo}
      </p>

      <div className="mt-3 flex flex-col items-center justify-center gap-1">
        <p className="text-center text-4xl font-bold tracking-tighter text-[var(--text-1)] sm:text-5xl">
          {valor}
          {unidade ? (
            <span className="ml-1 text-base font-normal text-[var(--text-3)] sm:text-lg">
              {unidade}
            </span>
          ) : null}
        </p>
        <div className="flex flex-col items-center gap-0.5">
          {tendencia ? (
            <p className="text-xs text-[var(--text-3)]">{tendencia}</p>
          ) : null}
          {isDemoData && (
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)] opacity-50">
              demonstrativo
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 h-12" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillStop0[status]} />
                <stop offset="55%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
              <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <YAxis domain={domain} hide />
            <Tooltip
              cursor={{ stroke: stroke, strokeDasharray: '3 3', opacity: 0.35 }}
              content={<ChartTooltip unidade={unidade} />}
            />

            <Area
              type="monotone"
              dataKey="valor"
              stroke={stroke}
              strokeWidth={2.8}
              fill={`url(#${gradId})`}
              filter={`url(#${glowId})`}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              dot={false}
              activeDot={{ r: 5, fill: stroke, stroke: 'var(--background)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
