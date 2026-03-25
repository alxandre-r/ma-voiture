'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { forwardRef } from 'react';

import Icon from '@/components/common/ui/Icon';

import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

interface MaintenanceCardProps {
  expense: Expense;
  vehicle?: VehicleMinimal;
  isLast: boolean;
  isMenuOpen: boolean;
  userId?: string;
  onEdit: () => void;
  onDeleteClick: () => void;
  deletingId?: number | null;
}

const MaintenanceCard = forwardRef<HTMLDivElement, MaintenanceCardProps>(
  (
    {
      expense,
      vehicle,
      isLast,
      isMenuOpen,
      userId,
      onEdit,
      onDeleteClick,
      deletingId,
    }: MaintenanceCardProps,
    ref,
  ) => {
    const vehicleName = vehicle
      ? vehicle.name || `${vehicle.make} ${vehicle.model}`
      : 'Véhicule inconnu';

    const getDisplayLabel = (exp: Expense) => {
      return exp.maintenance_type_label || 'Entretien';
    };

    return (
      <div className="relative flex items-stretch gap-2 sm:gap-6">
        {/* Desktop: Date on the left */}
        <div className="hidden sm:block w-16 sm:w-24 shrink-0 text-right pt-1.5">
          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
            {format(new Date(expense.date), 'dd MMM', { locale: fr })}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(expense.date), 'yyyy', { locale: fr })}
          </div>
        </div>

        {/* Timeline: Desktop = logo, Mobile = date */}
        <div className="relative flex flex-col items-center">
          {/* Desktop: Logo on timeline node */}
          <div
            className="hidden sm:flex w-8 h-8 rounded-full bg-transparent
                      border-2 border-custom-2 text-custom-2 items-center justify-center shrink-0 z-10"
          >
            <Icon name="tool" size={14} />
          </div>
          {/* Mobile: Date on timeline node */}
          <div className="sm:hidden w-8 h-8 rounded-full bg-transparent border-2 border-custom-2 text-custom-2 flex flex-col items-center justify-center shrink-0 z-10 -ml-1">
            <span className="text-[10px] font-bold text-gray-800 dark:text-gray-100 leading-none">
              {format(new Date(expense.date), 'dd')}
            </span>
            <span className="text-[8px] text-gray-600 dark:text-gray-400 leading-none">
              {format(new Date(expense.date), 'MMM', { locale: fr })}
            </span>
          </div>
          {!isLast && <div className="w-0.5 bg-gray-200 flex-1 my-1"></div>}
        </div>

        {/* Content on the right */}
        <div className={`flex-1 ${isLast ? '' : 'pb-8'}`}>
          <div
            className="bg-gray-50 rounded-xl p-4 sm:p-6 
                      dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700
                      border border-gray-100 hover:shadow-sm transition-shadow relative"
          >
            {/* More menu button - top right : display only if the expense is user's */}
            {userId && expense.owner_id === userId && (
              <div ref={ref} className="absolute top-3 right-3">
                <button
                  onClick={onEdit}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Icon
                    name="more-vertical"
                    size={18}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-36 bg-white 
                              dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                              rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  >
                    <button
                      onClick={onEdit}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100
                                  dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Icon name="edit" size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={onDeleteClick}
                      disabled={deletingId === expense.id}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 
                                    dark:text-red-400 dark:hover:bg-red-700/50 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="delete" size={16} />
                      {deletingId === expense.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2 sm:gap-0 pr-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {getDisplayLabel(expense)}
                  </h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-custom-1/10 text-custom-1 rounded-full border border-custom-1">
                    {vehicleName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {expense.odometer && (
                    <span className="flex items-center">
                      <Icon name="chart" size={14} className="mr-1.5" />
                      {expense.odometer.toLocaleString()} km
                    </span>
                  )}
                  {expense.garage && (
                    <span className="flex items-center">
                      <Icon name="garage" size={14} className="mr-1.5" />
                      {expense.garage}
                    </span>
                  )}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {expense.amount.toFixed(2)} €
                </span>
              </div>
            </div>

            {expense.notes && (
              <p className="text-gray-600 border-t border-gray-200 pt-4 mt-4 dark:text-gray-400 dark:border-gray-700 text-sm whitespace-pre-wrap">
                {expense.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

MaintenanceCard.displayName = 'MaintenanceCard';

export default MaintenanceCard;
