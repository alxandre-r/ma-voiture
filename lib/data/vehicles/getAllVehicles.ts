import { getUserFamilyIds } from '../user/getUserFamilyIds';

import { getFamilyVehicles, getFamilyVehiclesMinimal } from './getFamilyVehicles';
import { getUserVehicles, getUserVehiclesMinimal } from './getUserVehicles';

export async function getAllVehicles() {
  const [userVehicles, familyIds] = await Promise.all([getUserVehicles(), getUserFamilyIds()]);

  if (!familyIds.length) return userVehicles;

  const perFamily = await Promise.all(familyIds.map((id) => getFamilyVehicles(id)));
  const seen = new Set(userVehicles.map((v) => v.vehicle_id));
  const familyVehicles = perFamily.flat().filter((v) => {
    if (seen.has(v.vehicle_id)) return false;
    seen.add(v.vehicle_id);
    return true;
  });

  return [...userVehicles, ...familyVehicles];
}

export async function getAllVehiclesMinimal() {
  const [userVehicles, familyIds] = await Promise.all([
    getUserVehiclesMinimal(),
    getUserFamilyIds(),
  ]);

  if (!familyIds.length) return userVehicles;

  const perFamily = await Promise.all(familyIds.map((id) => getFamilyVehiclesMinimal(id)));
  const seen = new Set(userVehicles.map((v) => v.vehicle_id));
  const familyVehicles = perFamily.flat().filter((v) => {
    if (seen.has(v.vehicle_id)) return false;
    seen.add(v.vehicle_id);
    return true;
  });

  return [...userVehicles, ...familyVehicles];
}
