import type { ReactNode } from 'react';
import { BackButton } from '@/components/BackButton';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';

export function AppShell({
  active,
  title,
  eyebrow,
  description,
  actions,
  contentClassName = '',
  children,
}: {
  active: string;
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  const showBackButton = active !== '/dashboard';

  return (
    <main className="app-background flex h-screen w-screen overflow-hidden text-[var(--foreground)]">
      <Sidebar />
      {showBackButton ? <BackButton /> : null}

      <section className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <header className="w-full shrink-0 px-4 pt-5 pb-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className={`min-w-0 ${showBackButton ? 'pl-14 lg:pl-12' : ''}`}>
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ui-accent)]">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[var(--text-1)] sm:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-0.5 hidden text-xs text-[var(--text-3)] sm:block">{description}</p>
              ) : null}
            </div>

            <div className="flex min-w-0 max-w-full shrink items-center gap-2">
              <div className="hidden sm:block">
                <ApiStatusIndicator />
              </div>
              {actions}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="app-content min-h-0 flex-1 overflow-y-auto">
          <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
