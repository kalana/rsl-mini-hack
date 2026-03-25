'use client';
import { useMemo, useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/useToast';
import { deleteTransaction } from '@/lib/firebase/firestore';
import { formatRelativeDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { TransactionItemSkeleton } from '@/components/ui/Skeleton';
import { FAB } from '@/components/dashboard/FAB';
import type { TransactionFilters } from '@/types';

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const removeOptimistic = useTransactionStore((s) => s.removeOptimistic);
  const categories = useCategoryStore((s) => s.categories);
  const user = useAuthStore((s) => s.user);
  const setEditingTransaction = useUIStore((s) => s.setEditingTransaction);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);
  const toast = useToast();

  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    categoryId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const [dateFromStr, setDateFromStr] = useState('');
  const [dateToStr, setDateToStr] = useState('');

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
        if (filters.dateFrom && t.date < filters.dateFrom) return false;
        if (filters.dateTo   && t.date > filters.dateTo)   return false;
        return true;
      });
  }, [transactions, filters]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const label = formatRelativeDate(t.date);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(t);
    }
    return groups;
  }, [filtered]);

  async function handleDelete(id: string) {
    removeOptimistic(id);
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
    } catch {
      toast.error('Failed to delete transaction');
    }
  }

  function handleDateFromChange(value: string) {
    setDateFromStr(value);
    setFilters((f) => ({ ...f, dateFrom: value ? new Date(value + 'T00:00:00') : undefined }));
  }

  function handleDateToChange(value: string) {
    setDateToStr(value);
    setFilters((f) => ({ ...f, dateTo: value ? new Date(value + 'T23:59:59') : undefined }));
  }

  const hasActiveFilters = filters.type !== 'all' || filters.categoryId || filters.dateFrom || filters.dateTo;

  return (
    <div className="page-container">
      <div className="hidden md:flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[var(--color-heading)]">Transactions</h1>
        <button onClick={openAddTransaction} className="btn-primary text-sm px-4 py-2">
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-3">
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-xs">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters((f) => ({ ...f, type: t }))}
                className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                  filters.type === t
                    ? 'bg-[var(--color-heading)] text-white'
                    : 'text-[var(--color-body)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={filters.categoryId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))}
            className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-body)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFromStr}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-body)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
            placeholder="From"
          />
          <input
            type="date"
            value={dateToStr}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-body)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
            placeholder="To"
          />

          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilters({ type: 'all' });
                setDateFromStr('');
                setDateToStr('');
              }}
              className="text-xs text-[var(--color-expense)] px-2 py-1.5 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {filtered.length > 0 && (
          <p className="text-xs text-[var(--color-muted)] mt-2">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Transaction list */}
      {isLoading ? (
        <div className="card divide-y divide-[var(--color-border-light)]">
          {[...Array(5)].map((_, i) => <TransactionItemSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="💸"
          title={hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
          description={hasActiveFilters ? 'Try adjusting your filters' : 'Add your first transaction to get started'}
          action={
            !hasActiveFilters ? (
              <button onClick={openAddTransaction} className="text-sm text-[var(--color-primary-500)] font-medium hover:underline">
                Add transaction →
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([label, txns]) => {
            const dayIncome   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
              <div key={label} className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface-muted)] border-b border-[var(--color-border-light)]">
                  <span className="text-xs font-semibold text-[var(--color-heading)]">{label}</span>
                  <div className="flex gap-3 text-xs font-medium">
                    {dayIncome  > 0 && <span className="text-[var(--color-income)]">+{formatCurrency(dayIncome,   user?.currency)}</span>}
                    {dayExpenses > 0 && <span className="text-[var(--color-expense)]">-{formatCurrency(dayExpenses, user?.currency)}</span>}
                  </div>
                </div>
                <div className="px-4 divide-y divide-[var(--color-border-light)]">
                  {txns.map((t) => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      category={categories.find((c) => c.id === t.categoryId)}
                      currency={user?.currency}
                      onEdit={(id) => setEditingTransaction(id)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FAB />
    </div>
  );
}
