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
  onEditFill?: (expense: Expense) => void;
}

export default function RecentExpenses({ expenses, vehicles, onEditFill }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon name="euro" size={18} />
          <CardTitle>Dépenses récentes</CardTitle>
        </div>
        <Link href="/expenses" className="text-sm font-medium text-custom-1 hover:underline">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <Icon name="euro" size={32} className="opacity-20 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Aucune dépense pour la sélection actuelle.
            </p>
          </div>
        ) : (
          <div>
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                {/* Left: Icon + Type + Vehicle/Date */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center p-2 rounded-xl shrink-0 ${getCategoryColor(expense.type)}`}
                  >
                    <Icon name={getCategoryIcon(expense.type)} size={16} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getCategoryLabel(expense)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getVehicleName(expense.vehicle_id, vehicles)} · {formatDate(expense.date)}
                    </p>
                  </div>
                </div>

                {/* Right: Edit button (fill/charge only) + Amount */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {onEditFill &&
                    (expense.type === 'fuel' || expense.type === 'electric_charge') && (
                      <button
                        onClick={() => onEditFill(expense)}
                        className="p-1 text-gray-400 hover:text-custom-1 transition-colors"
                        title="Modifier"
                      >
                        <Icon name="pencil" size={13} />
                      </button>
                    )}
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(expense.amount ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
