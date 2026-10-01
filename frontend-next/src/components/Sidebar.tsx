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
        className="app-nav app-nav--rail fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center border-0 px-2 py-5 lg:flex"
      >
        <Link
          href="/dashboard"
          aria-label="FieldNode — ir para o dashboard"
          className="app-nav__brand flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] text-[11px] font-black tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.85)] active:scale-95"
        >
          FN
        </Link>

        {/* Ícones empilhados a partir do topo, unidos numa pílula — sem centralizar. */}
        <div className="app-nav__cluster mt-5 w-full">
          {items.map(({ icon: Icon, href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`app-nav__item group relative flex shrink-0 items-center justify-center border border-transparent transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 ${
                  isActive ? 'app-nav--active' : ''
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="app-nav__indicator absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full"
                  />
                )}
                <Icon aria-hidden="true" size={19} strokeWidth={isActive ? 2.2 : 1.6} />
                <span className="app-nav__tooltip pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        <div
          className="app-nav__divider mt-auto flex w-10 flex-col items-center gap-2 border-t pt-4"
          title="Gateway conectado"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--status-normal)] shadow-[0_0_6px_var(--glow-normal-strong)]" />
          <span className="app-nav__status-label text-[8px] font-semibold uppercase tracking-[0.14em]">
            live
          </span>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav
        aria-label="Navegação mobile"
        className="app-nav app-nav--bar fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-1 rounded-[1.5rem] px-2 py-1.5 lg:hidden"
      >
        {items.map(({ icon: Icon, href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`app-nav__item flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 ${
                isActive ? 'app-nav--active' : ''
              }`}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={isActive ? 2.2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
