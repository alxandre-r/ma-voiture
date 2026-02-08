'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import VehicleSwitcher from '@/components/vehicle/VehicleSwitcher';
import FillFormModal from '@/components/fill/forms/FillAddForm';
import Charts from '@/components/dashboard/Charts';
import LatestFills from '@/components/dashboard/LatestFills';
import Icon from '@/components/ui/Icon';

import DashboardLandingPage from './DashboardLandingPage';
import { useVehicles } from '@/contexts/VehicleContext';
import { useFills } from '@/contexts/FillContext';

/* ---------------- Loader léger ---------------- */
function LoaderInline() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
    </div>
  );
}

/* ---------------- Add Fill Button ---------------- */
function AddFillClient({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="px-4 py-3 bg-custom-2 text-white rounded-lg hover:bg-custom-2-hover flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3 hover:cursor-pointer"
    >
      <Icon name="add" size={20} className="invert dark:invert-0" />
      <span className="font-medium">Ajouter un plein</span>
    </button>
  );
}

/* ---------------- Dashboard Main ---------------- */
export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { vehicles, selectedVehicleId, setSelectedVehicleId } = useVehicles();
  const { fills, setVehicles: setFillsVehicles, setSelectedVehicleIds: setFillSelectedVehicleIds } = useFills();

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const initialized = useRef(false);

  const [fillModalOpen, setFillModalOpen] = useState(false);
  const [fillVehicleId, setFillVehicleId] = useState<number | null>(null);

  /* ---------------- URL deep-link ---------------- */
  useEffect(() => {
    if (searchParams.get('addFill') === 'true') {
      setFillModalOpen(true);
      const vid = searchParams.get('vehicleId');
      if (vid) setFillVehicleId(Number(vid));
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  /* ---------------- Initialisation contexts ---------------- */
  useEffect(() => {
    if (initialized.current || !vehicles.length) return;

    setFillsVehicles(vehicles);

    // ✅ Tous les véhicules sélectionnés par défaut
    const initialIds = vehicles.map(v => v.vehicle_id);
    setSelectedVehicleIds(initialIds);
    setFillSelectedVehicleIds(initialIds);
    setSelectedVehicleId(initialIds[0] ?? null);

    initialized.current = true;
  }, [vehicles, setFillsVehicles, setFillSelectedVehicleIds, setSelectedVehicleId]);

  /* ---------------- Vehicle switch handler ---------------- */
  const handleVehicleChange = (ids: number[]) => {
    setSelectedVehicleIds(ids);
    setFillSelectedVehicleIds(ids);
    setSelectedVehicleId(ids[0] ?? null);
  };

  /* ----------------- States & Render ----------------- */
  if (!vehicles.length) return <DashboardLandingPage />;

  return (
    <>
      <section>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 w-full items-start">
          {vehicles.length > 1 ? (
            <VehicleSwitcher
              vehicles={vehicles}
              value={selectedVehicleIds}
              onChange={handleVehicleChange}
            />
          ) : vehicles.length === 1 ? (
            <div className="px-4 py-3 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium">
              {vehicles[0].name || `${vehicles[0].make} ${vehicles[0].model}`}
            </div>
          ) : null}

          {/* Add Fill Button */}
          <div className="flex flex-col">
            <AddFillClient onOpen={() => setFillModalOpen(true)} />

            {/* Hint aligné sous le bouton */}
            {selectedVehicleIds.length === 1 &&
             fills !== undefined &&
             !fills.some(f => f.vehicle_id === selectedVehicleIds[0]) && (
              <div className="flex flex-col items-center mt-2">
                <Icon name="arrow-up" size={24} className="text-gray-400 dark:invert-0 animate-bounce" />
                <p className="text-gray-800 dark:text-gray-100 font-medium text-lg sm:text-xl animate-pulse">
                  Cliquez sur le bouton « Ajouter un plein » pour commencer.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          <Charts />

          {/* LatestFills si plusieurs véhicules ou pleins existants */}
          {selectedVehicleIds.length !== 1 ||
           (fills !== undefined && fills.some(f => selectedVehicleIds.includes(f.vehicle_id))) ? (
            fills === undefined ? <LoaderInline /> : <LatestFills />
          ) : null}
        </div>
      </section>

      {/* Modal Fill */}
      <FillFormModal
        isOpen={fillModalOpen}
        onClose={() => setFillModalOpen(false)}
        vehicles={vehicles}
        initialVehicleId={fillVehicleId ?? undefined}
      />
    </>
  );
}