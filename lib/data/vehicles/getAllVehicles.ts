import { getUserFamilyId } from '../user/getUserFamilyId';

import { getFamilyVehicles, getFamilyVehiclesMinimal } from './getFamilyVehicles';
import { getUserVehicles, getUserVehiclesMinimal } from './getUserVehicles';

export async function getAllVehicles(userId: string) {
  const userVehicles = await getUserVehicles(userId);
  const familyId = await getUserFamilyId(userId);

  if (!familyId) return userVehicles;

  const familyVehicles = await getFamilyVehicles(userId, familyId);

  return [...userVehicles, ...familyVehicles];
}

export async function getAllVehiclesMinimal(userId: string) {
  const userVehicles = await getUserVehiclesMinimal(userId);
  const familyId = await getUserFamilyId(userId);

  if (!familyId) return userVehicles;

  const familyVehicles = await getFamilyVehiclesMinimal(userId, familyId);

  return [...userVehicles, ...familyVehicles];
}
