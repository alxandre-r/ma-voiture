/**
 * @file FamilyVehicles.tsx
 * @fileoverview Async Server Component that fetches and displays family vehicles.
 * Wrapped in Suspense for streaming.
 */
import { getFamilyMembers } from '@/lib/data/family';
import { getUserFamilyIds } from '@/lib/data/user/getUserFamilyIds';
import { getFamilyVehicles } from '@/lib/data/vehicles';

import { FamilyVehiclesList } from './FamilyVehiclesList';

import type { Vehicle } from '@/types/vehicle';

interface FamilyVehiclesProps {
  onVehicleClick: (vehicle: Vehicle) => void;
}

export default async function FamilyVehicles({ onVehicleClick }: FamilyVehiclesProps) {
  const familyIds = await getUserFamilyIds();

  if (!familyIds.length) {
    return null;
  }

  const [allVehiclesNested, allMembersNested] = await Promise.all([
    Promise.all(familyIds.map((id) => getFamilyVehicles(id))),
    Promise.all(familyIds.map((id) => getFamilyMembers(id))),
  ]);

  const seenVehicleIds = new Set<number>();
  const familyVehicles = allVehiclesNested.flat().filter((v) => {
    if (seenVehicleIds.has(v.vehicle_id)) return false;
    seenVehicleIds.add(v.vehicle_id);
    return true;
  });

  const seenMemberIds = new Set<string>();
  const familyMembers = allMembersNested.flat().filter((m) => {
    if (seenMemberIds.has(m.user_id)) return false;
    seenMemberIds.add(m.user_id);
    return true;
  });

  if (!familyVehicles || familyVehicles.length === 0) {
    return null;
  }

  return (
    <FamilyVehiclesList
      vehicles={familyVehicles}
      familyMembers={familyMembers}
      onVehicleClick={onVehicleClick}
    />
  );
}
