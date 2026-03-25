'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthListener } from '@/hooks/useAuth';
import { useTransactionsListener } from '@/hooks/useTransactions';
import { useCategoriesListener } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';

function AppProviders({ children }: { children: React.ReactNode }) {
  // Register all real-time listeners
  useAuthListener();
  useTransactionsListener();
  useCategoriesListener();

  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-muted)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-balance flex items-center justify-center animate-pulse">
            <span className="text-white text-lg">💎</span>
          </div>
          <p className="text-sm text-[var(--color-muted)]">Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="md:ml-60">
        {/* Mobile top bar */}
        <TopBar />

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Global portals */}
      <AddTransactionModal />
      <ToastContainer />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
