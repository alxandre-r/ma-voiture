/**
 * @file components/fill/FillList.tsx
 * @fileoverview Component for displaying and managing fuel fill-up records.
 * 
 * This component displays a list of fuel fill-ups with editing, deletion,
 * and statistical information.
 */

'use client';

import { useState } from 'react';
import { useFills } from '@/contexts/FillContext';

import FillListItem from './FillListItem';
import FillChart from './FillChart';
import OdometerChart from './OdometerChart';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

/**
 * FillList Component
 * 
 * Displays a list of fuel fill-ups with editing, deletion, and statistics.
 */
export default function FillList() {
  const {
    fills,
    loading,
    error,
    stats,
    refreshFills,
    deleteFillOptimistic,
  } = useFills();

  // UI state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification context
  const { showSuccess, showError } = useNotifications();



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
      
      // Show success notification
      showSuccess('Plein supprimé avec succès !');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError('Une erreur inconnue est survenue');
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

  return (
    <div className="fill-list space-y-6">
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





      {/* Statistics Summary - Focused on consumption */}
      {stats && fills && fills.length > 0 && (
        <div className="bg-gray-800/50 p-4 rounded-lg">
          {/* Key metrics - consumption focused - moved to top */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-6">
            <div className="bg-white/5 p-3 rounded">
              <div className="text-gray-400 text-xs">Consommation moyenne</div>
              <div className="font-medium text-xl">{stats.avg_consumption.toFixed(1)} L/100km</div>
            </div>
            <div className="bg-white/5 p-3 rounded">
              <div className="text-gray-400 text-xs">Coût total</div>
              <div className="font-medium text-xl">{formatCurrency(stats.total_cost)}</div>
            </div>
            <div className="bg-white/5 p-3 rounded">
              <div className="text-gray-400 text-xs">Prix moyen/L</div>
              <div className="font-medium text-xl">{formatCurrency(stats.avg_price_per_liter)}</div>
            </div>
          </div>
          
          {/* Monthly consumption chart */}
          {stats.monthly_chart && stats.monthly_chart.length > 0 && (
            <div className="mb-6">
              <FillChart data={stats.monthly_chart} />
            </div>
          )}
          
          {/* Monthly odometer chart - only show if we have odometer data */}
          {stats.monthly_chart && stats.monthly_chart.filter(item => item.odometer !== null).length > 0 && (
            <div className="mb-6">
              <OdometerChart data={stats.monthly_chart.map(item => ({
                month: item.month,
                odometer: item.odometer || 0
              }))} />
            </div>
          )}
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
          <p className="text-sm">Ajoutez votre premier plein en utilisant le bouton ci-dessus.</p>
        </div>
      )}

      {/* Fill list - Compact view (max 4 items) */}
      {fills && fills.length > 0 && (
        <div className="space-y-1">
          {/* Show only last 4 fills in dashboard */}
          {fills.slice(0, 4).map((fill) => (
            <FillListItem
              key={fill.id}
              fill={fill}
              onDelete={() => handleDelete(fill.id || 0)}
              isDeleting={deletingId === fill.id}
            />
          ))}
          
          {/* Show history button if more than 4 fills */}
          {fills.length > 4 && (
            <div className="mt-4 text-center">
              <Link
                href="/historique"
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                Voir l&#39;historique complet ({fills.length} pleins)
              </Link>
            </div>
          )}
        </div>
      )}
      

    </div>
  );
}