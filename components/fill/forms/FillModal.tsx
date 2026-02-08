/**
 * @file components/fill/FillModal.tsx
 * @fileoverview Modal dialog for adding fuel fill-up records.
 * 
 * This component provides a modal overlay that displays the FillForm.
 * Handles keyboard escape to close and click-outside-to-close functionality.
 */

'use client';

import { useEffect } from 'react';
import FillForm from './FillAddForm';
import { VehicleMinimal } from '@/types/vehicle';

export interface FillModalProps {
  open: boolean;
  onClose: () => void;
  vehicles?: VehicleMinimal[] | null;
}

/**
 * FillModal Component
 * 
 * Modal dialog for fill-up forms with keyboard and click-outside support.
 */
export default function FillModal({ open, onClose, vehicles = null }: FillModalProps) {
  /**
   * Handle Escape key to close modal.
   * Cleanup event listener on unmount.
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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
      >

        <FillForm
          onCancel={onClose}
          onSuccess={onClose}
          autoCloseOnSuccess={true}
          vehicles={vehicles}
        />
      </div>
    </div>
  );
}