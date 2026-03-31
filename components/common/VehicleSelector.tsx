'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

import Icon from '@/components/common/ui/Icon';
import { useSelectors } from '@/contexts/SelectorsContext';
import { useUser } from '@/contexts/UserContext';

interface VehicleSelectorProps {
  value: number[];
  onChange: (vehicleIds: number[]) => void;
  disabled?: boolean;
}

export default function VehicleSelector({
  value,
  onChange,
  disabled = false,
}: VehicleSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { vehicles } = useSelectors();
  const user = useUser();

  const hasOnlyOneVehicle = vehicles.length === 1;

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
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const toggleAll = () => {
    if (value.length === vehicles.length) {
      onChange([]);
    } else {
      onChange(vehicles.map((v) => v.vehicle_id));
    }
  };

  const vehicleName = (id: number) => {
    const v = vehicles.find((v) => v.vehicle_id === id);
    return v ? v.name || `${v.make} ${v.model}` : 'Véhicule';
  };

  const label = () => {
    if (value.length === 0) return 'Aucun véhicule';
    if (value.length === vehicles.length) return 'Tous les véhicules';

    const selectedVehicles = vehicles.filter((v) => value.includes(v.vehicle_id));
    const allPersonal = selectedVehicles.every((v) => v.owner_id === user.id);
    const allFamily = selectedVehicles.every((v) => v.owner_id !== user.id);

    if (value.length === 1) return vehicleName(value[0]);
    if (allFamily) return 'Véhicules de la famille';
    if (allPersonal) return 'Vos véhicules';
    return `${value.length} véhicules sélectionnés`;
  };

  const handleToggle = () => {
    // Don't open dropdown if only one vehicle
    if (!hasOnlyOneVehicle && !disabled) {
      setOpen((o) => !o);
    }
  };

  return (
    <div ref={ref} className="vehicleSelector-Button relative w-full sm:w-[360px]">
      {/* Trigger */}
      <motion.button
        type="button"
        disabled={disabled || hasOnlyOneVehicle}
        onClick={handleToggle}
        className={`outer-button p-0.5
          bg-gradient-to-r from-orange-400/70 to-custom-2
          flex items-center justify-between w-full
          rounded-xl sm:min-w-[180px] min-w-[120px] 
          transition-all
          ${hasOnlyOneVehicle || disabled ? 'cursor-default' : 'hover:cursor-pointer active:scale-96'}
        `}
      >
        <div
          className={`inner-button bg-white dark:bg-gray-800
          flex items-center justify-between w-full
          px-4 py-3 rounded-[calc(1rem-6px)]
        `}
        >
          <span className={`truncate text-xs font-medium text-gray-900 dark:text-gray-100`}>
            {label()}
          </span>

          {!hasOnlyOneVehicle && !disabled && (
            <Icon
              name="arrow-down"
              size={16}
              className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
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
              {vehicles.map((v) => (
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
        rounded-xl
        hover:cursor-pointer
        transition-all
        ${checked ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
      `}
    >
      {/* Checkbox visuelle */}
      <span
        className={`
          w-4 h-4 rounded border flex items-center justify-center
          ${checked ? 'bg-custom-1 border-custom-1' : 'border-gray-400 dark:border-gray-500'}
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

      <span className={`truncate ${checked ? 'font-medium text-gray-900 dark:text-gray-100' : ''}`}>
        {label}
      </span>
    </motion.button>
  );
}
