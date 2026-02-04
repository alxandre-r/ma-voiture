/**
 * @file app/(app)/garage/AddVehicleButton.tsx
 * @fileoverview Client component for adding vehicles.
 * 
 * This component provides a button that opens the VehicleModal for adding new vehicles.
 * Uses client-side state to manage modal visibility.
 */

"use client";

import React from 'react';
import Icon from '@/components/ui/Icon';

interface AddVehicleButtonProps {
  onOpen: () => void;
}

export default function AddVehicleButton({ onOpen }: AddVehicleButtonProps) {

    return (
        <>
            <button
                onClick={onOpen}
                className="px-4 py-3 bg-custom-1 text-white rounded-lg hover:bg-custom-1-hover hover:cursor-pointer flex items-center gap-2 transition-all duration-200 sm:px-6 sm:py-3"
                aria-label="Ajouter un véhicule"
            >
                <Icon name="add" size={20} className="invert dark:invert-0" />
                <span className="font-medium">Ajouter un véhicule</span>
            </button>
        </>
    );
}