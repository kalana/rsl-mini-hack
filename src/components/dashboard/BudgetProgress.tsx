import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/utils/currency';
import { getBudgetColor } from '@/lib/utils/calculations';

interface BudgetProgressProps {
  totalExpenses: number;
  monthlyBudget: number;
  budgetUsedPercent: number;
  currency?: string;
}

export function BudgetProgress({ totalExpenses, monthlyBudget, budgetUsedPercent, currency = 'USD' }: BudgetProgressProps) {
  const color = getBudgetColor(budgetUsedPercent);
  const status =
    budgetUsedPercent >= 100 ? 'Over budget' :
    budgetUsedPercent >= 85  ? 'Almost at limit' :
    budgetUsedPercent >= 60  ? 'Spending up' :
    'On track';

  const statusColors: Record<string, string> = {
    'Over budget':    'text-[var(--color-expense)]',
    'Almost at limit':'text-[var(--color-warning)]',
    'Spending up':    'text-[var(--color-warning)]',
    'On track':       'text-[var(--color-income)]',
  };

  if (!monthlyBudget) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-sm font-medium text-[var(--color-heading)]">No budget set</p>
          <p className="text-xs text-[var(--color-muted)]">Set a monthly budget in Settings to track your spending</p>
        </div>
      </div>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-heading)]">Monthly Budget</p>
          <p className={`text-xs font-medium ${statusColors[status]}`}>{status}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[var(--color-heading)] font-[var(--font-mono)]">
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className="text-xs text-[var(--color-muted)]">of {formatCurrency(monthlyBudget, currency)}</p>
        </div>
      </div>
      <ProgressBar value={budgetUsedPercent} color={color} height="md" showLabel animate />
      <p className="text-xs text-[var(--color-muted)] mt-2">
        {budgetUsedPercent >= 100
          ? `${formatCurrency(totalExpenses - monthlyBudget, currency)} over budget`
          : `${formatCurrency(monthlyBudget - totalExpenses, currency)} remaining`}
      </p>
    </Card>
  );
}
