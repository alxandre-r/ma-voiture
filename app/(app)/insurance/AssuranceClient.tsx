'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ui/ConfirmationModal';
import Icon from '@/components/common/ui/Icon';
import Spinner from '@/components/common/ui/Spinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { getActiveContract, getNextMonthlyPaymentDate } from '@/lib/utils/insuranceUtils';
import { uploadPendingAttachments } from '@/lib/utils/uploadAttachments';

import InsuranceContractDrawer from './components/InsuranceContractDrawer';
import InsuranceStatsGrid from './components/InsuranceStatsGrid';
import InsuranceVehicleCard from './components/InsuranceVehicleCard';
import { useInsuranceContracts } from './hooks/useInsuranceContracts';
import { useInsuranceDrawer } from './hooks/useInsuranceDrawer';

import type { InsuranceContract, InsuranceFormData } from '@/types/insurance';
import type { Vehicle } from '@/types/vehicle';

interface AssuranceClientProps {
  vehicles: Vehicle[];
  ownedVehicleIds: number[];
}

const SAVE_MESSAGES = {
  add: "Contrat d'assurance ajouté !",
  'new-contract': 'Nouveau contrat enregistré !',
  'change-rate': 'Nouveau tarif enregistré !',
  edit: 'Contrat mis à jour !',
} as const;

export default function AssuranceClient({ vehicles, ownedVehicleIds }: AssuranceClientProps) {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();

  const ownedSet = new Set(ownedVehicleIds);
  const ownedVehicles = vehicles.filter((v) => ownedSet.has(v.vehicle_id));
  const familyVehicles = vehicles.filter((v) => !ownedSet.has(v.vehicle_id));

  const { contractsMap, loading, refetchVehicle } = useInsuranceContracts(
    ownedVehicleIds,
    vehicles,
  );
  const { drawer, openDrawer, closeDrawer } = useInsuranceDrawer();

  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteState, setDeleteState] = useState<{
    contract: InsuranceContract | null;
    vehicleId: number | null;
  }>({ contract: null, vehicleId: null });
  const [deleting, setDeleting] = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const allActiveContracts: InsuranceContract[] = [];
  for (const vehicleId of ownedVehicleIds) {
    const active = getActiveContract(contractsMap.get(vehicleId) ?? []);
    if (active) allActiveContracts.push(active);
  }

  const totalMonthlyPremium = allActiveContracts.reduce((sum, c) => sum + c.monthly_cost, 0);
  const vehiclesInsuredCount = allActiveContracts.length;

  const nextPaymentEntry =
    allActiveContracts.length > 0
      ? allActiveContracts
          .map((c) => ({ contract: c, date: getNextMonthlyPaymentDate(c.start_date) }))
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
      : null;

  const nextPaymentVehicle = nextPaymentEntry
    ? (vehicles.find((v) => v.vehicle_id === nextPaymentEntry.contract.vehicle_id) ?? null)
    : null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async (
    formData: InsuranceFormData,
    pendingFiles: File[],
  ): Promise<boolean> => {
    if (!drawer.vehicleId || !drawer.mode) return false;
    setSaving(true);
    try {
      const res =
        drawer.mode === 'edit'
          ? await fetch('/api/insurance/update', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: drawer.editingContract!.id, ...formData }),
            })
          : await fetch('/api/insurance/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vehicle_id: drawer.vehicleId, ...formData }),
            });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      if (pendingFiles.length && data.contract?.id) {
        await uploadPendingAttachments(pendingFiles, 'insurance_contract', data.contract.id);
      }

      showSuccess(SAVE_MESSAGES[drawer.mode]);
      const vid = drawer.vehicleId;
      closeDrawer();
      await refetchVehicle(vid);
      router.refresh();
      return true;
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteState.contract) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/insurance/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteState.contract.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      showSuccess('Contrat supprimé.');
      const vid = deleteState.vehicleId!;
      setDeleteState({ contract: null, vehicleId: null });
      await refetchVehicle(vid);
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InsuranceStatsGrid
        loading={loading}
        totalMonthlyPremium={totalMonthlyPremium}
        vehiclesInsuredCount={vehiclesInsuredCount}
        totalVehicleCount={vehicles.length}
        nextPaymentEntry={nextPaymentEntry}
        nextPaymentVehicle={nextPaymentVehicle}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Contrats actifs
        </h2>
        {ownedVehicles.length > 0 && (
          <button
            onClick={() => {
              const v = ownedVehicles[0];
              openDrawer('add', v.vehicle_id, contractsMap.get(v.vehicle_id) ?? []);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-custom-2 hover:bg-custom-2-hover text-white transition-colors cursor-pointer"
          >
            <Icon name="add" size={14} className="invert dark:invert-0" /> Ajouter
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-3">
          {ownedVehicles.map((vehicle) => {
            const contracts = contractsMap.get(vehicle.vehicle_id) ?? [];
            return (
              <InsuranceVehicleCard
                key={vehicle.vehicle_id}
                vehicle={vehicle}
                contracts={contracts}
                isExpanded={expandedVehicleId === vehicle.vehicle_id}
                onToggleExpand={() =>
                  setExpandedVehicleId((prev) =>
                    prev === vehicle.vehicle_id ? null : vehicle.vehicle_id,
                  )
                }
                onAdd={() => openDrawer('add', vehicle.vehicle_id, contracts)}
                onNewContract={() => openDrawer('new-contract', vehicle.vehicle_id, contracts)}
                onChangeRate={() => openDrawer('change-rate', vehicle.vehicle_id, contracts)}
                onEdit={(contract) => openDrawer('edit', vehicle.vehicle_id, contracts, contract)}
                onDelete={(contract) => setDeleteState({ contract, vehicleId: vehicle.vehicle_id })}
              />
            );
          })}
        </div>
      )}

      {familyVehicles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Icon name="family" size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Véhicules de la famille
            </h3>
          </div>
          {familyVehicles.map((vehicle) => (
            <InsuranceVehicleCard
              key={vehicle.vehicle_id}
              vehicle={vehicle}
              contracts={[]}
              isFamily
              isExpanded={false}
              onToggleExpand={() => {}}
            />
          ))}
        </div>
      )}

      <InsuranceContractDrawer
        drawer={drawer}
        onClose={closeDrawer}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmationModal
        isOpen={!!deleteState.contract}
        onClose={() => setDeleteState({ contract: null, vehicleId: null })}
        onConfirm={handleDelete}
        title="Supprimer le contrat d'assurance"
        message="Cette action supprimera également toutes les dépenses d'assurance associées. Continuer ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmButtonColor="red"
        isLoading={deleting}
      />
    </div>
  );
}
