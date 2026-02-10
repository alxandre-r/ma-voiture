'use client';

import { useState, useEffect } from 'react';
import { useFills } from '@/contexts/FillContext';
import { FillFormData } from '@/types/fill';
import { VehicleMinimal } from '@/types/vehicle';
import { Modal } from '@/components/ui/Modal';
import { useNotifications } from '@/contexts/NotificationContext';

export interface FillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
  vehicles?: VehicleMinimal[] | null;
  initialVehicleId?: number;
}

export default function FillFormModal({
  isOpen,
  onClose,
  onSuccess,
  autoCloseOnSuccess = true,
  vehicles = null,
  initialVehicleId
}: FillFormProps) {
  const { addFillOptimistic, refreshFills, selectedVehicleIds } = useFills();
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // --- Détermine l'ID du véhicule par défaut ---
  const getDefaultVehicleId = (): number => {
    if (selectedVehicleIds && vehicles) {
      const match = vehicles.find(v => selectedVehicleIds.includes(v.vehicle_id));
      if (match) return match.vehicle_id;
    }
    if (vehicles && vehicles.length === 1) return vehicles[0].vehicle_id;
    return 0;
  };

  const [formData, setFormData] = useState<FillFormData>({
    vehicle_id: initialVehicleId ?? getDefaultVehicleId(),
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    liters: '',
    amount: '',
    price_per_liter: '',
    notes: ''
  });

  const [message, setMessage] = useState<string | null>(null);

  // --- Auto-remplir le kilométrage selon le véhicule sélectionné ---
  useEffect(() => {
    if (!vehicles || !formData.vehicle_id) return;

    const selectedVehicle = vehicles.find(
      v => v.vehicle_id === formData.vehicle_id
    );

    if (selectedVehicle?.odometer != null) {
      setFormData(prev => ({
        ...prev,
        odometer: selectedVehicle.odometer!.toString()
      }));
    }
  }, [formData.vehicle_id, vehicles]);

  // --- Gestion des changements de champs ---
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;

  let parsedValue: any = value;

  // ✅ FIX : convertir vehicle_id en number
  if (name === 'vehicle_id') {
    parsedValue = value === '' ? 0 : Number(value);
  }

  if (type === 'checkbox') {
    setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    return;
  }

  const newFormData = { ...formData, [name]: parsedValue };

  // --- calculs auto ---
  const liters = parseFloat(newFormData.liters);
  const amount = parseFloat(newFormData.amount);
  const pricePerLiter = parseFloat(newFormData.price_per_liter);

  if (name === 'liters' && amount > 0 && liters > 0) {
    newFormData.price_per_liter = (amount / liters).toFixed(3);
  }

  if (name === 'price_per_liter' && amount > 0 && pricePerLiter > 0) {
    newFormData.liters = (amount / pricePerLiter).toFixed(2);
  }

  if (name === 'amount') {
    if (newFormData.liters && parseFloat(newFormData.liters) > 0) {
      newFormData.price_per_liter = (amount / parseFloat(newFormData.liters)).toFixed(3);
    } else if (newFormData.price_per_liter && parseFloat(newFormData.price_per_liter) > 0) {
      newFormData.liters = (amount / parseFloat(newFormData.price_per_liter)).toFixed(2);
    }
  }

  setFormData(newFormData);
};

  // --- Soumission du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (formData.vehicle_id === 0) showError('Veuillez sélectionner un véhicule');
      if (!formData.date) showError('Veuillez entrer une date');
      if (!formData.amount) showError('Veuillez entrer le montant total');
      if (!formData.liters && !formData.price_per_liter) showError('Veuillez entrer soit les litres, soit le prix au litre');

      const fillData = {
        vehicle_id: formData.vehicle_id,
        owner: '',
        date: formData.date,
        odometer: formData.odometer ? parseInt(formData.odometer, 10) : null,
        liters: formData.liters ? parseFloat(formData.liters) : null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        price_per_liter: formData.price_per_liter ? parseFloat(formData.price_per_liter) : null,
        notes: formData.notes || null,
        created_at: new Date().toISOString()
      };

      const res = await fetch('/api/fills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fillData)
      });

      const data = await res.json();
      if (!res.ok) showError(data.error || 'Erreur lors de l\'ajout du plein');

      addFillOptimistic({ ...data.fill, ...fillData, vehicle_id: data.fill.vehicle_id || Date.now() });
      showSuccess('Plein ajouté avec succès');

      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        odometer: '',
        liters: '',
        amount: '',
        price_per_liter: '',
        notes: ''
      }));

      refreshFills();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un plein" size="md" fullscreenOnMobile>
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Véhicule */}
      {vehicles && vehicles.length > 1 && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Véhicule <span className="text-red-500">*</span>
          </label>
          <select
            name="vehicle_id"
            value={formData.vehicle_id ?? 0}
            onChange={handleChange}
            required
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 px-3 py-3 text-sm
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              hover:border-gray-400 dark:hover:border-gray-600
              transition-colors
            "
          >
            <option value="">Sélectionnez un véhicule</option>
            {vehicles.map(v => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.name || `${v.make} ${v.model}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {vehicles && vehicles.length === 1 && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Véhicule
          </label>
          <input
            readOnly
            value={vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
            className="
              w-full rounded-md border border-gray-300 dark:border-gray-700
              bg-gray-100 dark:bg-gray-700 px-3 py-3 text-sm
              text-gray-500 dark:text-gray-300 cursor-not-allowed
            "
          />
        </div>
      )}

      {/* Date */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
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

      {/* Kilométrage */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Kilométrage <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="odometer"
          value={formData.odometer}
          onChange={handleChange}
          placeholder="-"
          className="
            w-full rounded-md border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 px-3 py-3 text-sm
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            hover:border-gray-400 dark:hover:border-gray-600
            transition-colors
          "
        />
      </div>

      {/* Montant */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Montant total (€) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
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

      {/* Litres / Prix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Litres <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="liters"
            value={formData.liters}
            onChange={handleChange}
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
            Prix au litre (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.001"
            name="price_per_liter"
            value={formData.price_per_liter}
            onChange={handleChange}
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

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="
            w-full rounded-md border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800 px-3 py-3 text-sm resize-none
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
          onClick={onClose}
          disabled={loading}
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
          disabled={loading}
          className="
            px-5 py-2 text-sm font-medium rounded-md
            bg-custom-1 text-white
            hover:bg-custom-1-hover hover:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {loading ? 'Enregistrement...' : 'Ajouter le plein'}
        </button>
      </div>

      {message && (
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </form>
  </Modal>
);
}