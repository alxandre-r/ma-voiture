'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Icon from '@/components/ui/Icon';
import { useNotifications } from '@/contexts/NotificationContext';

import VehicleEditForm from './forms/VehicleEditForm';

import type { Vehicle } from '@/types/vehicle';

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { showSuccess, showError } = useNotifications();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // --- Close menu on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/vehicles/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicle.vehicle_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression du véhicule');
      showSuccess('Véhicule supprimé avec succès !');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      showError(`❌ ${msg}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  console.log('Rendering VehicleCard for:', vehicle);

  return (
    <div className="vehicle-card">
      {editing ? (
        <VehicleEditForm
          vehicle={vehicle}
          onCancelEdit={() => setEditing(false)}
          onSaved={() => {
            router.refresh();
            setEditing(false);
          }}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col gap-5 transition-colors">
          {/* --- Header : Véhicule --- */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: vehicle.color || '#F26E52' }}
            >
              {vehicle.make?.[0] || '🚗'}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {vehicle.name || `${vehicle.make || 'Unknown'} ${vehicle.model || ''}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {vehicle.plate ? `Plaque : ${vehicle.plate}` : ''}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Année : {vehicle.year || '—'} • Carburant : {vehicle.fuel_type || '—'}
              </p>
            </div>

            {/* --- Actions flottantes avec sous-menu --- */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
                title="Menu"
              >
                <Icon name="more-vertical" size={20} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 z-10">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Icon name="edit" size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    disabled={deleting}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 last:rounded-b-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    <Icon name="delete" size={16} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- Stats principales : badges verticaux --- */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Kilométrage
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {vehicle.odometer?.toLocaleString() ?? '—'} km
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Conso Moy.
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {vehicle.calculated_consumption ?? '—'} L/100km
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Dernier plein
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {vehicle.last_fill_date
                  ? new Date(vehicle.last_fill_date).toLocaleDateString('fr-FR')
                  : '—'}
              </span>
            </div>
          </div>

          {/* --- Timeline mini : suivi du véhicule --- */}
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div>{vehicle.owner_name && `Propriétaire : ${vehicle.owner_name}`}</div>
            <div>
              Créé le :{' '}
              {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString('fr-FR') : '—'}
            </div>
          </div>

          {/* --- Si pas de plein enregistré : hint pour ajouter un plein --- */}
          {!vehicle.last_fill_date && (
            <div className="mt-4 p-4 rounded-lg border border-dashed border-custom-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 text-center">
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Aucun plein enregistré pour ce véhicule
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Ajoutez votre premier plein pour commencer le suivi.
              </p>
              <button
                onClick={() => {
                  window.location.href = `/dashboard?addFill=true&vehicleId=${vehicle.vehicle_id}`;
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-custom-2 text-white rounded-md hover:bg-custom-2-hover transition-all text-sm font-medium hover:cursor-pointer"
              >
                <Icon name="add" size={16} className="invert dark:invert-0" />
                Ajouter un plein
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Delete Confirmation --- */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le véhicule "${vehicle.name || vehicle.make || 'ce véhicule'}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={deleting}
      />
    </div>
  );
}
