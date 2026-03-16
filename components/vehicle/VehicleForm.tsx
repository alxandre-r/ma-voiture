'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import { FormField, FormInput, FormSelect } from '@/components/common/ui/form';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';
import { useNotifications } from '@/contexts/NotificationContext';

import VehicleImageModal from './VehicleImageModal';

import type { Vehicle } from '@/types/vehicle';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSave: (vehicle: Partial<Vehicle>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VehicleForm({
  vehicle,
  onSave,
  onCancel,
  isLoading: externalLoading,
}: VehicleFormProps) {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    vin: '',
    // Status
    status: 'active' as 'active' | 'inactive',
    // Technical
    fuel_type: 'Essence',
    transmission: 'Manuelle' as 'Manuelle' | 'Automatique',
    odometer: 0,
    // Image
    image: '',
    color: '#f97316',
    // Dates - insurance
    insurance_start_date: '',
    insurance_monthly_cost: undefined as number | undefined,
    // Other dates
    tech_control_expiry: '',
    purchase_date: '',
    // Finance
    financing_mode: 'owned' as 'owned' | 'lld' | 'loa',
    purchase_price: undefined as number | undefined,
  });

  // Initialize form with existing vehicle data
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        plate: vehicle.plate || '',
        vin: vehicle.vin || '',
        status: vehicle.status || 'active',
        fuel_type: vehicle.fuel_type || 'Essence',
        transmission: vehicle.transmission || 'Manuelle',
        odometer: vehicle.odometer || 0,
        image: vehicle.image || '',
        color: vehicle.color || '#f97316',
        insurance_start_date: vehicle.insurance_start_date || '',
        insurance_monthly_cost: vehicle.insurance_monthly_cost || undefined,
        tech_control_expiry: vehicle.tech_control_expiry || '',
        purchase_date: vehicle.purchase_date || '',
        financing_mode: vehicle.financing_mode || 'owned',
        purchase_price: vehicle.purchase_price || undefined,
      });
    }
  }, [vehicle]);

  // Check if vehicle is electric or hybrid (both should have automatic transmission)
  const isElectricOrHybrid =
    formData.fuel_type === 'Électrique' || formData.fuel_type === 'Hybride';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Auto-uppercase for plate and VIN
    const processedValue =
      name === 'plate' || name === 'vin'
        ? value.toUpperCase()
        : name === 'year' || name === 'odometer' || name === 'purchase_price'
          ? value
            ? Number(value)
            : undefined
          : value;

    // If fuel_type changes to Électrique or Hybride, automatically set transmission to Automatique
    if (name === 'fuel_type' && (value === 'Électrique' || value === 'Hybride')) {
      setFormData((prev) => ({
        ...prev,
        fuel_type: value,
        transmission: 'Automatique',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleImageSave = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make.trim() || !formData.model.trim()) {
      showError('La marque et le modèle sont requis');
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        ...formData,
        vehicle_id: vehicle?.vehicle_id,
      };
      onSave(vehicleData);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition items-center flex cursor-pointer 
            bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Icon name="arrow-back" size={18} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {vehicle ? `Modification du véhicule ${vehicle.name}` : 'Ajouter un véhicule'}
          </h2>
        </div>
        <button
          type="submit"
          form="vehicle-form"
          disabled={isLoading}
          className="px-6 py-2 rounded-lg bg-custom-2 hover:bg-custom-2-hover text-white transition disabled:opacity-50 cursor-pointer flex items-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Enregistrement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Icon name="check" size={18} className="invert dark:invert-0" />
              Enregistrer
            </span>
          )}
        </button>
      </div>

      <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
        {/* All cards in single grid - Apparence & Statut 1/2 width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Apparence & Statut Card */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="stack" size={18} /> Apparence & Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Image */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="w-full h-full min-h-[80px] rounded-md overflow-hidden border 
                    border-gray-200 bg-gray-100 hover:bg-gray-200 
                    dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600
                    transition flex items-center justify-center cursor-pointer relative"
                  >
                    {formData.image ? (
                      <>
                        <Image
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          fill
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white/50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 text-center py-1">
                          Cliquez pour changer
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Icon name="add" size={36} />
                        <span className="text-xs mt-2">Ajouter une image</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Status & Color */}
                <div className="flex flex-col space-y-3">
                  {/* Toggle Slider */}
                  <div
                    className="relative w-full h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full border border-gray-200 
                  dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 overflow-hidden p-1"
                  >
                    {/* Sliding background */}
                    <motion.div
                      className="absolute top-1 bottom-1 w-1/2 rounded-full shadow-md"
                      initial={false}
                      animate={{
                        left: formData.status === 'active' ? '4px' : 'calc(50% + 0px)',
                        backgroundColor: formData.status === 'active' ? '#10b981' : '#6b7280',
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />

                    {/* Labels */}
                    <div className="relative flex h-full">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                        className={`flex-1 text-xs font-bold uppercase tracking-wider transition-colors z-10 cursor-pointer
                          ${
                            formData.status === 'active'
                              ? 'text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                      >
                        Actif
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: 'inactive' }))}
                        className={`flex-1 text-xs font-bold uppercase tracking-wider transition-colors z-10 cursor-pointer
                          ${
                            formData.status === 'inactive'
                              ? 'text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                      >
                        Inactif
                      </button>
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                      Couleur
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="color"
                        value={formData.color || '#f97316'}
                        onChange={handleChange}
                        className="h-8 w-10 cursor-pointer rounded-md border border-gray-200 p-1 bg-white dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-xs text-gray-500 font-mono uppercase">
                        {formData.color || '#f97316'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Informations Générales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="settings" size={18} className="text-gray-500" /> Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField label="Nom du véhicule" hint="Facultatif - ex: Clio daily">
                  <FormInput
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Clio daily"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Marque" required>
                    <FormInput
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      placeholder="Ex: Renault"
                      required
                    />
                  </FormField>
                  <FormField label="Modèle" required>
                    <FormInput
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Ex: Clio V"
                      required
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Année">
                    <FormInput
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      min={1900}
                      max={new Date().getFullYear() + 1}
                    />
                  </FormField>
                  <FormField label="Immatriculation">
                    <FormInput
                      name="plate"
                      value={formData.plate}
                      onChange={handleChange}
                      placeholder="Ex: AB-123-CD"
                    />
                  </FormField>
                </div>
                <FormField label="Numéro de série (VIN)">
                  <FormInput
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    placeholder="Ex: W0L0XCF6844000000"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Technique & Performances */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="tool" size={18} className="text-gray-500" /> Technique & Performances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Type de carburant" required>
                  <FormSelect
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybride non rechargeable">Hybride non rechargeable</option>
                    <option value="Hybride rechargeable">Hybride rechargeable</option>
                    <option value="Électrique">Électrique</option>
                  </FormSelect>
                </FormField>
                <FormField label="Transmission" required>
                  <FormSelect
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    disabled={isElectricOrHybrid}
                    required
                  >
                    <option value="Automatique">Automatique</option>
                    {!isElectricOrHybrid && <option value="Manuelle">Manuelle</option>}
                  </FormSelect>
                </FormField>
              </div>
              <FormField label="Kilométrage (km)" required>
                <FormInput
                  type="number"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Assurance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="secure" size={18} className="text-gray-500" /> Assurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Début de validité" required>
                  <FormInput
                    type="date"
                    name="insurance_start_date"
                    value={formData.insurance_start_date}
                    onChange={handleChange}
                    required
                  />
                </FormField>
                <FormField label="Coût mensuel (€)">
                  <FormInput
                    type="number"
                    name="insurance_monthly_cost"
                    value={formData.insurance_monthly_cost || ''}
                    onChange={handleChange}
                    placeholder="Ex: 50"
                    min={0}
                    step="0.01"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Contrôle Technique */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="settings" size={18} className="text-gray-500" /> Contrôle technique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Date d'expiration" required>
                <FormInput
                  type="date"
                  name="tech_control_expiry"
                  value={formData.tech_control_expiry}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Achat & Finance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="euro" size={18} className="text-gray-500" /> Achat & Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Mode de financement" required>
                  <FormSelect
                    name="financing_mode"
                    value={formData.financing_mode}
                    onChange={handleChange}
                    required
                  >
                    <option value="owned">Propriétaire</option>
                    <option value="lld">LLD</option>
                    <option value="loa">LOA</option>
                  </FormSelect>
                </FormField>
                <FormField label="Date d'achat" required>
                  <FormInput
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </div>
              <FormField label="Prix d'achat (€)" required>
                <FormInput
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price || ''}
                  onChange={handleChange}
                  placeholder="Ex: 15000"
                  min={0}
                  step="0.01"
                  required
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Vehicle Image Modal */}
      <VehicleImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={formData.image}
        onSave={handleImageSave}
        onRemove={handleImageRemove}
        showNotification={(msg, type) => {
          if (type === 'error') showError(msg);
          else showSuccess(msg);
        }}
      />
    </div>
  );
}
