'use client';

import { useState } from 'react';

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

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId !== null && onDeleteExpense) {
      await onDeleteExpense(deleteConfirmId);
      setDeleteConfirmId(null);
      if (onRefresh) onRefresh();
    }
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

                return (
                  <MaintenanceCard
                    key={expense.id}
                    expense={expense}
                    vehicle={vehicle}
                    isLast={isLast}
                    userId={userId}
                    onEdit={() => onEditExpense?.(expense)}
                    onDeleteClick={() => setDeleteConfirmId(expense.id)}
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
