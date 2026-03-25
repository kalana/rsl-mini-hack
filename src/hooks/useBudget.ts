'use client';
import { useMemo } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { computeBudgetSummary, computeCategoryBreakdown } from '@/lib/utils/calculations';

export function useBudget() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const user = useAuthStore((s) => s.user);

  const summary = useMemo(() =>
    computeBudgetSummary(
      transactions,
      user?.monthlyBudget ?? 0,
      user?.monthlyIncome ?? 0,
      user?.savingsTarget ?? 0
    ),
    [transactions, user]
  );

  const categoryBreakdown = useMemo(() =>
    computeCategoryBreakdown(transactions, categories),
    [transactions, categories]
  );

  return { summary, categoryBreakdown };
}
