"use client";

import { useState } from "react";
import VehicleModal from "@/components/VehicleModal";

export default function AddVehicleClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Vehicle
      </button>

      <VehicleModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}