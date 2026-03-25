import { formatCurrency } from '@/lib/utils/currency';

interface SummaryCardProps {
  title: string;
  amount: number; // cents
  icon: string;
  variant: 'income' | 'expense' | 'savings' | 'default';
  subtitle?: string;
  currency?: string;
}

const VARIANTS = {
  income:  { bg: 'gradient-income',  text: 'text-[var(--color-income)]',  iconBg: 'bg-[var(--color-income-bg)]' },
  expense: { bg: 'gradient-expense', text: 'text-[var(--color-expense)]', iconBg: 'bg-[var(--color-expense-bg)]' },
  savings: { bg: 'gradient-savings', text: 'text-[#16a34a]',              iconBg: 'bg-[#dcfce7]' },
  default: { bg: '',                 text: 'text-[var(--color-heading)]',  iconBg: 'bg-[var(--color-border-light)]' },
};

export function SummaryCard({ title, amount, icon, variant, subtitle, currency = 'USD' }: SummaryCardProps) {
  const v = VARIANTS[variant];

  return (
    <div className={`card p-4 ${v.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[var(--color-body)] uppercase tracking-wide">{title}</p>
        <span className={`w-8 h-8 rounded-xl ${v.iconBg} flex items-center justify-center text-base`}>
          {icon}
        </span>
      </div>
      <p className={`text-xl font-bold font-[var(--font-mono)] ${v.text}`}>
        {formatCurrency(amount, currency)}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--color-muted)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
