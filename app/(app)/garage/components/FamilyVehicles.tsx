/**
 * @file FamilyVehicles.tsx
 * @fileoverview Async Server Component that fetches and displays family vehicles.
 * Wrapped in Suspense for streaming.
 */
import { getFamilyMembers } from '@/lib/data/family';
import { getUserFamilyId } from '@/lib/data/user/getUserFamilyId';
import { getFamilyVehicles } from '@/lib/data/vehicles';

import { FamilyVehiclesList } from './FamilyVehiclesList';

import type { Vehicle } from '@/types/vehicle';

interface FamilyVehiclesProps {
  onVehicleClick: (vehicle: Vehicle) => void;
}

export default async function FamilyVehicles({ onVehicleClick }: FamilyVehiclesProps) {
  // Fetch family data on the server
  const familyId = await getUserFamilyId();

  if (!familyId) {
    return null;
  }

  const [familyVehicles, familyMembers] = await Promise.all([
    getFamilyVehicles(familyId),
    getFamilyMembers(familyId),
  ]);

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
