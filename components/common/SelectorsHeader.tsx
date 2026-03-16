'use client';

import { useEffect } from 'react';

import PeriodSelector from '@/components/common/PeriodSelector';
import VehicleSelector from '@/components/common/VehicleSelector';
import { useSetHeader } from '@/contexts/HeaderContext';
import { useSelectors } from '@/contexts/SelectorsContext';

import type { VehicleMinimal } from '@/types/vehicle';

interface SelectorsHeaderProps {
  title: string;
  vehicles: VehicleMinimal[];
}

/**
 * Reusable header component that displays VehicleSelector and PeriodSelector.
 * Uses the shared SelectorsContext to maintain state across page navigations.
 *
 * @param title - The page title to display in the header
 * @param vehicles - List of vehicles to display in the VehicleSelector
 */
export default function SelectorsHeader({ title, vehicles }: SelectorsHeaderProps) {
  const setHeader = useSetHeader();
  const { selectedVehicleIds, setSelectedVehicleIds, selectedPeriod, setSelectedPeriod } =
    useSelectors();

  useEffect(() => {
    setHeader({
      title,
      rightContent: (
        <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
          <VehicleSelector
            vehicles={vehicles}
            value={selectedVehicleIds}
            onChange={setSelectedVehicleIds}
          />
          <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        </div>
      ),
    });

    return () => {
      setHeader({ title: 'Ma Voiture' });
    };
  }, [
    setHeader,
    title,
    vehicles,
    selectedVehicleIds,
    setSelectedVehicleIds,
    selectedPeriod,
    setSelectedPeriod,
  ]);

  // This component doesn't render anything visible - it just sets the header
  return null;
}
