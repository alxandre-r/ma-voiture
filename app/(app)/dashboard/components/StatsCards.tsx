'use client';

import { StatOverviewGrid } from '@/components/common/StatOverviewCard';

import type { StatCardDef } from '@/components/common/StatOverviewCard';

interface StatsCardsProps {
  avgConsumption: number;
  totalExpenses: number;
}

export default function StatsCards({ avgConsumption, totalExpenses }: StatsCardsProps) {
  const cards: StatCardDef[] = [
    {
      key: 'expenses',
      label: 'Dépenses totales',
      value: totalExpenses.toFixed(2),
      unit: '€',
    },
    {
      key: 'consumption',
      label: 'Consommation moyenne',
      value: avgConsumption > 0 ? avgConsumption.toFixed(1) : '—',
      unit: avgConsumption > 0 ? 'L/100' : undefined,
    },
  ];

  return <StatOverviewGrid cards={cards} gridClass="grid-cols-2" />;
}
