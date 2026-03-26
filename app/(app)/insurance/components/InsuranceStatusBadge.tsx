import { getDaysUntilExpiry } from '@/lib/utils/insuranceUtils';

import type { InsuranceContract } from '@/types/insurance';

interface InsuranceStatusBadgeProps {
  contract: InsuranceContract;
}

export default function InsuranceStatusBadge({ contract }: InsuranceStatusBadgeProps) {
  const days = getDaysUntilExpiry(contract);

  if (days === null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
        Actif
      </span>
    );
  }

  if (days < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
        Expiré
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
        Échéance Proche
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
      Actif
    </span>
  );
}
