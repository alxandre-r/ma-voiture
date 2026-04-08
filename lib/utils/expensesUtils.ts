import type { Expense } from '@/types/expense';

type ExpenseType = 'fuel' | 'electric_charge' | 'maintenance' | 'insurance' | 'other';

const EXPENSE_CONFIG: Record<ExpenseType, { color: string; icon: string }> = {
  fuel: { color: 'bg-orange-600/90', icon: 'car' },
  electric_charge: { color: 'bg-blue-600/90', icon: 'elec' },
  maintenance: { color: 'bg-amber-600/90', icon: 'tool' },
  insurance: { color: 'bg-green-600/90', icon: 'secure' },
  other: { color: 'bg-violet-600/90', icon: 'euro' },
};

const getCategoryLabel = (expense: Expense) => {
  switch (expense.type) {
    case 'fuel':
      return 'Carburant';
    case 'electric_charge':
      return 'Recharge';
    case 'maintenance':
      return expense.maintenance_type_label || 'Entretien';
    case 'insurance':
      return 'Assurance';
    case 'other':
      return expense.label || 'Autre';
    default:
      return expense.type;
  }
};

const getCategoryColor = (type: string) =>
  EXPENSE_CONFIG[type as ExpenseType]?.color ?? 'bg-violet-600/90';

const getCategoryIcon = (type: string) => EXPENSE_CONFIG[type as ExpenseType]?.icon ?? 'euro';

export { getCategoryLabel, getCategoryColor, getCategoryIcon };
