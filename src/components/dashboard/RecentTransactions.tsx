'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatRelativeDate } from '@/lib/utils/date';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/uiStore';
import type { Transaction, Category } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  currency?: string;
}

export function RecentTransactions({ transactions, categories, currency = 'USD' }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[var(--color-heading)]">Recent Transactions</p>
        <Link href="/transactions" className="text-xs text-[var(--color-primary-500)] font-medium hover:underline">
          See all
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          emoji="💸"
          title="No transactions yet"
          description="Add your first transaction to get started"
          action={
            <button
              onClick={openAddTransaction}
              className="text-sm text-[var(--color-primary-500)] font-medium hover:underline"
            >
              Add transaction →
            </button>
          }
        />
      ) : (
        <div className="divide-y divide-[var(--color-border-light)]">
          {recent.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <CategoryBadge category={cat} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-heading)] truncate">
                    {cat?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {t.note ? `${t.note} · ` : ''}{formatRelativeDate(t.date)}
                  </p>
                </div>
                <span className={t.type === 'income' ? 'amount-positive text-sm' : 'amount-negative text-sm'}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
