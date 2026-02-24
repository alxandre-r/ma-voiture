'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import Charts from '@/components/dashboard/Charts';
import FillStatistics from '@/components/dashboard/FillStatistics';
import DashboardHeader from '@/components/dashboard/Header';
import LatestFills from '@/components/dashboard/LatestFills';
import FillFormModal from '@/components/fill/forms/FillAddForm';
import { useFillChartData } from '@/hooks/dashboard/useChartData';

import type { Fill } from '@/types/fill';
import type { Vehicle } from '@/types/vehicle';

export type PeriodType = '1m' | '3m' | '6m' | '12m';

interface DashboardClientProps {
  userVehicles: Vehicle[];
}

export default function DashboardClient({ userVehicles }: DashboardClientProps) {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loadingFills, setLoadingFills] = useState(true);
  const [fillModalOpen, setFillModalOpen] = useState(false);
  const [fillVehicleId, setFillVehicleId] = useState<number | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('6m');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const allVehicles = useMemo(() => [...userVehicles], [userVehicles]);

  useEffect(() => {
    if (allVehicles.length > 0) {
      setSelectedVehicleIds(allVehicles.map((v) => v.vehicle_id));
    }
  }, [allVehicles]);

  // URL deep-link
  useEffect(() => {
    if (searchParams.get('addFill') === 'true') {
      setFillModalOpen(true);
      const vid = searchParams.get('vehicleId');
      if (vid) setFillVehicleId(Number(vid));
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  // 🔄 Refresh function
  const refreshFills = useCallback(async () => {
    if (!allVehicles.length) return;
    setLoadingFills(true);
    try {
      const res = await fetch(
        `/api/fills/get?vehicleIds=${allVehicles.map((v) => v.vehicle_id).join(',')}`,
      );
      const body = await res.json();
      if (res.ok && body.fills) setFills(body.fills);
    } catch (err) {
      console.error('Erreur fetching fills:', err);
    } finally {
      setLoadingFills(false);
    }
  }, [allVehicles]);

  // Initial fetch
  useEffect(() => {
    refreshFills();
  }, [refreshFills]);

  // Chart data basé sur sélection réelle
  const { vehiclesForChart, filteredStats } = useFillChartData({
    allVehicles,
    fills,
    selectedVehicleIds,
    selectedPeriod,
  });

  return (
    <section className="space-y-6">
      <DashboardHeader
        vehicles={allVehicles}
        selectedVehicleIds={selectedVehicleIds}
        onVehicleChange={setSelectedVehicleIds}
        onAddFill={() => setFillModalOpen(true)}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      <FillStatistics filteredStats={filteredStats} />
      <Charts vehiclesForChart={vehiclesForChart} />

      <LatestFills fills={fills} loading={loadingFills} onRefresh={refreshFills} />

      <FillFormModal
        isOpen={fillModalOpen}
        onClose={() => setFillModalOpen(false)}
        vehicles={allVehicles}
        initialVehicleId={fillVehicleId ?? undefined}
        onSuccess={refreshFills}
      />
    </section>
  );
}
