'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';
import { computeMonthlyData, computeCategoryBreakdown, computeDailyTrend, getCurrentMonthTransactions } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthLabel, subtractMonths } from '@/lib/utils/date';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';

const IncomeExpenseBar = dynamic(
  () => import('@/components/analytics/IncomeExpenseBar').then(m => m.IncomeExpenseBar),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const TrendChart = dynamic(
  () => import('@/components/analytics/TrendChart').then(m => m.TrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CategoryDonutChart = dynamic(
  () => import('@/components/analytics/CategoryDonutChart').then(m => m.CategoryDonutChart),
  { ssr: false, loading: () => <div className="w-48 h-48 animate-pulse bg-[var(--color-border-light)] rounded-full" /> }
);

export default function AnalyticsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const user = useAuthStore((s) => s.user);
  const [monthOffset, setMonthOffset] = useState(0);

  const selectedMonth = useMemo(() => subtractMonths(new Date(), monthOffset), [monthOffset]);
  const monthLabel = getMonthLabel(selectedMonth);

  const monthlyData = useMemo(() => computeMonthlyData(transactions, 6), [transactions]);
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(transactions, categories), [transactions, categories]);
  const dailyTrend = useMemo(() => computeDailyTrend(transactions), [transactions]);

  const monthlyTx = useMemo(() => getCurrentMonthTransactions(transactions), [transactions]);
  const totalIncome   = monthlyTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthlyTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const avgDailySpend = dailyTrend.length > 0
    ? dailyTrend[dailyTrend.length - 1].expenses / dailyTrend.length
    : 0;
  const topCategory = categoryBreakdown[0];
  const cur = user?.currency ?? 'USD';

  return (
    <div className="page-container">
      <div className="hidden md:block mb-5">
        <h1 className="text-xl font-bold text-[var(--color-heading)]">Analytics</h1>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-body)] hover:bg-[var(--color-surface-muted)]"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-[var(--color-heading)]">{monthLabel}</p>
        <button
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40"
        >
          ›
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Income</p>
          <p className="text-sm font-bold text-[var(--color-income)] font-[var(--font-mono)]">{formatCurrency(totalIncome, cur)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Expenses</p>
          <p className="text-sm font-bold text-[var(--color-expense)] font-[var(--font-mono)]">{formatCurrency(totalExpenses, cur)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Avg/Day</p>
          <p className="text-sm font-bold text-[var(--color-heading)] font-[var(--font-mono)]">{formatCurrency(avgDailySpend, cur)}</p>
        </div>
      </div>

      {/* Top insight */}
      {topCategory && (
        <div className="card mb-4 p-4 gradient-card">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{topCategory.icon}</span>
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Top Spending Category</p>
              <p className="text-sm font-bold text-[var(--color-heading)]">
                {topCategory.categoryName} — {formatCurrency(topCategory.amount, cur)} ({topCategory.percent.toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income vs Expenses bar chart */}
      <Card padding="md" className="mb-4">
        <p className="text-sm font-semibold text-[var(--color-heading)] mb-4">6-Month Overview</p>
        <div className="h-52">
          <IncomeExpenseBar data={monthlyData} currency={cur} />
        </div>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-income)]" />
            <span className="text-xs text-[var(--color-muted)]">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-expense)]" />
            <span className="text-xs text-[var(--color-muted)]">Expenses</span>
          </div>
        </div>
      </Card>

      {/* Daily trend area chart */}
      {dailyTrend.length > 0 && (
        <Card padding="md" className="mb-4">
          <p className="text-sm font-semibold text-[var(--color-heading)] mb-4">Monthly Balance Trend</p>
          <div className="h-44">
            <TrendChart data={dailyTrend} currency={cur} />
          </div>
        </Card>
      )}

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card padding="md">
          <p className="text-sm font-semibold text-[var(--color-heading)] mb-4">Category Breakdown</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-48 h-48 flex-shrink-0">
              <CategoryDonutChart data={categoryBreakdown} currency={cur} />
            </div>
            <div className="flex-1 w-full space-y-2">
              {categoryBreakdown.slice(0, 8).map((cat) => (
                <div key={cat.categoryId} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-[var(--color-body)] flex-1">{cat.categoryName}</span>
                  <span className="text-xs font-semibold text-[var(--color-heading)] font-[var(--font-mono)]">
                    {formatCurrency(cat.amount, cur)}
                  </span>
                  <span className="text-xs text-[var(--color-muted)] w-8 text-right">{cat.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {categoryBreakdown.length === 0 && dailyTrend.length === 0 && (
        <div className="card p-8 text-center">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-sm font-medium text-[var(--color-heading)]">No data yet</p>
          <p className="text-xs text-[var(--color-muted)]">Add transactions to see your analytics</p>
        </div>
      )}
    </div>
  );
}
