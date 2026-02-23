'use client';

import { Fill } from "@/types/fill";
import FillRow, { FillRowProps } from "./FillRow";
import { useFillActions } from "@/hooks/fill/useFillActions";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useEffect } from "react";

interface FillRowContainerProps {
  fill: Fill;
  showVehicleName?: boolean;
  isReadOnly?: boolean;
  onRefresh?: () => void; 
}

export default function FillRowContainer({
  fill,
  showVehicleName = false,
  isReadOnly = false,
  onRefresh,
}: FillRowContainerProps) {
  const {
    editingId,
    editData,
    saving,
    deletingId,
    showDeleteConfirm,
    startEdit,
    cancelEdit,
    saveEdit,
    requestDelete,
    confirmDelete,
    setShowDeleteConfirm,
    handleFieldChange,
    setRefreshCallback, 
  } = useFillActions();

  // Passe le refresh depuis le parent au hook pour qu'il puisse l'appeler après les actions
  useEffect(() => {
    if (onRefresh) setRefreshCallback(onRefresh);
  }, [onRefresh, setRefreshCallback]);

  const isEditing = editingId === fill.id;
  const isDeleting = deletingId === fill.id;
  const fillId = fill.id;

  /** --- Sauvegarde --- */
  const handleSaveEdit = async () => {
    if (!fillId || !editData) return;
    return await saveEdit(fillId);
  };

  /** --- Suppression --- */
  const handleConfirmDelete = async () => {
    if (!fillId) return false;
    return await confirmDelete();
  };

  /** --- Changement d'un champ --- */
  const handleChangeField = (key: string, value: unknown) => {
    if (!editData) return;
    handleFieldChange(key, value);
  };

  const baseProps: FillRowProps = {
    fill,
    isDeleting,
    showVehicleName,
    isReadOnly,
  };

  const editingProps: FillRowProps =
    isEditing && editData
      ? {
          ...baseProps,
          isEditing: true,
          editData,
          saving,
          onChangeField: handleChangeField,
          onSaveEdit: handleSaveEdit,
          onCancelEdit: cancelEdit,
          onDelete: () => fillId && requestDelete(fillId),
        }
      : baseProps;

  const displayProps: FillRowProps = !isEditing
    ? {
        ...baseProps,
        onEdit: () => startEdit(fill),
        onDelete: () => fillId && requestDelete(fillId),
      }
    : editingProps;

  return (
    <>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le plein"
        message="Êtes-vous sûr de vouloir supprimer ce plein ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />

      <FillRow {...(isEditing && editData ? editingProps : displayProps)} />
    </>
  );
}
