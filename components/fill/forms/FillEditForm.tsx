'use client';

import { Fill } from '@/types/fill';
import Icon from '@/components/ui/Icon';

export interface FillEditFormProps {
  fill: Fill;
  editData: Partial<Fill>;
  onChangeField: (key: string, value: unknown) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  saving: boolean;
}

export default function FillEditForm({
  fill,
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving,
}: FillEditFormProps) {

  const v = <T,>(key: keyof Fill): T =>
    (editData[key] as T) ?? (fill[key] as T);

  /* ---------- recalculs croisés ---------- */

  const updateFromLiters = (liters?: number) => {
    const amount = v<number>('amount');
    if (liters && amount && liters > 0) {
      onChangeField('price_per_liter', Number((amount / liters).toFixed(3)));
    }
  };

  const updateFromPrice = (price?: number) => {
    const amount = v<number>('amount');
    if (price && amount && price > 0) {
      onChangeField('liters', Number((amount / price).toFixed(2)));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-4 rounded-lg border border-custom-1/40 dark:border-custom-1-dark/40 space-y-4">

      {/* Ligne principale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">

        {/* Date + Odomètre */}
        <div className="lg:col-span-3 space-y-2">
          <input
            type="date"
            value={v<string>('date')}
            onChange={(e) => onChangeField('date', e.target.value)}
            className="w-full text-lg font-bold bg-transparent border-b-2 border-custom-1 focus:outline-none"
          />

          <div className="relative">
            <input
              type="number"
              value={v<number>('odometer') ?? ''}
              onChange={(e) =>
                onChangeField('odometer', e.target.value ? Number(e.target.value) : null)
              }
              className="w-full pr-10 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none"
              placeholder="Odomètre"
            />
            <span className="absolute right-2 bottom-1 text-sm text-gray-500">km</span>
          </div>
        </div>

        {/* Montant */}
        <div className="lg:col-span-2">
          <div className="text-xs text-gray-500 mb-1">Montant</div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={v<number>('amount') ?? ''}
              onChange={(e) =>
                onChangeField('amount', e.target.value ? Number(e.target.value) : null)
              }
              className="w-full pr-8 text-lg font-bold text-custom-1 dark:text-custom-1-dark bg-transparent border-b border-gray-300 focus:outline-none"
            />
            <span className="absolute right-2 bottom-1 text-sm text-gray-500">€</span>
          </div>
        </div>

        {/* Prix / L */}
        <div className="lg:col-span-2">
          <div className="text-xs text-gray-500 mb-1">Prix / L</div>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              value={v<number>('price_per_liter') ?? ''}
              onChange={(e) => {
                const price = Number(e.target.value);
                onChangeField('price_per_liter', price);
                updateFromPrice(price);
              }}
              className="w-full pr-8 bg-transparent border-b border-gray-300 focus:outline-none"
            />
            <span className="absolute right-2 bottom-1 text-sm text-gray-500">€/L</span>
          </div>
        </div>

        {/* Litres */}
        <div className="lg:col-span-2">
          <div className="text-xs text-gray-500 mb-1">Litres</div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={v<number>('liters') ?? ''}
              onChange={(e) => {
                const liters = Number(e.target.value);
                onChangeField('liters', liters);
                updateFromLiters(liters);
              }}
              className="w-full pr-8 bg-transparent border-b border-gray-300 focus:outline-none"
            />
            <span className="absolute right-2 bottom-1 text-sm text-gray-500">L</span>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-3 flex justify-end gap-2 pt-2">
          <button
            onClick={onCancelEdit}
            disabled={saving}
            className="px-3 py-2 rounded text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
          >
            Annuler
          </button>

          <button
            onClick={onSaveEdit}
            disabled={saving}
            className="px-4 py-2 rounded text-sm bg-custom-1 text-white hover:bg-custom-1/90 flex items-center gap-2 cursor-pointer"
          >
            <Icon name="check" className='invert dark:invert-0' size={14} />
            {saving ? 'Sauvegarde…' : 'Valider'}
          </button>
        </div>
      </div>

      {/* Notes */}
      <textarea
        value={v<string>('notes') ?? ''}
        onChange={(e) => onChangeField('notes', e.target.value)}
        placeholder="📝 Notes…"
        rows={2}
        className="w-full text-sm bg-gray-50 dark:bg-gray-700 rounded p-2 resize-none focus:outline-none"
      />
    </div>
  );
}