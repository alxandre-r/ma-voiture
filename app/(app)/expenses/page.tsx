/**
 * @file app/(app)/expenses/page.tsx
 * @summary Server Component that loads user and vehicles for the Expenses page.
 *
 * Fetches user and vehicles owned by the user and their family.
 * Expenses and fills are fetched client-side via API to avoid SSR performance issues.
 */

import { redirect } from 'next/navigation';

import { getCurrentUserInfo } from '@/lib/data/user';
import { getAllVehicles } from '@/lib/data/vehicles';
import { mapVehiclesToMinimal } from '@/lib/utils/vehicles/mapVehiclesToMinimal';

import ExpensesClient from './ExpensesClient';

/**
 * Server page responsible for loading user and vehicles before rendering the ExpensesClient.
 * Expenses and fills are fetched client-side via API to avoid loading too much data on the server.
 *
 * @returns JSX page containing the ExpensesClient component.
 * @throws Redirects to "/" if no authenticated user is found.
 */
export default async function ExpensesPage() {
  const user = await getCurrentUserInfo();
  if (!user) {
    redirect('/');
  }

  const vehicles = await getAllVehicles(user.id);
  const selectorVehicles = mapVehiclesToMinimal(vehicles);

  return (
    <main>
      <ExpensesClient
        vehicles={vehicles}
        currentUserId={user.id}
        selectorVehicles={selectorVehicles}
      />
    </main>
  );
}
