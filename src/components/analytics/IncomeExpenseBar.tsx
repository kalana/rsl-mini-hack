'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { MonthlyData } from '@/types';

interface IncomeExpenseBarProps {
  data: MonthlyData[];
  currency?: string;
}

export function IncomeExpenseBar({ data, currency = 'USD' }: IncomeExpenseBarProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v: number) => `$${(v / 100).toFixed(0)}`}
          tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
          axisLine={false} tickLine={false} width={45}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(v, currency), name === 'income' ? 'Income' : 'Expenses']}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        <Bar dataKey="income"   fill="var(--color-income)"  radius={[4, 4, 0, 0]} name="income" />
        <Bar dataKey="expenses" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
