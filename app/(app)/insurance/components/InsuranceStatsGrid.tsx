import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Icon from '@/components/common/ui/Icon';

import type { InsuranceContract } from '@/types/insurance';
import type { Vehicle } from '@/types/vehicle';

interface StatCardProps {
  icon: string;
  iconBg: string;
  valueColor?: string;
  label: string;
  loading: boolean;
  value: React.ReactNode;
  subtitle?: string;
}

function StatCard({ icon, iconBg, label, valueColor, loading, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
        <span
          className={`p-1 sm:p-1.5 ${iconBg} rounded-lg flex-shrink-0 flex items-center justify-center`}
        >
          <Icon name={icon} size={16} />
        </span>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 leading-tight hidden sm:block">
          {label}
        </p>
      </div>
      <p className={`text-base sm:text-2xl font-bold ${valueColor}`}>{loading ? '—' : value}</p>
      {subtitle && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

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
  const nextPaymentValue = nextPaymentEntry ? (
    <>
      <span>
        {format(nextPaymentEntry.date, 'dd MMM', { locale: fr })}
        <span className="hidden sm:inline">
          {' '}
          {format(nextPaymentEntry.date, 'yyyy', { locale: fr })}
        </span>
      </span>
      {nextPaymentVehicle && (
        <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {nextPaymentVehicle.make} {nextPaymentVehicle.model}
        </span>
      )}
    </>
  ) : null;

  const vehiclesColor =
    !loading && vehiclesInsuredCount < totalVehicleCount
      ? 'text-amber-500'
      : 'text-gray-900 dark:text-gray-100';

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <StatCard
        icon="euro"
        iconBg="bg-custom-2/10"
        label="Prime mensuelle totale"
        loading={loading}
        value={`${totalMonthlyPremium.toFixed(2)} €`}
      />

      <StatCard
        icon="car"
        iconBg="bg-blue-50 dark:bg-blue-900/20"
        label="Véhicules assurés"
        loading={loading}
        value={`${vehiclesInsuredCount} / ${totalVehicleCount}`}
        valueColor={vehiclesColor}
        subtitle="véhicules"
      />

      <StatCard
        icon="calendar"
        iconBg="bg-red-50 dark:bg-red-900/20"
        label="Prochaine mensualité"
        loading={loading}
        value={nextPaymentValue || '—'}
      />
    </div>
  );
}
