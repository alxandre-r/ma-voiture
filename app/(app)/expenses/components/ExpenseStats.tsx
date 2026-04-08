'use client';

import { StatOverviewGrid } from '@/components/common/StatOverviewCard';
import { formatCurrency } from '@/lib/utils/format';

import type { StatCardDef } from '@/components/common/StatOverviewCard';

interface ExpenseStatsProps {
  total: number;
  avgPerMonth: number;
}

export default function ExpenseStats({ total, avgPerMonth }: ExpenseStatsProps) {
  const cards: StatCardDef[] = [
    {
      key: 'total',
      label: 'Total',
      value: formatCurrency(total),
    },
    {
      key: 'avg',
      label: 'Moy. / mois',
      value: formatCurrency(avgPerMonth),
    },
  ];

  return <StatOverviewGrid cards={cards} gridClass="grid-cols-2" />;
}
