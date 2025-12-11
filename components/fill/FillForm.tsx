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

interface FillFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
  vehicles?: Array<{ 
    id: number; 
    name: string | null; 
    make: string | null; 
    model: string | null; 
    odometer: number | null;
  }> | null;
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
  const { addFillOptimistic, refreshFills } = useFills();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FillFormData>({
    vehicle_id: vehicles && vehicles.length === 1 ? vehicles[0].id.toString() : '',
    date: new Date().toISOString().split('T')[0], // Today's date
    odometer: '',
    liters: '',
    amount: '',
    price_per_liter: '',
    is_full: false, // Removed the checkbox, default to false
    notes: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Handle form field changes
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
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  /**
   * Calculate price per liter automatically
   */
  const calculatePricePerLiter = useCallback(() => {
    const liters = parseFloat(formData.liters);
    const amount = parseFloat(formData.amount);
    
    if (liters > 0 && amount > 0) {
      const pricePerLiter = amount / liters;
      setFormData(prev => ({
        ...prev,
        price_per_liter: pricePerLiter.toFixed(3)
      }));
    }
  }, [formData.liters, formData.amount]);

  /**
   * Auto-fill odometer from selected vehicle
   */
  useEffect(() => {
    if (formData.vehicle_id && vehicles) {
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
      if (selectedVehicle && selectedVehicle.odometer) {
        setFormData(prev => ({
          ...prev,
          odometer: selectedVehicle.odometer.toString()
        }));
      }
    }
  }, [formData.vehicle_id, vehicles]);

  /**
   * Auto-calculate price per liter when liters or amount changes
   */
  useEffect(() => {
    if (formData.liters && formData.amount) {
      calculatePricePerLiter();
    }
  }, [formData.liters, formData.amount, calculatePricePerLiter]);

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
      
      if (!formData.liters && !formData.amount) {
        throw new Error('Veuillez entrer au moins les litres ou le montant');
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
        is_full: formData.is_full,
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
        is_full: fillData.is_full,
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
      className="space-y-4 max-w-md p-6 rounded-lg bg-gray-800 text-white"
    >
      {/* Vehicle Selection - Only show if multiple vehicles */}
      {vehicles && vehicles.length > 1 ? (
        <div>
          <label className="block text-sm font-medium mb-1">Véhicule</label>
          <select
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleChange}
            required
            className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
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
          <label className="block text-sm font-medium mb-1">Véhicule</label>
          <input
            type="text"
            value={vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
            readOnly
            className="w-full bg-white/10 text-white px-3 py-2 rounded outline-none cursor-not-allowed"
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
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
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
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Liters */}
      <div>
        <label className="block text-sm font-medium mb-1">Litres</label>
        <input
          type="number"
          step="0.01"
          name="liters"
          placeholder="Litres"
          value={formData.liters}
          onChange={handleChange}
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-1">Montant (€)</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          placeholder="Montant total"
          value={formData.amount}
          onChange={handleChange}
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Price per Liter (read-only, calculated) */}
      <div>
        <label className="block text-sm font-medium mb-1">Prix au litre (€)</label>
        <input
          type="number"
          step="0.001"
          name="price_per_liter"
          placeholder="Prix/litre"
          value={formData.price_per_liter}
          onChange={handleChange}
          readOnly
          className="w-full bg-white/10 text-white px-3 py-2 rounded outline-none cursor-not-allowed"
        />
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
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500 resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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