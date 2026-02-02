'use client';

import { useState, useEffect } from 'react';
import { useFills } from '@/contexts/FillContext';
import { FillFormData } from '@/types/fill';
import { VehicleMinimal } from '@/types/vehicle';

export interface FillFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
  vehicles?: VehicleMinimal[] | null;
}

export default function FillForm({
  onCancel,
  onSuccess,
  autoCloseOnSuccess = true,
  vehicles = null
}: FillFormProps) {
  const { addFillOptimistic, refreshFills, selectedVehicleIds } = useFills();
  const [loading, setLoading] = useState(false);

  // --- Détermine l'ID du véhicule par défaut ---
  const getDefaultVehicleId = (): number => {
    if (selectedVehicleIds && vehicles) {
      const match = vehicles.find(v => selectedVehicleIds.includes(v.id));
      if (match) return match.id;
    }
    if (vehicles && vehicles.length === 1) return vehicles[0].id;
    return 0;
  };

  const [formData, setFormData] = useState<FillFormData>({
    vehicle_id: getDefaultVehicleId(),
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
    if (formData.vehicle_id && vehicles) {
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (selectedVehicle && selectedVehicle.odometer != null) {
        setFormData(prev => ({ ...prev, odometer: selectedVehicle.odometer!.toString() }));
      }
    }
  }, [formData.vehicle_id, vehicles]);

  // --- Gestion des changements de champs ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
      return;
    }

    const newFormData = { ...formData, [name]: value };

    // Calcul automatique litres / prix au litre
    const liters = parseFloat(newFormData.liters);
    const amount = parseFloat(newFormData.amount);
    const pricePerLiter = parseFloat(newFormData.price_per_liter);

    if (name === 'liters' && amount > 0 && liters > 0) newFormData.price_per_liter = (amount / liters).toFixed(3);
    if (name === 'price_per_liter' && amount > 0 && pricePerLiter > 0) newFormData.liters = (amount / pricePerLiter).toFixed(2);
    if (name === 'amount') {
      if (newFormData.liters && parseFloat(newFormData.liters) > 0) newFormData.price_per_liter = (amount / parseFloat(newFormData.liters)).toFixed(3);
      else if (newFormData.price_per_liter && parseFloat(newFormData.price_per_liter) > 0) newFormData.liters = (amount / parseFloat(newFormData.price_per_liter)).toFixed(2);
    }

    setFormData(newFormData);
  };

  // --- Soumission du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (formData.vehicle_id === 0) throw new Error('Veuillez sélectionner un véhicule');
      if (!formData.date) throw new Error('Veuillez entrer une date');
      if (!formData.amount) throw new Error('Veuillez entrer le montant total');
      if (!formData.liters && !formData.price_per_liter) throw new Error('Veuillez entrer soit les litres, soit le prix au litre');

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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'ajout du plein');

      addFillOptimistic({ ...data.fill, ...fillData, id: data.fill.id || Date.now() });
      setMessage('✅ Plein ajouté avec succès !');

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
      if (autoCloseOnSuccess && onCancel) setTimeout(onCancel, 1500);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? `❌ ${err.message}` : '❌ Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-md p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 sm:space-y-3 sm:p-4 lg:space-y-4 lg:p-6">
      {/* Vehicle Selection */}
      {vehicles && vehicles.length > 1 ? (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Véhicule</label>
          <select
            name="vehicle_id"
            value={formData.vehicle_id ?? 0}
            onChange={handleChange}
            required
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none hover:cursor-pointer focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
          >
            <option value="">Sélectionnez un véhicule</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name || `${v.make} ${v.model}`}</option>
            ))}
          </select>
        </div>
      ) : vehicles && vehicles.length === 1 ? (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Véhicule</label>
          <input type="text" value={vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`} readOnly className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-3 py-2 rounded outline-none cursor-not-allowed border border-gray-300 dark:border-gray-700" />
          <input type="hidden" name="vehicle_id" value={vehicles[0].id} />
        </div>
      ) : null}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 hover:cursor-text" />
      </div>

      {/* Odometer */}
      <div>
        <label className="block text-sm font-medium mb-1">Kilométrage</label>
        <input type="number" name="odometer" placeholder="Kilomètres" value={formData.odometer} onChange={handleChange} className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700" />
      </div>

      {/* Amount, Liters, Price per Liter */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Montant total (€) *</label>
        <input type="number" step="0.01" name="amount" placeholder="Montant total" value={formData.amount} onChange={handleChange} required className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300 dark:border-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Litres</label>
          <input type="number" step="0.01" name="liters" placeholder="Litres" value={formData.liters} onChange={handleChange} className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Prix au litre (€)</label>
          <input type="number" step="0.001" name="price_per_liter" placeholder="Prix/litre" value={formData.price_per_liter} onChange={handleChange} className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300 dark:border-gray-700" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea name="notes" placeholder="Notes supplémentaires" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 resize-none border border-gray-300 dark:border-gray-700" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
        {onCancel && <button type="button" onClick={onCancel} disabled={loading} className="flex-1 px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 hover:cursor-pointer text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4 sm:py-2 sm:text-base">Annuler</button>}
        <button type="submit" disabled={loading} className="flex-1 px-3 py-2 text-sm bg-custom-1 hover:bg-custom-1-hover hover:cursor-pointer text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4 sm:py-2 sm:text-base">{loading ? 'Enregistrement...' : 'Enregistrer le plein'}</button>
      </div>

      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </form>
  );
}