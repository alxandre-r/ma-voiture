'use client';

import Icon from '@/components/common/ui/Icon';

import type { Fill } from '@/types/fill';

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
  const v = <T,>(key: keyof Fill): T => (editData[key as keyof Fill] as T) ?? (fill[key] as T);

  const currentType = v<Fill['charge_type']>('charge_type');

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-4 rounded-lg border border-custom-1/40 dark:border-custom-1-dark/40 space-y-4">
      {/* Type indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={
            currentType === 'charge'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-orange-600 dark:text-orange-400'
          }
        >
          {currentType === 'charge' ? (
            <>
              <Icon name="elec" size={14} className="inline mr-1" /> Recharge électrique
            </>
          ) : (
            <>
              <Icon name="conso" size={14} className="inline mr-1" /> Plein de carburant
            </>
          )}
        </span>
      </div>

      {/* Main form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Date */}
        <div className="lg:col-span-3 space-y-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input
            type="date"
            value={v<string>('date')}
            onChange={(e) => onChangeField('date', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Amount */}
        <div className="lg:col-span-2 space-y-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Montant (€)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={v<number>('amount') ?? ''}
              onChange={(e) =>
                onChangeField(
                  'amount',
                  e.target.value === '' ? null : parseFloat(e.target.value.replace(',', '.')),
                )
              }
              className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
          </div>
        </div>

        {/* Odometer */}
        <div className="lg:col-span-2 space-y-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Kilométrage</label>
          <div className="relative">
            <input
              type="number"
              value={v<number>('odometer') ?? ''}
              onChange={(e) =>
                onChangeField(
                  'odometer',
                  e.target.value === '' ? null : parseFloat(e.target.value.replace(',', '.')),
                )
              }
              placeholder="0"
              className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              km
            </span>
          </div>
        </div>

        {/* Litres (if fuel) */}
        {currentType === 'fill' && (
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">Litres</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={v<number>('liters') ?? ''}
                onChange={(e) =>
                  onChangeField(
                    'liters',
                    e.target.value === '' ? null : parseFloat(e.target.value.replace(',', '.')),
                  )
                }
                placeholder="0.00"
                className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                L
              </span>
            </div>
          </div>
        )}

        {/* Price per liter (if fuel) */}
        {currentType === 'fill' && (
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">Prix/Litre</label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                value={v<number>('price_per_liter') ?? ''}
                onChange={(e) =>
                  onChangeField(
                    'price_per_liter',
                    e.target.value === '' ? null : parseFloat(e.target.value.replace(',', '.')),
                  )
                }
                placeholder="0.000"
                className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                €/L
              </span>
            </div>
          </div>
        )}

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
            <Icon name="check" className="invert dark:invert-0" size={14} />
            {saving ? 'Sauvegarde...' : 'Valider'}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">Notes</label>
        <textarea
          value={v<string>('notes') ?? ''}
          onChange={(e) => onChangeField('notes', e.target.value)}
          placeholder="📝 Notes..."
          rows={2}
          className="w-full text-sm bg-gray-50 dark:bg-gray-700 rounded p-2 resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
