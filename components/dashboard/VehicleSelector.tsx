'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { VehicleMinimal } from '@/types/vehicle';

interface VehicleSelectorProps {
  vehicles: VehicleMinimal[];
  value: number[];
  onChange: (vehicleIds: number[]) => void;
  disabled?: boolean;
}

export default function VehicleSelector({
  vehicles,
  value,
  onChange,
  disabled = false,
}: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleVehicle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const toggleAll = () => {
    if (value.length === vehicles.length) {
      onChange([]);
    } else {
      onChange(vehicles.map(v => v.vehicle_id));
    }
  };

  const label = () => {
    if (value.length === 0) return 'Sélectionnez un ou plusieurs véhicules';
    if (value.length === vehicles.length) return 'Tous les véhicules';
    if (value.length === 1) {
      const v = vehicles.find(v => v.vehicle_id === value[0]);
      return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
    }
    return `${value.length} véhicules sélectionnés`;
  };

  return (
    <div ref={ref} className="relative w-full sm:w-[360px]">
      {/* Trigger */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.98 }}
        className="
          flex items-center justify-between w-full
          px-4 py-3 rounded-full border
          bg-white dark:bg-gray-800
          border-gray-200 dark:border-gray-700
          shadow-sm dark:shadow-xl
          hover:shadow-md dark:hover:shadow-xl
          transition-all hover:cursor-pointer
        "
      >
        <span
          className={`truncate ${
            value.length === 0
              ? 'text-gray-400 dark:text-gray-500'
              : 'font-medium text-gray-900 dark:text-gray-100'
          }`}
        >
          {label()}
        </span>

        <Icon
          name="arrow-down"
          size={16}
          className={`ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="
              absolute z-50 mt-2 w-full
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg overflow-hidden
            "
          >
            {/* Tous */}
            <DropdownItem
              label="Tous les véhicules"
              checked={value.length === vehicles.length && vehicles.length > 0}
              onClick={toggleAll}
            />

            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            <div className="max-h-64 overflow-y-auto">
              {vehicles.map(v => (
                <DropdownItem
                  key={v.vehicle_id}
                  label={v.name || `${v.make} ${v.model}`}
                  checked={value.includes(v.vehicle_id)}
                  onClick={() => toggleVehicle(v.vehicle_id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Item ---------------- */

function DropdownItem({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      layout
      className={`
        flex items-center gap-3 w-full
        px-4 py-2 text-left
        rounded-lg
        hover:cursor-pointer
        transition-all
        ${checked ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
      `}
    >
      {/* Checkbox visuelle */}
      <span
        className={`
          w-4 h-4 rounded border flex items-center justify-center
          ${checked
            ? 'bg-custom-1 border-custom-1'
            : 'border-gray-400 dark:border-gray-500'}
        `}
      >
        <Icon
          name="check"
          size={12}
          className={`text-white invert dark:invert-0 transition-opacity ${
            checked ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </span>

      <span
        className={`truncate ${
          checked ? 'font-medium text-gray-900 dark:text-gray-100' : ''
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}