/**
 * @file components/vehicle/VehicleCardReadOnly.tsx
 * @fileoverview Read-only vehicle card component for displaying vehicle information.
 * 
 * This component displays a single vehicle's information in a card format
 * without editing capabilities. Ideal for read-only views.
 */

'use client';

interface Vehicle {
  id?: string;
  vehicle_id: string;
  owner_name: string;
  name?: string | null;
  vehicle_name: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  odometer?: number | null;
  plate?: string | null;
  last_fill?: string | null;
  [key: string]: unknown; // Allow for additional fields from API
}

interface VehicleCardReadOnlyProps {
  vehicle: Vehicle;
  showOwner?: boolean;
}

/**
 * VehicleCardReadOnly Component
 * 
 * Displays a single vehicle in a card format without editing capabilities.
 * Perfect for any read-only vehicle display.
 */
export default function VehicleCardReadOnly({ vehicle, showOwner = true }: VehicleCardReadOnlyProps) {
  
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

  return (
    <div className="vehicle-card-readonly bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      {/* Vehicle Header with icon and main info */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Vehicle icon/letter */}
          <div className="h-16 w-16 rounded-xl bg-blue-600/20 dark:bg-blue-900/20 flex items-center justify-center text-blue-400 dark:text-blue-400 font-bold text-xl border border-blue-600/30 dark:border-blue-400/30 lg:flex hidden">
            {((vehicle.make ?? vehicle.vehicle_name ?? vehicle.name ?? '') as string).charAt(0).toUpperCase() || 'V'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-gray-800 dark:text-white text-lg font-bold break-words sm:text-xl sm:break-normal lg:text-2xl lg:truncate">
              {vehicle.vehicle_name ?? vehicle.name ?? `${vehicle.make ?? 'Marque inconnue'} ${vehicle.model ?? ''}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm break-words sm:truncate sm:mt-1">
              {vehicle.make ? `${vehicle.make} ${vehicle.model}` : 'Détails indisponibles'}
            </p>
            {showOwner && vehicle.owner_name && (
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-medium">
                Propriétaire: {vehicle.owner_name}
              </p>
            )}
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
          <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">PLAQUE</div>
          <div className="text-gray-800 dark:text-white text-xl font-bold mt-1">{formatValue(vehicle.plate)}</div>
        </div>
      </div>

      {/* Additional info - Last fill date if available */}
      {vehicle.last_fill && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">DERNIER PLEIN</div>
          <div className="text-gray-800 dark:text-white text-lg font-medium mt-1">
            {new Date(vehicle.last_fill).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}