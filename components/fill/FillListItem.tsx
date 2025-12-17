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
}

/**
 * FillListItem Component
 * 
 * Compact display for a single fuel fill-up record.
 * Shows key information in a minimal space.
 */
export default function FillListItem({ fill, onEdit, onDelete, isDeleting }: FillListItemProps) {
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
    <div className="fill-list-item grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b border-gray-700/50 dark:border-gray-600 text-sm">
      {/* Mobile layout - stacked */}
      <div className="md:hidden space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-500">{formatDate(fill.date)}</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {fill.vehicle_name || `Véhicule #${fill.vehicle_id}`}
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-gray-800 dark:text-white">{fill.liters || 'N/A'} L</span>
            <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(fill.amount)}</span>
            <span className="text-gray-300 dark:text-gray-500 text-xs">
              {fill.price_per_liter ? `${fill.price_per_liter.toFixed(3)} €/L` : 'N/A'}
            </span>
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {fill.odometer ? `${fill.odometer} km` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Desktop layout - grid */}
      <div className="hidden md:flex md:col-span-12 md:gap-4 px-6 items-center">
        <div className="flex-1 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(fill.date)}</span>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-white">
        {fill.vehicle_name || `Véhicule #${fill.vehicle_id}`}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
        {fill.odometer ? `${fill.odometer} km` : 'N/A'}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-gray-800 dark:text-white">{fill.liters || 'N/A'} L</span>
          <span className="text-gray-500 dark:text-gray-400">•</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(fill.amount)}</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
        {fill.price_per_liter ? `${fill.price_per_liter.toFixed(3)} €/L` : 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-2">
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