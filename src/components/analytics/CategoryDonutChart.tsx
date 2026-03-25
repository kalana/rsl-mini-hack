'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { CategoryBreakdown } from '@/types';

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
  currency?: string;
}

export function CategoryDonutChart({ data, currency = 'USD' }: CategoryDonutChartProps) {
  const items = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={items} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="amount">
          {items.map((entry, i) => (
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
