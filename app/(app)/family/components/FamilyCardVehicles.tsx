/**
 * @file FamilyCardVehicles.tsx
 * @fileoverview Async Server Component — récupère véhicules + membres et passe au client.
 */

import { getFamilyMembers } from '@/lib/data/family/getFamilyMembers';
import { getFamilyAllVehicles } from '@/lib/data/vehicles/getFamilyVehicles';

import { FamilyCardVehiclesClient } from './FamilyCardVehiclesClient';

interface FamilyCardVehiclesProps {
  familyId: string;
  currentUserId: string;
}

export default async function FamilyCardVehicles({
  familyId,
  currentUserId,
}: FamilyCardVehiclesProps) {
  // getFamilyAllVehicles et getFamilyMembers utilisent React cache() — pas de double fetch
  const [vehicles, members] = await Promise.all([
    getFamilyAllVehicles(familyId),
    getFamilyMembers(familyId),
  ]);

  return (
    <FamilyCardVehiclesClient
      vehicles={vehicles ?? []}
      members={members.map((m) => ({ user_id: m.user_id, user_name: m.user_name }))}
      currentUserId={currentUserId}
    />
  );
}
