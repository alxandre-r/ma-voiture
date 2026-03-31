'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Card } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';

import CategoryFilters from './CategoryFilters';
import ExpenseDetailModal from './ExpenseDetailModal';
import { CATEGORY_DEFS } from './expenseListUtils';
import ExpenseMonthGroup from './ExpenseMonthGroup';
import ExpenseStats from './ExpenseStats';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

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
  const router = useRouter();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);

  const closeDetail = () => {
    setDetailExpense(null);
    router.refresh();
  };

  const toggleCategory = (key: string) =>
    setActiveCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const resetCategories = () => setActiveCategories([]);

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

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
    const count = filteredExpenses.length;
    const avgPerMonth = monthGroups.length > 0 ? total / monthGroups.length : 0;
    return { total, count, avgPerMonth };
  }, [filteredExpenses, monthGroups.length]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORY_DEFS) {
      counts[cat.key] = expenses.filter((e) => cat.types.includes(e.type)).length;
    }
    return counts;
  }, [expenses]);

  return (
    <div className="flex gap-6 items-start">
      {/* Desktop sidebar */}
      <aside className="max-lg:hidden w-44 shrink-0">
        <Card>
          <div className="p-3">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
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

      {/* Main area */}
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
          <ExpenseStats total={stats.total} count={stats.count} avgPerMonth={stats.avgPerMonth} />
        )}

        {/* Monthly groups */}
        {monthGroups.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <Icon name="euro" size={40} className="opacity-20 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-400">Aucune dépense trouvée.</p>
            </div>
          </Card>
        ) : (
          monthGroups.map((group) => (
            <ExpenseMonthGroup
              key={group.sortKey}
              group={group}
              vehicles={vehicles}
              onViewDetail={setDetailExpense}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Expense detail modal */}
      {detailExpense && (
        <ExpenseDetailModal
          expense={detailExpense}
          vehicles={vehicles}
          currentUserId={currentUserId}
          onClose={closeDetail}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />
      )}
    </div>
  );
}
