/**
 * @file app/statistics/page.tsx
 * @summary Server Component that loads user and vehicles for the Statistics page.
 *
 * Fetches user and vehicles owned by the user and their family.
 * Expenses are fetched client-side via API to avoid SSR performance issues.
 */

import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUserInfo } from '@/lib/data/user';
import { getAllVehicles } from '@/lib/data/vehicles';
import { mapVehiclesToMinimal } from '@/lib/utils/vehicles/mapVehiclesToMinimal';

import StatisticsClient from './StatisticsClient';

/**
 * Server page responsible for loading user and vehicles before rendering the StatisticsClient.
 * Expenses are fetched client-side via API to avoid loading too much data on the server.
 *
 * @returns JSX page containing the StatisticsClient component.
 * @throws Redirects to "/" if no authenticated user is found.
 */
export default async function StatisticsPage() {
  const user = await getCurrentUserInfo();
  if (!user)
    redirect('/');
  else if (user.has_vehicles === false) {
    redirect('/garage');
  }

  const vehicles = await getAllVehicles(user.id);
  const selectorVehicles = mapVehiclesToMinimal(vehicles);

  return (
    <main>
      <StatisticsClient vehicles={vehicles} selectorVehicles={selectorVehicles} />
    </main>
  );
}
