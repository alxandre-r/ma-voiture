/**
 * @file app/(app)/expenses/page.tsx
 * @summary Server Component that loads user and vehicles for the Expenses page.
 *
 * Fetches user and vehicles owned by the user and their family.
 * Expenses and fills are fetched client-side via API to avoid SSR performance issues.
 */

import { getAllVehicles } from '@/lib/data/vehicles';

import ExpensesClient from './ExpensesClient';

/**
 * Server page responsible for loading user and vehicles before rendering the ExpensesClient.
 * Expenses and fills are fetched client-side via API to avoid loading too much data on the server.
 *
 * @returns JSX page containing the ExpensesClient component.
 * @throws Redirects to "/" if no authenticated user is found.
 */
export default async function ExpensesPage() {
  const vehicles = await getAllVehicles();

  return (
    <main>
      <ExpensesClient vehicles={vehicles} />
    </main>
  );
}
