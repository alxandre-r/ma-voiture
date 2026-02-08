'use client';

import { useState, useMemo, useCallback } from 'react';
import { Fill } from '@/types/fill';
import { Vehicle } from '@/types/vehicle';
import { useFills } from '@/contexts/FillContext';
import { FillRow } from '.';
import FillFilters from '../controls/FillFilters';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface FillHistoryListProps {
  vehicles?: Vehicle[]; // optionnel si récupéré via context
}

export default function FillHistoryList({ vehicles }: FillHistoryListProps) {
  const {
    fills,
    loading,
    error,
    refreshFills,
    updateFillOptimistic,
    deleteFillOptimistic,
    vehicles: contextVehicles,
  } = useFills();

  const allVehicles = vehicles ?? contextVehicles ?? [];

  // --- UI State ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Fill> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // --- Filter State ---
  const [filters, setFilters] = useState({
    vehicleFilter: [] as number[], // tableau pour multi sélection
    yearFilter: 'all',
    monthFilter: 'all',
    sortBy: 'date',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  // --- Handler pour FillFilters ---
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // --- Filtered & sorted fills ---
  const filteredFills = useMemo(() => {
    if (!fills) return [];
    let result = [...fills];

    // Filtre multi véhicules
    if (filters.vehicleFilter.length > 0) {
      result = result.filter(f => filters.vehicleFilter.includes(f.vehicle_id));
    }

    // Filtre par année
    if (filters.yearFilter !== 'all') {
      result = result.filter(f => new Date(f.date).getFullYear().toString() === filters.yearFilter);
    }

    // Filtre par mois
    if (filters.monthFilter !== 'all') {
      result = result.filter(f => (new Date(f.date).getMonth()).toString() === filters.monthFilter);
    }

    // Tri
    if (filters.sortBy === 'date') {
      result.sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return filters.sortDirection === 'asc' ? diff : -diff;
      });
    } else if (filters.sortBy === 'amount') {
      result.sort((a, b) => filters.sortDirection === 'asc' ? ((a.amount ?? 0) - (b.amount ?? 0)) : ((b.amount ?? 0) - (a.amount ?? 0)));
    } else if (filters.sortBy === 'price_per_liter') {
      result.sort((a, b) => filters.sortDirection === 'asc' ? ((a.price_per_liter ?? 0) - (b.price_per_liter ?? 0)) : ((b.price_per_liter ?? 0) - (a.price_per_liter ?? 0)));
    }

    return result;
  }, [fills, filters]);

  // --- Statistics ---
  const totalLiters = useMemo(() => filteredFills.reduce((sum, f) => sum + (f.liters ?? 0), 0), [filteredFills]);
  const totalCost = useMemo(() => filteredFills.reduce((sum, f) => sum + (f.amount ?? 0), 0), [filteredFills]);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  // --- Handlers édition ---
  const startEdit = (fill: Fill) => {
    setEditingId(fill.id || null);
    setEditData({
      date: fill.date,
      odometer: fill.odometer ?? undefined,
      liters: fill.liters ?? undefined,
      amount: fill.amount ?? undefined,
      price_per_liter: fill.price_per_liter ?? undefined,
      notes: fill.notes ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
    setEditError(null);
  };

  const saveEdit = async (fillId: number) => {
    if (!editData) return;
    setSaving(true);
    setEditError(null);

    try {
      const res = await fetch('/api/fills/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fillId, ...editData }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);

      updateFillOptimistic(fillId, editData);
      cancelEdit();
    } catch (err) {
      setEditError((err as Error).message || 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers suppression ---
  const handleDelete = (fillId: number) => {
    setDeletingId(fillId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setShowDeleteConfirm(false);
    setDeleteMessage(null);

    try {
      const res = await fetch('/api/fills/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fillId: deletingId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Erreur lors de la suppression');

      deleteFillOptimistic(deletingId);
      setDeleteMessage('✅ Plein supprimé avec succès !');
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (err) {
      setDeleteMessage(err instanceof Error ? `❌ ${err.message}` : '❌ Une erreur inconnue');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value?: number | null) => value == null ? 'N/A' : `${value.toFixed(2)} €`;

  return (
    <div className="fill-history space-y-6">
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

      {deleteMessage && <div className="mb-4 p-3 bg-white/5 dark:bg-gray-800/5 rounded text-center">{deleteMessage}</div>}
      {editError && <div className="mb-4 p-3 bg-red-500/20 dark:bg-red-900/30 rounded text-center text-red-400 dark:text-red-300">{editError}</div>}

      {/* Filters */}
      <FillFilters
        fills={fills ?? null}
        vehicles={allVehicles}
        loading={loading}
        onFilterChange={handleFilterChange}
      />

      {/* Statistics */}
      {filteredFills.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-custom-1 p-3 rounded">
            <div className="text-gray-100 text-sm">Pleins totaux</div>
            <div className="font-medium text-gray-100">{filteredFills.length}</div>
          </div>
          <div className="bg-custom-1 p-3 rounded">
            <div className="text-gray-100 text-sm">Litres totaux</div>
            <div className="font-medium text-gray-100">{totalLiters.toFixed(1)} L</div>
          </div>
          <div className="bg-custom-1 p-3 rounded">
            <div className="text-gray-100 text-sm">Coût total</div>
            <div className="font-medium text-gray-100">{formatCurrency(totalCost)}</div>
          </div>
          <div className="bg-custom-1 p-3 rounded">
            <div className="text-gray-100 text-sm">Prix moyen/L</div>
            <div className="font-medium text-gray-100">{avgPricePerLiter.toFixed(3)} €/L</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          Chargement des pleins...
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 p-4 rounded-lg text-red-400 border border-red-500/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg">⚠️ Erreur de chargement</h3>
          </div>
          <p className="text-sm mb-3">{error}</p>
          <div className="flex gap-2">
            <button onClick={refreshFills} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 flex-1">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredFills.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Aucun plein trouvé pour le moment.</p>
        </div>
      )}

      {/* Fill list */}
      {filteredFills.map(fill => (
        <div key={fill.id}>
          {editingId === fill.id && editData ? (
            <FillRow
              fill={fill}
              editData={editData}
              onChangeField={(k, v) => setEditData(prev => ({ ...(prev ?? {}), [k]: v }))}
              onSaveEdit={() => saveEdit(fill.id!)}
              onCancelEdit={cancelEdit}
              saving={saving}
              isEditing
              onDelete={() => handleDelete(fill.id!)}
              isDeleting={deletingId === fill.id}
            />
          ) : (
            <FillRow
              fill={fill}
              onEdit={() => startEdit(fill)}
              onDelete={() => handleDelete(fill.id!)}
              isDeleting={deletingId === fill.id}
            />
          )}
        </div>
      ))}
    </div>
  );
}