'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/ui/card';
import { EXPENSE_CATEGORIES } from '@/components/expenses/expenseCategories';
import { formatCurrency } from '@/lib/utils/format';

interface ExpenseCategoryChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalCost: number;
}

// Build color map from shared categories
const colorMap: Record<string, string> = EXPENSE_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  },
  {} as Record<string, string>,
);

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-800 p-3 z-50 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{data.name}</p>
        <p className="text-sm text-slate-500">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseCategoryChart({ data, totalCost }: ExpenseCategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Add percentage to data
  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    color: colorMap[item.name] || item.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des dépenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex z-40 flex-col items-center">
          {/* Donut Chart with Recharts - Responsive size */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalCost > 0 ? formatCurrency(totalCost) : '0 €'}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>

          {/* Legend - Below chart, centered, responsive columns */}
          <div className="w-full max-w-md flex justify-center px-10">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
              {/* Left column - Labels */}
              <div className="space-y-1 sm:space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-slate-600 dark:text-slate-400 truncate">{item.name}</p>
                  </div>
                ))}
              </div>

              {/* Right column - Data */}
              <div className="space-y-1 sm:space-y-2">
                {chartData.map((item, index) => (
                  <div
                    key={`data-${index}`}
                    className="flex items-center justify-end gap-1 text-xs sm:text-sm"
                  >
                    <p className="text-slate-900 dark:text-slate-100 font-bold">
                      {formatCurrency(item.value)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      ({item.percentage.toFixed(1)}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
