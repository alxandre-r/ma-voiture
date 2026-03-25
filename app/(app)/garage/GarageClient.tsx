'use client';

/**
 * @file GarageClient.tsx
 * @fileoverview Client component for the Garage page.
 *
 * Handles view state management (list, detail, form) and uses the useGarageActions hook
 * for business logic.
 */

import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import VehicleForm from '@/app/(app)/garage/components/forms/VehicleForm';
import VehicleDetail from '@/app/(app)/garage/components/VehicleDetail';
import Icon from '@/components/common/ui/Icon';

import EmptyGarage from './components/EmptyGarage';
import { FamilyVehiclesList } from './components/FamilyVehiclesList';
import { GarageVehiclesList } from './components/GarageVehiclesList';
import { useGarageActions } from './hooks/useGarageActions';

import type { Expense } from '@/types/expense';
import type { FamilyMemberDisplay } from '@/types/family';
import type { Vehicle } from '@/types/vehicle';

interface GarageClientProps {
  userVehicles: Vehicle[];
  familyVehicles?: Vehicle[] | null;
  familyMembers?: FamilyMemberDisplay[] | null;
  expenses?: Expense[];
}

export default function GarageClient({
  userVehicles,
  familyVehicles,
  familyMembers,
  expenses,
}: GarageClientProps) {
  const searchParams = useSearchParams();

  const {
    isSubmitting,
    viewState,
    selectedVehicle,
    isEditing,
    handleSaveVehicle,
    handleVehicleClick,
    handleEdit,
    handleAddNew,
    handleCancel,
    handleBack,
  } = useGarageActions();

  // --- Modal ouverture selon search param ---
  useEffect(() => {
    if (searchParams.get('addVehicle') === 'true') {
      handleAddNew();
    }
  }, [searchParams, handleAddNew]);

  // Helper to check if vehicle is from family
  const isFamilyVehicle = (vehicle: Vehicle) =>
    familyVehicles?.some((fv) => fv.vehicle_id === vehicle.vehicle_id) ?? false;

  // Helper to get owner info for a family vehicle
  const getOwnerInfo = (vehicle: Vehicle) => {
    if (!vehicle.owner_id || !familyMembers) return null;
    const member = familyMembers.find((m) => m.user_id === vehicle.owner_id);
    if (!member) return null;
    return {
      user_id: member.user_id,
      user_name: member.user_name,
      avatar_url: member.avatar_url,
    };
  };

  // Personal vehicles
  const personalVehicles = userVehicles || [];
  // Shared vehicles
  const sharedVehicles = familyVehicles || [];

  // --- Empty garage ---
  if (personalVehicles.length === 0 && sharedVehicles.length === 0 && viewState === 'list') {
    return <EmptyGarage onAddVehicle={handleAddNew} />;
  }

  // --- Form view ---
  if (viewState === 'form') {
    return (
      <VehicleForm
        vehicle={isEditing ? selectedVehicle : null}
        onSave={handleSaveVehicle}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    );
  }

  // --- Detail view ---
  if (viewState === 'detail' && selectedVehicle) {
    const detailOwnerInfo = isFamilyVehicle(selectedVehicle)
      ? getOwnerInfo(selectedVehicle)
      : undefined;

    return (
      <VehicleDetail
        vehicle={selectedVehicle}
        onBack={handleBack}
        onEdit={() => handleEdit(selectedVehicle)}
        isFamilyVehicle={isFamilyVehicle(selectedVehicle)}
        owner={detailOwnerInfo ?? undefined}
        expenses={expenses}
      />
    );
  }

  // --- List view ---
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Desktop button */}
      <div className="hidden sm:flex justify-end">
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Icon name="add" size={18} className="invert dark:invert-0" />
          Ajouter un véhicule
        </button>
      </div>

      {/* Section: Mes Véhicules */}
      <GarageVehiclesList
        vehicles={personalVehicles}
        onVehicleClick={handleVehicleClick}
        onAddVehicle={handleAddNew}
      />

      {/* Section: Véhicules de la Famille */}
      {sharedVehicles.length > 0 && (
        <FamilyVehiclesList
          vehicles={sharedVehicles}
          familyMembers={familyMembers || []}
          onVehicleClick={handleVehicleClick}
        />
      )}

      {/* Mobile FAB */}
      <button
        onClick={handleAddNew}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-custom-2 hover:bg-custom-2-hover text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        aria-label="Ajouter un véhicule"
      >
        <Icon name="add" size={24} className="invert dark:invert-0" />
      </button>
    </div>
  );
}
