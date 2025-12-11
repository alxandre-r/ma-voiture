/**
 * @file components/fill/FillModal.tsx
 * @fileoverview Modal dialog for adding fuel fill-up records.
 * 
 * This component provides a modal overlay that displays the FillForm.
 * Handles keyboard escape to close and click-outside-to-close functionality.
 */

'use client';

import { useEffect } from 'react';
import FillForm from './FillForm';

interface FillModalProps {
  open: boolean;
  onClose: () => void;
  vehicles?: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }> | null;
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
        className="relative bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
      >
        {/* Close button in top right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-gray-200 text-2xl hover:text-white hover:cursor-pointer"
          aria-label="Fermer"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold mb-4">Ajouter un plein</h3>

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