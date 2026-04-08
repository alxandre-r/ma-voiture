'use client';

import { useCallback, useEffect, useState } from 'react';

import type { InsuranceContract } from '@/types/insurance';
import type { Vehicle } from '@/types/vehicle';

export function useInsuranceContracts(ownedVehicleIds: number[], allVehicles: Vehicle[]) {
  const [contractsMap, setContractsMap] = useState<Map<number, InsuranceContract[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      allVehicles.map((v) =>
        fetch(`/api/insurance/get?vehicle_id=${v.vehicle_id}`)
          .then((r) => r.json())
          .then((d) => ({
            vehicleId: v.vehicle_id,
            contracts: (d.contracts ?? []) as InsuranceContract[],
          }))
          .catch(() => ({ vehicleId: v.vehicle_id, contracts: [] as InsuranceContract[] })),
      ),
    ).then((results) => {
      const map = new Map<number, InsuranceContract[]>();
      for (const r of results) map.set(r.vehicleId, r.contracts);
      for (const v of allVehicles) {
        if (!map.has(v.vehicle_id)) map.set(v.vehicle_id, []);
      }
      setContractsMap(map);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchVehicle = useCallback(async (vehicleId: number) => {
    try {
      const res = await fetch(`/api/insurance/get?vehicle_id=${vehicleId}`);
      const data = await res.json();
      setContractsMap((prev) => new Map(prev).set(vehicleId, data.contracts ?? []));
    } catch {
      // silently fail — data will be refreshed on next router.refresh()
    }
  }, []);

  return { contractsMap, loading, refetchVehicle };
}
