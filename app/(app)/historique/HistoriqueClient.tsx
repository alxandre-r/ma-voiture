'use client';

import { useState, useEffect, useCallback } from 'react';
import FillHistoryList from '@/components/fill/FillHistoryList';
import { Vehicle, VehicleMinimal } from '@/types/vehicle';
import { Fill } from '@/types/fill';

interface HistoriqueClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
  fills: Fill[];
}

export default function HistoriqueClient({ vehicles, fills: initialFills }: HistoriqueClientProps) {
  const [fills, setFills] = useState<Fill[]>(initialFills || []);
  const [loading, setLoading] = useState(false);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        Aucun véhicule disponible pour l&apos;historique des pleins.
      </div>
    );
  }

  // --- Fonction pour re-fetch les fills ---
  const refreshFills = useCallback(async () => {
    if (vehicles.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fills/get?vehicleIds=${vehicles.map(v => v.vehicle_id).join(',')}`);
      const body = await res.json();
      if (res.ok && body.fills) {
        setFills(body.fills);
      }
    } catch (err) {
      console.error('Erreur fetching fills:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicles]);

  // --- Initial fetch si initialFills vide ---
  useEffect(() => {
    if (!initialFills || initialFills.length === 0) {
      refreshFills();
    }
  }, [initialFills, refreshFills]);

  return (
    <FillHistoryList
      vehicles={vehicles}
      fills={fills}
      onRefresh={refreshFills} // <-- passé à chaque FillRowContainer
    />
  );
}