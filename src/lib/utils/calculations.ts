import type { Transaction, Category, BudgetSummary, CategoryBreakdown, MonthlyData } from '@/types';
import { startOfMonth, endOfMonth, isSameMonth, getShortMonth, subtractMonths } from './date';

/**
 * Filter transactions to those within the current month
 */
export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const start = startOfMonth();
  const end = endOfMonth();
  return transactions.filter(t => t.date >= start && t.date <= end);
}

/**
 * Compute budget summary for a given set of (monthly) transactions
 */
export function computeBudgetSummary(
  transactions: Transaction[],
  monthlyBudget: number,
  monthlyIncome: number,
  savingsTarget: number
): BudgetSummary {
  const monthly = getCurrentMonthTransactions(transactions);
  const totalIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const budgetCap = monthlyBudget || monthlyIncome || 1;
  const budgetUsedPercent = Math.min((totalExpenses / budgetCap) * 100, 150);
  const budgetRemaining = Math.max(budgetCap - totalExpenses, 0);
  const savingsActual = Math.max(totalIncome - totalExpenses, 0);
  const savingsTargetPercent = savingsTarget > 0
    ? Math.min((savingsActual / savingsTarget) * 100, 100)
    : 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    budgetUsedPercent,
    budgetRemaining,
    savingsActual,
    savingsTargetPercent,
    isOverBudget: totalExpenses > budgetCap,
  };
}

/**
 * Compute category breakdown for expense transactions
 */
export function computeCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const monthly = getCurrentMonthTransactions(transactions).filter(t => t.type === 'expense');
  const totalExpenses = monthly.reduce((s, t) => s + t.amount, 0);

  const map = new Map<string, number>();
  for (const t of monthly) {
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }

  const results: CategoryBreakdown[] = [];
  for (const [categoryId, amount] of map.entries()) {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) continue;
    results.push({
      categoryId,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      amount,
      percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Compute last N months of income/expense data for bar chart
 */
export function computeMonthlyData(
  transactions: Transaction[],
  months = 6
): MonthlyData[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const date = subtractMonths(now, months - 1 - i);
    const monthTxns = transactions.filter(t => isSameMonth(t.date, date));
    return {
      month: getShortMonth(date),
      income:   monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });
}

/**
 * Compute cumulative daily balance for trend chart (current month)
 */
export function computeDailyTrend(
  transactions: Transaction[]
): { day: number; balance: number; income: number; expenses: number }[] {
  const monthly = getCurrentMonthTransactions(transactions);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const result = [];
  let cumulativeIncome = 0;
  let cumulativeExpenses = 0;

  for (let day = 1; day <= Math.min(today, daysInMonth); day++) {
    const dayTxns = monthly.filter(t => t.date.getDate() === day);
    cumulativeIncome   += dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    cumulativeExpenses += dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    result.push({ day, balance: cumulativeIncome - cumulativeExpenses, income: cumulativeIncome, expenses: cumulativeExpenses });
  }
  return result;
}

/**
 * Color for budget progress bar based on percentage
 */
export function getBudgetColor(percent: number): string {
  if (percent >= 85) return '#f87171'; // expense red
  if (percent >= 60) return '#fb923c'; // warning orange
  return '#4ade80';                    // income green
}
