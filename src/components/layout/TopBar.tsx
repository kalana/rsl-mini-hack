'use client';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/analytics':    'Analytics',
  '/settings':     'Settings',
};

export function TopBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = PAGE_TITLES[pathname] ?? 'FinanceMe';

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-[var(--color-muted)]">Welcome back,</p>
        <h1 className="text-base font-bold text-[var(--color-heading)] leading-tight">{user?.name?.split(' ')[0] ?? title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full gradient-balance flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  );
}
