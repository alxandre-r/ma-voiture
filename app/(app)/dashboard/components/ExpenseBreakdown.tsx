'use client';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import { formatCurrency } from '@/lib/utils/format';

import type { Expense } from '@/types/expense';

interface ExpenseBreakdownProps {
  expenses: Expense[];
}

// Inline hex colors avoids Tailwind JIT purge on dynamic class names
const CATEGORIES = [
  {
    key: 'energy',
    label: 'Énergie',
    types: ['fuel', 'electric_charge'],
    icon: 'car',
    color: '#f97316',
  },
  {
    key: 'maintenance',
    label: 'Entretien',
    types: ['maintenance'],
    icon: 'tool',
    color: '#d97706',
  },
  {
    key: 'insurance',
    label: 'Assurance',
    types: ['insurance'],
    icon: 'secure',
    color: '#16a34a',
  },
  {
    key: 'other',
    label: 'Autre',
    types: ['other'],
    icon: 'stack',
    color: '#7c3aed',
  },
] as const;

export default function ExpenseBreakdown({ expenses }: ExpenseBreakdownProps) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  if (total === 0) return null;

  const categories = CATEGORIES.map((cat) => {
    const amount = expenses
      .filter((e) => (cat.types as readonly string[]).includes(e.type))
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return { ...cat, amount, pct };
  }).filter((c) => c.amount > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon name="chart" size={18} />
          <CardTitle>Répartition des dépenses</CardTitle>
        </div>
        <Link href="/statistics" className="text-sm font-medium text-custom-1 hover:underline">
          Statistiques
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon name={cat.icon} size={14} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cat.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tabular-nums">
                    {cat.pct.toFixed(0)}%
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-20 text-right">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
