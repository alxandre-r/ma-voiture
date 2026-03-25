/**
 * @file app/(app)/garage/page.tsx
 * @fileoverview SSR page for the garage. Fetches data in parallel and passes it
 * to the client component. loading.tsx handles the navigation skeleton.
 */
import { getAllExpenses } from '@/lib/data/expenses/getAllExpenses';
import { getFamilyMembers } from '@/lib/data/family';
import { getUserFamilyId } from '@/lib/data/user/getUserFamilyId';
import { getUserVehicles, getFamilyVehicles } from '@/lib/data/vehicles';

import GarageClient from './GarageClient';

export default async function GaragePage() {
  const [vehicles, familyId] = await Promise.all([getUserVehicles(), getUserFamilyId()]);

  const vehicleIds = vehicles.map((v) => v.vehicle_id);

  if (!familyId) {
    const expenses = vehicleIds.length > 0 ? await getAllExpenses(vehicleIds) : [];
    return <GarageClient userVehicles={vehicles} expenses={expenses ?? []} />;
  }

  const [familyVehicles, familyMembers] = await Promise.all([
    getFamilyVehicles(familyId),
    getFamilyMembers(familyId),
  ]);

  const allVehicleIds = [...vehicleIds, ...(familyVehicles?.map((v) => v.vehicle_id) ?? [])];
  const expenses = allVehicleIds.length > 0 ? await getAllExpenses(allVehicleIds) : [];

  return (
    <GarageClient
      userVehicles={vehicles}
      familyVehicles={familyVehicles}
      familyMembers={familyMembers}
      expenses={expenses ?? []}
    />
  );
}
