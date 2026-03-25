'use client';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import type { CategoryBreakdown } from '@/types';

const ExpenseDonutChart = dynamic(
  () => import('./ExpenseDonutChart').then(m => m.ExpenseDonutChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface ExpenseDonutProps {
  breakdown: CategoryBreakdown[];
  currency?: string;
}

export function ExpenseDonut({ breakdown, currency = 'USD' }: ExpenseDonutProps) {
  if (breakdown.length === 0) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-[var(--color-heading)] mb-3">Spending by Category</p>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-3xl mb-2">🥧</span>
          <p className="text-sm text-[var(--color-muted)]">No expenses this month</p>
        </div>
      </Card>
    );
  }

  const topCategories = breakdown.slice(0, 6);

  return (
    <Card padding="md">
      <p className="text-sm font-semibold text-[var(--color-heading)] mb-3">Spending by Category</p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-48 h-44">
          <ExpenseDonutChart data={topCategories} currency={currency} />
        </div>
        <div className="flex-1 w-full space-y-2">
          {topCategories.map((cat) => (
            <div key={cat.categoryId} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-[var(--color-body)] flex-1 truncate">{cat.categoryName}</span>
              <span className="text-xs font-semibold text-[var(--color-heading)] font-[var(--font-mono)]">
                {formatCurrency(cat.amount, currency)}
              </span>
              <span className="text-xs text-[var(--color-muted)] w-10 text-right">
                {cat.percent.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
