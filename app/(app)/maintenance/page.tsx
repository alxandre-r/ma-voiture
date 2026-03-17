/**
 * app/(app)/maintenance/page.tsx
 * @summary Server Component that loads user, vehicles, and maintenance expenses for the Maintenance page.
 *
 * Fetches vehicles owned by the user and their family,
 * then retrieves associated maintenance expenses before passing data
 * to the client component.
 *
 * @todo Fecthing expenses client side via API instead of here.
 */

import { redirect } from 'next/navigation';

import { getMaintenanceExpenses } from '@/lib/data/expenses/getMaintenanceExpense';
import { getCurrentUserInfo } from '@/lib/data/user';
import { getAllVehicles } from '@/lib/data/vehicles';
import { mapVehiclesToMinimal } from '@/lib/utils/vehicles/mapVehiclesToMinimal';

import MaintenanceClient from './MaintenanceClient';

import type { Expense } from '@/types/expense';

/**
 * Server page responsible for loading vehicles and maintenance expenses before rendering the MaintenanceClient.
 *
 * @returns JSX page containing the MaintenanceClient component.
 * @throws Redirects to "/" if no authenticated user is found.
 */
export default async function MaintenancePage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');
  else if (user.has_vehicles === false) {
    redirect('/garage');
  }

  const vehicles = await getAllVehicles(user.id);
  const selectorVehicles = mapVehiclesToMinimal(vehicles);

  const vehicleIds = vehicles.map((v) => v.vehicle_id).filter((id) => id > 0);
  const expenses =
    vehicleIds.length > 0 ? ((await getMaintenanceExpenses(vehicleIds)) as Expense[]) : [];

  return (
    <main>
      <MaintenanceClient
        user={user}
        vehicles={vehicles}
        expenses={expenses}
        selectorVehicles={selectorVehicles}
      />
    </main>
  );
}
