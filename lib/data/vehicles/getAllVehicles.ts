import { getUserFamilyId } from '../user/getUserFamilyId';

import { getFamilyVehicles, getFamilyVehiclesMinimal } from './getFamilyVehicles';
import { getUserVehicles, getUserVehiclesMinimal } from './getUserVehicles';

export async function getAllVehicles() {
  const [userVehicles, familyId] = await Promise.all([getUserVehicles(), getUserFamilyId()]);

  if (!familyId) return userVehicles;

  const familyVehicles = await getFamilyVehicles(familyId);

  return [...userVehicles, ...familyVehicles];
}

export async function getAllVehiclesMinimal() {
  const [userVehicles, familyId] = await Promise.all([getUserVehiclesMinimal(), getUserFamilyId()]);

  if (!familyId) return userVehicles;

  const familyVehicles = await getFamilyVehiclesMinimal(familyId);

  return [...userVehicles, ...familyVehicles];
}
