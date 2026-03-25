'use client';
import { useUIStore } from '@/store/uiStore';

export function FAB() {
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <button
      onClick={openAddTransaction}
      className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-balance text-white flex items-center justify-center text-2xl font-light transition-transform duration-200 active:scale-95"
      style={{ boxShadow: 'var(--shadow-fab)' }}
      aria-label="Add transaction"
    >
      +
    </button>
  );
}
