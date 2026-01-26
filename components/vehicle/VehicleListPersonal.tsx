'use client';

import React from 'react'
import { useVehicles } from '@/contexts/VehicleContext'
import VehicleCard from './VehicleCard'

interface VehicleListPersonalProps {
  vehicles: Array<{
    id: number
    name: string | null
    make: string | null
    model: string | null
    odometer: number | null
    plate: string | null
    fuel_type: string | null
  }>
}

export const VehicleListPersonal: React.FC<VehicleListPersonalProps> = ({ vehicles }) => {
  const { selectedVehicleId, setSelectedVehicleId } = useVehicles()
  
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
  }
  
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Aucun véhicule personnel trouvé
      </div>
    )
  }
  
  return (
    <div className="vehicle-list-personal">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Mes véhicules ({vehicles.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={selectedVehicleId === vehicle.id.toString()}
            onSelect={handleVehicleSelect}
            showActions={true}
          />
        ))}
      </div>
    </div>
  )
}