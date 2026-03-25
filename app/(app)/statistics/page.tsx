/**
 * @file app/statistics/page.tsx
 * @summary Server Component that loads vehicles for the Statistics page.
 *
 * Expenses are fetched client-side via API to keep initial SSR payload small.
 * AppDataProvider guarantees the user is authenticated before this page renders.
 */

import { redirect } from 'next/navigation';

import { getAllVehicles } from '@/lib/data/vehicles';

import StatisticsClient from './StatisticsClient';

export default async function StatisticsPage() {
  const vehicles = await getAllVehicles();

  if (vehicles.length === 0) {
    redirect('/garage');
  }

  return (
    <main>
      <StatisticsClient vehicles={vehicles} />
    </main>
  );
}
