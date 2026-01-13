/**
 * @file components/vehicle/GarageFamilySection.tsx
 * @fileoverview Family vehicles section for the garage page.
 * 
 * This component displays vehicles from family members (excluding current user's vehicles).
 * It's only rendered when the user belongs to a family and there are other members' vehicles.
 */

'use client';

import { useState, useEffect } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useFamily } from '@/contexts/FamilyContext';
import VehicleCardReadOnly from './VehicleCardReadOnly';

type FamilyVehicle = {
  vehicle_id: string;
  vehicle_name: string;
  user_id: string;
  owner_name: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuel_type?: string | null;
  odometer?: number | null;
  plate?: string | null;
  last_fill?: string | null;
  [key: string]: unknown;
};

export default function VehicleListFamily() {
  const { vehicles } = useVehicles();
  const { currentFamily, families } = useFamily();
  const currentUserId = vehicles?.[0]?.owner;
  
  const [familyVehicles, setFamilyVehicles] = useState<FamilyVehicle[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyVehicles = async () => {
      if (currentFamily && families.length > 0) {
        try {
          setFamilyLoading(true);
          setFamilyError(null);
          
          const response = await fetch(`/api/families/${currentFamily.id}/vehicles`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch family vehicles');
          }
          
          const data = await response.json();
          setFamilyVehicles(data.vehicles || []);
          
        } catch (error) {
          console.error('Error fetching family vehicles:', error);
          setFamilyError(error instanceof Error ? error.message : 'Failed to load family vehicles');
        } finally {
          setFamilyLoading(false);
        }
      }
    };
    
    if (currentFamily && familyVehicles.length === 0) {
      fetchFamilyVehicles();
    }
  }, [currentFamily, families.length, familyVehicles.length]);

  function getOtherFamilyMembersVehicles(): FamilyVehicle[] {
    if (!currentUserId) {
      return familyVehicles;
    }
    
    return familyVehicles.filter(vehicle => vehicle.user_id !== currentUserId);
  }

  const otherMembersVehicles = getOtherFamilyMembersVehicles();

  // Don't render anything if no other members' vehicles exist
  if (families.length === 0 || otherMembersVehicles.length === 0) {
    return null;
  }

  return (
    <div className="family-vehicles-section mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Véhicules des membres de votre famille
      </h2>
      
      {familyError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {familyError}
        </div>
      )}

      {familyLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {!familyLoading && (
        <div className="grid grid-cols-1 gap-6">
          {otherMembersVehicles.map((vehicle) => (
            <VehicleCardReadOnly 
              key={vehicle.vehicle_id} 
              vehicle={vehicle} 
              showOwner={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}