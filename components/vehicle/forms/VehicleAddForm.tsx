/**
 * @file components/vehicle/forms/VehicleAddForm.tsx
 * @fileoverview Vehicle form component for adding new vehicles.
 * 
 * This component provides the inline form for adding a new vehicle as well as API calls.
 */

'use client';

import { useMemo, useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface VehicleFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
}

interface VehicleFormData {
  name: string;
  make: string;
  model: string;
  year: string;
  fuel_type: string;
  odometer: string;
}

export default function VehicleForm({
  onCancel,
  onSuccess,
  autoCloseOnSuccess,
}: VehicleFormProps) {
  const { addVehicleOptimistic, refreshVehicles } = useVehicles();
  const { showSuccess, showError } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    make: '',
    model: '',
    year: '',
    fuel_type: '',
    odometer: '',
  });

  /* ---------------------------- helpers ---------------------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    if (!formData.make.trim()) return false;
    if (!formData.model.trim()) return false;
    if (!formData.odometer || Number(formData.odometer) < 0) return false;
    if (formData.year && Number(formData.year) < 1900) return false;
    return true;
  }, [formData]);

  /* ---------------------------- submit ---------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const vehicleData = {
        name: formData.name || null,
        make: formData.make,
        model: formData.model,
        year: formData.year ? Number(formData.year) : null,
        fuel_type: formData.fuel_type || null,
        odometer: Number(formData.odometer),
      };

      const res = await fetch('/api/vehicles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addVehicleOptimistic({
        ...data.vehicle,
        created_at: new Date().toISOString(),
      });

      showSuccess('Véhicule ajouté avec succès');

      setFormData({
        name: '',
        make: '',
        model: '',
        year: '',
        fuel_type: '',
        odometer: '',
      });

      refreshVehicles();
      onSuccess?.();

      if (autoCloseOnSuccess && onCancel) {
        setTimeout(onCancel, 1200);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------- UI ---------------------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nom (facultatif) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Nom du véhicule{' '}
          <span className="text-xs text-gray-400">(facultatif)</span>
        </label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex : Clio daily"
          className="
            w-full rounded-md border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 px-3 py-3 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            hover:border-gray-400 dark:hover:border-gray-600
            transition-colors
          "
        />
      </div>

      {/* Marque / Modèle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Marque <span className="text-red-500">*</span>
          </label>
          <input
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="Renault"
            required
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 px-3 py-3 text-sm
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              hover:border-gray-400 dark:hover:border-gray-600
              transition-colors
            "
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modèle <span className="text-red-500">*</span>
          </label>
          <input
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Clio V"
            required
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 px-3 py-3 text-sm
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              hover:border-gray-400 dark:hover:border-gray-600
              transition-colors
            "
          />
        </div>
      </div>

      {/* Année / Carburant (indicatif) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Année
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="2020"
            min={1900}
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 px-3 py-3 text-sm
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              hover:border-gray-400 dark:hover:border-gray-600
              transition-colors
            "
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Carburant
          </label>
          <input
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            placeholder="Essence"
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 px-3 py-3 text-sm
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              hover:border-gray-400 dark:hover:border-gray-600
              transition-colors
            "
          />
        </div>
      </div>

      {/* Kilométrage */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Kilométrage actuel <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="odometer"
          value={formData.odometer}
          onChange={handleChange}
          placeholder="35000"
          min={0}
          required
          className="
            w-full rounded-md border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 px-3 py-3 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            hover:border-gray-400 dark:hover:border-gray-600
            transition-colors
          "
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-4 py-2 text-sm rounded-md
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer
            transition-colors
          "
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="
            px-5 py-2 text-sm font-medium rounded-md
            bg-custom-1 text-white
            hover:bg-custom-1-hover hover:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          Ajouter
        </button>
      </div>
    </form>
  );
}