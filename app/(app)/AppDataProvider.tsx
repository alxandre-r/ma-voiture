/**
 * @file AppDataProvider.tsx
 * @fileoverview Async Server Component that fetches user and vehicle data.
 * Wrapped in Suspense in layout for streaming.
 * This allows the layout shell to render immediately while data loads.
 *
 * Note: Family data is fetched directly in each page's Server Components
 * for proper granular streaming with Suspense boundaries.
 */
import { redirect } from 'next/navigation';

import { SelectorsProvider } from '@/contexts/SelectorsContext';
import { UserProvider } from '@/contexts/UserContext';
import { getCurrentUserInfo } from '@/lib/data/user/getCurrentUserInfo';
import { getAllVehiclesMinimal } from '@/lib/data/vehicles';

import type { User } from '@/types/user';
import type { ReactNode } from 'react';

interface AppDataProviderProps {
  children: ReactNode;
}

/**
 * Fetches user and vehicle data in PARALLEL.
 * This is wrapped in Suspense to enable streaming.
 */
export default async function AppDataProvider({ children }: AppDataProviderProps) {
  // Fetch user and vehicles in PARALLEL
  const [user, initialVehicles] = await Promise.all([
    getCurrentUserInfo(),
    getAllVehiclesMinimal(),
  ]);

  if (!user) {
    redirect('/auth/not-identified');
  }

  return (
    <UserProvider user={user as User}>
      <SelectorsProvider initialVehicles={initialVehicles}>{children}</SelectorsProvider>
    </UserProvider>
  );
}
