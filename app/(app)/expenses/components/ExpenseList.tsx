'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';

import { Card, CardContent } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import { useClickOutside } from '@/lib/utils/clickOutside';
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from '@/lib/utils/expensesUtils';
import { formatCurrency } from '@/lib/utils/format';
import { getVehicleName } from '@/lib/utils/vehicleUtils';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

// ---------------------------------------------------------------------------
// Category definitions (multi-select sidebar)
// ---------------------------------------------------------------------------

const CATEGORY_DEFS = [
  {
    key: 'energy',
    label: 'Énergie',
    icon: 'car',
    types: ['fuel', 'electric_charge'] as string[],
    activeClass:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  },
  {
    key: 'maintenance',
    label: 'Entretien',
    icon: 'tool',
    types: ['maintenance'] as string[],
    activeClass:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  },
  {
    key: 'insurance',
    label: 'Assurance',
    icon: 'secure',
    types: ['insurance'] as string[],
    activeClass:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  },
  {
    key: 'other',
    label: 'Autre',
    icon: 'stack',
    types: ['other'] as string[],
    activeClass:
      'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700',
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDescription(expense: Expense): string | null {
  if (expense.type === 'fuel' && expense.liters != null) {
    const parts = [`${expense.liters.toFixed(2)} L`];
    if (expense.price_per_liter) parts.push(`${expense.price_per_liter.toFixed(3)} €/L`);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ');
  }
  if (expense.type === 'electric_charge' && expense.kwh != null) {
    const parts = [`${expense.kwh.toFixed(2)} kWh`];
    if (expense.price_per_kwh) parts.push(`${expense.price_per_kwh.toFixed(3)} €/kWh`);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ');
  }
  if (expense.type === 'maintenance') {
    const parts: string[] = [];
    if (expense.maintenance_type_label) parts.push(expense.maintenance_type_label);
    if (expense.garage) parts.push(expense.garage);
    if (expense.odometer) parts.push(`${expense.odometer.toLocaleString('fr-FR')} km`);
    return parts.join(' · ') || null;
  }
  if (expense.type === 'insurance') return "Mensualité d'assurance";
  if (expense.type === 'other' && expense.label) return expense.label;
  return expense.notes ?? null;
}

// ---------------------------------------------------------------------------
// Action menu
// ---------------------------------------------------------------------------

function ActionMenu({
  expense,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  expense: Expense;
  onEdit?: (e: Expense) => void;
  onDelete?: (id: number) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!canEdit && !canDelete) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Icon name="more-vertical" size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit!(expense);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Icon name="edit" size={14} />
              Modifier
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete!(expense.id);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Icon name="delete" size={14} />
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expense row
// ---------------------------------------------------------------------------

function ExpenseRow({
  expense,
  vehicles,
  onEdit,
  onDelete,
  currentUserId,
}: {
  expense: Expense;
  vehicles: (Vehicle | VehicleMinimal)[];
  onEdit?: (e: Expense) => void;
  onDelete?: (id: number) => void;
  currentUserId?: string | null;
}) {
  const desc = getDescription(expense);
  const canEdit = !!(
    currentUserId &&
    expense.owner_id === currentUserId &&
    expense.type !== 'insurance' &&
    onEdit
  );
  const canDelete = !!(
    currentUserId &&
    expense.owner_id === currentUserId &&
    expense.type !== 'insurance' &&
    onDelete
  );

  return (
    <div className="group flex items-center gap-3 sm:gap-4 py-3 px-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* Category icon */}
      <div
        className={`flex items-center justify-center p-2 sm:p-2.5 rounded-xl shrink-0 ${getCategoryColor(expense.type)}`}
      >
        <Icon name={getCategoryIcon(expense.type)} size={16} className="invert dark:invert-0" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getCategoryLabel(expense)}
          </p>
          {/* Mobile: amount */}
          <span className="sm:hidden text-sm font-bold text-gray-900 dark:text-gray-100 shrink-0 tabular-nums">
            {formatCurrency(expense.amount)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 max-w-[40%] truncate">
            {getVehicleName(expense.vehicle_id, vehicles)}
          </span>
          {desc && (
            <>
              <span className="text-gray-300 dark:text-gray-600 text-xs shrink-0">·</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-1 min-w-0 truncate">
                {desc}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Desktop: date + amount + actions */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-12 text-right">
          {format(new Date(expense.date), 'dd MMM', { locale: fr })}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-20 text-right tabular-nums">
          {formatCurrency(expense.amount)}
        </span>
        <div className="w-8">
          <ActionMenu
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      </div>

      {/* Mobile: actions */}
      <div className="sm:hidden shrink-0">
        <ActionMenu
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category filter pills (shared between sidebar and mobile)
// ---------------------------------------------------------------------------

function CategoryFilters({
  activeCategories,
  onToggle,
  onReset,
  counts,
  totalCount,
  mobile = false,
}: {
  activeCategories: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
  counts: Record<string, number>;
  totalCount: number;
  mobile?: boolean;
}) {
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ExpenseListProps {
  expenses?: Expense[];
  vehicles?: (Vehicle | VehicleMinimal)[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: number) => void;
  currentUserId?: string | null;
}

export default function ExpenseList({
  expenses = [],
  vehicles = [],
  onEditExpense,
  onDeleteExpense,
  currentUserId,
}: ExpenseListProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const toggleCategory = (key: string) =>
    setActiveCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const resetCategories = () => setActiveCategories([]);

  // Filter
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (activeCategories.length > 0) {
      const activeTypes = CATEGORY_DEFS.filter((c) => activeCategories.includes(c.key)).flatMap(
        (c) => [...c.types],
      );
      result = result.filter((e) => activeTypes.includes(e.type));
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, activeCategories]);

  // Group by month
  const monthGroups = useMemo(() => {
    const map = new Map<
      string,
      { label: string; sortKey: string; expenses: Expense[]; total: number }
    >();
    for (const exp of filteredExpenses) {
      const d = new Date(exp.date);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = format(d, 'MMMM yyyy', { locale: fr });
      if (!map.has(sortKey)) map.set(sortKey, { label, sortKey, expenses: [], total: 0 });
      const g = map.get(sortKey)!;
      g.expenses.push(exp);
      g.total += exp.amount ?? 0;
    }
    return [...map.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [filteredExpenses]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
    const count = filteredExpenses.length;
    const avgPerMonth = monthGroups.length > 0 ? total / monthGroups.length : 0;
    return { total, count, avgPerMonth };
  }, [filteredExpenses, monthGroups.length]);

  // Per-category counts (always based on unfiltered expenses)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORY_DEFS) {
      counts[cat.key] = expenses.filter((e) => cat.types.includes(e.type)).length;
    }
    return counts;
  }, [expenses]);

  return (
    <div className="flex gap-6 items-start">
      {/* ── Desktop sidebar ── */}
      <aside className="max-lg:hidden w-44 shrink-0">
        <Card>
          <div className="p-3">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
              Catégories
            </p>
            <CategoryFilters
              activeCategories={activeCategories}
              onToggle={toggleCategory}
              onReset={resetCategories}
              counts={categoryCounts}
              totalCount={expenses.length}
            />
          </div>
        </Card>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Mobile: category pills */}
        <div className="lg:hidden">
          <CategoryFilters
            activeCategories={activeCategories}
            onToggle={toggleCategory}
            onReset={resetCategories}
            counts={categoryCounts}
            totalCount={expenses.length}
            mobile
          />
        </div>

        {/* Stats */}
        {filteredExpenses.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Card>
              <div className="p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  Total
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums truncate">
                  {formatCurrency(stats.total)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  Transactions
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                  {stats.count}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  Moy. / mois
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums truncate">
                  {formatCurrency(stats.avgPerMonth)}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Monthly groups */}
        {monthGroups.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <Icon name="euro" size={40} className="opacity-20 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Aucune dépense trouvée.</p>
            </div>
          </Card>
        ) : (
          monthGroups.map((group) => (
            <Card key={group.sortKey}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {group.label}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(group.total)}
                </p>
              </div>
              <CardContent className="p-0">
                {group.expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    vehicles={vehicles}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    currentUserId={currentUserId}
                  />
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
