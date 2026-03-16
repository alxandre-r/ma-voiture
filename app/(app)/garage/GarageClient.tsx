/**
 * @file GarageClient.tsx
 * @fileoverview Client component for the Garage page.
 *
 * Displays user's vehicles and family vehicles with the new design.
 * Handles "Add Vehicle" modal state and vehicle detail view.
 *
 * Based on the new garage_model design.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Icon from '@/components/common/ui/Icon';
import VehicleCard from '@/components/vehicle/VehicleCard';
import VehicleDetail from '@/components/vehicle/VehicleDetail';
import VehicleForm from '@/components/vehicle/VehicleForm';
import { useSetHeader } from '@/contexts/HeaderContext';
import { useNotifications } from '@/contexts/NotificationContext';

import type { Vehicle } from '@/types/vehicle';

interface FamilyMember {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
}

export default function GarageClient({
  userVehicles,
  familyVehicles,
  familyMembers = [],
}: {
  userVehicles: Vehicle[];
  familyVehicles: Vehicle[];
  familyMembers?: FamilyMember[];
}) {
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useNotifications();
  const setHeader = useSetHeader();

  // View state: 'list' | 'detail' | 'form'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set header with "Ajouter un véhicule" button
  useEffect(() => {
    setHeader({
      title: 'Garage',
      rightContent:
        viewState === 'list' ? (
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setIsEditing(false);
              setViewState('form');
            }}
            className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg cursor-pointer
            font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="add" size={18} className="invert dark:invert-0" />
            Ajouter un véhicule
          </button>
        ) : undefined,
    });

    return () => {
      setHeader({ title: 'Ma Voiture' });
    };
  }, [setHeader, viewState]);

  // --- Modal ouverture selon search param ---
  useEffect(() => {
    if (searchParams.get('addVehicle') === 'true') {
      setSelectedVehicle(null);
      setIsEditing(false);
      setViewState('form');
    }
  }, [searchParams]);

  // --- Handle vehicle click ---
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setViewState('detail');
    setIsEditing(false);
  };

  // --- Handle edit ---
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
    setViewState('form');
  };

  // --- Handle add new ---
  const handleAddNew = () => {
    setSelectedVehicle(null);
    setIsEditing(false);
    setViewState('form');
  };

  // --- Handle form cancel ---
  const handleCancel = () => {
    if (selectedVehicle) {
      setViewState('detail');
    } else {
      setViewState('list');
    }
    setIsEditing(false);
  };

  // --- Handle form save ---
  const handleSave = async (vehicleData: Partial<Vehicle>) => {
    setIsSubmitting(true);
    try {
      const isUpdate = !!vehicleData.vehicle_id;
      const endpoint = isUpdate ? '/api/vehicles/update' : '/api/vehicles/add';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");

      showSuccess(isUpdate ? 'Véhicule modifié avec succès !' : 'Véhicule ajouté avec succès !');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      showError(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Back to list ---
  const handleBack = () => {
    setSelectedVehicle(null);
    setViewState('list');
    setIsEditing(false);
  };

  // --- Filter vehicles ---
  // Personal vehicles: owned by current user (all userVehicles are personal)
  const personalVehicles = userVehicles || [];
  // Shared vehicles: belong to family
  const sharedVehicles = familyVehicles || [];

  // Helper to check if vehicle is from family
  const isFamilyVehicle = (v: Vehicle) =>
    sharedVehicles.some((sv) => sv.vehicle_id === v.vehicle_id);

  // Helper to get owner info for a family vehicle
  const getOwnerInfo = (vehicle: Vehicle) => {
    if (!vehicle.owner_id) return null;
    const member = familyMembers.find((m) => m.user_id === vehicle.owner_id);
    if (!member) return null;
    return {
      user_id: member.user_id,
      user_name: member.user_name,
      avatar_url: member.avatar_url,
    };
  };

  // --- Empty garage ---
  if (personalVehicles.length === 0 && sharedVehicles.length === 0 && viewState === 'list') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="car" size={48} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Votre garage est vide</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Ajoutez votre premier véhicule pour commencer à suivre vos pleinages, votre consommation
          et vos statistiques.
        </p>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-200"
        >
          <Icon name="add" size={20} />
          Ajouter un véhicule
        </button>
      </div>
    );
  }

  // --- Form view ---
  if (viewState === 'form') {
    return (
      <VehicleForm
        vehicle={isEditing ? selectedVehicle : null}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    );
  }

  // --- Detail view ---
  if (viewState === 'detail' && selectedVehicle) {
    const detailOwnerInfo = isFamilyVehicle(selectedVehicle)
      ? (getOwnerInfo(selectedVehicle) ?? undefined)
      : undefined;
    return (
      <VehicleDetail
        vehicle={selectedVehicle}
        onBack={handleBack}
        onEdit={() => handleEdit(selectedVehicle)}
        isFamilyVehicle={isFamilyVehicle(selectedVehicle)}
        owner={detailOwnerInfo}
      />
    );
  }

  // --- List view ---
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Section: Mes Véhicules */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon name="car" size={24} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
              Mes Véhicules
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {personalVehicles.length} VÉHICULE{personalVehicles.length > 1 ? 'S' : ''}
          </span>
        </div>

        {personalVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.vehicle_id}
                vehicle={vehicle}
                onClick={handleVehicleClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Aucun véhicule personnel</p>
            <button
              onClick={handleAddNew}
              className="mt-4 text-custom-2 hover:text-custom-2-hover font-medium"
            >
              + Ajouter un véhicule
            </button>
          </div>
        )}
      </section>

      {/* Section: Véhicules de la Famille */}
      {sharedVehicles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Icon name="family" size={24} className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                Véhicules de la Famille
              </h3>
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {sharedVehicles.length} VÉHICULE{sharedVehicles.length > 1 ? 'S' : ''} PARTAGÉ
              {sharedVehicles.length > 1 ? 'S' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedVehicles.map((vehicle) => {
              const ownerInfo = getOwnerInfo(vehicle);
              return (
                <VehicleCard
                  key={vehicle.vehicle_id}
                  vehicle={vehicle}
                  onClick={handleVehicleClick}
                  isFamilyVehicle={true}
                  owner={ownerInfo || undefined}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
