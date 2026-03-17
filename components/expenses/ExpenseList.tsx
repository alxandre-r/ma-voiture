'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo, useState, useRef } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import { useClickOutside } from '@/lib/utils/clickOutside';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface ExpenseListProps {
  expenses?: Expense[];
  vehicles?: (Vehicle | VehicleMinimal)[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: number) => void;
  currentUserId?: string | null;
}

export default function ExpenseList({
  expenses = [],
  vehicles = [],
  onEditExpense,
  onDeleteExpense,
  currentUserId,
}: ExpenseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Check if expense can be edited (owned by current user and is not insurance)
  const canEditExpense = (expense: Expense): boolean => {
    if (!currentUserId || !onEditExpense) return false;
    if (expense.owner_id !== currentUserId) return false;
    if (expense.type === 'insurance') return false;
    return true;
  };

  // Check if expense can be deleted (owned by current user and is not insurance)
  const canDeleteExpense = (expense: Expense): boolean => {
    if (!currentUserId || !onDeleteExpense) return false;
    if (expense.owner_id !== currentUserId) return false;
    if (expense.type === 'insurance') return false;
    return true;
  };

  // Action Menu Component
  const ActionMenu = ({ expense }: { expense: Expense }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

    if (!canEditExpense(expense) && !canDeleteExpense(expense)) return null;

    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Actions"
        >
          <Icon name="more-vertical" size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl z-50 py-1">
            {canEditExpense(expense) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEditExpense!(expense);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Icon name="edit" size={16} /> Modifier
              </button>
            )}
            {canDeleteExpense(expense) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDeleteExpense!(expense.id);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Icon name="delete" size={16} /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Filter expenses by category only (vehicle and period are handled in header)
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let result = [...expenses];

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'Carburant / Recharge') {
        result = result.filter((e) => e.type === 'fuel' || e.type === 'electric_charge');
      } else {
        const categoryMap: Record<string, string> = {
          Assurance: 'insurance',
          Entretien: 'maintenance',
          Autre: 'other',
        };
        const expenseType = categoryMap[selectedCategory];
        if (expenseType) {
          result = result.filter((e) => e.type === expenseType);
        }
      }
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [expenses, selectedCategory]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCost = filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const totalCount = filteredExpenses.length;
    const fillUpsCount = filteredExpenses.filter((e) => e.type === 'fuel').length;
    const chargeUpsCount = filteredExpenses.filter((e) => e.type === 'electric_charge').length;

    return {
      totalCost,
      totalCount,
      fillUpsCount,
      chargeUpsCount,
    };
  }, [filteredExpenses]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    return vehicle ? vehicle.name || `${vehicle.make} ${vehicle.model}` : 'Véhicule';
  };

  const getCategoryLabel = (expense: Expense) => {
    switch (expense.type) {
      case 'fuel':
        return 'Carburant';
      case 'electric_charge':
        return 'Recharge';
      case 'maintenance':
        // Use maintenance_type_label from the database (French label)
        return expense.maintenance_type_label || 'Entretien';
      case 'insurance':
        return 'Assurance';
      case 'other':
        return expense.label || 'Autre';
      default:
        return expense.type;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'fuel':
        return 'bg-orange-600/90';
      case 'electric_charge':
        return 'bg-blue-600/90';
      case 'maintenance':
        return 'bg-amber-600/90';
      case 'insurance':
        return 'bg-green-600/90';
      case 'other':
      default:
        return 'bg-violet-600/90';
    }
  };

  const getCategoryIcon = (type: string) => {
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
  };

  const getDescription = (expense: Expense) => {
    // For fuel - show liters
    if (expense.type === 'fuel' && expense.liters != null) {
      return `${expense.liters.toFixed(2)} L • ${expense.price_per_liter?.toFixed(3)} €/L`;
    }
    // For electric_charge - show kWh
    if (expense.type === 'electric_charge' && expense.kwh != null) {
      return `${expense.kwh.toFixed(2)} kWh • ${expense.price_per_kwh?.toFixed(3)} €/kWh`;
    }
    // For maintenance - show maintenance type and garage
    if (expense.type === 'maintenance') {
      const parts: string[] = [];
      if (expense.maintenance_type_label) parts.push(expense.maintenance_type_label);
      if (expense.garage) parts.push(expense.garage);
      return parts.length > 0 ? parts.join(' • ') : null;
    }
    // For insurance - show message
    if (expense.type === 'insurance') {
      return "Mensualité d'assurance";
    }
    // For other - show label
    if (expense.type === 'other' && expense.label) return expense.label;
    // Fall back to notes
    if (expense.notes) return expense.notes;
    return null;
  };

  // Get additional details (secondary info like price per unit)
  const getAdditionalDetails = (expense: Expense) => {
    const parts: string[] = [];

    // For fuel - show price per liter
    if (expense.type === 'fuel' && expense.price_per_liter != null) {
      parts.push(`${expense.odometer ? `${expense.odometer.toLocaleString()} km` : ''}`);
    }
    // For electric_charge - show price per kWh
    if (expense.type === 'electric_charge' && expense.price_per_kwh != null) {
      parts.push(`${expense.price_per_kwh.toFixed(3)} €/kWh`);
    }
    // For maintenance - show odometer
    if (expense.type === 'maintenance' && expense.odometer != null) {
      parts.push(`${expense.odometer.toLocaleString()} km`);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <CardTitle>Transactions</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Category Filter Only */}
            <select
              className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              <option value="Carburant / Recharge">Carburant / Recharge</option>
              <option value="Assurance">Assurance</option>
              <option value="Entretien">Entretien</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
      </CardHeader>

      {/* Stats Section */}
      <div className="px-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.totalCost > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                <Icon name="euro" size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Coût Total</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalCost.toFixed(2)} €
              </span>
            </div>
          )}
          {stats.totalCount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                <Icon name="stack" size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Transactions</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalCount}
              </span>
            </div>
          )}
          {stats.fillUpsCount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                <Icon name="conso" size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Pleins</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.fillUpsCount}
              </span>
            </div>
          )}
          {stats.chargeUpsCount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                <Icon name="elec" size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Recharges</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.chargeUpsCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        {/* Desktop Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-gray-50/80 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-4 lg:col-span-3">Catégorie & Date</div>
          <div className="col-span-5 lg:col-span-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="col-span-1 lg:col-span-2">Véhicule</div>
            <div className="col-span-1 lg:col-span-4">Description</div>
          </div>
          <div className="col-span-2 lg:col-span-2 text-right">
            <span>Montant</span>
          </div>
          <div className="col-span-1 lg:col-span-1 text-center"></div>
        </div>

        <div className="flex flex-col">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-3 sm:gap-6"
            >
              {/* Mobile Top Row / Desktop Col 1 */}
              <div className="flex justify-between items-start sm:items-center sm:col-span-4 lg:col-span-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`flex items-center justify-center p-2.5 sm:p-3 rounded-xl shrink-0 ${getCategoryColor(expense.type)}`}
                  >
                    <Icon
                      name={getCategoryIcon(expense.type)}
                      size={18}
                      className="invert dark:invert-0"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {getCategoryLabel(expense)}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block mt-1 sm:mt-0.5">
                      {formatDate(expense.date)}
                    </div>
                  </div>
                </div>
                {/* Mobile Amount (Hidden on Desktop) */}
                <div className="flex flex-col items-end sm:hidden">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {expense.amount.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Mobile Bottom Row / Desktop Cols 2 & 3 */}
              <div className="flex items-center justify-between text-sm sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-gray-100 dark:border-gray-700 sm:border-none sm:col-span-5 lg:col-span-6 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:gap-4">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 sm:col-span-1 lg:col-span-2">
                  <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                    {getVehicleName(expense.vehicle_id)}
                  </span>
                </div>
                <div className="truncate text-gray-500 dark:text-gray-400 max-w-[150px] sm:max-w-none text-right sm:text-left sm:col-span-1 lg:col-span-4">
                  {getDescription(expense) ? (
                    <div className="flex flex-col items-start">
                      <span>{getDescription(expense)}</span>
                      {getAdditionalDetails(expense) && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getAdditionalDetails(expense)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600 italic">
                      Aucune description
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop Amount and Actions (Hidden on Mobile) */}
              <div className="hidden sm:flex items-center justify-end sm:col-span-2 lg:col-span-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {expense.amount.toFixed(2)} €
                </span>
              </div>
              <div className="hidden sm:flex items-center justify-center sm:col-span-1 lg:col-span-1">
                <ActionMenu expense={expense} />
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucune transaction trouvée pour ces filtres.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
