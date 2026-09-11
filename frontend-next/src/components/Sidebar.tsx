'use client';

import Link from 'next/link';
import { FileText, LayoutGrid, Map, Tractor, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

const items = [
  { icon: LayoutGrid, href: '/dashboard', label: 'Dashboard' },
  { icon: Map,         href: '/mapa',         label: 'Mapa' },
  { icon: Tractor,     href: '/colheitadeiras', label: 'Máquinas' },
  { icon: Users,       href: '/operarios',    label: 'Operários' },
  { icon: FileText,    href: '/relatorios',   label: 'Relatórios' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav
        aria-label="Navegação principal"
        className="!fixed inset-y-0 left-0 z-50 hidden h-[100dvh] w-[5.5rem] flex-col items-center rounded-none border-y-0 border-l-0 px-2 py-4 shadow-[var(--shadow-glass)] lg:flex liquid-glass"
      >
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="FieldNode — ir para o dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--ui-accent)] text-[11px] font-black tracking-tight text-slate-950 shadow-[0_0_18px_var(--glow-normal)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95"
          >
            FN
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-8">
          {items.map(({ icon: Icon, href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95 ${
                  isActive
                    ? 'bg-[color:var(--ui-accent)]/12 text-[color:var(--ui-accent)] shadow-[0_0_14px_var(--glow-normal)]'
                    : 'text-[var(--text-3)] hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1px] top-2 h-6 w-0.5 rounded-r-full bg-[color:var(--ui-accent)]"
                  />
                )}
                <Icon aria-hidden="true" size={19} strokeWidth={isActive ? 2 : 1.6} />
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-1)] shadow-xl opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        <div
          className="flex w-10 flex-col items-center gap-2 border-t border-[var(--line)] pt-4"
          title="Gateway conectado"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--status-normal)] shadow-[0_0_6px_var(--glow-normal-strong)]" />
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
            live
          </span>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav
        aria-label="Navegação mobile"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-1 rounded-2xl px-2 py-1.5 shadow-[var(--shadow-glass)] lg:hidden liquid-glass"
      >
        {items.map(({ icon: Icon, href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ui-accent)] active:scale-95 ${
                isActive
                  ? 'bg-[color:var(--ui-accent)]/12 text-[color:var(--ui-accent)] shadow-[0_0_12px_var(--glow-normal)]'
                  : 'text-[var(--text-3)] hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)]'
              }`}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={isActive ? 2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
