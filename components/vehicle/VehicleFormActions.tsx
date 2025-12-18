/**
 * @file components/vehicle/VehicleFormActions.tsx
 * @fileoverview Form action buttons for vehicle forms.
 * 
 * This component provides the cancel and submit buttons for vehicle forms
 * with proper loading states and styling.
 */

'use client';

interface VehicleFormActionsProps {
  onCancel?: () => void;
  loading: boolean;
  submitText?: string;
}

/**
 * VehicleFormActions Component
 * 
 * Action buttons for vehicle forms (Cancel and Submit).
 * Handles loading states and provides consistent button styling.
 */
export default function VehicleFormActions({
  onCancel,
  loading,
  submitText = 'Ajouter le véhicule',
}: VehicleFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 sm:gap-3">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors sm:px-4 sm:py-2 sm:text-base"
        >
          Annuler
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 cursor-pointer transition-colors sm:px-4 sm:py-2 sm:text-base"
      >
        {loading ? 'Enregistrement...' : submitText}
      </button>
    </div>
  );
}