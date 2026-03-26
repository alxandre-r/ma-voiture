import Image from 'next/image';

import Icon from '@/components/common/ui/Icon';
import { getActiveContract, getHistoricalContracts } from '@/lib/utils/insuranceUtils';

import InsuranceHistoryList from './InsuranceHistoryList';
import InsuranceStatusBadge from './InsuranceStatusBadge';

import type { InsuranceContract } from '@/types/insurance';
import type { Vehicle } from '@/types/vehicle';

interface InsuranceVehicleCardProps {
  vehicle: Vehicle;
  contracts: InsuranceContract[];
  isFamily?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAdd?: () => void;
  onNewContract?: () => void;
  onChangeRate?: () => void;
  onEdit?: (contract: InsuranceContract) => void;
  onDelete?: (contract: InsuranceContract) => void;
}

export default function InsuranceVehicleCard({
  vehicle,
  contracts,
  isFamily,
  isExpanded,
  onToggleExpand,
  onAdd,
  onNewContract,
  onChangeRate,
  onEdit,
  onDelete,
}: InsuranceVehicleCardProps) {
  const activeContract = getActiveContract(contracts);
  const historicalContracts = getHistoricalContracts(contracts);
  const vehicleName = [vehicle.make, vehicle.model, vehicle.year ? `· ${vehicle.year}` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* ── Main info row ── */}
        <div className="flex gap-3 items-center">
          {/* Thumbnail */}
          <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
            {vehicle.image ? (
              <Image src={vehicle.image} alt={vehicleName} fill className="object-cover" />
            ) : (
              <Icon name="car" size={24} className="text-gray-400" />
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {vehicleName}
              </p>
              {activeContract && <InsuranceStatusBadge contract={activeContract} />}
              {isFamily && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full font-medium">
                  Lecture seule
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {vehicle.plate && (
                <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {vehicle.plate}
                </span>
              )}
              {activeContract?.provider && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {activeContract.provider}
                </span>
              )}
              {!activeContract && (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  Aucun contrat actif
                </span>
              )}
            </div>
          </div>

          {/* Monthly cost — prominent */}
          {activeContract ? (
            <div className="flex-shrink-0 text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                {activeContract.monthly_cost} €
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                /mois
              </p>
            </div>
          ) : !isFamily ? (
            <button
              onClick={onAdd}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-custom-2 hover:bg-custom-2-hover text-white transition-colors cursor-pointer"
            >
              <Icon name="add" size={13} className="invert dark:invert-0" /> Ajouter
            </button>
          ) : null}
        </div>

        {/* ── Actions row ── */}
        {!isFamily && activeContract && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex-wrap">
            <button
              onClick={onNewContract}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-white bg-custom-2 hover:bg-custom-2-hover"
            >
              Nouveau contrat
            </button>
            <button
              onClick={onChangeRate}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-white bg-custom-1 hover:bg-custom-1-hover"
            >
              Changement tarif
            </button>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => onEdit?.(activeContract)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Modifier"
              >
                <Icon name="edit" size={14} />
              </button>
              <button
                onClick={() => onDelete?.(activeContract)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Icon name="delete" size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── History toggle ── */}
        {historicalContracts.length > 0 && (
          <button
            onClick={onToggleExpand}
            className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Icon name={isExpanded ? 'arrow-up' : 'arrow-down'} size={14} />
            Historique ({historicalContracts.length})
          </button>
        )}

        {/* ── History list ── */}
        {isExpanded && historicalContracts.length > 0 && (
          <InsuranceHistoryList
            contracts={historicalContracts}
            isFamily={isFamily}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
