import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useFormSubmitOnEnter } from '@/hooks/useFormSubmitOnEnter';

interface RenameFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
  isLoading?: boolean;
}

export const RenameFamilyModal: React.FC<RenameFamilyModalProps> = ({
  isOpen,
  onClose,
  onRename,
  currentName,
  isLoading = false,
}) => {
  const [newName, setNewName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newName.trim()) {
      return;
    }

    if (newName.trim() === currentName) {
      onClose();
      return;
    }

    try {
      await onRename(newName.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming family:', error);
      // Error is handled by the parent component
    }
  };

  // Add Enter key support
  useFormSubmitOnEnter(inputRef, () => {
    if (newName.trim()) {
      handleSubmit();
    }
  }, isLoading);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renommer la famille" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-family-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nouveau nom de la famille
          </label>
          <input
            id="new-family-name"
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Entrez le nouveau nom"
            maxLength={100}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isLoading || !newName.trim() || newName.trim() === currentName}
            className={`px-4 py-2 text-white rounded-md transition-colors bg-blue-600 hover:bg-blue-700 ${
              (isLoading || !newName.trim() || newName.trim() === currentName) ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Enregistrement...
              </span>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};