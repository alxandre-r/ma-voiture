'use client';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from '@/lib/utils/expensesUtils';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getVehicleName } from '@/lib/utils/vehicleUtils';

import type { Expense } from '@/types/expense';
import type { Vehicle } from '@/types/vehicle';

interface RecentExpensesProps {
  expenses: Expense[];
  vehicles: Vehicle[];
}

export default function RecentExpenses({ expenses, vehicles }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Dépenses Récentes</CardTitle>
        <Link
          href="/expenses"
          className="text-sm font-medium text-custom-1 hover:text-custom-1-hover transition-colors"
        >
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {expenses.slice(0, 5).map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Left: Icon + Type/Date + Vehicle */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center p-2.5 rounded-xl shrink-0 ${getCategoryColor(expense.type)}`}
                >
                  <Icon name={getCategoryIcon(expense.type)} size={18} className='invert dark:invert-0' />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {getCategoryLabel(expense)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {formatDate(expense.date)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getVehicleName(expense.vehicle_id, vehicles)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Amount */}
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {formatCurrency(expense.amount ?? 0)}
              </span>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              Aucune dépense pour la sélection actuelle.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
