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
  writableVehicleIds?: Set<number>;
  onRefresh?: () => void;
  onAdd?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: number) => Promise<boolean>;
  onCreateReminder?: (expense: Expense) => void;
  deletingId?: number | null;
  isDataLoading?: boolean;
  onDeleteAttachment?: (attachmentId: number) => void;
  deletingAttachmentId?: number | null;
}

export default function MaintenanceTimeline({
  userId,
  expenses = [],
  vehicles = [],
  writableVehicleIds,
  onRefresh,
  onAdd,
  onEditExpense,
  onDeleteExpense,
  onCreateReminder,
  deletingId,
  isDataLoading = false,
  onDeleteAttachment,
  deletingAttachmentId,
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
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Historique Récent</CardTitle>
          {onAdd && (
            <button
              onClick={onAdd}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-custom-2 hover:bg-custom-2-hover 
              text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Icon name="add" size={16} className="text-white" />
              Ajouter un entretien
            </button>
          )}
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
                const canModify = writableVehicleIds
                  ? writableVehicleIds.has(expense.vehicle_id ?? -1)
                  : !!(userId && expense.owner_id === userId);

                return (
                  <MaintenanceCard
                    key={expense.id}
                    expense={expense}
                    vehicle={vehicle}
                    isLast={isLast}
                    canModify={canModify}
                    onEdit={() => onEditExpense?.(expense)}
                    onDeleteClick={() => setDeleteConfirmId(expense.id)}
                    onCreateReminder={
                      onCreateReminder ? () => onCreateReminder(expense) : undefined
                    }
                    deletingId={deletingId}
                    onDeleteAttachment={onDeleteAttachment}
                    deletingAttachmentId={deletingAttachmentId}
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
