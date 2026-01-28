/**
 * @file components/fill/FillForm.tsx
 * @fileoverview Form component for adding and editing fuel fill-up records.
 * 
 * This component provides a comprehensive form for recording fuel fill-ups
 * with validation, vehicle selection, and all relevant fuel data fields.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFills } from '@/contexts/FillContext';
import { FillFormData } from '@/types/fill';
import { VehicleMinimal } from '@/types/vehicle';

export interface FillFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
  vehicles?: VehicleMinimal[] | null;
}

/**
 * FillForm Component
 * 
 * Form for adding/editing fuel fill-up records with comprehensive data entry.
 */
export default function FillForm({ 
  onCancel, 
  onSuccess, 
  autoCloseOnSuccess = true,
  vehicles = null 
}: FillFormProps) {
  const { addFillOptimistic, refreshFills, selectedVehicleId } = useFills();
  const [loading, setLoading] = useState(false);
  
  // Determine the default vehicle ID
  const getDefaultVehicleId = (): string => {
    // If there's a selected vehicle from the context (VehicleSwitcher), use it
    if (selectedVehicleId && vehicles?.some(v => v.id.toString() === selectedVehicleId)) {
      return selectedVehicleId;
    }
    // If only one vehicle exists, use it
    if (vehicles && vehicles.length === 1) {
      return vehicles[0].id.toString();
    }
    // Otherwise, return empty string
    return '';
  };
  
  const [formData, setFormData] = useState<FillFormData>({
    vehicle_id: getDefaultVehicleId(),
    date: new Date().toISOString().split('T')[0], // Today's date
    odometer: '',
    liters: '',
    amount: '',
    price_per_liter: '',
    notes: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Handle form field changes with auto-calculation
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      // Update the field value
      const newFormData = {
        ...formData,
        [name]: value
      };
      
      // Perform auto-calculation based on what field was changed
      if (name === 'liters' && newFormData.amount) {
        // If liters changed and we have amount, calculate price per liter
        const liters = parseFloat(value);
        const amount = parseFloat(newFormData.amount);
        if (liters > 0 && amount > 0) {
          newFormData.price_per_liter = (amount / liters).toFixed(3);
        }
      } else if (name === 'price_per_liter' && newFormData.amount) {
        // If price per liter changed and we have amount, calculate liters
        const pricePerLiter = parseFloat(value);
        const amount = parseFloat(newFormData.amount);
        if (pricePerLiter > 0 && amount > 0) {
          newFormData.liters = (amount / pricePerLiter).toFixed(2);
        }
      } else if (name === 'amount') {
        // If amount changed, try to calculate the missing field
        if (newFormData.liters) {
          const liters = parseFloat(newFormData.liters);
          const amount = parseFloat(value);
          if (liters > 0 && amount > 0) {
            newFormData.price_per_liter = (amount / liters).toFixed(3);
          }
        } else if (newFormData.price_per_liter) {
          const pricePerLiter = parseFloat(newFormData.price_per_liter);
          const amount = parseFloat(value);
          if (pricePerLiter > 0 && amount > 0) {
            newFormData.liters = (amount / pricePerLiter).toFixed(2);
          }
        }
      }
      
      setFormData(newFormData);
    }
  };



  /**
   * Auto-fill odometer from selected vehicle
   */
  useEffect(() => {
    if (formData.vehicle_id && vehicles) {
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
      if (selectedVehicle && selectedVehicle.odometer !== null) {
        setFormData(prev => ({
          ...prev,
          odometer: selectedVehicle.odometer!.toString()
        }));
      }
    }
  }, [formData.vehicle_id, vehicles]);



  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.vehicle_id) {
        throw new Error('Veuillez sélectionner un véhicule');
      }
      
      if (!formData.date) {
        throw new Error('Veuillez entrer une date');
      }
      
      if (!formData.amount) {
        throw new Error('Veuillez entrer le montant total');
      }
      
      // At least one of liters or price_per_liter should be provided
      if (!formData.liters && !formData.price_per_liter) {
        throw new Error('Veuillez entrer soit les litres, soit le prix au litre');
      }

      // Create fill data with proper types
      const fillData = {
        vehicle_id: parseInt(formData.vehicle_id, 10),
        owner: '', // Will be set by API
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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l&apos;ajout du plein');

      // Add optimistic update - add the new fill to the list immediately
      const newFill = {
        ...data.fill,
        id: data.fill.id || Date.now(), // Temporary ID if not returned
        vehicle_id: fillData.vehicle_id,
        date: fillData.date,
        odometer: fillData.odometer,
        liters: fillData.liters,
        amount: fillData.amount,
        price_per_liter: fillData.price_per_liter,
        notes: fillData.notes,
        created_at: fillData.created_at
      };
      
      addFillOptimistic(newFill);
      
      setMessage('✅ Plein ajouté avec succès !');
      
      // Reset form (except vehicle selection)
      setFormData({
        ...formData,
        date: new Date().toISOString().split('T')[0],
        odometer: '',
        liters: '',
        amount: '',
        price_per_liter: '',
        notes: ''
      });
      
      // Refresh fills list in background
      refreshFills();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Auto-close if enabled (for modal usage)
      if (autoCloseOnSuccess && onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1500); // Give user time to see success message
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage('❌ Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 max-w-md p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 sm:space-y-3 sm:p-4 lg:space-y-4 lg:p-6"
    >
      {/* Vehicle Selection - Only show if multiple vehicles */}
      {vehicles && vehicles.length > 1 ? (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Véhicule</label>
          <select
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleChange}
            required
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none hover:cursor-pointer focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
          >
            <option value="">Sélectionnez un véhicule</option>
            {vehicles?.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name || `${vehicle.make} ${vehicle.model}`}
              </option>
            ))}
          </select>
        </div>
      ) : vehicles && vehicles.length === 1 ? (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Véhicule</label>
          <input
            type="text"
            value={vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
            readOnly
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-3 py-2 rounded outline-none cursor-not-allowed border border-gray-300 dark:border-gray-700"
          />
          <input type="hidden" name="vehicle_id" value={vehicles[0].id} />
        </div>
      ) : null}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700 hover:cursor-text"
        />
      </div>

      {/* Odometer */}
      <div>
        <label className="block text-sm font-medium mb-1">Kilométrage</label>
        <input
          type="number"
          name="odometer"
          placeholder="Kilomètres"
          value={formData.odometer}
          onChange={handleChange}
          className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
        />
      </div>

      {/* Amount (always required) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Montant total (€) *</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          placeholder="Montant total"
          value={formData.amount}
          onChange={handleChange}
          required
          className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300 dark:border-gray-700"
        />
      </div>

      {/* Liters and Price per Liter - both editable, one will auto-calculate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Liters Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Litres</label>
          <input
            type="number"
            step="0.01"
            name="liters"
            placeholder="Litres"
            value={formData.liters}
            onChange={handleChange}
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-300 dark:border-gray-700"
          />
        </div>

        {/* Price per Liter Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-white">Prix au litre (€)</label>
          <input
            type="number"
            step="0.001"
            name="price_per_liter"
            placeholder="Prix/litre"
            value={formData.price_per_liter}
            onChange={handleChange}
            className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 border border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Help text explaining auto-calculation */}
      <div className="p-3 bg-custom-1/10 dark:bg-custom-1/20 rounded text-sm text-custom-1 dark:text-custom-1-dark">
        💡 <strong>Calcul automatique :</strong> Remplissez soit les litres, soit le prix au litre + le montant. 
        L&apos;autre valeur sera calculée automatiquement.
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          placeholder="Notes supplémentaires"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-indigo-500 resize-none border border-gray-300 dark:border-gray-700"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-3 sm:gap-3 sm:pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 hover:cursor-pointer text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4 sm:py-2 sm:text-base"
          >
            Annuler
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm bg-custom-1 hover:bg-custom-1-hover hover:cursor-pointer text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-4 sm:py-2 sm:text-base"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le plein'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <p className="mt-2 text-sm text-center">
          {message}
        </p>
      )}
    </form>
  );
}