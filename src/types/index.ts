export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // stored in cents (integer) to avoid float precision bugs
  categoryId: string;
  date: Date;
  note?: string;
  createdAt: Date;
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // hex e.g. '#60a5fa'
  icon: string;  // emoji
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;  // cents
  monthlyBudget: number;  // cents
  savingsTarget: number;  // cents
  currency: string;       // 'USD'
  createdAt: Date;
}

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetUsedPercent: number;
  budgetRemaining: number;
  savingsActual: number;
  savingsTargetPercent: number;
  isOverBudget: boolean;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percent: number;
}

export interface MonthlyData {
  month: string; // "Jan", "Feb", etc.
  income: number;
  expenses: number;
}
