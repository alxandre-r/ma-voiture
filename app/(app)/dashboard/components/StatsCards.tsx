'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';

interface StatsCardsProps {
  avgConsumption: number;
  totalExpenses: number;
  overdueReminders: number;
}

interface StatDef {
  title: string;
  mobileTitle: string;
  value: string;
  iconName: string;
  iconBg: string;
  valueColor?: string;
}

export default function StatsCards({
  avgConsumption,
  totalExpenses,
  overdueReminders,
}: StatsCardsProps) {
  const stats: StatDef[] = [
    {
      title: 'Dépenses totales',
      mobileTitle: 'Dépenses',
      value: `${totalExpenses.toFixed(2)} €`,
      iconName: 'euro',
      iconBg: 'bg-gray-50 dark:bg-gray-900/40',
    },
    {
      title: 'Consommation moyenne',
      mobileTitle: 'Conso.',
      value: avgConsumption > 0 ? `${avgConsumption.toFixed(1)} L/100` : '—',
      iconName: 'conso',
      iconBg: 'bg-gray-50 dark:bg-gray-900/40',
    },
    {
      title: 'Rappels en retard',
      mobileTitle: 'Rappels',
      value:
        overdueReminders > 0
          ? `${overdueReminders} rappel${overdueReminders > 1 ? 's' : ''}`
          : 'Aucun',
      iconName: 'bell',
      iconBg:
        overdueReminders > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-50 dark:bg-gray-900/40',
      valueColor:
        overdueReminders > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <>
      {/* Mobile: single unified card, 3 sections side-by-side */}
      <Card className="sm:hidden">
        <CardContent className="p-0">
          <div className="flex divide-x divide-gray-100 dark:divide-gray-800">
            {stats.map((stat) => (
              <div
                key={stat.mobileTitle}
                className="flex-1 flex flex-col items-center py-4 px-2 gap-1.5"
              >
                <div
                  className={`p-2 ${stat.iconBg} rounded-lg inline-flex items-center justify-center shrink-0`}
                >
                  <Icon name={stat.iconName} size={18} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-tight">
                  {stat.mobileTitle}
                </p>
                <p
                  className={`text-sm font-bold text-center leading-tight truncate w-full px-1 ${stat.valueColor ?? 'text-slate-900 dark:text-slate-100'}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Desktop: 3 separate cards */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`p-3 ${stat.iconBg} rounded-lg inline-flex items-center justify-center shrink-0`}
              >
                <Icon name={stat.iconName} size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{stat.title}</p>
                <p
                  className={`text-xl font-bold truncate ${stat.valueColor ?? 'text-slate-900 dark:text-slate-100'}`}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
