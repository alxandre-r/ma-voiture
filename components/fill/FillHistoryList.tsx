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
import FillEditForm from './FillEditForm';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Icon from '@/components/ui/Icon';

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
    stats,
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
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

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
      is_full: fill.is_full,
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
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2) + ' €';
  };

  /**
   * Filter fills based on search and filters
   */
  const filteredFills = fills ? fills.filter((fill) => {
    // Search term filter
    const searchMatch = searchTerm.toLowerCase() === '' ||
      (fill.vehicle_name && fill.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fill.notes && fill.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fill.date && fill.date.includes(searchTerm));
    
    // Vehicle filter
    const vehicleMatch = vehicleFilter === 'all' || 
      (fill.vehicle_name && fill.vehicle_name === vehicleFilter);
    
    // Year filter
    const yearMatch = yearFilter === 'all' || 
      (fill.date && new Date(fill.date).getFullYear().toString() === yearFilter);
    
    return searchMatch && vehicleMatch && yearMatch;
  }) : [];

  /**
   * Get unique vehicles for filter
   */
  const uniqueVehicles = fills ? Array.from(new Set(fills
    .map(fill => fill.vehicle_name)
    .filter((name): name is string => !!name)
  )) : [];

  /**
   * Get unique years for filter
   */
  const uniqueYears = fills ? Array.from(new Set(fills
    .map(fill => fill.date ? new Date(fill.date).getFullYear().toString() : null)
    .filter((year): year is string => !!year)
  )).sort((a, b) => b.localeCompare(a)) : [];

  return (
    <div className="fill-history space-y-6">
      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer le plein"
        message="Êtes-vous sûr de vouloir supprimer ce plein ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
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

      {/* Statistics Summary */}
      {stats && fills && fills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Statistiques globales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Pleins totaux</div>
              <div className="font-medium text-gray-800 dark:text-white">{stats.total_fills}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Litres totaux</div>
              <div className="font-medium text-gray-800 dark:text-white">{stats.total_liters} L</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Coût total</div>
              <div className="font-medium text-gray-800 dark:text-white">{formatCurrency(stats.total_cost)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Consommation moy.</div>
              <div className="font-medium text-gray-800 dark:text-white">{stats.avg_consumption.toFixed(1)} L/100km</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300 dark:border-gray-700"
          />
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-white/5 dark:bg-gray-800/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="all">Tous les véhicules</option>
            {uniqueVehicles.map((vehicle) => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white/5 dark:bg-gray-800/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="all">Toutes les années</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* State handling */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p>Chargement des pleins...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 p-4 rounded-lg text-red-400">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refreshFills}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && fills && fills.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">Aucun plein enregistré pour le moment.</p>
          <p className="text-sm">Ajoutez votre premier plein en utilisant le bouton sur le tableau de bord.</p>
        </div>
      )}

      {/* Results count */}
      {filteredFills.length > 0 && (
        <div className="text-sm text-gray-400">
          {filteredFills.length} plein{filteredFills.length > 1 ? 's' : ''} trouvé{filteredFills.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Fill list - Detailed view */}
      {filteredFills.length > 0 && (
        <div className="space-y-4">
          {filteredFills.map((fill) => (
            <div key={fill.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg relative border border-gray-200 dark:border-gray-700">
              {/* Edit form (if editing) */}
              {editingId === fill.id && editData && (
                <FillEditForm
                  fill={fill}
                  editData={editData}
                  onChangeField={onChangeField}
                  onSaveEdit={() => saveEdit(fill.id || 0)}
                  onCancelEdit={cancelEdit}
                  saving={saving}
                />
              )}

              {/* Display mode */}
              {!editingId || editingId !== fill.id ? (
                <>
                  {/* Fill header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">
                        {fill.vehicle_name || `Véhicule #${fill.vehicle_id}`}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {formatDate(fill.date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(fill)}
                        disabled={saving || deletingId === fill.id}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 disabled:opacity-50 flex items-center"
                        title="Modifier"
                      >
                        <Icon name="edit" size={14} className="mr-1" /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(fill.id || 0)}
                        disabled={saving || deletingId === fill.id}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 disabled:opacity-50 flex items-center"
                        title="Supprimer"
                      >
                        <Icon name="delete" size={14} className="mr-1" /> Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Fill details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <div className="text-gray-400 text-xs">Kilométrage</div>
                      <div className="font-medium">{fill.odometer || 'N/A'} km</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Litres</div>
                      <div className="font-medium">{fill.liters || 'N/A'} L</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Montant</div>
                      <div className="font-medium">{formatCurrency(fill.amount)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Prix/L</div>
                      <div className="font-medium">{formatCurrency(fill.price_per_liter)}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  {fill.notes && (
                    <div className="p-3 bg-white/5 rounded text-sm">
                      <div className="text-gray-400 text-xs mb-1">Notes</div>
                      <div>{fill.notes}</div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}