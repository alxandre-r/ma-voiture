'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import { FormField, FormInput, FormDate } from '@/components/common/ui/form';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';
import { useMaintenanceForm } from '@/hooks/maintenance/useMaintenanceForm';
import { MAINTENANCE_TYPES } from '@/types/maintenance';

import type { MaintenanceFormData } from '@/hooks/maintenance/useMaintenanceActions';
import type { Expense } from '@/types/expense';
import type { VehicleMinimal } from '@/types/vehicle';

const SELECT_CLASS =
  'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 ' +
  'px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
  'hover:border-gray-400 dark:hover:border-gray-600 transition-colors';

interface MaintenanceFormProps {
  initialExpense?: Expense | null;
  vehicles: VehicleMinimal[];
  onSave: (data: MaintenanceFormData, expenseId?: number) => Promise<boolean>;
  onCancel: () => void;
  saving?: boolean;
}

export default function MaintenanceForm({
  initialExpense,
  vehicles,
  onSave,
  onCancel,
  saving = false,
}: MaintenanceFormProps) {
  const isEditing = !!initialExpense;
  const { formData, handleChange } = useMaintenanceForm(vehicles, initialExpense);

  const getVehicleName = (id: number) => {
    const v = vehicles.find((v) => v.vehicle_id === id);
    return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, initialExpense?.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 md:max-w-3xl mx-auto md:mx-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition flex items-center cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-slate-700"
        >
          <Icon name="arrow-back" size={18} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">
          {isEditing ? "Modifier l'intervention" : 'Ajouter une intervention'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Véhicule */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                <Icon name="car" size={16} className="inline mr-2 text-slate-500" />
                Véhicule <span className="text-red-500">*</span>
              </label>
              {vehicles.length === 1 ? (
                <input
                  readOnly
                  value={getVehicleName(vehicles[0].vehicle_id)}
                  className={`${SELECT_CLASS} bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed`}
                />
              ) : (
                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  required
                  className={SELECT_CLASS}
                >
                  <option value="">Sélectionnez un véhicule</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>
                      {v.name || `${v.make} ${v.model}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Type d'entretien & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  <Icon name="tool" size={16} className="inline mr-2 text-slate-500" />
                  Type d&apos;entretien <span className="text-red-500">*</span>
                </label>
                <select
                  name="maintenance_type"
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  required
                  className={SELECT_CLASS}
                >
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <FormField label="Date de l'intervention" icon="calendar">
                <FormDate name="date" value={formData.date} onChange={handleChange} required />
              </FormField>
            </div>

            {/* Kilométrage & Montant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Kilométrage" icon="chart">
                <FormInput
                  type="number"
                  name="odometer"
                  value={formData.odometer || ''}
                  onChange={handleChange}
                  placeholder="Kilométrage actuel"
                />
              </FormField>

              <FormField label="Montant" icon="euro">
                <FormInput
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  placeholder="Coût de l'intervention"
                  step="0.01"
                />
              </FormField>
            </div>

            {/* Garage */}
            <FormField label="Garage" icon="garage">
              <FormInput
                type="text"
                name="garage"
                value={formData.garage || ''}
                onChange={handleChange}
                placeholder="Nom du garage ou de l'intervenant"
              />
            </FormField>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                <Icon name="notes" size={16} className="inline mr-2 text-slate-500" />
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Détails supplémentaires sur l'intervention..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              />
            </div>

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
                    <Spinner color="white" /> Enregistrement...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name="check" size={18} className="invert" /> Enregistrer
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
