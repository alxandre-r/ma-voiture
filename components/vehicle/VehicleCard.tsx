/**
 * @file components/vehicle/VehicleCard.tsx
 * @fileoverview Individual vehicle card component for displaying vehicle information.
 * 
 * This component displays a single vehicle's information in a card format
 * with options to expand for more details and edit the vehicle.
 */

'use client';

import { useState } from 'react';
import VehicleEditForm from './VehicleEditForm';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Icon from '@/components/ui/Icon';

interface Vehicle {
  id: string;
  owner?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  manufacturer_consumption?: number | null;
  odometer?: number | null;
  plate?: string | null;
  created_at?: string | null;
  [key: string]: unknown; // Allow for additional fields from API
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onEditStart: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  editingId: string | null;
  editData: Partial<Vehicle> | null;
  onChangeField: (key: string, value: unknown) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  saving: boolean;
  deletingId: string | null;
}

/**
 * VehicleCard Component
 * 
 * Displays a single vehicle in a card format with expandable details
 * and editing capabilities.
 */
export default function VehicleCard({
  vehicle,
  onEditStart,
  editingId,
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving,
  deletingId,
  onDelete,
}: VehicleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Format value for display
   */
  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch { 
      return String(value);
    }
  };

  /**
   * Get extra fields that aren't part of the main vehicle interface
   */
  const getExtraFields = () => {
    const standardFields = ['id', 'owner', 'name', 'make', 'model', 'year', 'fuel_type', 'manufacturer_consumption', 'plate', 'created_at'];
    return Object.keys(vehicle).filter(key => !standardFields.includes(key));
  };

  const extraFields = getExtraFields();

  return (
    <li key={vehicle.id}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
        {/* Show vehicle data only when not editing this specific vehicle */}
        {editingId !== vehicle.id && (
          <>
            {/* Vehicle Header with icon and main info */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                {/* Removed identifier letter to save space on mobile */}
                <div className="h-16 w-16 rounded-xl bg-blue-600/20 dark:bg-blue-900/20 flex items-center justify-center text-blue-400 dark:text-blue-400 font-bold text-xl border border-blue-600/30 dark:border-blue-400/30 lg:flex hidden">
                  {((vehicle.make ?? vehicle.name ?? '') as string).charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-gray-800 dark:text-white text-lg font-bold break-words sm:text-xl sm:break-normal lg:text-2xl lg:truncate">
                    {vehicle.name ?? `${vehicle.make ?? 'Marque inconnue'} ${vehicle.model ?? ''}`}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm break-words sm:truncate sm:mt-1">
                    {vehicle.make ? `${vehicle.make} ${vehicle.model}` : 'Détails indisponibles'}
                  </p>
                </div>
              </div>

              {/* Action Buttons - moved to top right */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditStart(vehicle)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition sm:px-4 hover:cursor-pointer"
                    aria-label={`Modifier ${vehicle.name ?? vehicle.id}`}
                  >
                    <Icon name="edit" size={18} className="invert dark:invert-0 sm:size-16" />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletingId === vehicle.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50 sm:px-4 hover:cursor-pointer"
                    aria-label={`Supprimer ${vehicle.name ?? vehicle.id}`}
                  >
                    <Icon name="delete" size={18} className="invert dark:invert-0 sm:size-16" />
                    <span className="hidden sm:inline">{deletingId === vehicle.id ? 'Suppression...' : 'Supprimer'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Vehicle Stats - Grid layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-400 dark:text-gray-500 text-xs font-medium">KILOMÉTRAGE</div>
                <div className="text-gray-800 dark:text-white text-xl font-bold mt-1">
                  {vehicle.odometer != null ? `${vehicle.odometer.toLocaleString()} km` : '—'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">ANNÉE</div>
                <div className="text-gray-800 dark:text-white text-xl font-bold mt-1">{formatValue(vehicle.year)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">CARBURANT</div>
                <div className="text-gray-800 dark:text-white text-xl font-bold mt-1">{formatValue(vehicle.fuel_type)}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">CONSOMMATION</div>
                <div className="text-gray-800 dark:text-white text-xl font-bold mt-1">
                  {vehicle.manufacturer_consumption != null ? `${vehicle.manufacturer_consumption} L/100km` : '—'}
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-600 dark:text-gray-400 text-sm font-medium">INFORMATIONS COMPLÉMENTAIRES</h4>
              </div>

              {/* Basic additional info always visible */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Plaque d&apos;immatriculation</span>
                  <span className="text-gray-800 dark:text-white font-medium">{formatValue(vehicle.plate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Propriétaire</span>
                  <span className="text-gray-800 dark:text-white font-medium">{formatValue(vehicle.owner)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Date d&apos;ajout</span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Dernier plein</span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {vehicle.last_fill && typeof vehicle.last_fill === 'string' ? new Date(vehicle.last_fill).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Form Section - shown when editing, replaces the card content */}
        {editingId === vehicle.id && editData && (
            <VehicleEditForm
              editData={editData}
              onChangeField={onChangeField}
              onSaveEdit={() => onSaveEdit(vehicle.id)}
              onCancelEdit={onCancelEdit}
              saving={saving}
            />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete(vehicle.id);
          }}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer le véhicule "${vehicle.name || vehicle.make || 'ce véhicule'}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          loading={deletingId === vehicle.id}
        />
      </div>
    </li>
  );
}