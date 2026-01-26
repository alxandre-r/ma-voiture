/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles. Ability to add vehicles.
 */

import { VehicleProvider } from '@/contexts/VehicleContext';
import GarageClient from './GarageClient';

// Main server component
export default function GaragePage() {
  return (
    <VehicleProvider>
      <GarageClient />
    </VehicleProvider>
  );
}