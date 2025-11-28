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
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-800 rounded-lg shadow-lg p-6"
      >
        {/* Croix en haut à droite */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-gray-200 text-2xl hover:text-white hover:cursor-pointer"
          aria-label="Fermer"
        >
          ✕
        </button>

        <VehicleForm onCancel={onClose} />
      </div>
    </div>
  );
}