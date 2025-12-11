/**
 * @file components/fill/FillEditForm.tsx
 * @fileoverview Inline edit form for fuel fill-up records.
 * 
 * This component provides an inline editing interface for modifying
 * existing fill-up records.
 */

'use client';

import { Fill } from '@/types/fill';

interface FillEditFormProps {
  fill: Fill;
  editData: Partial<Fill>;
  onChangeField: (key: string, value: unknown) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  saving: boolean;
}

/**
 * FillEditForm Component
 * 
 * Inline form for editing existing fill-up records.
 */
export default function FillEditForm({
  fill,
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving,
}: FillEditFormProps) {
  /**
   * Handle field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      onChangeField(name, checkbox.checked);
    } else {
      onChangeField(name, value);
    }
  };

  /**
   * Calculate price per liter automatically
   */
  const calculatePricePerLiter = () => {
    const liters = editData.liters || fill.liters || 0;
    const amount = editData.amount || fill.amount || 0;
    
    if (liters > 0 && amount > 0) {
      const pricePerLiter = amount / liters;
      onChangeField('price_per_liter', pricePerLiter.toFixed(3));
    }
  };

  return (
    <div className="space-y-3">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={editData.date || fill.date}
          onChange={handleChange}
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
          value={editData.odometer || fill.odometer || ''}
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
          value={editData.liters || fill.liters || ''}
          onChange={(e) => {
            handleChange(e);
            calculatePricePerLiter();
          }}
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
          value={editData.amount || fill.amount || ''}
          onChange={(e) => {
            handleChange(e);
            calculatePricePerLiter();
          }}
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
          value={editData.price_per_liter || fill.price_per_liter || ''}
          onChange={handleChange}
          readOnly
          className="w-full bg-white/10 text-white px-3 py-2 rounded outline-none cursor-not-allowed"
        />
      </div>

      {/* Full Tank Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_full"
          id="is_full"
          checked={editData.is_full !== undefined ? editData.is_full : fill.is_full}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="is_full" className="text-sm">Plein complet</label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          placeholder="Notes supplémentaires"
          value={editData.notes || fill.notes || ''}
          onChange={handleChange}
          rows={3}
          className="w-full bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500 resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancelEdit}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        
        <button
          type="button"
          onClick={onSaveEdit}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}