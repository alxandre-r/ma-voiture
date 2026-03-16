// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import React from 'react';

import { getAllExpenses } from '@/lib/data/expenses';
import { getCurrentUserInfo } from '@/lib/data/user';
import { getAllVehicles } from '@/lib/data/vehicles';
import { mapVehiclesToMinimal } from '@/lib/utils/vehicles/mapVehiclesToMinimal';

import DashboardClient from './DashboardClient';

import type { Expense } from '@/types/expense';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

export default async function DashboardPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  const vehicles = (await getAllVehicles(user.id)) as Vehicle[];
  const selectorVehicles = mapVehiclesToMinimal(vehicles) as VehicleMinimal[];
  const expenses = (await getAllExpenses(
    vehicles.map((v) => v.vehicle_id).filter((id) => id > 0),
  )) as Expense[];

  return (
    <main>
      <DashboardClient
        currentUserId={user.id}
        vehicles={vehicles}
        expenses={expenses}
        selectorVehicles={selectorVehicles}
      />
    </main>
  );
}
