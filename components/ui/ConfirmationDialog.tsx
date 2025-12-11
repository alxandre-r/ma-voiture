/**
 * @file components/ui/ConfirmationDialog.tsx
 * @fileoverview Reusable confirmation dialog component.
 * 
 * This component provides a modal dialog for confirming destructive actions
 * like deletion with customizable title, message, and buttons.
 */

'use client';

import { useEffect } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

/**
 * ConfirmationDialog Component
 * 
 * Modal dialog for confirming actions with customizable content.
 * Handles keyboard escape to close and click-outside-to-close.
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  loading = false,
}: ConfirmationDialogProps) {
  /**
   * Handle Escape key to close dialog
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        {/* Dialog Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        {/* Dialog Message */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Suppression...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}