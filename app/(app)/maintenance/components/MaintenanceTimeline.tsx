'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/ui/card';
import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';

import MaintenanceCard from './cards/MaintenanceCard';
import MaintenanceCardSkeleton from './cards/MaintenanceCardSkeleton';

import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

interface MaintenanceTimelineProps {
  userId?: string;
  expenses?: Expense[];
  vehicles?: VehicleMinimal[];
  onRefresh?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: number) => Promise<boolean>;
  deletingId?: number | null;
  isDataLoading?: boolean;
}

export default function MaintenanceTimeline({
  userId,
  expenses = [],
  vehicles = [],
  onRefresh,
  onEditExpense,
  onDeleteExpense,
  deletingId,
  isDataLoading = false,
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
          {isDataLoading ? (
            <div className="space-y-6">
              <MaintenanceCardSkeleton isLast={false} />
              <MaintenanceCardSkeleton isLast={true} />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
                const isLast = index === expenses.length - 1;
                const isMenuOpen = openMenuId === expense.id;

                return (
                  <MaintenanceCard
                    key={expense.id}
                    ref={setMenuRef(expense.id)}
                    expense={expense}
                    vehicle={vehicle}
                    isLast={isLast}
                    isMenuOpen={isMenuOpen}
                    userId={userId}
                    onEdit={() => handleEdit(expense)}
                    onDeleteClick={() => handleDeleteClick(expense.id)}
                    deletingId={deletingId}
                  />
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
