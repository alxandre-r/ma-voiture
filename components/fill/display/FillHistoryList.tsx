/**
 * @file components/fill/FillHistoryList.tsx
 * @fileoverview Comprehensive history list for all fuel fill-up records.
 * 
 * This component provides a detailed view of all fill-ups with filtering,
 * search, and pagination capabilities for the dedicated history page.
 */

'use client';

import { useState } from 'react';
import { useFills } from '@/contexts/FillContext';
import { Fill } from '@/types/fill';
import { FillRow } from '.';
import { FillFilters } from '../controls';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { processFills } from '@/lib/fillUtils';

/**
 * FillHistoryList Component
 * 
 * Comprehensive list of all fuel fill-ups with detailed information.
 */

export default function FillHistoryList() {
  const {
    fills,
    loading,
    error,
    refreshFills,
    updateFillOptimistic,
    deleteFillOptimistic,
  } = useFills();

  // UI state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Fill> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    vehicleFilter: 'all' as string | number,
    yearFilter: 'all',
    monthFilter: 'all',
    sortBy: 'date',
    sortDirection: 'desc' as 'asc' | 'desc'
  });
  
  /**
   * Initialize editing for a fill
   */
  function startEdit(fill: Fill) {
    setEditingId(fill.id || null);
    setEditData({
      date: fill.date,
      odometer: fill.odometer || undefined,
      liters: fill.liters || undefined,
      amount: fill.amount || undefined,
      price_per_liter: fill.price_per_liter || undefined,
      notes: fill.notes || '',
    });
  }

  /**
   * Cancel editing and reset edit state
   */
  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
    setEditError(null);
  }

  /**
   * Save edited fill data to backend
   */
  async function saveEdit(fillId: number) {
    if (!editData || !fillId) return;
    setSaving(true);
    setEditError(null);

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

      // Optimistic update
      updateFillOptimistic(fillId, editData);
      cancelEdit();
    } catch (err) {
      setEditError((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Handle field changes in edit form
   */
  function onChangeField(key: string, value: unknown) {
    setEditData((prev) => ({ ...(prev ?? {}), [key]: value }));
  }

  /**
   * Delete a fill after confirmation
   */
  async function handleDelete(fillId: number) {
    setDeletingId(fillId);
    setShowDeleteConfirm(true);
  }

  /**
   * Confirm deletion
   */
  async function confirmDelete() {
    if (!deletingId) return;
    setShowDeleteConfirm(false);
    setDeleteMessage(null);

    try {
      const res = await fetch('/api/fills/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fillId: deletingId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression du plein');
      }

      // Optimistic update
      deleteFillOptimistic(deletingId);
      setDeleteMessage('✅ Plein supprimé avec succès !');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setDeleteMessage(null);
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteMessage(`❌ ${err.message}`);
      } else {
        setDeleteMessage('❌ Une erreur inconnue est survenue');
      }
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * Format currency
   */
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2) + ' €';
  };

  /**
   * Calculate average price per liter for filtered fills
   */
  const calculateAvgPricePerLiter = (fills: Fill[]) => {
    const totalAmount = fills.reduce((sum, fill) => sum + (fill.amount ?? 0), 0);
    const totalLiters = fills.reduce((sum, fill) => sum + (fill.liters ?? 0), 0);
    return totalLiters > 0 ? totalAmount / totalLiters : 0;
  };

  /**
   * Process fills with filtering and sorting
   */
  const processedFills = fills ? processFills(fills, filters) : [];

  return (
    <div className="fill-history space-y-6">
      {/* Delete confirmation dialog */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer le plein"
        message="Êtes-vous sûr de vouloir supprimer ce plein ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
      />

      {/* Delete operation feedback */}
      {deleteMessage && (
        <div className="mb-4 p-3 bg-white/5 dark:bg-gray-800/5 rounded text-center">
          {deleteMessage}
        </div>
      )}

      {/* Edit operation error */}
      {editError && (
        <div className="mb-4 p-3 bg-red-500/20 dark:bg-red-900/30 rounded text-center text-red-400 dark:text-red-300">
          {editError}
        </div>
      )}

      {/* Filters */}
      <FillFilters
        fills={fills}
        onFilterChange={setFilters}
        loading={loading}
      />

      {/* Statistics Summary - based on filtered data */}
      {processedFills && processedFills.length > 0 && (

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-custom-1 p-3 rounded">
          <div className="text-gray-100 text-sm">Pleins totaux</div>
          <div className="font-medium text-gray-100">{processedFills.length}</div>
        </div>
        <div className="bg-custom-1 p-3 rounded">
          <div className="text-gray-100 text-sm">Litres totaux</div>
          <div className="font-medium text-gray-100">
            {processedFills.reduce((sum, fill) => sum + (fill.liters ?? 0), 0).toFixed(1)} L
          </div>
        </div>
        <div className="bg-custom-1 p-3 rounded">
          <div className="text-gray-100 text-sm">Coût total</div>
          <div className="font-medium text-gray-100">
            {formatCurrency(processedFills.reduce((sum, fill) => sum + (fill.amount ?? 0), 0))}
          </div>
        </div>
        <div className="bg-custom-1 p-3 rounded">
          <div className="text-gray-100 text-sm">Prix moyen/L</div>
          <div className="font-medium text-gray-100">
            {calculateAvgPricePerLiter(processedFills).toFixed(3)} €/L
          </div>
        </div>
      </div>
      )}

      {/* State handling */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p>Chargement des pleins...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 p-4 rounded-lg text-red-400 border border-red-500/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">⚠️ Erreur de chargement</h3>
          </div>
          <p className="text-sm mb-3">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={refreshFills}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 flex-1"
            >
              Réessayer
            </button>
            {error.includes('session') || error.includes('connecter') ? (
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 flex-1"
              >
                Recharger
              </button>
            ) : null}
          </div>
        </div>
      )}

      {!loading && !error && processedFills && processedFills.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          {filters.vehicleFilter !== 'all' || filters.yearFilter !== 'all' || filters.monthFilter !== 'all' ? (
            <>
              <p className="mb-2">Aucun plein trouvé avec les filtres actuels.</p>
              <p className="text-sm mb-4">Essayez de modifier vos critères de recherche.</p>
              <button
                onClick={() => setFilters({
                  vehicleFilter: 'all',
                  yearFilter: 'all',
                  monthFilter: 'all',
                  sortBy: 'date',
                  sortDirection: 'desc'
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
              >
                Réinitialiser les filtres
              </button>
            </>
          ) : (
            <>
              <p className="mb-2">Aucun plein enregistré pour le moment.</p>
              <p className="text-sm">Ajoutez votre premier plein en utilisant le bouton sur le tableau de bord.</p>
            </>
          )}
        </div>
      )}

      {/* Fill list - Detailed view */}
      {processedFills.length > 0 && (
        <div className="space-y-4">
          {processedFills.map((fill) => (
            <div key={fill.id}>
              {/* Edit form (if editing) */}
              {editingId === fill.id && editData && (
                <FillRow
                  fill={fill}
                  editData={editData}
                  onChangeField={onChangeField}
                  onSaveEdit={() => saveEdit(fill.id || 0)}
                  onCancelEdit={cancelEdit}
                  saving={saving}
                  isEditing={true}
                  onDelete={() => handleDelete(fill.id || 0)}
                  isDeleting={deletingId === fill.id}
                />
              )}

              {/* Display mode */}
              {!editingId || editingId !== fill.id ? (
                <FillRow
                  fill={fill}
                  onEdit={() => startEdit(fill)}
                  onDelete={() => handleDelete(fill.id || 0)}
                  isDeleting={deletingId === fill.id}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}