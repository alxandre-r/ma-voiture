/**
 * @file components/vehicle/VehicleEditForm.tsx
 * @fileoverview Edit form component for vehicle information.
 * 
 * This component provides the inline edit form that appears when editing a vehicle.
 */

'use client';

interface VehicleEditFormProps {
  editData: Partial<{
    name: string | null;
    owner: string | null;
    make: string | null;
    model: string | null;
    year: number | null | undefined;
    fuel_type: string | null;
    manufacturer_consumption: number | null | undefined;
    odometer: number | null | undefined;
    plate: string | null;
  }> | null;
  onChangeField: (key: string, value: unknown) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  saving: boolean;
}

/**
 * VehicleEditForm Component
 * 
 * Inline edit form for vehicle information with all editable fields.
 */
export default function VehicleEditForm({
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving,
}: VehicleEditFormProps) {
  if (!editData) {
    return null; // or loading state
  }

  return (
    <div className="mt-5 bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-600 dark:text-gray-300 text-xs mb-1">Nom</span>
          <input
            value={editData.name ?? ''}
            onChange={(e) => onChangeField('name', e.target.value)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Make Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Marque</span>
          <input
            value={editData.make ?? ''}
            onChange={(e) => onChangeField('make', e.target.value)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Model Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Modèle</span>
          <input
            value={editData.model ?? ''}
            onChange={(e) => onChangeField('model', e.target.value)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Year Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Année</span>
          <input
            type="number"
            value={editData.year ?? ''}
            onChange={(e) => onChangeField('year', e.target.value ? Number(e.target.value) : undefined)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Fuel Type Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Carburant</span>
          <input
            value={editData.fuel_type ?? ''}
            onChange={(e) => onChangeField('fuel_type', e.target.value)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Odometer Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Kilométrage (km)</span>
          <input
            type="number"
            value={editData.odometer ?? ''}
            onChange={(e) =>
              onChangeField(
                'odometer',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>

        {/* Plate Field */}
        <label className="flex flex-col text-sm">
          <span className="text-gray-500 dark:text-gray-300 text-xs mb-1">Plaque</span>
          <input
            value={editData.plate ?? ''}
            onChange={(e) => onChangeField('plate', e.target.value)}
            className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded"
          />
        </label>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={onCancelEdit}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-transparent border border-white/10 dark:text-gray-300 hover:text-gray-300 dark:hover:text-white text-sm transition hover:cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={onSaveEdit}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-custom-1 hover:bg-custom-1-dark text-white text-sm transition hover:cursor-pointer"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}