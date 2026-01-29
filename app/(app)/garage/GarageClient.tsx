'use client'

import React from 'react'
import AddVehicleButton from './AddVehicleButton'
import { useVehicles } from '@/contexts/VehicleContext'
import { Vehicle } from '@/types/vehicle'
import VehicleListPersonal from '@/components/vehicle/VehicleList'

export default function GarageClient() {
  const { vehicles, loading, error } = useVehicles()

  // Debug: log des véhicules bruts pour vérifier l'API
  console.log('Raw vehicles data from API:', vehicles)

  // Transforme les véhicules API en objets Vehicle typés correctement
  const transformedVehicles: Vehicle[] = vehicles?.map((vehicle) => ({
    id: Number(vehicle?.vehicle_id) || 0,
    owner: vehicle?.owner ?? null,
    owner_name: vehicle?.owner_name ?? null,
    name: typeof vehicle?.vehicle_name === 'string' ? vehicle.vehicle_name : null,
    make: vehicle?.make ?? null,
    model: vehicle?.model ?? null,
    year: vehicle?.year ?? null,
    fuel_type: vehicle?.fuel_type ?? null,
    manufacturer_consumption: vehicle?.manufacturer_consumption ?? null,
    odometer: vehicle?.odometer ?? null,
    plate: vehicle?.plate ?? null,
    last_fill: typeof vehicle?.last_fill === 'string' ? vehicle.last_fill : null,
  })) || []

  // Debug: log des véhicules transformés
  console.log('Transformed vehicles data:', transformedVehicles)

  if (loading) {
    return <div className="text-center py-8">Chargement des véhicules...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur: {error}</div>
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Vos véhicules</h1>

      {/* Section véhicules personnels */}
      <VehicleListPersonal vehicles={transformedVehicles} />

      <AddVehicleButton />
    </main>
  )
}