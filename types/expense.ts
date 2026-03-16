// Type for the expenses_for_display view

export interface Expense {
  id: number;
  vehicle_id: number;
  vehicle_name: string | null;
  owner_id: string;
  owner_name: string | null;
  type: 'fuel' | 'electric_charge' | 'maintenance' | 'insurance' | 'other';
  amount: number;
  date: string; // YYYY-MM-DD
  notes: string | null;
  odometer: number | null;

  label: string | null; // For 'other' type expenses, a custom label provided by the user

  // Maintenance-specific fields
  maintenance_type: string | null;
  maintenance_type_label: string | null;
  garage: string | null;

  // Fill-specific fields (for fuel and electric_charge expenses)
  liters?: number | null;
  price_per_liter?: number | null;
  kwh?: number | null;
  price_per_kwh?: number | null;
  charge_type?: 'fill' | 'charge' | null;
}

// Form data structure for submitting an expense
export interface ExpenseFormData {
  vehicle_id: number;
  type: 'fuel' | 'electric_charge' | 'maintenance' | 'insurance' | 'other';
  amount: number;
  date: string;
  notes?: string;
  // For maintenance expenses
  maintenance_type?: string;
  odometer?: number;
  garage?: string;
  // For other expenses
  label?: string;
  // For insurance - link to contract
  insurance_contract_id?: number;
  // For fuel expenses
  liters?: number | null;
  price_per_liter?: number | null;
  // For electric_charge expenses
  kwh?: number | null;
  price_per_kwh?: number | null;
  charge_type?: 'fill' | 'charge';
}

// Mapping of expense types to display names
export const EXPENSE_TYPE_LABELS: Record<Expense['type'], string> = {
  fuel: 'Carburant',
  electric_charge: 'Recharge électrique',
  maintenance: 'Entretien',
  insurance: 'Assurance',
  other: 'Autre',
};

// Check if an expense is related to energy (fuel or electric charge)
export const isEnergyExpense = (expense: Expense): boolean => {
  return expense.type === 'fuel' || expense.type === 'electric_charge';
};

// Get the category name for an expense type (for grouping in statistics)
export const getCategoryName = (type: string): string => {
  switch (type) {
    case 'fuel':
      return 'Carburant';
    case 'electric_charge':
      return 'Carburant'; // Electric is part of fuel/energy category
    case 'insurance':
      return 'Assurance';
    case 'maintenance':
      return 'Entretien';
    case 'other':
    default:
      return 'Autre';
  }
};
