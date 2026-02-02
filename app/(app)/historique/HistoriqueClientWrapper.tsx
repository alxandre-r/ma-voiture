'use client';

import { VehicleProvider } from '@/contexts/VehicleContext';
import HistoriqueClient from './HistoriqueClient';

export default function HistoriqueClientWrapper() {
  return (
    <VehicleProvider>
      <HistoriqueClient />
    </VehicleProvider>
  );
}