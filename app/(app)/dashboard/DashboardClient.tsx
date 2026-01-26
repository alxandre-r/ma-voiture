"use client";

import React, { useEffect, useState } from "react";
import VehicleSwitcher from "@/components/vehicle/VehicleSwitcher"; // optionnel : tu peux inline si tu préfères
import FillModal from "@/components/fill/forms/FillModal";
import Icon from "@/components/ui/Icon";
import Charts from "@/components/dashboard/Charts";
import LatestFills from "@/components/dashboard/LatestFills";
import { useFills } from "@/contexts/FillContext";

export type Vehicle = {
	id: number;
	name: string | null;
	make: string | null;
	model: string | null;
	odometer: number | null;
};

interface DashboardClientProps {
	vehicles: Vehicle[];
}

/**
 * Petit composant AddFill intégré
 */
function AddFillClient({ vehicles }: { vehicles: Vehicle[] }) {
	const [open, setOpen] = useState(false);

	return (
		<>
		<button
			onClick={() => setOpen(true)}
			className="px-4 py-3 bg-custom-3 text-white rounded-lg hover:bg-custom-3-hover flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3 hover:cursor-pointer"
			aria-label="Ajouter un plein"
		>
			<Icon name="add" size={20} className="invert dark:invert-0" />
			<span className="font-medium">Ajouter un plein</span>
		</button>

		<FillModal open={open} onClose={() => setOpen(false)} vehicles={vehicles} />
		</>
	);
}

export default function DashboardClient({ vehicles }: DashboardClientProps) {
	const { setSelectedVehicleId, setVehicles, loading, error } = useFills();

	const [selectedVehicleId, setLocalSelectedVehicleId] = useState<string | null>(null);

	useEffect(() => {
		// Set vehicles
		setVehicles(vehicles);
		
		// init single vehicle if only one
		if (vehicles.length === 1 && selectedVehicleId === null) {
		const id = vehicles[0].id.toString();
		setLocalSelectedVehicleId(id);
		setSelectedVehicleId(id);
		}
	}, [vehicles, setVehicles, selectedVehicleId, setSelectedVehicleId]);

	const handleVehicleChange = (vehicleId: string | null) => {
		setLocalSelectedVehicleId(vehicleId);
		setSelectedVehicleId(vehicleId);
	};

	const isSwitcherDisabled = vehicles.length <= 1;

	if (loading) {
		return (
		<div className="flex justify-center items-center h-64">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
		</div>
		);
  	}



  	return (
    <>
		{error && (
			<div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700"> {error} </div>
		)}

		<div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
			<VehicleSwitcher
				vehicles={vehicles}
				selectedVehicleId={selectedVehicleId}
				onVehicleChange={handleVehicleChange}
				disabled={isSwitcherDisabled}
			/>
			<AddFillClient vehicles={vehicles} />
		</div>
		
		<div className="mt-6 grid grid-cols-1 gap-6">
			<Charts />
			<LatestFills />
		</div>
	</>
	);
}