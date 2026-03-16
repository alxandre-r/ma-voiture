'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useRef, useEffect, useCallback } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/ui/card';
import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';

import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

interface MaintenanceTimelineProps {
  expenses?: Expense[];
  vehicles?: VehicleMinimal[];
  onRefresh?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: number) => Promise<boolean>;
  deletingId?: number | null;
}

export default function MaintenanceTimeline({
  expenses = [],
  vehicles = [],
  onRefresh,
  onEditExpense,
  onDeleteExpense,
  deletingId,
}: MaintenanceTimelineProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openMenuId = openMenuIdRef.current;
      if (openMenuId !== null) {
        const menuRef = menuRefs.current.get(openMenuId);
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use ref to track current openMenuId in event listener
  const openMenuIdRef = useRef<number | null>(null);
  useEffect(() => {
    openMenuIdRef.current = openMenuId;
  }, [openMenuId]);

  // Callback to set menu ref for each expense
  const setMenuRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) {
        menuRefs.current.set(id, el);
      } else {
        menuRefs.current.delete(id);
      }
    },
    [],
  );

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null && onDeleteExpense) {
      await onDeleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
      if (onRefresh) onRefresh();
    }
  };

  // Get the display label for a maintenance expense
  const getDisplayLabel = (expense: Expense) => {
    return expense.maintenance_type_label || 'Entretien';
  };

  // Handle edit with menu close
  const handleEdit = (expense: Expense) => {
    setOpenMenuId(null);
    if (onEditExpense) {
      onEditExpense(expense);
    }
  };

  // Handle delete with menu close
  const handleDeleteClick = (expenseId: number) => {
    setOpenMenuId(null);
    setDeleteConfirmId(expenseId);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card with Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique Récent</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Icon name="tool" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun entretien trouvé.</p>
              <p className="text-sm mt-1">
                Ajoutez votre premier entretien en cliquant sur le bouton ci-dessus.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {expenses.map((expense, index) => {
                const vehicle = vehicles.find((v) => v.vehicle_id === expense.vehicle_id);
                const vehicleName = vehicle
                  ? vehicle.name || `${vehicle.make} ${vehicle.model}`
                  : 'Véhicule';
                const isLast = index === expenses.length - 1;
                const isMenuOpen = openMenuId === expense.id;

                return (
                  <div key={expense.id} className="relative flex items-stretch gap-2 sm:gap-6">
                    {/* Desktop: Date on the left */}
                    <div className="hidden sm:block w-16 sm:w-24 shrink-0 text-right pt-1.5">
                      <div className="text-sm sm:text-base font-bold text-slate-900">
                        {format(new Date(expense.date), 'dd MMM', { locale: fr })}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500">
                        {format(new Date(expense.date), 'yyyy', { locale: fr })}
                      </div>
                    </div>

                    {/* Timeline: Desktop = logo, Mobile = date */}
                    <div className="relative flex flex-col items-center">
                      {/* Desktop: Logo on timeline node */}
                      <div className="hidden sm:flex w-8 h-8 rounded-full bg-white border-2 border-custom-2 text-custom-2 items-center justify-center shrink-0 z-10">
                        <Icon name="tool" size={14} />
                      </div>
                      {/* Mobile: Date on timeline node */}
                      <div className="sm:hidden w-8 h-8 rounded-full bg-white border-2 border-custom-2 text-custom-2 flex flex-col items-center justify-center shrink-0 z-10 -ml-1">
                        <span className="text-[10px] font-bold text-gray-800 leading-none">
                          {format(new Date(expense.date), 'dd')}
                        </span>
                        <span className="text-[8px] text-gray-600 leading-none">
                          {format(new Date(expense.date), 'MMM', { locale: fr })}
                        </span>
                      </div>
                      {!isLast && <div className="w-0.5 bg-slate-200 flex-1 my-1"></div>}
                    </div>

                    {/* Content on the right */}
                    <div className={`flex-1 ${isLast ? '' : 'pb-8'}`}>
                      <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-100 hover:shadow-sm transition-shadow relative">
                        {/* More menu button - top right */}
                        {onEditExpense && (
                          <div className="absolute top-3 right-3" ref={setMenuRef(expense.id)}>
                            <button
                              onClick={() => setOpenMenuId(isMenuOpen ? null : expense.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <Icon name="more-vertical" size={18} className="text-slate-500" />
                            </button>

                            {/* Dropdown menu */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Icon name="edit" size={16} />
                                  Modifier
                                </button>
                                {onDeleteExpense && (
                                  <button
                                    onClick={() => handleDeleteClick(expense.id)}
                                    disabled={deletingId === expense.id}
                                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Icon name="delete" size={16} />
                                    {deletingId === expense.id ? 'Suppression...' : 'Supprimer'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2 sm:gap-0 pr-8">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h4 className="text-lg font-bold text-slate-900">
                                {getDisplayLabel(expense)}
                              </h4>
                              <span className="px-2 py-0.5 text-xs font-medium bg-custom-1/10 text-custom-1 rounded-full">
                                {vehicleName}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-500">
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
                            <span className="text-xl font-bold text-slate-900">
                              {expense.amount.toFixed(2)} €
                            </span>
                          </div>
                        </div>

                        {expense.notes && (
                          <p className="text-slate-600 border-t border-slate-200 pt-4 mt-4">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'entretien"
        message="Êtes-vous sûr de vouloir supprimer cette intervention ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
