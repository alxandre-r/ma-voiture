'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import DashboardHeader from '@/components/dashboard/Header';
import FillFormModal from '@/components/fill/forms/FillAddForm';
import Charts from '@/components/dashboard/Charts';
import LatestFills from '@/components/dashboard/LatestFills';
import FillStatistics from '@/components/dashboard/FillStatistics';
import Loader from '@/components/ui/Loader';
import DashboardLandingPage from './DashboardLandingPage';

import { useVehicles } from '@/contexts/VehicleContext';
import { useFills } from '@/contexts/FillContext';
import { useFillChartData } from '@/hooks/dashboard/useChartData';

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { vehicles, selectedVehicleId, setSelectedVehicleId } = useVehicles();
  const { fills, setVehicles: setFillsVehicles, setSelectedVehicleIds: setFillSelectedVehicleIds } = useFills();

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const initialized = useRef(false);

  const [fillModalOpen, setFillModalOpen] = useState(false);
  const [fillVehicleId, setFillVehicleId] = useState<number | null>(null);

  // ---------------- URL deep-link ----------------
  useEffect(() => {
    if (searchParams.get('addFill') === 'true') {
      setFillModalOpen(true);
      const vid = searchParams.get('vehicleId');
      if (vid) setFillVehicleId(Number(vid));
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  // ---------------- Initialisation contexts ----------------
  useEffect(() => {
    if (initialized.current || !vehicles.length) return;

    setFillsVehicles(vehicles);
    const initialIds = vehicles.map(v => v.vehicle_id);
    setSelectedVehicleIds(initialIds);
    setFillSelectedVehicleIds(initialIds);
    setSelectedVehicleId(initialIds[0] ?? null);
    initialized.current = true;
  }, [vehicles, setFillsVehicles, setFillSelectedVehicleIds, setSelectedVehicleId]);

  // ---------------- Vehicle switch handler ----------------
  const handleVehicleChange = (ids: number[]) => {
    setSelectedVehicleIds(ids);
    setFillSelectedVehicleIds(ids);
    setSelectedVehicleId(ids[0] ?? null);
  };

  // ---------------- Hook Chart Data ----------------
  const { vehiclesForChart, filteredStats, hasData } = useFillChartData();

  // ----------------- Render -----------------
  if (!vehicles.length) return <DashboardLandingPage />;

  const showEmptyHint = selectedVehicleIds.length === 1 &&
    fills !== undefined &&
    !fills.some(f => f.vehicle_id === selectedVehicleIds[0]);

  return (
    <>
      <section className="space-y-6">
        <DashboardHeader
          vehicles={vehicles}
          selectedVehicleIds={selectedVehicleIds}
          onVehicleChange={handleVehicleChange}
          onAddFill={() => setFillModalOpen(true)}
          showEmptyHint={showEmptyHint}
        />

        {filteredStats && <FillStatistics filteredStats={filteredStats} />}

        {hasData ? (
          <Charts vehiclesForChart={vehiclesForChart} />
        ) : null}

        {selectedVehicleIds.length !== 1 ||
         (fills !== undefined && fills.some(f => selectedVehicleIds.includes(f.vehicle_id))) ? (
          fills === undefined ? <Loader /> : <LatestFills />
        ) : null}
      </section>

      <FillFormModal
        isOpen={fillModalOpen}
        onClose={() => setFillModalOpen(false)}
        vehicles={vehicles}
        initialVehicleId={fillVehicleId ?? undefined}
      />
    </>
  );
}