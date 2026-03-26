import { getAllExpenses } from '@/lib/data/expenses/getAllExpenses';
import { getAllVehicles } from '@/lib/data/vehicles';

import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage() {
  const vehicles = await getAllVehicles();
  const vehicleIds = vehicles.map((v) => v.vehicle_id).filter((id) => id > 0);
  const expenses = vehicleIds.length > 0 ? await getAllExpenses(vehicleIds) : [];

  return (
    <main>
      <ExpensesClient vehicles={vehicles} initialExpenses={expenses ?? []} />
    </main>
  );
}
