/**
 * @file src/app/garage/page.tsx
 * @fileoverview SSR page pour afficher le garage de l'utilisateur. Utilise un VehicleProvider pour gérer les données des véhicules
 * Fetch initial data côté serveur via lib/data/vehicles.ts
 */

import { redirect } from 'next/navigation';
import React from 'react';

import { getFamilyMembers } from '@/lib/data/family';
import { getCurrentUserInfo } from '@/lib/data/user';
import { getUserVehicles, getFamilyVehicles } from '@/lib/data/vehicles';

import GarageClient from './GarageClient';

export default async function GaragePage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  const vehicles = await getUserVehicles(user.id);
  const familyVehicles = await getFamilyVehicles(user.id, user.family_id);

  // Fetch family members to get owner info for family vehicles
  const familyMembers = user.family_id ? await getFamilyMembers(user.family_id) : [];

  return (
    <GarageClient
      userVehicles={vehicles}
      familyVehicles={familyVehicles}
      familyMembers={familyMembers}
    />
  );
}
