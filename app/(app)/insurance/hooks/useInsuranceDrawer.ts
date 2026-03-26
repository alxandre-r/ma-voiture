'use client';

import { useCallback, useState } from 'react';

import { getActiveContract, getSuggestedStartDate } from '@/lib/utils/insuranceUtils';

import type { InsuranceContract } from '@/types/insurance';

export type DrawerMode = 'add' | 'new-contract' | 'change-rate' | 'edit';

export interface DrawerState {
  isOpen: boolean;
  mode: DrawerMode | null;
  vehicleId: number | null;
  currentProvider: string | null;
  editingContract: InsuranceContract | null;
  suggestedStartDate: string;
}

const DRAWER_INITIAL: DrawerState = {
  isOpen: false,
  mode: null,
  vehicleId: null,
  currentProvider: null,
  editingContract: null,
  suggestedStartDate: new Date().toISOString().split('T')[0],
};

export function useInsuranceDrawer() {
  const [drawer, setDrawer] = useState<DrawerState>(DRAWER_INITIAL);

  const openDrawer = useCallback(
    (
      mode: DrawerMode,
      vehicleId: number,
      contracts: InsuranceContract[],
      editingContract?: InsuranceContract,
    ) => {
      const active = getActiveContract(contracts);
      setDrawer({
        isOpen: true,
        mode,
        vehicleId,
        currentProvider: active?.provider ?? null,
        editingContract: editingContract ?? null,
        suggestedStartDate: getSuggestedStartDate(contracts),
      });
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    setDrawer(DRAWER_INITIAL);
  }, []);

  return { drawer, openDrawer, closeDrawer };
}
