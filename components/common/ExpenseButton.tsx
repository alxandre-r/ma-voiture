'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

import FillForm from '@/components/common/forms/FillForm';
import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import Icon from '@/components/common/ui/Icon';
import { useFillActions } from '@/hooks/fill/useFillActions';
import { useMaintenanceActions } from '@/hooks/maintenance/useMaintenanceActions';
import { useClickOutside } from '@/lib/utils/clickOutside';

import type { MaintenanceFormData } from '@/hooks/maintenance/useMaintenanceActions';
import type { FillFormData } from '@/types/fill';
import type { VehicleMinimal } from '@/types/vehicle';

type ExpenseType = 'fill' | 'charge' | 'maintenance';

interface ExpenseButtonProps {
  vehicles: VehicleMinimal[];
  currentUserId: string | undefined;
}

export default function ExpenseButton({ vehicles, currentUserId }: ExpenseButtonProps) {
  const router = useRouter();

  const [showMenu, setShowMenu] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null);
  const [showFillForm, setShowFillForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { addFill } = useFillActions();
  const { addMaintenance } = useMaintenanceActions();

  // Close dropdown when clicking outside
  useClickOutside(menuRef, () => setShowMenu(false), showMenu);

  // Get minimal vehicles for forms
  const minimalVehicles = vehicles
    .map((v) => ({
      vehicle_id: v.vehicle_id,
      name: v.name,
      make: v.make,
      model: v.model,
      fuel_type: v.fuel_type,
      odometer: v.odometer,
      status: v.status,
      owner_id: v.owner_id,
    }))
    // Filter to only include active vehicles owned by the current user
    .filter((v) => {
      const isActive = v.status === 'active' || v.status === null || v.status === undefined;
      const isOwner = v.owner_id === currentUserId;
      return isActive && isOwner;
    });

  // Filter vehicles for fill (fuel)
  const fillVehicles = minimalVehicles.filter((v) => {
    const fuelType = v.fuel_type;
    return fuelType !== 'Électrique' && fuelType !== 'Hybride non rechargeable';
  });

  // Filter vehicles for charge (electric)
  const chargeVehicles = minimalVehicles.filter((v) => {
    const fuelType = v.fuel_type;
    return fuelType === 'Électrique' || fuelType === 'Hybride rechargeable';
  });

  // Check if user has at least one active electric or rechargeable hybrid vehicle

  const hasActiveFuelVehicle = fillVehicles.length > 0;
  const hasActiveElectricVehicle = chargeVehicles.length > 0;
  const hasActiveVehicle = minimalVehicles.length > 0;

  // Get form vehicles based on type
  const formVehicles = selectedExpenseType === 'charge' ? chargeVehicles : fillVehicles;

  const handleSelect = (type: ExpenseType) => {
    setSelectedExpenseType(type);
    setShowMenu(false);

    if (type === 'maintenance') {
      setShowMaintenanceForm(true);
    } else {
      setShowFillForm(true);
    }
  };

  const handleSuccess = () => {
    router.refresh();
    setShowFillForm(false);
    setShowMaintenanceForm(false);
    setSelectedExpenseType(null);
  };

  // Handle fill form save
  const handleFillSave = async (data: FillFormData) => {
    const success = await addFill(data);
    if (success) {
      handleSuccess();
    }
    return success;
  };

  // Handle maintenance form save
  const handleMaintenanceSave = async (data: MaintenanceFormData) => {
    const success = await addMaintenance(data);
    if (success) {
      handleSuccess();
    }
    return success;
  };

  // Render the component based on state
  // Note: All hooks must be called before any conditional returns

  // If no active vehicle, show warning message
  if (!hasActiveVehicle) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-medium">Aucun véhicule actif disponible</p>
        <p className="text-sm">Veuillez ajouter un véhicule actif pour enregistrer des dépenses.</p>
      </div>
    );
  }

  // If showing fill form, render it
  if (showFillForm && selectedExpenseType) {
    return (
      <FillForm
        vehicles={formVehicles}
        forcedType={selectedExpenseType === 'charge' ? 'charge' : 'fill'}
        onSave={handleFillSave}
        onCancel={() => {
          setShowFillForm(false);
          setSelectedExpenseType(null);
        }}
        saving={false}
      />
    );
  }

  // If showing maintenance form, render it
  if (showMaintenanceForm) {
    return (
      <MaintenanceForm
        vehicles={minimalVehicles}
        onSave={handleMaintenanceSave}
        onCancel={() => {
          setShowMaintenanceForm(false);
          setSelectedExpenseType(null);
        }}
        saving={false}
      />
    );
  }

  // Render the button
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-medium 
              transition-colors flex items-center gap-2 self-center sm:self-auto cursor-pointer"
      >
        <Icon name="add" size={18} className="invert" />
        Ajouter une dépense
        <Icon name="arrow-down" size={14} className="invert" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border 
                border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="py-1">
            {/* Fill button - only show if user has active fuel vehicles */}
            {hasActiveFuelVehicle && (
              <button
                onClick={() => handleSelect('fill')}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                      flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Icon name="conso" size={20} className="text-orange-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Plein de carburant
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ajouter un plein d&#39;essence ou diesel
                  </div>
                </div>
              </button>
            )}

            {/* Charge button - only show if user has active electric vehicles */}
            {hasActiveElectricVehicle && (
              <button
                onClick={() => handleSelect('charge')}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                        flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Icon name="elec" size={20} className="text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Recharge électrique
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ajouter une recharge pour véhicule électrique
                  </div>
                </div>
              </button>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            <button
              onClick={() => handleSelect('maintenance')}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                      flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Icon name="tool" size={20} className="text-green-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Entretien / Réparation
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ajouter un entretien ou une réparation
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
