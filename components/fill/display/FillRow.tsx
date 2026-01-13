/**
 * @file components/fill/FillRow.tsx
 * @fileoverview Unified component for displaying fuel fill-up records.
 * 
 * This component provides a consistent visual representation of fill-up data
 * that is used across both dashboard and history views.
 */

'use client';

import { Fill } from '@/types/fill';
import Icon from '@/components/ui/Icon';

export interface FillRowProps {
  fill: Fill;
  onEdit?: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  showVehicleName?: boolean;
  isEditing?: boolean;
  editData?: Partial<Fill>;
  onChangeField?: (key: string, value: unknown) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  saving?: boolean;
}

/**
 * FillRow Component
 * 
 * Unified component for displaying fuel fill-up records with consistent styling.
 * Used in both dashboard and history views.
 */
export default function FillRow({
  fill,
  onEdit,
  onDelete,
  isDeleting,
  isEditing = false,
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving = false,
}: FillRowProps) {
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

  if (isEditing && editData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={editData.date || ''}
                onChange={(e) => onChangeField?.('date', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compteur (km)</label>
              <input
                type="number"
                value={editData.odometer || ''}
                onChange={(e) => onChangeField?.('odometer', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Litres</label>
              <input
                type="number"
                step="0.01"
                value={editData.liters || ''}
                onChange={(e) => onChangeField?.('liters', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={editData.amount || ''}
                onChange={(e) => onChangeField?.('amount', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix/Litre (€)</label>
              <input
                type="number"
                step="0.001"
                value={editData.price_per_liter || ''}
                onChange={(e) => onChangeField?.('price_per_liter', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={editData.notes || ''}
              onChange={(e) => onChangeField?.('notes', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelEdit}
              disabled={saving}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onSaveEdit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Get vehicle display name
   * The API now provides this via the vehicle_fills view with proper fallback
   */
  const getVehicleDisplayName = () => {
    // The vehicle_fills view handles: COALESCE(NULLIF(v.name, ''), concat_ws(' ', v.make, v.model))
    return fill.vehicle_name || `Véhicule #${fill.vehicle_id}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Mobile: Date, Vehicle Info, and Actions (all in same row) */}
        <div className="lg:col-span-2 col-span-1 flex justify-between items-start">
          <div className="flex-1">
            <div className="text-lg font-bold text-custom-1 dark:text-blue-400 mb-1">
              {formatDate(fill.date)}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getVehicleDisplayName()}
            </div>
          </div>
          <div className="lg:hidden flex gap-2 ml-3 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={isDeleting}
                className="p-1.5 bg-custom-3 text-white text-sm rounded disabled:opacity-50 hover:cursor-pointer flex items-center justify-center"
                title="Modifier"
              >
                <Icon name="edit" size={16} className='invert' />
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded disabled:opacity-50 hover:cursor-pointer flex items-center justify-center"
              title="Supprimer"
            >
              <Icon name="delete" size={16} className='invert' />
            </button>
          </div>
        </div>

        {/* Desktop: Amount */}
        <div className="hidden lg:block lg:col-span-1 lg:text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Montant</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(fill.amount)}
          </div>
        </div>

        {/* Desktop only */}
        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Prix/Litre</div>
          <div className="font-medium">
            {formatCurrency(fill.price_per_liter)}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Litres</div>
          <div className="text-sm">
            {fill.liters || 'N/A'} L
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Odomètre</div>
          <div className="text-sm">
            {fill.odometer || 'N/A'} km
          </div>
        </div>

        {/* Desktop: Actions */}
        <div className="hidden lg:flex lg:col-span-6 justify-end gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={isDeleting}
              className="p-1.5 bg-custom-3 text-white text-sm rounded disabled:opacity-50 hover:cursor-pointer flex items-center justify-center"
              title="Modifier"
            >
              <Icon name="edit" size={16} className='invert' />
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded disabled:opacity-50 hover:cursor-pointer flex items-center justify-center"
            title="Supprimer"
          >
            <Icon name="delete" size={16} className='invert' />
          </button>
        </div>
      </div>

      {/* Mobile: 2x2 Grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mt-3">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Montant</div>
          <div className="font-bold text-green-600 dark:text-green-400">
            {formatCurrency(fill.amount)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Prix/Litre</div>
          <div className="font-medium">
            {formatCurrency(fill.price_per_liter)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Litres</div>
          <div className="text-sm">
            {fill.liters || 'N/A'} L
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Odomètre</div>
          <div className="text-sm">
            {fill.odometer || 'N/A'} km
          </div>
        </div>
      </div>

      {/* Notes */}
      {fill.notes && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          <span className="text-gray-500 dark:text-gray-400">📝 </span>
          <span>{fill.notes}</span>
        </div>
      )}
    </div>
  );
}