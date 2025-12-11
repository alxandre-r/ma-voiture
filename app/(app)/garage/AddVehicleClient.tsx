/**
 * @file app/(app)/garage/AddVehicleClient.tsx
 * @fileoverview Client component for adding vehicles.
 * 
 * This component provides a button that opens the VehicleModal for adding new vehicles.
 * Uses client-side state to manage modal visibility.
 */

"use client";

import { useState } from "react";
import VehicleModal from "@/components/VehicleModal";

/**
 * AddVehicleClient Component
 * 
 * Button component that triggers the vehicle addition modal.
 * Manages modal open/close state.
 */
export default function AddVehicleClient() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 hover:cursor-pointer"
                aria-label="Ajouter un véhicule"
            >
                Ajouter un véhicule
            </button>

            <VehicleModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}