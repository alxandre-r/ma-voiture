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
                className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 hover:cursor-pointer sm:px-6 sm:py-3"
                aria-label="Ajouter un véhicule"
            >
                Ajouter un véhicule
            </button>

            <VehicleModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}