'use client';

import { Fill } from '@/types/fill';
import Icon from '@/components/ui/Icon';
import FillEditForm from '@/components/fill/forms/FillEditForm';

export interface FillRowProps {
  fill: Fill;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting: boolean;
  showVehicleName?: boolean;
  isEditing?: boolean;
  editData?: Partial<Fill>;
  onChangeField?: (key: string, value: unknown) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  saving?: boolean;
  isReadOnly?: boolean;
}

export default function FillRow({
  fill,
  onEdit,
  onDelete,
  isDeleting,
  isEditing = false,
  editData,
  onChangeField,
  onSaveEdit,
  onCancelEdit,
  saving = false,
  isReadOnly = false,
}: FillRowProps) {

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value?: number | null) =>
    value == null ? 'N/A' : `${value.toFixed(2)} €`;

  /**
   * EDIT MODE
   */
  if (isEditing && editData && onChangeField && onSaveEdit && onCancelEdit) {
    return (
      <FillEditForm
        fill={fill}
        editData={editData}
        onChangeField={onChangeField}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        saving={saving}
      />
    );
  }

  /**
   * DISPLAY MODE
   */
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">

        {/* Date + véhicule */}
        <div className="lg:col-span-2 flex justify-between items-start">
          <div>
            <div className="text-lg font-bold">{formatDate(fill.date)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {fill.vehicle_name ?? fill.vehicle_id}
            </div>
            <div className="text-sm text-gray-500">
              {fill.odometer ? `${fill.odometer} km` : 'Odomètre N/A'}
            </div>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex gap-2">
            {onEdit && !isReadOnly && (
              <button onClick={onEdit} disabled={isDeleting}>
                <Icon name="edit" size={16} />
              </button>
            )}
            {onDelete && !isReadOnly && (
              <button onClick={onDelete} disabled={isDeleting}>
                <Icon name="delete" size={16} className="invert dark:invert-0" />
              </button>
            )}
          </div>
        </div>

        {/* Montant */}
        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500">Montant</div>
          <div className="text-lg font-bold text-custom-1">
            {formatCurrency(fill.amount)}
          </div>
        </div>

        {/* Prix / L */}
        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500">Prix/L</div>
          <div>{formatCurrency(fill.price_per_liter)}</div>
        </div>

        {/* Litres */}
        <div className="hidden lg:block lg:col-span-1 text-center">
          <div className="text-xs text-gray-500">Litres</div>
          <div>{fill.liters ?? 'N/A'} L</div>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex lg:col-span-6 justify-end gap-2">
          {onEdit && !isReadOnly && (
            <button onClick={onEdit} disabled={isDeleting} className="rounded px-3 py-1 bg-gray-100 text-black text-sm hover:bg-gray-200
            dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 flex items-center gap-1 hover:cursor-pointer">
              <Icon name="edit" size={16} />
              Modifier
            </button>
          )}
          {onDelete && !isReadOnly && (
            <button onClick={onDelete} disabled={isDeleting} className="rounded px-3 py-1 bg-red-600 text-white text-sm 
            hover:bg-red-500 flex items-center gap-1 hover:bg-red-500 hover:cursor-pointer">
              <Icon name="delete" size={16} className="invert dark:invert-0" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Mobile stats */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mt-3 text-center">
        <div>
          <div className="text-xs text-gray-500">Montant</div>
          <div className="font-bold">{formatCurrency(fill.amount)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Prix/L</div>
          <div>{formatCurrency(fill.price_per_liter)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Litres</div>
          <div>{fill.liters ?? 'N/A'} L</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Odomètre</div>
          <div>{fill.odometer ?? 'N/A'} km</div>
        </div>
      </div>

      {/* Notes */}
      {fill.notes && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          📝 {fill.notes}
        </div>
      )}
    </div>
  );
}