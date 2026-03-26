'use client';

import InsuranceForm from '@/app/(app)/garage/components/forms/InsuranceForm';
import Drawer from '@/components/common/ui/Drawer';
import Icon from '@/components/common/ui/Icon';

import type { DrawerMode, DrawerState } from '../hooks/useInsuranceDrawer';
import type { InsuranceFormData } from '@/types/insurance';

const DRAWER_TITLES: Record<DrawerMode, string> = {
  add: 'Ajouter une assurance',
  'new-contract': 'Nouveau contrat',
  'change-rate': 'Changement de tarif',
  edit: 'Modifier le contrat',
};

interface InsuranceContractDrawerProps {
  drawer: DrawerState;
  onClose: () => void;
  onSave: (data: InsuranceFormData) => Promise<boolean>;
  saving: boolean;
}

export default function InsuranceContractDrawer({
  drawer,
  onClose,
  onSave,
  saving,
}: InsuranceContractDrawerProps) {
  return (
    <Drawer isOpen={drawer.isOpen} onClose={onClose}>
      {drawer.mode && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Icon name="arrow-back" size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {DRAWER_TITLES[drawer.mode]}
            </h2>
          </div>
          <InsuranceForm
            key={`${drawer.mode}-${drawer.vehicleId}-${drawer.editingContract?.id ?? 'new'}`}
            initialContract={drawer.mode === 'edit' ? drawer.editingContract : null}
            defaultProvider={
              drawer.mode === 'change-rate' ? (drawer.currentProvider ?? undefined) : undefined
            }
            defaultStartDate={drawer.mode !== 'edit' ? drawer.suggestedStartDate : undefined}
            showEndDate={drawer.mode === 'edit'}
            submitLabel={
              drawer.mode === 'change-rate' || drawer.mode === 'new-contract'
                ? 'Enregistrer'
                : undefined
            }
            onSave={onSave}
            onCancel={onClose}
            saving={saving}
          />
        </div>
      )}
    </Drawer>
  );
}
