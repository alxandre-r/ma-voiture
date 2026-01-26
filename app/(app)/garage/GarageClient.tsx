'use client'

import React from 'react'
import AddVehicleButton from './AddVehicleButton'
import { useVehicles } from '@/contexts/VehicleContext'
import VehicleListPersonal from '@/components/vehicle/VehicleList'

export default function GarageClient() {
  const { vehicles, loading, error } = useVehicles()

  // Debug: Log the raw API response to understand the data structure
  console.log('Raw vehicles data from API:', vehicles)

  // Transform vehicles data from user_vehicles view to match VehicleListPersonal format
  const transformedVehicles = vehicles?.map(vehicle => ({
    id: vehicle?.vehicle_id?.toString() || '',
    owner: vehicle?.owner,
    owner_name: vehicle?.owner_name,
    name: vehicle?.vehicle_name,
    make: vehicle?.make,
    model: vehicle?.model,
    year: vehicle?.year,
    fuel_type: vehicle?.fuel_type,
    manufacturer_consumption: vehicle?.manufacturer_consumption,
    odometer: vehicle?.odometer,
    plate: vehicle?.plate,
    created_at: vehicle?.created_at,
    last_fill: vehicle?.last_fill
  })) || []

  // Debug: Log the transformed data
  console.log('Transformed vehicles data:', transformedVehicles)

  return (
    <main className="px-1 pt-4 pb-24 space-y-3 sm:px-2 sm:space-y-4 lg:px-4 lg:space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vos véhicules</h1>

      {/* Personal Vehicles Section with full CRUD capabilities */}
      <VehicleListPersonal vehicles={transformedVehicles} />

      <AddVehicleButton />
    </main>
  )
}