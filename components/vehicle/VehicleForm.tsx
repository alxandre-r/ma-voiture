/**
 * @file components/vehicle/VehicleForm.tsx
 * @fileoverview Form component to add a new vehicle via the /api/vehicles/add endpoint.
 * 
 * This component has been refactored to use smaller, reusable subcomponents
 * for better maintainability and organization.
 */

'use client';

import { useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useNotifications } from '@/contexts/NotificationContext';
import VehicleFormField from './VehicleFormField';
import VehicleFormActions from './VehicleFormActions';

interface VehicleFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  autoCloseOnSuccess?: boolean;
}

/**
 * Vehicle form data interface
 */
interface VehicleFormData {
  name: string;
  make: string;
  model: string;
  year: string;
  fuel_type: string;
  manufacturer_consumption: string;
  odometer: string;
}

/**
 * VehicleForm Component
 * 
 * Form for adding new vehicles with validation and submission handling.
 * Uses reusable subcomponents for better organization.
 */
export default function VehicleForm({ onCancel, onSuccess, autoCloseOnSuccess }: VehicleFormProps) {
  const { addVehicleOptimistic, refreshVehicles } = useVehicles();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    make: '',
    model: '',
    year: '',
    fuel_type: '',
    manufacturer_consumption: '',
    odometer: ''
  });

  /**
   * Handle form field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create vehicle data with proper types
      const vehicleData = {
        ...formData,
        year: formData.year ? parseInt(formData.year, 10) : null,
        manufacturer_consumption: formData.manufacturer_consumption
          ? parseFloat(formData.manufacturer_consumption)
          : null,
        odometer: formData.odometer ? parseInt(formData.odometer, 10) : null
      };

      const res = await fetch('/api/vehicles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du véhicule');

      // Add optimistic update - add the new vehicle to the list immediately
      const newVehicle = {
        ...data.vehicle,
        name: formData.name,
        make: formData.make,
        model: formData.model,
        year: vehicleData.year,
        fuel_type: formData.fuel_type,
        manufacturer_consumption: vehicleData.manufacturer_consumption,
        odometer: vehicleData.odometer,
        created_at: new Date().toISOString()
      };
      
      addVehicleOptimistic(newVehicle);
      
      // Show success notification
      showSuccess('Véhicule ajouté avec succès !');
      
      setFormData({
        name: '',
        make: '',
        model: '',
        year: '',
        fuel_type: '',
        manufacturer_consumption: '',
        odometer: ''
      });
      
      // Refresh vehicles list in background
      refreshVehicles();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Auto-close if enabled (for modal usage)
      if (autoCloseOnSuccess && onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1500); // Give user time to see success notification
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError('Une erreur inconnue est survenue');
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
      {/* Vehicle Name Field */}
      <VehicleFormField
        type="text"
        name="name"
        placeholder="Nom du véhicule"
        value={formData.name}
        onChange={handleChange}
        required
      />

      {/* Make Field */}
      <VehicleFormField
        type="text"
        name="make"
        placeholder="Marque"
        value={formData.make}
        onChange={handleChange}
      />

      {/* Model Field */}
      <VehicleFormField
        type="text"
        name="model"
        placeholder="Modèle"
        value={formData.model}
        onChange={handleChange}
      />

      {/* Year Field */}
      <VehicleFormField
        type="number"
        name="year"
        placeholder="Année"
        value={formData.year}
        onChange={handleChange}
      />

      {/* Fuel Type Field */}
      <VehicleFormField
        type="text"
        name="fuel_type"
        placeholder="Type de carburant"
        value={formData.fuel_type}
        onChange={handleChange}
      />

      {/* Consumption Field */}
      <VehicleFormField
        type="number"
        step="0.01"
        name="manufacturer_consumption"
        placeholder="Consommation (L/100km)"
        value={formData.manufacturer_consumption}
        onChange={handleChange}
      />

      {/* Odometer Field */}
      <VehicleFormField
        type="number"
        name="odometer"
        placeholder="Kilométrage actuel (km)"
        value={formData.odometer}
        onChange={handleChange}
      />

      {/* Form Actions */}
      <VehicleFormActions
        onCancel={onCancel}
        loading={loading}
      />


    </form>
  );
}