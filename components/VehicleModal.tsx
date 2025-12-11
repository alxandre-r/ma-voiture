/**
 * @file components/VehicleModal.tsx
 * @fileoverview Modal dialog for adding/editing vehicles.
 * 
 * This component provides a modal overlay that displays the VehicleForm.
 * Handles keyboard escape to close and click-outside-to-close functionality.
 */

"use client";

import { useEffect } from "react";
import VehicleForm from "./vehicle/VehicleForm";

/**
 * VehicleModal Props
 * 
 * @property {boolean} open - Whether modal is open
 * @property {() => void} onClose - Callback when modal should close
 */
interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * VehicleModal Component
 * 
 * Modal dialog for vehicle forms with keyboard and click-outside support.
 */
export default function VehicleModal({ open, onClose }: VehicleModalProps) {
  /**
   * Handle Escape key to close modal.
   * Cleanup event listener on unmount.
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Don't render if not open
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
        {/* Close button in top right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-gray-200 text-2xl hover:text-white hover:cursor-pointer"
          aria-label="Fermer"
        >
          ✕
        </button>

        <VehicleForm 
          onCancel={onClose} 
          onSuccess={onClose}
          autoCloseOnSuccess={true}
        />
      </div>
    </div>
  );
}