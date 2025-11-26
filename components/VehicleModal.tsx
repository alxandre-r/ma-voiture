"use client";

import { useEffect } from "react";
import VehicleForm from "./VehicleForm";

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VehicleModal({ open, onClose }: VehicleModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add a Vehicle</h2>
        <VehicleForm />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}