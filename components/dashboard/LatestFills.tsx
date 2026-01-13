// components/fill/LatestFills.tsx
"use client";

import React, { useState } from "react";
import { useFills } from "@/contexts/FillContext";
import { FillRow } from "../fill";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useNotifications } from "@/contexts/NotificationContext";
import Link from "next/link";

export default function LatestFills() {
  const {
    fills,
    loading,
    error,
    selectedVehicleId,
    refreshFills,
    deleteFillOptimistic,
    getFilteredFills,
    getVehicleName,
  } = useFills();

  const { showSuccess, showError } = useNotifications();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function startEdit(fill: any) {
    setEditingId(fill.id);
    setEditData({
      date: fill.date,
      odometer: fill.odometer || undefined,
      liters: fill.liters || undefined,
      amount: fill.amount || undefined,
      price_per_liter: fill.price_per_liter || undefined,
      is_full: fill.is_full,
      notes: fill.notes || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
  }

  async function saveEdit(fillId: number) {
    if (!editData || !fillId) return;
    setSaving(true);

    try {
      const res = await fetch('/api/fills/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fillId, ...editData }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      // Refresh fills to get updated data
      await refreshFills();
      cancelEdit();
      showSuccess("Plein modifié avec succès !");
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  function onChangeField(key: string, value: unknown) {
    setEditData((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  async function handleDelete(fillId: number) {
    setDeletingId(fillId);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setShowDeleteConfirm(false);
    try {
      const res = await fetch("/api/fills/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fillId: deletingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression du plein");
      }

      // Optimistic update
      deleteFillOptimistic(deletingId);
      showSuccess("Plein supprimé avec succès !");
    } catch (err: unknown) {
      if (err instanceof Error) showError(err.message);
      else showError("Une erreur inconnue est survenue");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = getFilteredFills(selectedVehicleId);

  return (
    <div className="space-y-4">
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer le plein"
        message="Êtes-vous sûr de vouloir supprimer ce plein ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Chargement des pleins...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refreshFills}
            className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Aucun plein enregistré pour {selectedVehicleId ? "ce véhicule" : "le moment"}.</p>
          <p className="text-sm">Ajoutez votre premier plein en utilisant le bouton ci-dessus.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white pb-5 rounded-lg space-y-2">
          {filtered.slice(0, 4).map((fill: any) => (
            <div key={fill.id}>
              {editingId === fill.id && editData ? (
                <FillRow
                  fill={fill}
                  editData={editData}
                  onChangeField={onChangeField}
                  onSaveEdit={() => saveEdit(fill.id || 0)}
                  onCancelEdit={cancelEdit}
                  onDelete={() => handleDelete(fill.id || 0)}
                  isDeleting={deletingId === fill.id}
                  saving={saving}
                  isEditing={true}
                  showVehicleName={true}
                />
              ) : (
                <FillRow
                  fill={fill}
                  onEdit={() => startEdit(fill)}
                  onDelete={() => handleDelete(fill.id || 0)}
                  isDeleting={deletingId === fill.id}
                  showVehicleName={true}
                />
              )}
            </div>
          ))}

          {filtered.length > 4 && (
            <div className="mt-8 text-center">
              <Link
                href="/historique"
                className="px-5 py-3 bg-custom-2 hover:bg-custom-3-hover text-white rounded-lg transition-colors"
              >
                Voir l'historique complet ({filtered.length} pleins)
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}