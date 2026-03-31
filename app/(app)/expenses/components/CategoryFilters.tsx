'use client';

import Icon from '@/components/common/ui/Icon';

import { CATEGORY_DEFS } from './expenseListUtils';

interface CategoryFiltersProps {
  activeCategories: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
  counts: Record<string, number>;
  totalCount: number;
  mobile?: boolean;
}

export default function CategoryFilters({
  activeCategories,
  onToggle,
  onReset,
  counts,
  totalCount,
  mobile = false,
}: CategoryFiltersProps) {
  const base = mobile
    ? 'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer'
    : 'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer';

  const inactive =
    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700';
  const allActive = 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent';

  return (
    <div className={mobile ? 'flex flex-wrap gap-2' : 'space-y-1'}>
      <button
        onClick={onReset}
        className={`${base} ${activeCategories.length === 0 ? allActive : inactive}`}
      >
        <Icon
          name="stack"
          size={mobile ? 12 : 14}
          className={`${activeCategories.length === 0 ? 'invert' : ''}`}
        />
        <span>Toutes</span>
        {!mobile && <span className="ml-auto text-xs opacity-50 font-normal">{totalCount}</span>}
      </button>

      {CATEGORY_DEFS.map((cat) => {
        const isActive = activeCategories.includes(cat.key);
        return (
          <button
            key={cat.key}
            onClick={() => onToggle(cat.key)}
            className={`${base} ${isActive ? cat.activeClass : inactive}`}
          >
            <Icon name={cat.icon} size={mobile ? 12 : 14} />
            <span>{cat.label}</span>
            {!mobile && (
              <span className="ml-auto text-xs opacity-50 font-normal">{counts[cat.key] ?? 0}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
