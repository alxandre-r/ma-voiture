'use client';

import { Card } from '@/components/common/ui/card';
import { formatCurrency } from '@/lib/utils/format';

interface ExpenseStatsProps {
  total: number;
  count: number;
  avgPerMonth: number;
}

export default function ExpenseStats({ total, count, avgPerMonth }: ExpenseStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Card>
        <div className="p-2 sm:p-3 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 mb-0.5">Total</p>
          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums truncate">
            {formatCurrency(total)}
          </p>
        </div>
      </Card>
      <Card>
        <div className="p-2 sm:p-3 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 mb-0.5">
            Transactions
          </p>
          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">{count}</p>
        </div>
      </Card>
      <Card>
        <div className="p-2 sm:p-3 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 mb-0.5">
            Moy. / mois
          </p>
          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums truncate">
            {formatCurrency(avgPerMonth)}
          </p>
        </div>
      </Card>
    </div>
  );
}
