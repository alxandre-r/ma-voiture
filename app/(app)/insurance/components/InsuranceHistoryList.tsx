import { parseISO } from 'date-fns';

import Icon from '@/components/common/ui/Icon';
import { formatInsuranceDate } from '@/lib/utils/insuranceUtils';

import type { InsuranceContract } from '@/types/insurance';

interface InsuranceHistoryListProps {
  contracts: InsuranceContract[];
  isFamily?: boolean;
  onEdit?: (contract: InsuranceContract) => void;
  onDelete?: (contract: InsuranceContract) => void;
}

export default function InsuranceHistoryList({
  contracts,
  isFamily,
  onEdit,
  onDelete,
}: InsuranceHistoryListProps) {
  const sorted = [...contracts].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime(),
  );

  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2 space-y-0.5">
      {sorted.map((contract, idx) => {
        const older = sorted[idx + 1];
        const evolution = older ? contract.monthly_cost - older.monthly_cost : null;

        return (
          <div
            key={contract.id}
            className="flex items-center gap-2 py-1.5 border-t border-gray-50 dark:border-gray-800 first:border-t-0"
          >
            {/* Provider + period */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {contract.provider ?? <span className="italic text-gray-400">—</span>}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {formatInsuranceDate(contract.start_date)} →{' '}
                {formatInsuranceDate(contract.end_date)}
              </p>
            </div>

            {/* Monthly cost */}
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex-shrink-0">
              {contract.monthly_cost} €
            </span>

            {/* Evolution badge */}
            {evolution !== null ? (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  evolution > 0
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : evolution < 0
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {evolution !== 0 && (
                  <Icon name={evolution > 0 ? 'trending-up' : 'trending-down'} size={10} />
                )}
                {evolution > 0 ? '+' : ''}
                {evolution.toFixed(2)} €
              </span>
            ) : (
              <span className="text-[10px] text-gray-300 dark:text-gray-600 flex-shrink-0">
                <span className="sm:hidden">init.</span>
                <span className="hidden sm:inline">Initialisation</span>
              </span>
            )}

            {/* Actions — always visible (no hover-only on mobile) */}
            {!isFamily && (
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEdit?.(contract)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Icon name="edit" size={13} />
                </button>
                <button
                  onClick={() => onDelete?.(contract)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Icon name="delete" size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
