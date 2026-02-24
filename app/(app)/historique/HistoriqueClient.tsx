/**
 * @file HistoriqueClient.tsx
 * @summary Client component for the Historique page.
 * @description
 * Receives vehicles and initial fill history from the server component.
 * Manages fill state and provides a refresh function to re-fetch fills when updated.
 * @todo
 * - Extract logic from FillHistoryList into smaller components (Filter, Stats, List).
 * - Implement pagination and adapt SSR to fetch only required page data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import FillHistoryList from '@/components/fill/FillHistoryList';

import type { Fill } from '@/types/fill';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface HistoriqueClientProps {
  vehicles: (Vehicle | VehicleMinimal)[];
  fills: Fill[];
}

/**
 * Client wrapper for fill history.
 *
 * @param vehicles - User vehicles (full or minimal).
 * @param fills - Initial fills fetched from SSR.
 */
export default function HistoriqueClient({ vehicles, fills: initialFills }: HistoriqueClientProps) {
  const [fills, setFills] = useState<Fill[]>(initialFills || []);

  /**
   * Fetches updated fills for all vehicles and updates local state.
   */
  const refreshFills = useCallback(async () => {
    if (vehicles.length === 0) return;
    try {
      const res = await fetch(
        `/api/fills/get?vehicleIds=${vehicles.map((v) => v.vehicle_id).join(',')}`,
      );
      const body = await res.json();
      if (res.ok && body.fills) {
        setFills(body.fills);
      }
    } catch (err) {
      console.error('Erreur fetching fills:', err);
    }
  }, [vehicles]);

  // Refresh fills on mount if no initial fills are provided
  useEffect(() => {
    if (!initialFills || initialFills.length === 0) {
      refreshFills();
    }
  }, [initialFills, refreshFills]);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        Aucun véhicule trouvé. Veuillez ajouter un véhicule pour voir l&apos;historique de vos
        pleins.
      </div>
    );
  }

  return <FillHistoryList vehicles={vehicles} fills={fills} onRefresh={refreshFills} />;
}
