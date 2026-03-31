'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import { formatCurrency } from '@/lib/utils/format';

import ExpenseRow from './ExpenseRow';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface MonthGroup {
  label: string;
  sortKey: string;
  expenses: Expense[];
  total: number;
}

interface ExpenseMonthGroupProps {
  group: MonthGroup;
  vehicles: (Vehicle | VehicleMinimal)[];
  onViewDetail: (e: Expense) => void;
  onEdit?: (e: Expense) => void;
  onDelete?: (id: number) => void;
  currentUserId?: string | null;
}

export default function ExpenseMonthGroup({
  group,
  vehicles,
  onViewDetail,
  onEdit,
  onDelete,
  currentUserId,
}: ExpenseMonthGroupProps) {
  return (
    <Card key={group.sortKey}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
          {group.label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-300 tabular-nums">
          {formatCurrency(group.total)}
        </p>
      </div>
      <CardContent className="p-0">
        {group.expenses.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            vehicles={vehicles}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />
        ))}
      </CardContent>
    </Card>
  );
}
