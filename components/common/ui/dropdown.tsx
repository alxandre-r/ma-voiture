'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';

import { cn } from '../../../lib/utils/utils';

import Icon from './Icon';

/* ---------------- DROPDOWN ---------------- */
interface DropdownProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  search?: boolean;
  selectedItems?: string[];
}

export const Dropdown = ({ label, children, className, search, selectedItems }: DropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [focusIndex, setFocusIndex] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  /* Click outside */
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = itemsRef.current.length;
    if (!count) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (focusIndex + 1) % count;
      setFocusIndex(next);
      itemsRef.current[next]?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (focusIndex - 1 + count) % count;
      setFocusIndex(prev);
      itemsRef.current[prev]?.focus();
    }
    if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      itemsRef.current[focusIndex]?.click();
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  /* Filter children if search is active */
  const filteredChildren = React.Children.toArray(children).filter((child) => {
    if (!search || !query) return true;
    if (!React.isValidElement(child)) return true;
    const childElement = child as React.ReactElement<{ label?: string }>;
    if (!childElement.props?.label) return true;
    return childElement.props.label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div ref={ref} className={cn('relative w-full sm:w-auto', className)} onKeyDown={handleKeyDown}>
      <button
        onClick={toggle}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-w-[180px]',
        )}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {selectedItems && selectedItems.length > 0 ? (
            selectedItems.map((s) => (
              <span
                key={s}
                className="bg-custom-1/20 dark:bg-custom-1/30 px-2 py-0.5 rounded-full text-xs"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="truncate text-sm">{label}</span>
          )}
        </div>
        <Icon
          name="arrow-down"
          size={14}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {search && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {React.Children.map(filteredChildren, (child, index) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, {
                      ref: (el: HTMLButtonElement) => (itemsRef.current[index] = el),
                      key: child.key || index,
                    })
                  : child,
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

/* ---------------- DROPDOWN ITEM ---------------- */
interface DropdownItemProps {
  label: string;
  checked?: boolean;
  onClick: () => void;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ label, checked, onClick }, ref) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer',
        checked ? 'bg-custom-1/10' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
      )}
    >
      <span
        className={cn(
          'w-3 h-3 rounded border flex items-center justify-center',
          checked ? 'bg-custom-1 border-custom-1' : 'border-gray-400',
        )}
      >
        <Icon name="check" size={10} className={checked ? 'text-white opacity-100' : 'opacity-0'} />
      </span>
      <span className="truncate">{label}</span>
    </button>
  ),
);
DropdownItem.displayName = 'DropdownItem';

/* ---------------- SEPARATOR ---------------- */
export const DropdownSeparator = () => (
  <div className="border-t border-gray-200 dark:border-gray-700" />
);
DropdownSeparator.displayName = 'DropdownSeparator';
