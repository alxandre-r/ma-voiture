/**
 * @file app/(app)/layout.tsx
 * @fileoverview Private layout component for authenticated users.
 *
 * Uses Suspense for streaming - the layout shell renders immediately,
 * while data fetching happens in AppDataProvider wrapped in Suspense.
 */
import { Suspense } from 'react';

import AppDataProvider from './AppDataProvider';
import AppLoading from './AppLoading';

import type { ReactNode } from 'react';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppDataProvider>{children}</AppDataProvider>
    </Suspense>
  );
}
