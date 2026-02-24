// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';
import { getFamilyVehicles } from '@/lib/data/vehicles/getFamilyVehicles';
import { getUserVehicles } from '@/lib/data/vehicles/getUserVehicles';

import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getCurrentUserInfo();
  if (!user) redirect('/');

  const vehicles = await getUserVehicles(user.id);
  if (!vehicles || vehicles.length === 0) {
    redirect('/dashboard/landing');
  }

  if (user.has_family) {
    const familyVehicles = await getFamilyVehicles(user.id, user.family_id);
    vehicles.push(...familyVehicles);
  }

  return (
    <main>
      <DashboardClient userVehicles={vehicles} />
    </main>
  );
}
