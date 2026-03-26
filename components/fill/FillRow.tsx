'use client';

import { useEffect, useRef, useState } from 'react';

import Icon from '@/components/common/ui/Icon';
import FillEditForm from '@/components/fill/forms/FillEditForm';

import type { Fill, FillFormData } from '@/types/fill';

export interface FillRowProps {
  fill: Fill;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting: boolean;
  showVehicleName?: boolean;
  isEditing?: boolean;
  editData?: FillFormData;
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
  const [notesOpen, setNotesOpen] = useState(false);

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
   * DROPDOWN MENU COMPONENT
   */
  const ActionMenu = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      function handlePointerDown(event: PointerEvent) {
        if (!menuRef.current) return;
        if (!menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      }
      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    if (isReadOnly || (!onEdit && !onDelete)) return null;

    return (
      <div ref={menuRef} className="relative flex justify-end w-12 min-w-[32px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="p-2 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Icon name="more-vertical" size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-44 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl z-50 py-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Icon name="edit" size={16} /> Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                disabled={isDeleting}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Icon name="delete" size={16} /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * DISPLAY MODE
   */
  return (
    <div className="bg-white dark:bg-gray-900 px-2 sm:px-4 py-4 border-b border-gray-100 dark:border-gray-700">
      {/* Flex container with justify-between and minimal gaps */}
      <div className="flex items-center justify-between gap-1">
        {/* Left items */}
        <div className="flex w-full items-center gap-1">
          {/* DATE */}
          <div className="w-2/12 text-sm md:text-base font-semibold truncate">
            {formatDate(fill.date)}
          </div>

          {/* VEHICLE / Type indicator */}
          <div className="w-3/12 md:w-2/12 text-sm truncate text-gray-600 dark:text-gray-300 lg:text-gray-700">
            <span className="flex items-center gap-1">
              {fill.charge_type === 'charge' ? (
                <Icon name="elec" size={14} />
              ) : (
                <Icon name="conso" size={14} />
              )}
              {fill.vehicle_name ?? fill.vehicle_id}
            </span>
          </div>

          {/* AMOUNT */}
          <div className="w-2/12 md:w-1/12 text-sm font-bold text-custom-1 text-right md:text-center">
            {formatCurrency(fill.amount)}
          </div>

          {/* ODOMETER */}
          <div className="w-3/12 md:w-1/12 text-sm text-gray-500 text-right md:text-center">
            {fill.odometer ? `${fill.odometer} km` : 'N/A'}
          </div>

          <div className="w-4/12 hidden lg:flex items-center px-2 py-1 text-sm truncate">
            {/* NOTES (desktop only, optional) */}
            {fill.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 py-1 px-2">
                <span className="font-medium text-gray-900 dark:text-white mr-1">Notes:</span>
                <span className="truncate">{fill.notes}</span>
              </div>
            )}
          </div>

          {/* mobile notes toggle */}
          <div className="w-1/12 flex items-center gap-2">
            {fill.notes && (
              <button
                className="lg:hidden p-2 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setNotesOpen((prev) => !prev)}
              >
                <Icon name={notesOpen ? 'arrow-up' : 'arrow-down'} size={18} />
              </button>
            )}
          </div>

          {/* Action menu dropdown */}
          <div className="w-1/12 flex justify-end">
            <ActionMenu />
          </div>
        </div>
      </div>

      {/* Mobile notes section */}
      {fill.notes && notesOpen && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 text-sm lg:hidden">
          <p className="font-medium text-gray-900 dark:text-white mb-1 mr-2">Notes:</p>
          {fill.notes}
        </div>
      )}
    </div>
  );

  /**
   * HELPER FUNCTIONS
   */
  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        });
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  function formatCurrency(value?: number | null) {
    return value == null ? 'N/A' : `${value.toFixed(2)} €`;
  }
}
