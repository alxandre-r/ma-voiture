'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { StatOverviewGrid } from '@/components/common/StatOverviewCard';

import type { StatCardDef } from '@/components/common/StatOverviewCard';
import type { InsuranceContract } from '@/types/insurance';
import type { Vehicle } from '@/types/vehicle';

interface InsuranceStatsGridProps {
  loading: boolean;
  totalMonthlyPremium: number;
  vehiclesInsuredCount: number;
  totalVehicleCount: number;
  nextPaymentEntry: { contract: InsuranceContract; date: Date } | null;
  nextPaymentVehicle: Vehicle | null;
}

export default function InsuranceStatsGrid({
  loading,
  totalMonthlyPremium,
  vehiclesInsuredCount,
  totalVehicleCount,
  nextPaymentEntry,
  nextPaymentVehicle,
}: InsuranceStatsGridProps) {
  const allInsured = vehiclesInsuredCount >= totalVehicleCount;

  const nextPaymentLabel = nextPaymentEntry
    ? format(nextPaymentEntry.date, 'dd MMM yyyy', { locale: fr })
    : '—';

  const cards: StatCardDef[] = [
    {
      key: 'premium',
      label: 'Prime mensuelle',
      value: loading ? '—' : `${totalMonthlyPremium.toFixed(2)}`,
      unit: loading ? undefined : '€',
      icon: 'euro',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      key: 'vehicles',
      label: 'Véhicules assurés',
      value: loading ? '—' : `${vehiclesInsuredCount} / ${totalVehicleCount}`,
      subtitle: loading ? undefined : 'véhicules',
      icon: 'car',
      iconBg: 'bg-sky-50 dark:bg-sky-900/20',
      valueColor: !loading && !allInsured ? 'text-amber-500' : 'text-gray-900 dark:text-gray-100',
    },
    {
      key: 'next-payment',
      label: 'Prochaine mensualité',
      value: loading ? '—' : nextPaymentLabel,
      subtitle:
        !loading && nextPaymentVehicle
          ? `${nextPaymentVehicle.make} ${nextPaymentVehicle.model}`
          : undefined,
      icon: 'calendar',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return <StatOverviewGrid cards={cards} gridClass="grid-cols-3" />;
}
