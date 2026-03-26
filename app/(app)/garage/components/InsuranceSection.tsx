'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';

import type { InsuranceContract } from '@/types/insurance';

interface InsuranceSectionProps {
  vehicleId: number;
  isFamilyVehicle?: boolean;
}

export default function InsuranceSection({ vehicleId, isFamilyVehicle }: InsuranceSectionProps) {
  const [activeContract, setActiveContract] = useState<InsuranceContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/insurance/get?vehicle_id=${vehicleId}`)
      .then((r) => r.json())
      .then((d) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const contracts: InsuranceContract[] = d.contracts ?? [];
        const active = contracts.find((c) => !c.end_date || new Date(c.end_date) >= today) ?? null;
        setActiveContract(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicleId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="secure" size={16} className="text-gray-500" />
            Assurance
          </CardTitle>
          {!isFamilyVehicle && (
            <Link href="/insurance" className="text-xs text-custom-2 hover:underline">
              Gérer →
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Spinner />
        ) : activeContract ? (
          <div className="space-y-1">
            {activeContract.provider && (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {activeContract.provider}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeContract.monthly_cost} €/mois
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">Aucune assurance active</p>
        )}
      </CardContent>
    </Card>
  );
}
