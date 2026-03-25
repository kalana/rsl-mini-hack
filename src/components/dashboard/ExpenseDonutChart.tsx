'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { CategoryBreakdown } from '@/types';

interface ExpenseDonutChartProps {
  data: CategoryBreakdown[];
  currency?: string;
}

export function ExpenseDonutChart({ data, currency = 'USD' }: ExpenseDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="amount">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [formatCurrency(v, currency), '']}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
