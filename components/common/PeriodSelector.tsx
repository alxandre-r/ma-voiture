'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

import Icon from '@/components/common/ui/Icon';

import type { PeriodType } from '@/types/period';

const periodOptions: { label: string; value: string }[] = [
  { label: 'Ce mois', value: 'month' },
  { label: 'Cette année', value: 'year' },
  { label: 'Tout', value: 'all' },
];

// Get current label
const getCurrentLabel = (period: string) => {
  const opt = periodOptions.find((o) => o.value === period);
  return opt?.label || 'Cette année';
};

export default function PeriodSelector({
  selectedPeriod,
  setSelectedPeriod,
}: {
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="periodSelector-Button relative w-full sm:w-auto">
      {/* Trigger */}
      <motion.button
        className="outer-button p-0.5
            bg-gradient-to-r from-custom-1 to-indigo-500/70
          flex items-center justify-between w-full
          rounded-xl sm:min-w-[180px] min-w-[120px] 
          transition-all hover:cursor-pointer
          active:scale-96
        "
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="inner-button bg-white dark:bg-gray-800
          flex items-center justify-between w-full
          px-4 py-3 rounded-[calc(1rem-6px)]
        "
        >
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
            {getCurrentLabel(selectedPeriod)}
          </span>
          <Icon
            name="arrow-down"
            size={16}
            className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="
              absolute z-50 mt-2 right-0 w-full sm:w-40
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg overflow-hidden
            "
          >
            {periodOptions.map((opt) => (
              <PeriodDropdownItem
                key={opt.value}
                label={opt.label}
                isSelected={selectedPeriod === opt.value}
                onClick={() => {
                  setSelectedPeriod(opt.value as PeriodType);
                  setIsOpen(false);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Dropdown Item ---------------- */

function PeriodDropdownItem({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
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
        ${isSelected ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
      `}
    >
      <span
        className={`truncate ${isSelected ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}
      >
        {label}
      </span>
    </motion.button>
  );
}
