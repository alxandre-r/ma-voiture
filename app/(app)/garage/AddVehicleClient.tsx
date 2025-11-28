"use client";

import { useState } from "react";
import VehicleModal from "@/components/VehicleModal";

export default function AddVehicleClient() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 hover:cursor-pointer"
            >
                Ajouter un véhicule
            </button>

            <VehicleModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}