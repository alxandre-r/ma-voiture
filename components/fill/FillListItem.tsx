/**
 * @file components/fill/FillListItem.tsx
 * @fileoverview Compact display component for individual fuel fill-up records.
 * 
 * This component provides a minimal, space-efficient display of fill-up data
 * suitable for showing multiple records without overwhelming the UI.
 */

'use client';

import { Fill } from '@/types/fill';
import Icon from '@/components/ui/Icon';

interface FillListItemProps {
  fill: Fill;
  onEdit?: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  showVehicleName?: boolean;
}

/**
 * FillListItem Component
 * 
 * Compact display for a single fuel fill-up record.
 * Shows key information in a minimal space.
 */
export default function FillListItem({ fill, onEdit, onDelete, isDeleting, showVehicleName = true }: FillListItemProps) {
  /**
   * Format date for compact display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Format currency compactly
   */
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2) + ' €';
  };

  return (
    <div className="fill-list-item w-full grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {/* Mobile layout - stacked (similar to history but compact) */}
      <div className="md:hidden w-full space-y-2">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-white">
              {showVehicleName ? fill.vehicle_name || `Véhicule #${fill.vehicle_id}` : `Véhicule #${fill.vehicle_id}`}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {formatDate(fill.date)}
            </span>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={isDeleting}
                className="text-gray-400 hover:text-white disabled:opacity-50 dark:text-gray-500 dark:hover:text-white"
                title="Modifier"
              >
                <Icon name="edit" size={18} />
              </button>
            )}
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
              title="Supprimer"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs w-full">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">MONTANT</div>
            <div className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(fill.amount)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">PRIX/L</div>
            <div className="font-medium">
              {fill.price_per_liter ? `${fill.price_per_liter.toFixed(3)} €` : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">LITRES</div>
            <div className="text-gray-800 dark:text-white">
              {fill.liters || 'N/A'} L
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 w-full">
          {fill.odometer ? `${fill.odometer} km` : 'N/A'}
        </div>
      </div>

      {/* Desktop layout - grid (similar to history but compact) */}
      <div className="hidden md:grid md:col-span-12 md:grid-cols-12 md:gap-3 md:items-center md:py-1 md:w-full">

        {/* Vehicle and Date (highlighted) */}
        <div className="md:col-span-4 flex items-center gap-2 w-full">
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {showVehicleName ? fill.vehicle_name || `Véhicule #${fill.vehicle_id}` : `Véhicule #${fill.vehicle_id}`}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {formatDate(fill.date)}
          </span>
        </div>

        {/* Amount (highlighted) */}
        <div className="md:col-span-2 text-center w-full">
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatCurrency(fill.amount)}
          </span>
        </div>

        {/* Price per liter */}
        <div className="md:col-span-2 text-center w-full">
          <span className="text-xs text-gray-500 dark:text-gray-400">PRIX/LITRE</span>
          <div className="text-sm font-medium">
            {fill.price_per_liter ? `${fill.price_per_liter.toFixed(3)} €` : 'N/A'}
          </div>
        </div>

        {/* Liters and Odometer */}
        <div className="md:col-span-2 text-center w-full">
          <span className="text-xs text-gray-500 dark:text-gray-400">LITRES / KM</span>
          <div className="text-xs">
            {fill.liters || 'N/A'} L • {fill.odometer ? `${fill.odometer} km` : 'N/A'}
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-2 w-full">
          {onEdit && (
            <button
              onClick={onEdit}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-white hover:cursor-pointer disabled:opacity-50 dark:text-gray-500 dark:hover:text-white"
              title="Modifier"
              aria-label="Modifier"
            >
              <Icon name="edit" size={18} />
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:cursor-pointer disabled:opacity-50 rounded dark:text-red-400 dark:hover:text-red-300"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}