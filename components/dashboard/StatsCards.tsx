'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';

interface StatsCardsProps {
  avgConsumption: number;
  totalExpenses: number;
}

export default function StatsCards({ avgConsumption, totalExpenses }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCard(
        'Consommation moyenne',
        `${avgConsumption.toFixed(1)} L/100km`,
        'conso',
        'bg-gray-400/20',
      )}
      {statCard('Dépenses totales', `${totalExpenses.toFixed(2)} €`, 'euro', 'bg-gray-400/20')}
    </div>
  );
}

function statCard(title: string, value: string | number, iconName: string, iconColor: string) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 ${iconColor} rounded-lg inline-flex items-center justify-center`}>
          <Icon name={iconName} size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
