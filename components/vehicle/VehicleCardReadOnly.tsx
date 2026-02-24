'use client';

import type { Vehicle } from '@/types/vehicle';

export default function VehicleCardReadOnly({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="vehicle-card">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 flex flex-col gap-5 transition-colors">
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
        </div>

        {/* --- Stats principales : badges verticaux --- */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Kilométrage
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {vehicle.odometer?.toLocaleString() ?? '—'} km
            </span>
          </div>
          <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Conso Moy.
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {vehicle.calculated_consumption ?? '—'} L/100km
            </span>
          </div>
          <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Dernier plein
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {vehicle.last_fill ? new Date(vehicle.last_fill).toLocaleDateString('fr-FR') : '—'}
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
      </div>
    </div>
  );
}
