/**
 * @file components/fill/FillListItem.tsx
 * @fileoverview Compact display component for individual fuel fill-up records.
 * 
 * This component provides a minimal, space-efficient display of fill-up data
 * suitable for showing multiple records without overwhelming the UI.
 */

'use client';

import { Fill } from '@/types/fill';

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
    <div className="fill-list-item grid grid-cols-12 gap-3 py-2 border-b border-gray-700/50 text-sm">
      {/* Date */}
      <div className="col-span-2 flex items-center">
        <span className="text-gray-400">{formatDate(fill.date)}</span>
      </div>

      {/* Vehicle & Odometer */}
      <div className="col-span-4 flex items-center">
        <span className="font-medium mr-2">
          {fill.vehicle_name || `Véhicule #${fill.vehicle_id}`}
        </span>
        <span className="text-gray-400 text-xs">
          {fill.odometer ? `${fill.odometer} km` : 'N/A'}
        </span>
      </div>

      {/* Liters & Amount */}
      <div className="col-span-3 flex items-center">
        <span className="mr-2">{fill.liters || 'N/A'} L</span>
        <span className="text-gray-400">•</span>
        <span className="ml-2 font-medium">{formatCurrency(fill.amount)}</span>
      </div>

      {/* Price per Liter */}
      <div className="col-span-2 flex items-center justify-end">
        <span className="text-gray-300">
          {fill.price_per_liter ? `${fill.price_per_liter.toFixed(3)} €/L` : 'N/A'}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white disabled:opacity-50"
            title="Modifier"
          >
            ✏️
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 disabled:opacity-50"
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}