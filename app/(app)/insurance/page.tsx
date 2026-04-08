import { redirect } from 'next/navigation';

import { getUserFamilyIds } from '@/lib/data/user/getUserFamilyIds';
import { getFamilyVehicles, getUserVehicles } from '@/lib/data/vehicles';

import AssuranceClient from './AssuranceClient';

export default async function AssurancePage() {
  const [userVehicles, familyIds] = await Promise.all([getUserVehicles(), getUserFamilyIds()]);

  const seenIds = new Set<number>(userVehicles.map((v) => v.vehicle_id));
  const perFamily = await Promise.all(familyIds.map((id) => getFamilyVehicles(id)));
  const deduped = perFamily.flat().filter((v) => {
    if (seenIds.has(v.vehicle_id)) return false;
    seenIds.add(v.vehicle_id);
    return true;
  });
  const allVehicles = [...userVehicles, ...deduped];

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
