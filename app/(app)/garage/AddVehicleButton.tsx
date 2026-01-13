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
import Icon from '@/components/ui/Icon';

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
                className="px-4 py-3 bg-custom-1 text-white rounded-lg hover:bg-custom-1-hover hover:cursor-pointer flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3"
                aria-label="Ajouter un véhicule"
            >
                <Icon name="add" size={20} className="invert dark:invert-0" />
                <span className="font-medium">Ajouter un véhicule</span>
            </button>

            <VehicleModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}