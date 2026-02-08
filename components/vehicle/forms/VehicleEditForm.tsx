'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/types/vehicle';
import { useNotifications } from '@/contexts/NotificationContext';

interface VehicleEditFormProps {
  vehicle: Vehicle;
  onCancelEdit: () => void;
  onSaved?: () => void;
}

export default function VehicleEditForm({ vehicle, onCancelEdit, onSaved }: VehicleEditFormProps) {
  const { showSuccess, showError } = useNotifications();

  const [editData, setEditData] = useState<Partial<Vehicle>>({
    name: vehicle.name ?? '',
    make: vehicle.make ?? '',
    model: vehicle.model ?? '',
    year: vehicle.year ?? undefined,
    fuel_type: vehicle.fuel_type ?? '',
    odometer: vehicle.odometer ?? undefined,
    plate: vehicle.plate ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicName, setDynamicName] = useState(editData.name || `${editData.make || ''} ${editData.model || ''}`.trim());

  useEffect(() => {
    setDynamicName(editData.name?.trim() || `${editData.make || ''} ${editData.model || ''}`.trim());
  }, [editData.name, editData.make, editData.model]);

  const onChangeField = (key: string, value: unknown) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const saveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/vehicles/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicle.vehicle_id, ...editData }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? 'Erreur inconnue');
      showSuccess('Véhicule modifié avec succès !');
      onSaved?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-1 transition";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-5 transition-colors">

      {/* --- Header --- */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-custom-2 text-white flex items-center justify-center text-2xl font-bold">
              {editData.make?.[0] || '🚗'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {dynamicName || '—'}
          </h2>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              placeholder="Nom"
              value={editData.name ?? ''}
              onChange={e => onChangeField('name', e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Plaque"
              value={editData.plate ?? ''}
              onChange={e => onChangeField('plate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* --- Stats badges --- */}
      <div className="flex flex-wrap gap-3">

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Marque</span>
          <input
            placeholder="Make"
            value={editData.make ?? ''}
            onChange={e => onChangeField('make', e.target.value)}
            className={`${inputClass} mt-1 text-center`}
          />
        </div>

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Modèle</span>
          <input
            placeholder="Model"
            value={editData.model ?? ''}
            onChange={e => onChangeField('model', e.target.value)}
            className={`${inputClass} mt-1 text-center`}
          />
        </div>

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Année</span>
          <input
            type="number"
            value={editData.year ?? ''}
            onChange={e => onChangeField('year', e.target.value ? Number(e.target.value) : undefined)}
            className={`${inputClass} mt-1 text-center`}
          />
        </div>

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Kilométrage</span>
          <input
            type="number"
            value={editData.odometer ?? ''}
            onChange={e => onChangeField('odometer', e.target.value ? Number(e.target.value) : undefined)}
            className={`${inputClass} mt-1 text-center`}
          />
        </div>

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Carburant</span>
          <select
            value={editData.fuel_type ?? ''}
            onChange={e => onChangeField('fuel_type', e.target.value)}
            className={`${inputClass} mt-1 text-center cursor-pointer`}
          >
            <option value="">Sélectionner</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        <div className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Conso Moy.</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {vehicle.calculated_consumption != null ? `${vehicle.calculated_consumption} L/100km` : '—'}
          </span>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancelEdit}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition hover:cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={saveEdit}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-custom-1 hover:bg-custom-1-dark text-white transition hover:cursor-pointer"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

    </div>
  );
}