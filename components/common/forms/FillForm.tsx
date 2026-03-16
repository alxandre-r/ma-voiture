'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import { FormField, FormInput, FormSelect, FormTextArea } from '@/components/common/ui/form';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';
import { useFillForm } from '@/hooks/fill/useFillForm';

import type { Fill, FillFormData } from '@/types/fill';
import type { VehicleMinimal } from '@/types/vehicle';

interface FillFormProps {
  initialFill?: Fill | null;
  vehicles: VehicleMinimal[];
  preselectedVehicleId?: number;
  forcedType?: 'fill' | 'charge';
  onSave: (data: FillFormData, fillId?: number) => Promise<boolean>;
  onCancel: () => void;
  saving?: boolean;
}

export default function FillForm({
  initialFill,
  vehicles,
  preselectedVehicleId,
  forcedType,
  onSave,
  onCancel,
  saving = false,
}: FillFormProps) {
  const isEditing = !!initialFill;

  const { formData, handleChange, allowedTypes, canChangeChargeType, isElectric } = useFillForm(
    vehicles,
    initialFill,
    preselectedVehicleId,
    forcedType,
  );

  const getVehicleName = (id: number) => {
    const v = vehicles.find((v) => v.vehicle_id === id);
    return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
  };

  const title = `${isEditing ? 'Modifier' : 'Ajouter'} ${isElectric ? 'une recharge' : 'un plein'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, initialFill?.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 md:max-w-3xl mx-auto md:mx-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition flex items-center cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <Icon name="arrow-back" size={18} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Véhicule */}
            <FormField label="Véhicule" icon="car" required>
              {vehicles.length === 1 ? (
                <FormInput
                  readOnly
                  value={getVehicleName(vehicles[0].vehicle_id)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                />
              ) : (
                <FormSelect
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un véhicule</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>
                      {v.name || `${v.make} ${v.model}`}
                    </option>
                  ))}
                </FormSelect>
              )}
            </FormField>

            {/* Type d'opération */}
            {!forcedType && (
              <FormField label="Type d'opération">
                <FormSelect
                  name="charge_type"
                  value={formData.charge_type}
                  onChange={handleChange}
                  disabled={!canChangeChargeType && formData.vehicle_id !== 0}
                >
                  {allowedTypes.fill && <option value="fill">Plein de carburant</option>}
                  {allowedTypes.charge && <option value="charge">Recharge électrique</option>}
                </FormSelect>
              </FormField>
            )}

            {/* Date & Kilométrage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Date" icon="calendar" required>
                <FormInput
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <FormField label="Kilométrage" icon="chart">
                <FormInput
                  type="number"
                  name="odometer"
                  value={formData.odometer || ''}
                  onChange={handleChange}
                  placeholder="Kilométrage actuel"
                />
              </FormField>
            </div>

            {/* Montant */}
            <FormField label="Montant total (€)" icon="euro" required>
              <FormInput
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </FormField>

            {/* Champs selon type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isElectric ? (
                <>
                  <FormField label="Capacité (kWh)" required>
                    <FormInput
                      type="number"
                      step="0.01"
                      name="kwh"
                      value={formData.kwh || ''}
                      onChange={handleChange}
                      placeholder="Ex: 50"
                      required
                    />
                  </FormField>

                  <FormField label="Prix au kWh (€)" required>
                    <FormInput
                      type="number"
                      step="0.001"
                      name="price_per_kwh"
                      value={formData.price_per_kwh || ''}
                      onChange={handleChange}
                      placeholder="Ex: 0.25"
                      required
                    />
                  </FormField>
                </>
              ) : (
                <>
                  <FormField label="Litres" required>
                    <FormInput
                      type="number"
                      step="0.01"
                      name="liters"
                      value={formData.liters || ''}
                      onChange={handleChange}
                      placeholder="Ex: 45"
                      required
                    />
                  </FormField>

                  <FormField label="Prix au litre (€)" required>
                    <FormInput
                      type="number"
                      step="0.001"
                      name="price_per_liter"
                      value={formData.price_per_liter || ''}
                      onChange={handleChange}
                      placeholder="Ex: 1.65"
                      required
                    />
                  </FormField>
                </>
              )}
            </div>

            {/* Notes */}
            <FormField label="Notes" icon="notes">
              <FormTextArea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Détails supplémentaires..."
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-custom-2 hover:bg-custom-2-hover text-white transition disabled:opacity-50 cursor-pointer flex items-center"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner color="white" />
                    Enregistrement...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name="check" size={18} className="invert" />
                    Enregistrer
                  </span>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
