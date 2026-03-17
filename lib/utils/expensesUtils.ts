import type { Expense } from '@/types/expense';

const getCategoryLabel = (expense: Expense) => {
  switch (expense.type) {
    case 'fuel':
      return 'Carburant';
    case 'electric_charge':
      return 'Recharge';
    case 'maintenance':
      // Use maintenance_type_label from the database (French label)
      return expense.maintenance_type_label || 'Entretien';
    case 'insurance':
      return 'Assurance';
    case 'other':
      return expense.label || 'Autre';
    default:
      return expense.type;
  }
};

const getCategoryColor = (type: string) => {
  switch (type) {
    case 'fuel':
      return 'bg-orange-600/90';
    case 'electric_charge':
      return 'bg-blue-600/90';
    case 'maintenance':
      return 'bg-amber-600/90';
    case 'insurance':
      return 'bg-green-600/90';
    case 'other':
    default:
      return 'bg-violet-600/90';
  }
};

const getCategoryIcon = (type: string) => {
  switch (type) {
    case 'fuel':
      return 'car';
    case 'electric_charge':
      return 'elec';
    case 'maintenance':
      return 'tool';
    case 'insurance':
      return 'secure';
    default:
      return 'euro';
  }
};

export { getCategoryLabel, getCategoryColor, getCategoryIcon };
