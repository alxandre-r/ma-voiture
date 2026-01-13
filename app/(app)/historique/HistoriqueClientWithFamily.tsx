'use client';

import { useEffect, useState } from 'react';
import { useFills } from '@/contexts/FillContext';
import { useFamily } from '@/contexts/FamilyContext';
import { ContextSwitcher } from '@/components/family/ContextSwitcher';
import FillHistoryList from '@/components/fill/display/FillHistoryList';

interface HistoriqueClientProps {
  vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }>;
}

export default function HistoriqueClientWithFamily({ vehicles }: HistoriqueClientProps) {
  const { setVehicles } = useFills();
  const [context, setContext] = useState<'user' | 'family'>('user');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    families,
    currentFamily,
    isLoading: isFamilyLoading,
    loadFamilies
  } = useFamily();
  
  /**
   * Load families on component mount
   */
  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  /**
   * Set vehicles in context
   */
  useEffect(() => {
    setVehicles(vehicles);
  }, [vehicles, setVehicles]);

  /**
   * Handle context change between user and family
   */
  const handleContextChange = (newContext: 'user' | 'family', newFamilyId?: string) => {
    setContext(newContext);
    setFamilyId(newFamilyId || null);
    setError(null);
  };

  if (isFamilyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="historique-with-family">
      {/* Context Switcher - Family/User context */}
      <div className="mb-6">
        <ContextSwitcher
          onContextChange={handleContextChange}
          currentContext={context}
          currentFamilyId={familyId}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* User History - Show when user context is selected */}
      {context === 'user' && (
        <FillHistoryList />
      )}
    </div>
  );
}