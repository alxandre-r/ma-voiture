import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { getCategoryLabel } from '@/lib/utils/expensesUtils';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

function getVehicleName(vehicleId: number, vehicles: (Vehicle | VehicleMinimal)[]): string {
  const v = vehicles.find((v) => v.vehicle_id === vehicleId);
  if (!v) return String(vehicleId);
  const full = v as Vehicle;
  return full.name ?? [full.make, full.model].filter(Boolean).join(' ') ?? String(vehicleId);
}

export function exportExpensesCSV(
  expenses: Expense[],
  vehicles: (Vehicle | VehicleMinimal)[],
): void {
  const headers = ['Date', 'Véhicule', 'Catégorie', 'Montant (€)', 'Notes'];

  const rows = expenses.map((e) => [
    format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
    getVehicleName(e.vehicle_id, vehicles),
    getCategoryLabel(e),
    e.amount.toFixed(2).replace('.', ','),
    e.notes ?? '',
  ]);

  const escape = (cell: string) => {
    const s = String(cell);
    return s.includes(';') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv =
    '\uFEFF' + // UTF-8 BOM for Excel
    [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `depenses-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
