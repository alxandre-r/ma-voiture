/**
 * @file components/VehicleModal.tsx
 * @fileoverview Modal component for adding a new vehicle.
 * This component utilizes the Modal component in order to provide the form for adding a new vehicle in it.
 */

"use client";

import { Modal } from "@/components/ui/Modal";
import VehicleForm from "./forms/VehicleAddForm";

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VehicleModal({ open, onClose }: VehicleModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Ajouter un véhicule"
      size="md"
      fullscreenOnMobile
    >
      <VehicleForm
        onCancel={onClose}
        onSuccess={onClose}
        autoCloseOnSuccess
      />
    </Modal>
  );
}