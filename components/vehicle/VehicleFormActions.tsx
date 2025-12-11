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
    <div className="flex justify-end gap-3">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Annuler
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 cursor-pointer transition-colors"
      >
        {loading ? 'Enregistrement...' : submitText}
      </button>
    </div>
  );
}