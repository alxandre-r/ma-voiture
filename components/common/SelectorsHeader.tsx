'use client';

import PeriodSelector from '@/components/common/PeriodSelector';
import VehicleSelector from '@/components/common/VehicleSelector';
import { useSelectors } from '@/contexts/SelectorsContext';

interface SelectorsHeaderProps {
  title: string;
}

export default function SelectorsHeader({ title }: SelectorsHeaderProps) {
  const { selectedVehicleIds, setSelectedVehicleIds, selectedPeriod, setSelectedPeriod } =
    useSelectors();

  return (
    <div className="flex flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-row gap-2 sm:gap-4 w-full sm:w-auto">
        <VehicleSelector value={selectedVehicleIds} onChange={setSelectedVehicleIds} />
        <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      </div>
    </div>
  );
}
