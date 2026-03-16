'use client';

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';

import type { Expense } from '@/types/expense';
import type { Vehicle } from '@/types/vehicle';

interface RecentExpensesProps {
  expenses: Expense[];
  vehicles: Vehicle[];
}

// Get category color based on expense type
function getCategoryColor(type: string): string {
  switch (type) {
    case 'fuel':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    case 'electric_charge':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'maintenance':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'insurance':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'other':
    default:
      return 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
  }
}

// Get category icon based on expense type
function getCategoryIcon(type: string): string {
  switch (type) {
    case 'fuel':
      return 'car';
    case 'electric_charge':
      return 'elec';
    case 'maintenance':
      return 'tool';
    case 'insurance':
      return 'secure';
    default:
      return 'euro';
  }
}

// Get category label based on expense type
function getCategoryLabel(expense: Expense): string {
  switch (expense.type) {
    case 'fuel':
      return 'Carburant';
    case 'electric_charge':
      return 'Recharge';
    case 'maintenance':
      return expense.maintenance_type_label || 'Entretien';
    case 'insurance':
      return 'Assurance';
    case 'other':
      return expense.label || 'Autre';
    default:
      return expense.type;
  }
}

// Get vehicle name from vehicle ID
function getVehicleName(vehicleId: number, vehicles: Vehicle[]): string {
  const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
  if (!vehicle) return 'Véhicule';

  return vehicle.name || `${vehicle.make} ${vehicle.model}`;
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
                  <Icon name={getCategoryIcon(expense.type)} size={18} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {getCategoryLabel(expense)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {format(parseISO(expense.date), 'dd MMM', { locale: fr })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getVehicleName(expense.vehicle_id, vehicles)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Amount */}
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {expense.amount.toFixed(2)} €
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
