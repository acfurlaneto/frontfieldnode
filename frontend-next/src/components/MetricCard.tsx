import type { ReactNode } from 'react';

const toneClass = {
  emerald: 'text-[color:var(--status-normal)]',
  amber:   'text-[color:var(--status-atencao)]',
  red:     'text-[color:var(--status-critico)]',
  slate:   'text-[var(--text-1)]',
} as const;

export function MetricCard({
  label,
  value,
  helper,
  tone = 'slate',
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: keyof typeof toneClass;
}) {
  return (
    <article
      role="group"
      aria-label={label}
      className={`metric-card metric-card--${tone}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
        {label}
      </p>
      <div className={`stat-value mt-3 text-2xl font-bold sm:text-3xl ${toneClass[tone]}`}>
        {value}
      </div>
      {helper ? (
        <p className="mt-1.5 text-xs text-[var(--text-3)]">{helper}</p>
      ) : null}
    </article>
  );
}
