/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles. Ability to add vehicles.
 */

import { Suspense } from 'react';
import { VehicleProvider } from '@/contexts/VehicleContext';
import GarageClient from './GarageClient';

export default function GaragePage() {
  return (
    <VehicleProvider>
      <Suspense fallback={<div className="py-8 text-center">Chargement…</div>}>
        <GarageClient />
      </Suspense>
    </VehicleProvider>
  );
}