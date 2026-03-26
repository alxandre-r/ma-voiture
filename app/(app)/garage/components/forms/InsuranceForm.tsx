'use client';

import { FormDate, FormField, FormInput } from '@/components/common/ui/form';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';

import type { InsuranceContract, InsuranceFormData } from '@/types/insurance';

interface InsuranceFormProps {
  initialContract?: InsuranceContract | null;
  onSave: (data: InsuranceFormData) => Promise<boolean>;
  onCancel: () => void;
  saving?: boolean;
  /** Show the end_date field (used when editing a historical contract) */
  showEndDate?: boolean;
  /** Custom label for the start_date field */
  labelStartDate?: string;
  /** Override the default start date (e.g. day after previous contract ended) */
  defaultStartDate?: string;
  /** Pre-fill provider without pre-filling monthly_cost (used for rate change) */
  defaultProvider?: string;
  /** Override the submit button label */
  submitLabel?: string;
}

export default function InsuranceForm({
  initialContract,
  onSave,
  onCancel,
  saving = false,
  showEndDate = false,
  labelStartDate = 'Date de début',
  defaultStartDate: defaultStartDateProp,
  defaultProvider,
  submitLabel,
}: InsuranceFormProps) {
  const defaultStartDate =
    defaultStartDateProp ??
    (initialContract?.start_date
      ? new Date(initialContract.start_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]);

  const defaultEndDate = initialContract?.end_date
    ? new Date(initialContract.end_date).toISOString().split('T')[0]
    : '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: InsuranceFormData = {
      provider: (fd.get('provider') as string) || '',
      monthly_cost: Number(fd.get('monthly_cost')),
      start_date: fd.get('start_date') as string,
      end_date: (fd.get('end_date') as string) || '',
    };
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Assureur">
        <FormInput
          name="provider"
          type="text"
          defaultValue={defaultProvider ?? initialContract?.provider ?? ''}
          placeholder="Ex : MAIF, Groupama, AXA…"
        />
      </FormField>

      <FormField label="Coût mensuel (€)" required>
        <FormInput
          name="monthly_cost"
          type="number"
          defaultValue={initialContract?.monthly_cost ?? ''}
          placeholder="Ex : 65"
          min={0}
          step="0.01"
          required
        />
      </FormField>

      <FormField label={labelStartDate} required>
        <FormDate name="start_date" defaultValue={defaultStartDate} required />
      </FormField>

      {showEndDate && (
        <FormField label="Date de fin">
          <FormDate name="end_date" defaultValue={defaultEndDate} />
        </FormField>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-custom-2 hover:bg-custom-2-hover text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {saving ? (
            <>
              <Spinner color="white" /> Enregistrement...
            </>
          ) : (
            <>
              <Icon name="check" size={16} className="invert dark:invert-0" />
              {submitLabel ?? (initialContract ? 'Enregistrer' : 'Ajouter')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
