/**
 * @file src/app/garage/page.tsx
 * @fileoverview SSR page pour afficher le garage de l'utilisateur. Utilise un VehicleProvider pour gérer les données des véhicules
 * Fetch initial data côté serveur via lib/data/vehicles.ts
 */

import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';
import { getFamilyVehicles } from '@/lib/data/vehicles/getFamilyVehicles';
import { getUserVehicles } from '@/lib/data/vehicles/getUserVehicles';

import GarageClient from './GarageClient';

export default async function GaragePage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  const vehicles = await getUserVehicles(user.id);
  const familyVehicles = await getFamilyVehicles(user.id, user.family_id);

  return <GarageClient userVehicles={vehicles} familyVehicles={familyVehicles} />;
}
