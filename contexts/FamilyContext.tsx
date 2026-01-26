'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Family, FamilyWithMembers, FamilyRole } from '@/types/family';

interface FamilyContextType {
  family: FamilyWithMembers | null;
  userRole: FamilyRole | null;
  isLoading: boolean;
  error: string | null;
  refreshFamily: () => Promise<void>;
  createFamily: (name: string) => Promise<Family | null>;
  updateFamily: (familyId: string, name: string) => Promise<Family | null>;
  leaveFamily: (familyId: string) => Promise<boolean>;
  deleteFamily: (familyId: string) => Promise<boolean>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [family, setFamily] = useState<FamilyWithMembers | null>(null);
  const [userRole, setUserRole] = useState<FamilyRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/family/check');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération de la famille');
      }

      if (data.hasFamily) {
        setFamily(data.family);
        setUserRole(data.family.userRole);
      } else {
        setFamily(null);
        setUserRole(null);
      }

    } catch (error) {
      console.error('Error fetching family data:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération de la famille');
      setFamily(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createFamily = async (name: string): Promise<Family | null> => {
    try {
      setIsLoading(true);
      setError(null);

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

      // Refresh family data after creation
      await fetchFamilyData();

      return data.family;

    } catch (error) {
      console.error('Error creating family:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la famille');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFamily = async (familyId: string, name: string): Promise<Family | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/family/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la famille');
      }

      // Refresh family data after update
      await fetchFamilyData();

      return data.family;

    } catch (error) {
      console.error('Error updating family:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la famille');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveFamily = async (familyId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/family/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sortie de la famille');
      }

      // Refresh family data after leaving
      await fetchFamilyData();

      return true;

    } catch (error) {
      console.error('Error leaving family:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la sortie de la famille');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFamily = async (familyId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/family/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de la famille');
      }

      // Refresh family data after deletion
      await fetchFamilyData();

      return true;

    } catch (error) {
      console.error('Error deleting family:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression de la famille');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  return (
    <FamilyContext.Provider
      value={{
        family,
        userRole,
        isLoading,
        error,
        refreshFamily: fetchFamilyData,
        createFamily,
        updateFamily,
        leaveFamily,
        deleteFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};