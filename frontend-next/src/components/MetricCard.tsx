import type { ReactNode } from 'react';

const toneClass = {
  emerald: 'text-[color:var(--status-normal)]',
  amber:   'text-[color:var(--status-atencao)]',
  red:     'text-[color:var(--status-critico)]',
  slate:   'text-[var(--text-1)]',
} as const;

const toneBorder = {
  emerald: 'border-[color:var(--status-normal)]/20',
  amber:   'border-[color:var(--status-atencao)]/20',
  red:     'border-[color:var(--status-critico)]/20',
  slate:   'border-[var(--line)]',
} as const;

const metricText = {
  temperatura: 'var(--metric-temperature)',
  vibracao: 'var(--metric-vibration)',
  rpm: 'var(--metric-rpm)',
} as const;

export function MetricCard({
  label,
  value,
  helper,
  tone = 'slate',
  metric,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: keyof typeof toneClass;
  metric?: keyof typeof metricText;
}) {
  return (
    <article
      role="group"
      aria-label={label}
      className={`metric-card metric-card--${tone} border ${toneBorder[tone]}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
        {label}
      </p>
      <div className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${toneClass[tone]}`}>
        <span style={metric ? { color: metricText[metric] } : undefined}>{value}</span>
      </div>
      {helper ? (
        <p className="mt-1.5 text-xs text-[var(--text-3)]">{helper}</p>
      ) : null}
    </article>
  );
}
