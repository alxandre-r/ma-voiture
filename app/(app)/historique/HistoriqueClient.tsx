'use client';

import { useEffect } from 'react';
import { useFills } from '@/contexts/FillContext';
import FillHistoryList from '@/components/fill/FillHistoryList';

interface HistoriqueClientProps {
  vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }>;
}

export default function HistoriqueClient({ vehicles }: HistoriqueClientProps) {
  const { setVehicles } = useFills();

  useEffect(() => {
    setVehicles(vehicles);
  }, [vehicles, setVehicles]);

  return <FillHistoryList />;
}