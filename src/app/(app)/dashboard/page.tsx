'use client';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthLabel } from '@/lib/utils/date';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { ExpenseDonut } from '@/components/dashboard/ExpenseDonut';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { FAB } from '@/components/dashboard/FAB';
import { SummaryCardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoadingTx = useTransactionStore((s) => s.isLoading);
  const categories = useCategoryStore((s) => s.categories);
  const { summary, categoryBreakdown } = useBudget();

  const currentMonth = getMonthLabel(new Date());

  return (
    <div className="page-container">
      {/* Balance hero card */}
      <div className="gradient-balance rounded-[var(--radius-card)] p-5 mb-4 text-white" style={{ boxShadow: 'var(--shadow-fab)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-blue-200 font-medium">{currentMonth}</p>
            <p className="text-xs text-blue-200 opacity-80">Net Balance</p>
          </div>
          <span className="text-2xl">💎</span>
        </div>
        <p className="text-3xl font-bold font-[var(--font-mono)] mb-1">
          {isLoadingTx ? '—' : formatCurrency(summary.netBalance, user?.currency)}
        </p>
        <p className="text-sm text-blue-200">
          {summary.netBalance >= 0 ? '↑ Looking good!' : '↓ Expenses exceed income'}
        </p>
      </div>

      {/* Summary cards grid */}
      {isLoadingTx ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[...Array(4)].map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <SummaryCard
            title="Income"
            amount={summary.totalIncome}
            icon="💰"
            variant="income"
            subtitle="This month"
            currency={user?.currency}
          />
          <SummaryCard
            title="Expenses"
            amount={summary.totalExpenses}
            icon="💸"
            variant="expense"
            subtitle="This month"
            currency={user?.currency}
          />
          <SummaryCard
            title="Savings"
            amount={summary.savingsActual}
            icon="🏦"
            variant="savings"
            subtitle={user?.savingsTarget ? `Goal: ${formatCurrency(user.savingsTarget, user.currency)}` : 'No target set'}
            currency={user?.currency}
          />
          <SummaryCard
            title="Budget Left"
            amount={summary.budgetRemaining}
            icon={summary.isOverBudget ? '⚠️' : '🎯'}
            variant="default"
            subtitle={user?.monthlyBudget ? `of ${formatCurrency(user.monthlyBudget, user.currency)}` : 'No budget set'}
            currency={user?.currency}
          />
        </div>
      )}

      {/* Budget progress */}
      <div className="mb-4">
        <BudgetProgress
          totalExpenses={summary.totalExpenses}
          monthlyBudget={user?.monthlyBudget ?? 0}
          budgetUsedPercent={summary.budgetUsedPercent}
          currency={user?.currency}
        />
      </div>

      {/* Expense breakdown donut */}
      <div className="mb-4">
        <ExpenseDonut
          breakdown={categoryBreakdown}
          currency={user?.currency}
        />
      </div>

      {/* Recent transactions */}
      <RecentTransactions
        transactions={transactions}
        categories={categories}
        currency={user?.currency}
      />

      {/* Mobile FAB */}
      <FAB />
    </div>
  );
}
