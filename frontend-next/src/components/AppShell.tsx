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
    <main className="app-background min-h-screen text-[var(--foreground)]">
      <Sidebar />

      <section className="relative z-10 lg:pl-[5.5rem]">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color:var(--surface-header)]/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {showBackButton ? (
                <div className="mt-0.5 shrink-0">
                  <BackButton />
                </div>
              ) : null}

              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ui-accent)]">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-[var(--text-1)] sm:text-xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-0.5 hidden text-xs text-[var(--text-3)] sm:block">{description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden sm:block">
                <ApiStatusIndicator />
              </div>
              {actions}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className={`mx-auto w-full max-w-7xl min-h-0 px-4 py-5 sm:px-6 lg:px-8 ${contentClassName}`}>
          {children}
        </div>
      </section>
    </main>
  );
}
