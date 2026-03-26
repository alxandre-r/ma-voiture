import { redirect } from 'next/navigation';

import { getUserFamilyId } from '@/lib/data/user/getUserFamilyId';
import { getFamilyVehicles, getUserVehicles } from '@/lib/data/vehicles';

import AssuranceClient from './AssuranceClient';

export default async function AssurancePage() {
  const [userVehicles, familyId] = await Promise.all([getUserVehicles(), getUserFamilyId()]);
  const familyVehicles = familyId ? await getFamilyVehicles(familyId) : [];
  const allVehicles = [...userVehicles, ...(familyVehicles ?? [])];

  if (allVehicles.length === 0) {
    redirect('/garage');
  }

  const ownedVehicleIds = userVehicles.map((v) => v.vehicle_id);

  return (
    <main>
      <AssuranceClient vehicles={allVehicles} ownedVehicleIds={ownedVehicleIds} />
    </main>
  );
}
