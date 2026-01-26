import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFormSubmitOnEnter } from '@/hooks/useFormSubmitOnEnter';

interface FamilyFormProps {
  onFamilyCreated?: (family: {
    id: string;
    name: string;
    created_at: string;
    owner: string;
  }) => void;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({ onFamilyCreated }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotifications();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/family/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la famille');
      }

      showNotification('Famille créée avec succès !', 'success');

      if (onFamilyCreated) {
        onFamilyCreated(data.family);
      }

      // Refresh the page to show the family
      router.refresh();

    } catch (error) {
      console.error('Error creating family:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la création de la famille', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Enter key support
  useFormSubmitOnEnter(inputRef, () => {
    if (name.trim()) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
    }
  }, isLoading);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="mb-4">
        <label htmlFor="family-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la famille
        </label>
        <input
          id="family-name"
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez le nom de votre famille"
          required
          minLength={2}
          maxLength={100}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        {isLoading ? 'Création en cours...' : 'Créer la famille'}
      </button>
    </form>
  );
};